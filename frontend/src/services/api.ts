import axios from 'axios';
import { ShipmentData, ImpactMetrics, RippleEffectGraph, SuggestedAction } from '../types';

const API_BASE_URL = window.location.port === '3000' ? 'http://localhost:5000/api/v1' : '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export const api = {
  async getShipments(filters?: { corridorId?: string; mode?: string; status?: string }): Promise<ShipmentData[]> {
    const res = await apiClient.get('/shipments', { params: filters });
    return res.data.data;
  },

  async getShipmentById(id: string): Promise<ShipmentData> {
    const res = await apiClient.get(`/shipments/${id}`);
    return res.data.data;
  },

  async getTimeline(shipmentId: string) {
    const res = await apiClient.get(`/shipments/${shipmentId}/timeline`);
    return res.data;
  },

  async getRippleEffect(shipmentId: string): Promise<RippleEffectGraph> {
    const res = await apiClient.get(`/shipments/${shipmentId}/ripple-effect`);
    return res.data.data;
  },

  async triggerPrediction(shipmentId: string, params?: any) {
    const res = await apiClient.post(`/predictions/shipments/${shipmentId}/predict`, params || {});
    return res.data;
  },

  async executeAction(shipmentId: string, actionType: SuggestedAction, legId?: string, notes?: string) {
    const res = await apiClient.post('/actions/execute', {
      shipmentId,
      actionType,
      legId,
      notes,
    });
    return res.data;
  },

  async pushTrackingPing(pingData: any) {
    const res = await apiClient.post('/tracking/ping', pingData);
    return res.data;
  },

  async getImpactMetrics(): Promise<ImpactMetrics> {
    const res = await apiClient.get('/analytics/impact');
    return res.data.data;
  },

  async getUlipFeed(type: 'fois' | 'fastag' | 'pcs1x') {
    const res = await apiClient.get(`/ulip/${type}`);
    return res.data;
  },

  async resetDemo() {
    const res = await apiClient.post('/analytics/reset-demo');
    return res.data;
  },
};
