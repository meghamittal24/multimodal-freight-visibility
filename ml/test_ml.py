"""
Unit & Sanity Tests for ML Delay Risk Prediction Service.
"""

import unittest
from predictor import DelayRiskPredictor

class TestMLPredictor(unittest.TestCase):
    def setUp(self):
        self.predictor = DelayRiskPredictor()

    def test_normal_road_leg(self):
        req = {
            "mode": "ROAD",
            "corridor": "COR-LDH-MUN",
            "toll_congestion_index": 0.1,
            "weather": "CLEAR",
            "hour_of_day": 14
        }
        res = self.predictor.predict(req)
        self.assertIn("risk_score", res)
        self.assertIn("suggested_action", res)
        self.assertIn(res["suggested_action"], ["PROCEED", "RESCHEDULE", "REROUTE", "HOLD"])
        self.assertIn(res["risk_label"], ["LOW", "MEDIUM", "HIGH", "CRITICAL"])

    def test_high_port_congestion_triggers_hold(self):
        req = {
            "mode": "PORT",
            "corridor": "COR-LDH-MUN",
            "port_berth_queue_length": 8,
            "weather": "HEAVY_MONSOON",
            "hour_of_day": 9
        }
        res = self.predictor.predict(req)
        self.assertGreaterEqual(res["risk_score"], 0.60)
        self.assertEqual(res["suggested_action"], "HOLD")
        self.assertIn("demurrage", res["plain_language_reason"].lower())

    def test_heavy_highway_toll_triggers_reroute(self):
        req = {
            "mode": "ROAD",
            "corridor": "COR-LDH-MUN",
            "toll_congestion_index": 0.88,
            "weather": "CLEAR",
            "hour_of_day": 18
        }
        res = self.predictor.predict(req)
        self.assertGreaterEqual(res["risk_score"], 0.50)
        self.assertIn(res["suggested_action"], ["REROUTE", "RESCHEDULE"])

    def test_perishable_sensitivity(self):
        req = {
            "mode": "RAIL",
            "corridor": "COR-LDH-MUN",
            "is_perishable": 1,
            "commodity": "Agro Perishables",
            "rake_turnaround_hrs": 5.0
        }
        res = self.predictor.predict(req)
        self.assertTrue(res["feature_attributions"]["perishable_spoilage_sensitivity"] > 0.5)

if __name__ == "__main__":
    unittest.main()
