import { PrismaClient } from '@prisma/client';
import { decodeToken } from '../utils/tokenGenerator.utils';
import { User } from '../types/user.types';
import { sendEmail } from '../utils/email.util';
import { hashPassword } from '../utils/password.util';
import { generateRandomPassword } from '../utils/randomPassword';

const prisma = new PrismaClient();

export class UserService {
    static async getUserByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                role: true,
            },
        });
        return user;
    }
    static async getUserByPhoneNumber(phone: string) {
        const user = await prisma.user.findUnique({
            where: { phoneNumber: phone },
            include: {
                role: true,
            },
        });
        return user;
    }

    static async verifyUser(token: string) {
        const decodedToken = decodeToken(token);
        const user = await UserService.getUserByEmail(decodedToken.email);
        if (!user) {
            return null;
        }
        return prisma.user.update({
            where: { email: decodedToken.email },
            data: { verified: true },
        });
    }

    static async getAllUsers() {
        return prisma.user.findMany({
            include: {
                role: true,
            },
        });
    }

    static async addUser(email: string, firstName: string, lastName: string, phoneNumber: string) {
        const randomPassword = generateRandomPassword();
        const hashedPassword = await hashPassword(randomPassword);
        const role = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
        if (!role) {
            throw new Error('Role ADMIN not found');
        }
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                phoneNumber,
                password: hashedPassword,
                verified: false,
                roleId: role?.id,
            },
        });

        await sendEmail(email, 'Your New Account', `Your password is: ${randomPassword}`);

        return newUser;
    }

    static async updateUserRole(id: string, roleId: string) {
        return prisma.user.update({
            where: { id },
            data: { roleId },
        });
    }

    static async deleteUser(id: string) {
        return prisma.user.delete({
            where: { id },
        });
    }
}