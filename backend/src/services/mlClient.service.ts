import axios from 'axios';
import { config } from '../config';
import { PredictionData } from '../db/seedData';

export interface MLPredictInput {
  mode: string;
  corridor?: string;
  from_node?: string;
  to_node?: string;
  commodity?: string;
  is_perishable?: number;
  planned_duration_hrs?: number;
  hour_of_day?: number;
  day_of_week?: number;
  weather?: string;
  toll_congestion_index?: number;
  rake_turnaround_hrs?: number;
  port_berth_queue_length?: number;
  customs_clearance_hrs?: number;
}

export class MLClientService {
  private static instance: MLClientService;
  private mlUrl: string;

  private constructor() {
    this.mlUrl = config.mlServiceUrl;
  }

  public static getInstance(): MLClientService {
    if (!MLClientService.instance) {
      MLClientService.instance = new MLClientService();
    }
    return MLClientService.instance;
  }

  public async predictDelayRisk(input: MLPredictInput): Promise<PredictionData> {
    try {
      const response = await axios.post(`${this.mlUrl}/predict`, input, {
        timeout: 2500,
      });

      const data = response.data;
      return {
        id: `prd-${Date.now()}`,
        legId: 'leg-target',
        riskScore: data.risk_score,
        riskLabel: data.risk_label,
        expectedDelayMinutes: data.expected_delay_minutes,
        suggestedAction: data.suggested_action,
        plainLanguageReason: data.plain_language_reason,
        featureAttributions: data.feature_attributions,
        modelVersion: data.model_version || 'xgboost-v1.4.2',
        actionExecuted: false,
        predictedAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn(`[ML Client] ML service call failed (${err.message}). Activating local heuristic fallback engine.`);
      return this.fallbackHeuristic(input);
    }
  }

  private fallbackHeuristic(input: MLPredictInput): PredictionData {
    const mode = (input.mode || 'ROAD').toUpperCase();
    let riskScore = 0.20;
    const toll = input.toll_congestion_index || 0.2;
    const rake = input.rake_turnaround_hrs || 2.0;
    const portQueue = input.port_berth_queue_length || 1;

    if (mode === 'PORT' || mode === 'VESSEL') {
      riskScore = Math.min(0.95, 0.35 + portQueue * 0.10);
    } else if (mode === 'RAIL') {
      riskScore = Math.min(0.90, 0.25 + rake * 0.05);
    } else if (mode === 'ROAD') {
      riskScore = Math.min(0.92, 0.15 + toll * 0.40);
    }

    if (input.weather && ['HEAVY_MONSOON', 'FOG_LOW_VISIBILITY'].includes(input.weather.toUpperCase())) {
      riskScore = Math.min(0.95, riskScore + 0.25);
    }

    const expDelay = Math.round(riskScore * 240);
    let riskLabel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 0.75) riskLabel = 'CRITICAL';
    else if (riskScore >= 0.50) riskLabel = 'HIGH';
    else if (riskScore >= 0.25) riskLabel = 'MEDIUM';

    let action: 'PROCEED' | 'HOLD' | 'REROUTE' | 'RESCHEDULE' = 'PROCEED';
    let reason = 'Normal multimodal transit operating within parameters.';

    if (riskScore >= 0.65 || portQueue >= 4 || (mode === 'ROAD' && toll >= 0.55)) {
      if (mode === 'PORT' || mode === 'VESSEL' || portQueue >= 4) {
        action = 'HOLD';
        reason = `Port berthing delay estimated at +${expDelay}m. Suggest HOLD consignment at inland dry port / warehouse to prevent open-yard demurrage.`;
      } else if (mode === 'ROAD' && toll >= 0.55) {
        action = 'REROUTE';
        reason = `Highway toll corridor congested (${Math.round(toll * 100)}%). Suggest REROUTE via Dedicated Freight Corridor rail.`;
      } else {
        action = 'RESCHEDULE';
        reason = `Estimated delay +${expDelay}m on ${mode} transit. Suggest RESCHEDULE downstream handling slot.`;
      }
    }

    return {
      id: `prd-fallback-${Date.now()}`,
      legId: 'leg-target',
      riskScore: Math.round(riskScore * 1000) / 1000,
      riskLabel,
      expectedDelayMinutes: expDelay,
      suggestedAction: action,
      plainLanguageReason: reason,
      featureAttributions: {
        port_berth_congestion_factor: portQueue * 0.12,
        railyard_dwell_factor: rake * 0.08,
        road_toll_bottleneck_factor: toll * 0.4,
        fallback_mode: true,
      },
      modelVersion: 'heuristic-rule-engine-v1.0',
      actionExecuted: false,
      predictedAt: new Date().toISOString(),
    };
  }
}

export const mlClient = MLClientService.getInstance();
