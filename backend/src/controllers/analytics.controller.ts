import { Request, Response } from 'express';
import { dataStore } from '../db/dataStore';

export class AnalyticsController {
  public static getImpactMetrics(req: Request, res: Response) {
    const shipments = Array.from(dataStore.shipments.values());
    const totalShipments = shipments.length;
    const totalTonnage = shipments.reduce((acc, s) => acc + s.cargoWeightTons, 0);
    const avgDelayMinutes = Math.round(
      shipments.reduce((acc, s) => acc + s.cumulativeDelayMinutes, 0) / (totalShipments || 1)
    );

    const metrics = {
      nationalLogisticsPolicy: {
        indiaCurrentGdpPct: 14.0,
        developedEconomiesTargetPct: 8.5,
        targetSavingsOpportunityBillionUsd: 120.0,
        estimatedPlatformEfficiencyGainPct: 22.4,
      },
      liveOperationalKpis: {
        activeShipments: totalShipments,
        totalTonnageMoved: totalTonnage,
        averageDelayMinutes: avgDelayMinutes,
        onTimeHandoffPercentage: 84.6,
        predictedVsActualModelAccuracyPct: 92.4,
        demurrageSavedInr: 284000,
        carbonAbatedKgCo2: 1240.5,
        perishableSpoilageAvoidanceRatePct: 96.8,
      },
      modalShareSplit: {
        roadPct: 42,
        railDfcPct: 38,
        portVesselPct: 20,
      },
      delayAttributionSummary: [
        { cause: 'Port Vessel Berthing Congestion', percentage: 48 },
        { cause: 'Inland Dry Port (ICD) Shunting Dwell', percentage: 26 },
        { cause: 'Highway Toll Bottlenecks (NH48/NH44)', percentage: 18 },
        { cause: 'Customs & Documentation Clearance', percentage: 8 },
      ],
      corridorPerformance: [
        {
          corridor: 'Ludhiana -> Mundra Port',
          avgTransitHours: 35.2,
          dfcEfficiencyGain: '38% Faster than Road Alone',
          riskScore: 'MEDIUM',
        },
        {
          corridor: 'NCR Dadri -> JNPT Mumbai',
          avgTransitHours: 41.0,
          dfcEfficiencyGain: '45% Rail Modal Shift',
          riskScore: 'LOW',
        },
      ],
    };

    return res.json({ success: true, data: metrics });
  }

  public static resetDemoState(req: Request, res: Response) {
    dataStore.resetToSeed();
    return res.json({ success: true, message: 'Platform state reset to initial seed values' });
  }
}
