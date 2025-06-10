import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenHelper';

interface AuthenticatedRequest extends Request {
  user?: any; // Optionally replace `any` with your decoded JWT payload type
}

const validateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, msg: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, msg: 'Invalid or expired token' });
  }

  req.user = decoded; // Inject user payload
  console.log('✅ Decoded user:', req.user);
  next();
};

export default validateToken;
