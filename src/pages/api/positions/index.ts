import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kiểm tra xác thực JWT
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('x ')) {
    return res.status(401).json({ error: 'Thiếu hoặc sai token xác thực' });
  }

  try {
    const token = authHeader.split(' ')[1];
    verify(token, JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ', details: (error as Error).message });
  }

  // GET: Lấy danh sách chức vụ
  if (req.method === 'GET') {
    try {
      const positions = await prisma.positions.findMany({
        include: {
          employees: {
            select: {
              employee_id: true,
              department_id: true,
            },
            where: {
              employment_status: { not: 'TERMINATED' },
            },
          },
        },
      });

      const response = positions.map((pos) => ({
        position_id: pos.position_id,
        name: pos.name,
        description: pos.description || '',
        created_at: pos.created_at.toISOString(),
        updated_at: pos.updated_at.toISOString(),
        employee_count: pos.employees.length,
        department_ids: [...new Set(
          pos.employees
            .map((emp) => emp.department_id)
            .filter((id): id is string => !!id)
        )],
      }));

      // console.log('Positions fetched:', response);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chức vụ:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi lấy danh sách chức vụ',
        details: (error as Error).message,
      });
    }
  }

  // POST: Tạo chức vụ mới
  else if (req.method === 'POST') {
    try {
      const { name, description, department_ids } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Tên chức vụ là bắt buộc' });
      }

      // Kiểm tra tên chức vụ trùng lặp
      const existingPosition = await prisma.positions.findFirst({
        where: { name: name.trim() },
      });
      if (existingPosition) {
        return res.status(400).json({ error: 'Tên chức vụ đã tồn tại' });
      }

      // Kiểm tra department_ids hợp lệ
      if (department_ids && Array.isArray(department_ids)) {
        for (const deptId of department_ids) {
          if (typeof deptId !== 'string') {
            return res.status(400).json({ error: 'department_ids phải là mảng chuỗi' });
          }
          const deptExists = await prisma.departments.findUnique({
            where: { department_id: deptId },
          });
          if (!deptExists) {
            return res.status(400).json({ error: `Phòng ban với ID ${deptId} không tồn tại` });
          }
        }
      }

      const position = await prisma.positions.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
        },
        include: {
          employees: {
            select: {
              employee_id: true,
              department_id: true,
            },
          },
        },
      });

      // Liên kết với phòng ban
      const assignedDepartmentIds: string[] = [];
      if (department_ids && Array.isArray(department_ids)) {
        for (const deptId of department_ids) {
          // Cập nhật nhân viên trong phòng ban, bỏ qua logic position_id: null
          await prisma.employees.updateMany({
            where: {
              department_id: deptId,
              employment_status: { not: 'TERMINATED' },
            },
            data: { position_id: position.position_id },
          });
          assignedDepartmentIds.push(deptId);
        }
      }

      const response = {
        position_id: position.position_id,
        name: position.name,
        description: position.description || '',
        created_at: position.created_at.toISOString(),
        updated_at: position.updated_at.toISOString(),
        employee_count: position.employees.length,
        department_ids: assignedDepartmentIds,
      };

      // console.log('Position created:', response);
      return res.status(201).json(response);
    } catch (error) {
      console.error('Lỗi khi tạo chức vụ:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi tạo chức vụ',
        details: (error as Error).message,
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}