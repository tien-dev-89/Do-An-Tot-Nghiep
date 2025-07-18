import { PrismaClient, PayrollStatus, EmploymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  employee_id: string;
  role_id: string;
}

// Middleware kiểm tra JWT
const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Token không hợp lệ');
  }
};

interface PayrollInput {
  payroll_id?: string;
  employee_id: string;
  month: string;
  base_salary: number;
  overtime_bonus?: number;
  late_penalty?: number;
  total_salary: number;
  status: PayrollStatus;
}

const isPayrollInput = (data: unknown): data is PayrollInput => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'employee_id' in data &&
    typeof data.employee_id === 'string' &&
    'month' in data &&
    typeof data.month === 'string' &&
    'base_salary' in data &&
    typeof data.base_salary === 'number' &&
    'total_salary' in data &&
    typeof data.total_salary === 'number' &&
    'status' in data &&
    (data.status === PayrollStatus.PAID || data.status === PayrollStatus.UNPAID) &&
    (!('overtime_bonus' in data) || typeof data.overtime_bonus === 'number') &&
    (!('late_penalty' in data) || typeof data.late_penalty === 'number') &&
    (!('payroll_id' in data) || typeof data.payroll_id === 'string')
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kiểm tra token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Thiếu hoặc sai định dạng token' });
  }

  try {
    verifyToken(authHeader.split(' ')[1]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ' });
  }

  // GET: Lấy danh sách bảng lương với phân trang
  if (req.method === 'GET') {
    try {
      const { month, department, status, search, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        return res.status(400).json({ error: 'Tham số phân trang không hợp lệ' });
      }

      const skip = (pageNum - 1) * limitNum;

      const payrolls = await prisma.payrolls.findMany({
        where: {
          month: typeof month === 'string' ? month : undefined,
          status: typeof status === 'string' && (status === PayrollStatus.PAID || status === PayrollStatus.UNPAID) ? status : undefined,
          employee: {
            department: {
              name: typeof department === 'string' ? department : undefined,
            },
            full_name: typeof search === 'string' ? { contains: search, mode: 'insensitive' } : undefined,
            employment_status: { not: EmploymentStatus.TERMINATED },
          },
        },
        select: {
          payroll_id: true,
          employee_id: true,
          month: true,
          base_salary: true,
          overtime_bonus: true,
          late_penalty: true,
          total_salary: true,
          status: true,
          created_at: true,
          updated_at: true,
          employee: {
            select: {
              full_name: true,
              department: {
                select: { name: true },
              },
              position: {
                select: { name: true },
              },
            },
          },
        },
        skip,
        take: limitNum,
      });

      const total = await prisma.payrolls.count({
        where: {
          month: typeof month === 'string' ? month : undefined,
          status: typeof status === 'string' && (status === PayrollStatus.PAID || status === PayrollStatus.UNPAID) ? status : undefined,
          employee: {
            department: {
              name: typeof department === 'string' ? department : undefined,
            },
            full_name: typeof search === 'string' ? { contains: search, mode: 'insensitive' } : undefined,
            employment_status: { not: EmploymentStatus.TERMINATED },
          },
        },
      });

      const response = payrolls.map((payroll) => ({
        payroll_id: payroll.payroll_id,
        employee_id: payroll.employee_id,
        employee_name: payroll.employee.full_name,
        department: payroll.employee.department?.name || 'Không xác định',
        position: payroll.employee.position?.name || 'Không xác định',
        month: payroll.month,
        base_salary: Number(payroll.base_salary),
        overtime_bonus: Number(payroll.overtime_bonus),
        late_penalty: Number(payroll.late_penalty),
        total_salary: Number(payroll.total_salary),
        status: payroll.status === PayrollStatus.PAID ? 'Đã nhận' : 'Chưa nhận',
        created_at: payroll.created_at.toISOString(),
        updated_at: payroll.updated_at.toISOString(),
      }));

      return res.status(200).json({ payrolls: response, total, page: pageNum, limit: limitNum });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bảng lương:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // POST: Tạo bảng lương mới
  else if (req.method === 'POST') {
    try {
      const input = req.body;
      if (!isPayrollInput(input)) {
        return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
      }

      const { employee_id, month, base_salary, overtime_bonus, late_penalty, total_salary, status } = input;

      const employeeExists = await prisma.employees.findUnique({
        where: { employee_id },
      });
      if (!employeeExists) {
        return res.status(404).json({ error: 'Nhân viên không tồn tại' });
      }
      if (employeeExists.employment_status === EmploymentStatus.TERMINATED) {
        return res.status(400).json({ error: 'Nhân viên đã nghỉ việc không thể tạo bảng lương' });
      }

      const existingPayroll = await prisma.payrolls.findFirst({
        where: { employee_id, month },
      });
      if (existingPayroll) {
        return res.status(400).json({ error: 'Bảng lương cho nhân viên này trong tháng đã tồn tại' });
      }

      const newPayroll = await prisma.payrolls.create({
        data: {
          employee_id,
          month,
          base_salary,
          overtime_bonus: overtime_bonus || 0,
          late_penalty: late_penalty || 0,
          total_salary,
          status,
        },
        select: {
          payroll_id: true,
          employee_id: true,
          month: true,
          base_salary: true,
          overtime_bonus: true,
          late_penalty: true,
          total_salary: true,
          status: true,
          created_at: true,
          updated_at: true,
          employee: {
            select: {
              full_name: true,
              department: {
                select: { name: true },
              },
              position: {
                select: { name: true },
              },
            },
          },
        },
      });

      const response = {
        payroll_id: newPayroll.payroll_id,
        employee_id: newPayroll.employee_id,
        employee_name: newPayroll.employee.full_name,
        department: newPayroll.employee.department?.name || 'Không xác định',
        position: newPayroll.employee.position?.name || 'Không xác định',
        month: newPayroll.month,
        base_salary: Number(newPayroll.base_salary),
        overtime_bonus: Number(newPayroll.overtime_bonus),
        late_penalty: Number(newPayroll.late_penalty),
        total_salary: Number(newPayroll.total_salary),
        status: newPayroll.status === PayrollStatus.PAID ? 'Đã nhận' : 'Chưa nhận',
        created_at: newPayroll.created_at.toISOString(),
        updated_at: newPayroll.updated_at.toISOString(),
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error('Lỗi khi tạo bảng lương:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // PUT: Cập nhật bảng lương
  else if (req.method === 'PUT') {
  try {
    const input = req.body;
    if (!input || !input.payroll_id || typeof input.payroll_id !== 'string') {
      return res.status(400).json({ error: 'payroll_id không hợp lệ' });
    }

    const payrollExists = await prisma.payrolls.findUnique({
      where: { payroll_id: input.payroll_id },
    });
    if (!payrollExists) {
      return res.status(404).json({ error: 'Bảng lương không tồn tại' });
    }

    const updateData: Partial<PayrollInput> = {};
    if (input.status && (input.status === PayrollStatus.PAID || input.status === PayrollStatus.UNPAID)) {
      updateData.status = input.status;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Không có dữ liệu để cập nhật' });
    }

    const updatedPayroll = await prisma.payrolls.update({
      where: { payroll_id: input.payroll_id },
      data: updateData,
      select: {
        payroll_id: true,
        employee_id: true,
        month: true,
        base_salary: true,
        overtime_bonus: true,
        late_penalty: true,
        total_salary: true,
        status: true,
        created_at: true,
        updated_at: true,
        employee: {
          select: {
            full_name: true,
            department: {
              select: { name: true },
            },
            position: {
              select: { name: true },
            },
          },
        },
      },
    });

    const response = {
      payroll_id: updatedPayroll.payroll_id,
      employee_id: updatedPayroll.employee_id,
      employee_name: updatedPayroll.employee.full_name,
      department: updatedPayroll.employee.department?.name || 'Không xác định',
      position: updatedPayroll.employee.position?.name || 'Không xác định',
      month: updatedPayroll.month,
      base_salary: Number(updatedPayroll.base_salary),
      overtime_bonus: Number(updatedPayroll.overtime_bonus),
      late_penalty: Number(updatedPayroll.late_penalty),
      total_salary: Number(updatedPayroll.total_salary),
      status: updatedPayroll.status === PayrollStatus.PAID ? 'Đã nhận' : 'Chưa nhận',
      created_at: updatedPayroll.created_at.toISOString(),
      updated_at: updatedPayroll.updated_at.toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Lỗi khi cập nhật bảng lương:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
  }
}

  // DELETE: Xóa bảng lương
  else if (req.method === 'DELETE') {
    try {
      const input = req.body;
      if (typeof input !== 'object' || input === null || !('payroll_id' in input) || typeof input.payroll_id !== 'string') {
        return res.status(400).json({ error: 'payroll_id không hợp lệ' });
      }

      const { payroll_id } = input;

      const payrollExists = await prisma.payrolls.findUnique({
        where: { payroll_id },
      });
      if (!payrollExists) {
        return res.status(404).json({ error: 'Bảng lương không tồn tại' });
      }

      await prisma.payrolls.delete({
        where: { payroll_id },
      });

      return res.status(200).json({ message: 'Xóa bảng lương thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa bảng lương:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}