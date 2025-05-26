import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'position_id là bắt buộc' });
  }

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

  // PUT: Cập nhật chức vụ
  if (req.method === 'PUT') {
    try {
      const { name, description, department_ids } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Tên chức vụ là bắt buộc' });
      }

      const positionExists = await prisma.positions.findUnique({
        where: { position_id: id },
        include: { employees: { select: { employee_id: true, department_id: true } } },
      });
      if (!positionExists) {
        return res.status(404).json({ error: 'Chức vụ không tồn tại' });
      }

      const updatedPosition = await prisma.positions.update({
        where: { position_id: id },
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
          updated_at: new Date(),
        },
        include: { employees: { select: { employee_id: true, department_id: true } } },
      });

      // Cập nhật liên kết phòng ban
      if (department_ids && Array.isArray(department_ids)) {
        await prisma.employees.updateMany({
          where: { position_id: id },
          data: { position_id: null },
        });
        for (const deptId of department_ids) {
          const deptExists = await prisma.departments.findUnique({
            where: { department_id: deptId },
          });
          if (deptExists) {
            await prisma.employees.updateMany({
              where: {
                department_id: deptId,
                position_id: null,
              },
              data: { position_id: id },
            });
          }
        }
      }

      const response = {
        position_id: updatedPosition.position_id,
        name: updatedPosition.name,
        description: updatedPosition.description || '',
        created_at: updatedPosition.created_at.toISOString(),
        updated_at: updatedPosition.updated_at.toISOString(),
        employee_count: updatedPosition.employees.length,
        department_ids: updatedPosition.employees
          .map((emp) => emp.department_id)
          .filter((id): id is string => !!id),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi cập nhật chức vụ:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi cập nhật chức vụ',
        details: (error as Error).message,
      });
    }
  }

  // DELETE: Xóa chức vụ
  else if (req.method === 'DELETE') {
    try {
      const positionExists = await prisma.positions.findUnique({
        where: { position_id: id },
        include: { employees: { select: { employee_id: true } } },
      });
      if (!positionExists) {
        return res.status(404).json({ error: 'Chức vụ không tồn tại' });
      }

      if (positionExists.employees.length > 0) {
        return res.status(400).json({
          error: `Không thể xóa chức vụ đang được sử dụng bởi ${positionExists.employees.length} nhân viên`,
        });
      }

      await prisma.positions.delete({
        where: { position_id: id },
      });

      return res.status(200).json({ message: 'Xóa chức vụ thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa chức vụ:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi xóa chức vụ',
        details: (error as Error).message,
      });
    }
  }

  else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}