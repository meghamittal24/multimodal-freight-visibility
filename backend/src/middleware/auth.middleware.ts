import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { dataStore } from '../db/dataStore';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organization: string;
    corridorAccess: string[];
  };
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // For hackathon ease of demo: if no token is provided, assign default Admin demo user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const defaultUser = Array.from(dataStore.users.values())[0];
    req.user = {
      id: defaultUser.id,
      email: defaultUser.email,
      role: defaultUser.role,
      organization: defaultUser.organization,
      corridorAccess: defaultUser.corridorAccess,
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired auth token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of roles [${allowedRoles.join(', ')}]`,
      });
    }
    next();
  };
};
