import { PrismaClient, EmploymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const allowedRoles = ['role_admin', 'role_hr']; // Thêm role_hr để cho phép HR truy cập
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Phương thức ${req.method} không được phép` });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'Email là bắt buộc' });
  }

  try {
    const employee = await prisma.employees.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        employment_status: { not: EmploymentStatus.TERMINATED },
      },
      select: {
        employee_id: true,
        full_name: true,
        email: true,
        birth_date: true,
        gender: true,
        avatar_url: true,
        department: { select: { department_id: true, name: true } },
        position: { select: { position_id: true, name: true } },
        user_roles: { include: { role: { select: { role_id: true, name: true } } } },
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Không tìm thấy nhân viên với email này hoặc nhân viên đã nghỉ việc' });
    }

    return res.status(200).json({ success: true, data: employee });
  } catch (error: unknown) {
    console.error('Lỗi khi tìm nhân viên:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ khi tìm nhân viên',
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await prisma.$disconnect();
  }
}