import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../../../lib/auth';

const prisma = new PrismaClient();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const { id } = req.query as { id: string };
  const allowedRoles = ['role_admin', 'role_hr']; // Thay bằng role_id thực tế
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) return;

  try {
    if (req.method === 'DELETE') {
      const userRole = await prisma.userRoles.findUnique({
        where: { user_role_id: id },
      });
      if (!userRole) {
        return res.status(404).json({ success: false, error: 'Phân quyền không tồn tại' });
      }

      await prisma.userRoles.delete({
        where: { user_role_id: id },
      });
      return res.status(204).json({ success: true });
    } else {
      res.setHeader('Allow', ['DELETE']);
      return res.status(405).json({ success: false, error: `Phương thức ${req.method} không được phép` });
    }
  } catch (error: unknown) {
    console.error('Lỗi trong API /user-roles/[id]:', error);
    return res.status(500).json({ success: false, error: 'Lỗi server khi xử lý phân quyền' });
  } finally {
    await prisma.$disconnect();
  }
}