import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dbconnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};
