import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../../../lib/auth';

const prisma = new PrismaClient();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const allowedRoles = ['role_admin'];
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const { role_id } = req.query as { role_id?: string };

      if (role_id) {
        const permissions = await prisma.rolePermissions.findMany({
          where: { role_id },
          select: {
            permission_id: true,
            role_id: true,
            resource: true,
            action: true,
          },
        });
        return res.status(200).json({ success: true, data: permissions });
      } else {
        const permissions = await prisma.rolePermissions.findMany({
          select: {
            permission_id: true,
            role_id: true,
            resource: true,
            action: true,
          },
        });
        return res.status(200).json({ success: true, data: permissions });
      }
    } else if (req.method === 'POST') {
      const { role_id, resource, action } = req.body as { role_id: string; resource: string; action: string };

      if (!role_id?.trim() || !resource?.trim() || !action?.trim()) {
        return res.status(400).json({ success: false, error: 'Role ID, resource và action là bắt buộc' });
      }

      const roleExists = await prisma.roles.findUnique({
        where: { role_id },
      });
      if (!roleExists) {
        return res.status(404).json({ success: false, error: 'Vai trò không tồn tại' });
      }

      const permission = await prisma.rolePermissions.create({
        data: {
          permission_id: uuidv4(),
          role_id,
          resource: resource.trim(),
          action: action.trim(),
        },
      });
      return res.status(201).json({ success: true, data: permission });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: `Phương thức ${req.method} không được phép` });
    }
  } catch (error: unknown) {
    console.error('Lỗi trong API /role-permissions:', error);
    return res.status(500).json({ success: false, error: 'Lỗi server khi xử lý quyền hạn' });
  } finally {
    await prisma.$disconnect();
  }
}