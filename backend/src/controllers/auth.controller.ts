import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { dataStore } from '../db/dataStore';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  public static login(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = Array.from(dataStore.users.values()).find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        corridorAccess: user.corridorAccess,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        corridorAccess: user.corridorAccess,
        phone: user.phone,
      },
    });
  }

  public static getMe(req: AuthenticatedRequest, res: Response) {
    return res.json({ success: true, user: req.user });
  }

  public static getAllDemoUsers(req: Request, res: Response) {
    const users = Array.from(dataStore.users.values()).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      organization: u.organization,
      corridorAccess: u.corridorAccess,
    }));
    return res.json({ success: true, users });
  }
}
