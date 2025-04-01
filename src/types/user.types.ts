import { User as PrismaUser, Role as PrismaRole, $Enums } from '@prisma/client';

export type User = PrismaUser;
export type Role = PrismaRole;
export type RoleData = $Enums.RoleData;
