import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { User } from '../types/user.types';
interface UserRequest extends Request {
  user?: User;
}
export const checkUserExistence = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    return 
  }

  try {
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: 'error', message: 'Server error while checking user existence' });
  }
};
