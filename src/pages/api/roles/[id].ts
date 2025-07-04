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
  const allowedRoles = ['role_admin']; // Sử dụng role_id
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const role = await prisma.roles.findUnique({
        where: { role_id: id },
        select: {
          role_id: true,
          name: true,
          description: true,
        },
      });
      if (!role) {
        return res.status(404).json({ success: false, error: 'Vai trò không tồn tại' });
      }
      return res.status(200).json({ success: true, data: role });
    } else if (req.method === 'PUT') {
      const { name, description } = req.body as { name: string; description: string };

      if (!name?.trim()) {
        return res.status(400).json({ success: false, error: 'Tên vai trò là bắt buộc' });
      }

      const role = await prisma.roles.update({
        where: { role_id: id },
        data: {
          name: name.trim(),
          description: description?.trim() || '',
        },
      });
      return res.status(200).json({ success: true, data: role });
    } else if (req.method === 'DELETE') {
      const userRoles = await prisma.userRoles.findMany({
        where: { role_id: id },
      });
      if (userRoles.length > 0) {
        return res.status(400).json({ success: false, error: 'Không thể xóa vai trò đang được gán' });
      }

      await prisma.rolePermissions.deleteMany({
        where: { role_id: id },
      });
      await prisma.roles.delete({
        where: { role_id: id },
      });
      return res.status(204).json({ success: true });
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ success: false, error: `Phương thức ${req.method} không được phép` });
    }
  } catch (error: unknown) {
    console.error('Lỗi trong API /roles/[id]:', error);
    return res.status(500).json({ success: false, error: 'Lỗi server khi xử lý vai trò' });
  } finally {
    await prisma.$disconnect();
  }
}