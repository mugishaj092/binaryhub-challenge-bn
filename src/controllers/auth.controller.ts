import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { comparePassword, hashPassword } from '../utils/password.util';
import { generateToken } from '../utils/tokenGenerator.utils';
import { sendEmail } from '../utils/email.util';
import { signupEmail } from '../utils/emailTemplate/signup';
import { PrismaClient } from '@prisma/client';
import { sendVerificationEmail } from '../utils/emailTemplate/verification.template';
import { resendVerificationEmail } from '../utils/resendVerificationEmail.util';
import { User } from '../types/user.types';

const prisma = new PrismaClient();
interface UserRequest extends Request {
    user?: User;
}

export const login = async (req: UserRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ status: 'fail', message: 'Email and password are required' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
            return;
        }

        const role = await RoleService.getRoleById(req.user?.roleId);
        const isPasswordValid = await comparePassword(password, req.user?.password);

        if (!isPasswordValid) {
            res.status(401).json({ status: 'fail', message: 'Invalid email or password' });
            return;
        }

        if (!req.user.verified) {
            const token = await generateToken(req.user, '1h');
            const verificationLink = `${process.env.FRONTEND_URL}api/auth/verify?token=${token}`;
           await sendVerificationEmail(req.user.email, verificationLink);
        }

        const token = await generateToken(req.user);
        const { password: _, ...userWithoutPassword } = req.user;

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: { token, role: role?.name, user: userWithoutPassword },
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ status: 'fail', message: 'An error occurred during login' });
    }
};
export const signup = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    const existingUserByPhone= await UserService.getUserByPhoneNumber(phoneNumber);
    if (existingUserByPhone) {
        res.status(400).json({ message: 'User with this phone number already exists' });
        return;
    }
    try {
        const role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
        if (!role) {
            res.status(500).json({
                status: 'fail',
                message: 'Role not found',
            });
            return;
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                roleId: `${role?.id}`,
                phoneNumber,
            },
        });
        const { password: _, ...userWithoutPassword } = newUser;
        await signupEmail(email);
        res.status(201).json({
            status: 'success',
            message: `User created successfully`,
            data: {
                user: userWithoutPassword,
            },
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Error creating user',
        });
    }
};


export const verifyUser =async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) {
        res.status(400).json({
            status: 'fail',
            message: 'Token is required',
        });
        return;
    }
    try {
        const user = await UserService.verifyUser(token);
        if (!user) {
            res.status(404).json({
                status: 'fail',
                message: 'User not found',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: 'User verified successfully',
            data: {
                user,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'fail',
            message: 'Error verifying user',
        });
    }

}


export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const result = await resendVerificationEmail(email);
    res.status(200).json({
      status: result.status,
      message: result.message,
      data: result.data,
    });
  } catch (error:any) {
    console.error('Error:', error.message);
    if (error.message === 'User not found') {
      res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    } else if (error.message === 'User is already verified') {
      res.status(400).json({
        status: 'error',
        message: 'User is already verified',
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error resending verification email',
      });
    }
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id, roleId } = req.body;
        const updatedUser = await UserService.updateUserRole(id, roleId);
        res.status(200).json({ message: 'User role updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user role' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await UserService.deleteUser(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};

export const addUser = async (req: Request, res: Response) => {
    try {
        const { email, firstName,lastName,phoneNumber } = req.body;
        const existingUser = await UserService.getUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
        if (!role) {
            res.status(500).json({ message: 'Role not found' });
            return;
        }
        const existingUserByPhone = await UserService.getUserByPhoneNumber(phoneNumber);
        if (existingUserByPhone) {
            res.status(400).json({ message: 'User with this phone number already exists' });
            return;
        }
        const newUser = await UserService.addUser(email, firstName, lastName, phoneNumber);
        res.status(201).json({ message: 'User added successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error adding user' });
    }
};
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json({
            status: 'success',
            message: 'Users fetched successfully',
            data: users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching users',
        });
    }
};