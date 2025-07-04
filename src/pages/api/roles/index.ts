import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken } from '../../../lib/auth';

const prisma = new PrismaClient();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const allowedRoles = ['role_admin']; // Sử dụng role_id
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) return;

  const { method } = req;

  switch (method) {
    case 'GET': {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const roles = await prisma.roles.findMany({
          skip,
          take: limit,
          select: {
            role_id: true,
            name: true,
            description: true,
            created_at: true,
            updated_at: true,
          },
        });

        const total = await prisma.roles.count();

        res.status(200).json({
          success: true,
          data: { roles, total },
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        res.status(500).json({ success: false, error: message });
      }
      break;
    }

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
      break;
  }
  await prisma.$disconnect();
}