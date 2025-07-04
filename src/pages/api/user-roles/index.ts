import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../../../lib/auth';

const prisma = new PrismaClient();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const allowedRoles = ['role_admin', 'role_hr']; // Thay bằng role_id thực tế
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const {
        search = '',
        department = '',
        position = '',
        role = '',
        page = '1',
        limit = '10',
      } = req.query as {
        search: string;
        department: string;
        position: string;
        role: string;
        page: string;
        limit: string;
      };

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const where: Prisma.UserRolesWhereInput = {};
      const employeeWhere: Prisma.EmployeesWhereInput = {};

      if (search.trim()) {
        employeeWhere.OR = [
          { full_name: { contains: search.trim(), mode: 'insensitive' } },
          { email: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }

      if (department.trim()) {
        employeeWhere.department = { name: { equals: department.trim() } };
      }

      if (position.trim()) {
        employeeWhere.position = { name: { equals: position.trim() } };
      }

      if (Object.keys(employeeWhere).length > 0) {
        where.employee = employeeWhere;
      }

      if (role.trim()) {
        where.role = { name: { equals: role.trim() } };
      }

      const [userRoles, total] = await Promise.all([
        prisma.userRoles.findMany({
          where,
          include: {
            employee: { select: { full_name: true } },
            role: { select: { name: true } },
          },
          skip,
          take: limitNum,
        }),
        prisma.userRoles.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          userRoles: userRoles.map((ur) => ({
            user_role_id: ur.user_role_id,
            employee_id: ur.employee_id,
            role_id: ur.role_id,
            employee_name: ur.employee.full_name,
            role_name: ur.role.name,
          })),
          total,
          page: pageNum,
          limit: limitNum,
        },
      });
    } else if (req.method === 'POST') {
      const { employee_id, role_id } = req.body as { employee_id: string; role_id: string };

      if (!employee_id?.trim() || !role_id?.trim()) {
        return res.status(400).json({ success: false, error: 'Employee ID và Role ID là bắt buộc' });
      }

      const [employeeExists, roleExists] = await Promise.all([
        prisma.employees.findUnique({ where: { employee_id } }),
        prisma.roles.findUnique({ where: { role_id } }),
      ]);
      if (!employeeExists || !roleExists) {
        return res.status(404).json({ success: false, error: 'Nhân viên hoặc vai trò không tồn tại' });
      }

      const existingAssignment = await prisma.userRoles.findFirst({
        where: { employee_id, role_id },
      });
      if (existingAssignment) {
        return res.status(400).json({ success: false, error: 'Nhân viên đã được gán vai trò này' });
      }

      const userRole = await prisma.userRoles.create({
        data: {
          user_role_id: uuidv4(),
          employee_id,
          role_id,
        },
        include: {
          employee: { select: { full_name: true } },
          role: { select: { name: true } },
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          user_role_id: userRole.user_role_id,
          employee_id: userRole.employee_id,
          role_id: userRole.role_id,
          employee_name: userRole.employee.full_name,
          role_name: userRole.role.name,
        },
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: `Phương thức ${req.method} không được phép` });
    }
  } catch (error: unknown) {
    console.error('Lỗi trong API /user-roles:', error);
    return res.status(500).json({ success: false, error: 'Lỗi server khi xử lý phân quyền' });
  } finally {
    await prisma.$disconnect();
  }
}