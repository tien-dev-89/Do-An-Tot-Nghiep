import { PrismaClient, EmploymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

// Type guard cho req.body
interface DepartmentInput {
  department_id?: string;
  name: string;
  description?: string | null;
  manager_id?: string | null;
}

const isDepartmentInput = (data: unknown): data is DepartmentInput => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof data.name === 'string' &&
    (!('description' in data) || data.description === null || typeof data.description === 'string') &&
    (!('manager_id' in data) || data.manager_id === null || typeof data.manager_id === 'string') &&
    (!('department_id' in data) || typeof data.department_id === 'string')
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Lấy danh sách phòng ban
  if (req.method === 'GET') {
    try {
      const departments = await prisma.departments.findMany({
        select: {
          department_id: true,
          name: true,
          description: true,
          manager_id: true,
          manager: {
            select: {
              full_name: true,
            },
          },
          _count: {
            select: {
              employees: {
                where: {
                  employment_status: { not: EmploymentStatus.TERMINATED },
                },
              },
            },
          },
        },
      });

      const response = departments.map((dept) => ({
        department_id: dept.department_id,
        name: dept.name,
        manager_id: dept.manager_id,
        manager_name: dept.manager?.full_name || null,
        description: dept.description,
        employee_count: dept._count.employees,
      }));

      console.log('Departments fetched:', response);
      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng ban:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // POST: Tạo phòng ban mới
  else if (req.method === 'POST') {
    try {
      const input = req.body;
      if (!isDepartmentInput(input)) {
        return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
      }

      const { name, description, manager_id } = input;

      if (!name.trim()) {
        return res.status(400).json({ error: 'Tên phòng ban là bắt buộc' });
      }

      if (manager_id) {
        const managerExists = await prisma.employees.findUnique({
          where: { employee_id: manager_id },
        });
        if (!managerExists) {
          return res.status(404).json({ error: 'Quản lý không tồn tại' });
        }
        if (managerExists.employment_status === 'TERMINATED') {
          return res.status(400).json({ error: 'Quản lý đã nghỉ việc không thể được chỉ định' });
        }
      }

      // Kiểm tra tên phòng ban trùng lặp
      const existingDepartment = await prisma.departments.findFirst({
        where: { name: name.trim() },
      });
      if (existingDepartment) {
        return res.status(400).json({ error: 'Tên phòng ban đã tồn tại' });
      }

      const newDepartment = await prisma.departments.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          manager_id: manager_id || null,
        },
        select: {
          department_id: true,
          name: true,
          description: true,
          manager_id: true,
          manager: {
            select: {
              full_name: true,
            },
          },
        },
      });

      const response = {
        department_id: newDepartment.department_id,
        name: newDepartment.name,
        description: newDepartment.description,
        manager_id: newDepartment.manager_id,
        manager_name: newDepartment.manager?.full_name || null,
        employee_count: 0,
        employees: [],
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error('Lỗi khi tạo phòng ban:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // PUT: Cập nhật phòng ban
  else if (req.method === 'PUT') {
    try {
      const input = req.body;
      if (!isDepartmentInput(input) || !input.department_id) {
        return res.status(400).json({ error: 'Dữ liệu đầu vào hoặc department_id không hợp lệ' });
      }

      const { department_id, name, description, manager_id } = input;

      const departmentExists = await prisma.departments.findUnique({
        where: { department_id },
      });
      if (!departmentExists) {
        return res.status(404).json({ error: 'Phòng ban không tồn tại' });
      }

      if (manager_id) {
        const managerExists = await prisma.employees.findUnique({
          where: { employee_id: manager_id },
        });
        if (!managerExists) {
          return res.status(404).json({ error: 'Quản lý không tồn tại' });
        }
        if (managerExists.employment_status === 'TERMINATED') {
          return res.status(400).json({ error: 'Quản lý đã nghỉ việc không thể được chỉ định' });
        }
      }

      // Kiểm tra tên phòng ban trùng lặp (trừ chính nó)
      const existingDepartment = await prisma.departments.findFirst({
        where: {
          name: name.trim(),
          department_id: { not: department_id },
        },
      });
      if (existingDepartment) {
        return res.status(400).json({ error: 'Tên phòng ban đã tồn tại' });
      }

      const updatedDepartment = await prisma.departments.update({
        where: { department_id },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          manager_id: manager_id || null,
        },
        select: {
          department_id: true,
          name: true,
          description: true,
          manager_id: true,
          manager: {
            select: {
              full_name: true,
            },
          },
        },
      });

      const employeeCount = await prisma.employees.count({
        where: {
          department_id,
          employment_status: { not: EmploymentStatus.TERMINATED },
        },
      });

      const response = {
        department_id: updatedDepartment.department_id,
        name: updatedDepartment.name,
        description: updatedDepartment.description,
        manager_id: updatedDepartment.manager_id,
        manager_name: updatedDepartment.manager?.full_name || null,
        employee_count: employeeCount,
        employees: [], // Để đồng bộ với /api/departments/[id]
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi cập nhật phòng ban:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // DELETE: Xóa phòng ban
  else if (req.method === 'DELETE') {
    try {
      const input = req.body;
      if (typeof input !== 'object' || input === null || !('department_id' in input) || typeof input.department_id !== 'string') {
        return res.status(400).json({ error: 'department_id không hợp lệ' });
      }

      const { department_id } = input;

      const departmentExists = await prisma.departments.findUnique({
        where: { department_id },
      });
      if (!departmentExists) {
        return res.status(404).json({ error: 'Phòng ban không tồn tại' });
      }

      const employeeCount = await prisma.employees.count({
        where: {
          department_id,
          employment_status: { not: EmploymentStatus.TERMINATED },
        },
      });
      if (employeeCount > 0) {
        return res.status(400).json({ error: 'Không thể xóa phòng ban có nhân viên đang hoạt động' });
      }

      await prisma.departments.delete({
        where: { department_id },
      });

      return res.status(200).json({ message: 'Xóa phòng ban thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa phòng ban:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}