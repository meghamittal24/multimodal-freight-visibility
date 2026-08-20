import { Request, Response } from 'express';
import { dataStore } from '../db/dataStore';

export class CorridorsController {
  public static listCorridors(req: Request, res: Response) {
    const list = Array.from(dataStore.corridors.values());
    return res.json({ success: true, count: list.length, data: list });
  }

  public static getCorridorById(req: Request, res: Response) {
    const { id } = req.params;
    const corridor = dataStore.corridors.get(id);
    if (!corridor) {
      return res.status(404).json({ success: false, message: `Corridor ${id} not found` });
    }
    return res.json({ success: true, data: corridor });
  }

  public static createCorridor(req: Request, res: Response) {
    const { code, name, origin, destination, distanceKm, averageTransitHours, dfcConnected } = req.body;
    const newId = `cor-${Date.now()}`;
    const newCorridor = {
      id: newId,
      code: code || `COR-${origin.substring(0, 3)}-${destination.substring(0, 3)}`.toUpperCase(),
      name,
      origin,
      destination,
      primaryModes: ['ROAD', 'RAIL', 'PORT'],
      distanceKm: Number(distanceKm || 1000),
      averageTransitHours: Number(averageTransitHours || 24),
      dfcConnected: Boolean(dfcConnected),
      active: true,
    };
    dataStore.corridors.set(newId, newCorridor);
    return res.status(201).json({ success: true, data: newCorridor });
  }
}
