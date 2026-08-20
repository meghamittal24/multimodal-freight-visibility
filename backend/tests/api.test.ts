import request from 'supertest';
import app from '../src/index';

describe('Unified Freight Visibility Platform API Integration Tests', () => {
  it('GET /health should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.sih_team).toContain('Jugaad Junction');
  });

  it('GET /api/v1/shipments should return list of seed shipments', async () => {
    const res = await request(app).get('/api/v1/shipments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/shipments/shp-101/timeline should return multimodal legs', async () => {
    const res = await request(app).get('/api/v1/shipments/shp-101/timeline');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.timeline.length).toBe(5);
    expect(res.body.timeline[0].mode).toBe('ROAD');
    expect(res.body.timeline[2].mode).toBe('RAIL');
  });

  it('POST /api/v1/actions/execute should execute HOLD action', async () => {
    const res = await request(app)
      .post('/api/v1/actions/execute')
      .send({
        shipmentId: 'shp-101',
        actionType: 'HOLD',
        notes: 'Hold at Palanpur DFC staging yard',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.actionType).toBe('HOLD');
    expect(res.body.shipment.status).toBe('HELD');
  });

  it('GET /api/v1/analytics/impact should return GDP logistics benchmark data', async () => {
    const res = await request(app).get('/api/v1/analytics/impact');
    expect(res.status).toBe(200);
    expect(res.body.data.nationalLogisticsPolicy.indiaCurrentGdpPct).toBe(14.0);
    expect(res.body.data.nationalLogisticsPolicy.developedEconomiesTargetPct).toBe(8.5);
  });
});
