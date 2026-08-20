import { Request, Response } from 'express';
import { UlipSimulatorService } from '../services/ulipSimulator.service';

export class UlipController {
  public static getFoisFeed(req: Request, res: Response) {
    const data = UlipSimulatorService.getFoisRakeFeed();
    return res.json({
      source: 'FOIS_CRIS_INDIAN_RAILWAYS',
      api_spec: 'ULIP_API_RAIL_04',
      status: 'LIVE_STREAMING',
      timestamp: new Date().toISOString(),
      rakes: data,
    });
  }

  public static getFastagFeed(req: Request, res: Response) {
    const data = UlipSimulatorService.getFastagTollFeed();
    return res.json({
      source: 'NPCI_NETC_FASTAG',
      api_spec: 'ULIP_API_ROAD_01',
      status: 'LIVE_STREAMING',
      timestamp: new Date().toISOString(),
      toll_transits: data,
    });
  }

  public static getPcs1xFeed(req: Request, res: Response) {
    const data = UlipSimulatorService.getPcs1xPortFeed();
    return res.json({
      source: 'IPA_PCS1X_NATIONAL_PORT_COMMUNITY',
      api_spec: 'ULIP_API_PORT_11',
      status: 'LIVE_STREAMING',
      timestamp: new Date().toISOString(),
      port_terminals: data,
    });
  }
}
