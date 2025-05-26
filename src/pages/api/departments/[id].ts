import { PrismaClient, EmploymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'department_id là bắt buộc' });
  }

  // GET: Lấy chi tiết phòng ban
  if (req.method === 'GET') {
    try {
      const department = await prisma.departments.findUnique({
        where: { department_id: id },
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
          employees: {
            select: {
              employee_id: true,
              full_name: true,
              email: true,
              phone_number: true,
              employment_status: true,
              gender: true,
            },
          },
        },
      });

      if (!department) {
        return res.status(404).json({ error: 'Phòng ban không tồn tại' });
      }

      const activeEmployees = department.employees.filter(
        (emp) => emp.employment_status !== EmploymentStatus.TERMINATED
      );

      const response = {
        department_id: department.department_id,
        name: department.name,
        description: department.description,
        manager_id: department.manager_id,
        manager_name: department.manager?.full_name || null,
        employee_count: activeEmployees.length,
        employees: activeEmployees.map((emp) => ({
          employee_id: emp.employee_id,
          full_name: emp.full_name,
          email: emp.email,
          phone: emp.phone_number || '',
          gender: emp.gender === 'MALE' ? 'Nam' : emp.gender === 'FEMALE' ? 'Nữ' : '',
          employment_status:
            emp.employment_status === EmploymentStatus.ACTIVE
              ? 'Đang làm'
              : emp.employment_status === EmploymentStatus.PROBATION
              ? 'Thử việc'
              : emp.employment_status === EmploymentStatus.MATERNITY_LEAVE
              ? 'Nghỉ thai sản'
              : 'Nghỉ việc',
        })),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết phòng ban:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi lấy chi tiết phòng ban',
        details: (error as Error).message,
      });
    }
  }

  // PUT: Cập nhật thông tin phòng ban
  else if (req.method === 'PUT') {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Tên phòng ban là bắt buộc' });
      }

      const departmentExists = await prisma.departments.findUnique({
        where: { department_id: id },
      });
      if (!departmentExists) {
        return res.status(404).json({ error: 'Phòng ban không tồn tại' });
      }

      const updatedDepartment = await prisma.departments.update({
        where: { department_id: id },
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
          updated_at: new Date(),
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
          department_id: id,
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
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi cập nhật phòng ban:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi cập nhật phòng ban',
        details: (error as Error).message,
      });
    }
  }

  // PATCH: Thêm hoặc xóa nhân viên khỏi phòng ban
  else if (req.method === 'PATCH') {
    try {
      const { action, employee_id } = req.body;

      if (!['add', 'remove'].includes(action) || !employee_id) {
        return res
          .status(400)
          .json({ error: 'action (add/remove) và employee_id là bắt buộc' });
      }

      const departmentExists = await prisma.departments.findUnique({
        where: { department_id: id },
      });
      if (!departmentExists) {
        return res.status(404).json({ error: 'Phòng ban không tồn tại' });
      }

      const employeeExists = await prisma.employees.findUnique({
        where: { employee_id },
      });
      if (!employeeExists) {
        return res.status(404).json({ error: 'Nhân viên không tồn tại' });
      }

      if (action === 'add') {
        await prisma.employees.update({
          where: { employee_id },
          data: {
            department_id: id,
            employment_status: EmploymentStatus.ACTIVE,
            updated_at: new Date(),
          },
        });

        const employeeCount = await prisma.employees.count({
          where: {
            department_id: id,
            employment_status: { not: EmploymentStatus.TERMINATED },
          },
        });

        return res.status(200).json({ message: 'Thêm nhân viên thành công', employee_count: employeeCount });
      } else if (action === 'remove') {
        await prisma.employees.update({
          where: { employee_id },
          data: {
            department_id: null,
            updated_at: new Date(),
          },
        });

        const employeeCount = await prisma.employees.count({
          where: {
            department_id: id,
            employment_status: { not: EmploymentStatus.TERMINATED },
          },
        });

        return res.status(200).json({ message: 'Xóa nhân viên khỏi phòng ban thành công', employee_count: employeeCount });
      }
    } catch (error) {
      console.error('Lỗi khi xử lý nhân viên:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi xử lý nhân viên',
        details: (error as Error).message,
      });
    }
  }

  // Xử lý phương thức không được hỗ trợ
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'PATCH']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}