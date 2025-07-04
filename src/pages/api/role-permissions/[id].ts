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
  const allowedRoles = ['role_admin']; // Chỉ Admin
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) return;

  try {
    if (req.method === 'PUT') {
      const { resource, action } = req.body as { resource: string; action: string };

      if (!resource?.trim() || !action?.trim()) {
        return res.status(400).json({ success: false, error: 'Resource và action là bắt buộc' });
      }

      const permission = await prisma.rolePermissions.update({
        where: { permission_id: id },
        data: {
          resource: resource.trim(),
          action: action.trim(),
        },
      });
      return res.status(200).json({ success: true, data: permission });
    } else if (req.method === 'DELETE') {
      await prisma.rolePermissions.delete({
        where: { permission_id: id },
      });
      return res.status(204).json({ success: true });
    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Phương thức ${req.method} không được phép` });
    }
  } catch (error: unknown) {
    console.error('Lỗi trong API /role-permissions/[id]:', error);
    return res.status(500).json({ success: false, error: 'Lỗi server khi xử lý quyền hạn' });
  } finally {
    await prisma.$disconnect();
  }
}