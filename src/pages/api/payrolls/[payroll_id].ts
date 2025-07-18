
import { PrismaClient, PayrollStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  employee_id: string;
  role_id: string;
}

const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error('Token không hợp lệ');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const { payroll_id } = req.query;

  if (typeof payroll_id !== 'string') {
    return res.status(400).json({ error: 'payroll_id không hợp lệ' });
  }

  if (req.method === 'GET') {
    try {
      const payroll = await prisma.payrolls.findUnique({
        where: { payroll_id },
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
              email: true,
              phone_number: true,
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

      if (!payroll) {
        return res.status(404).json({ error: 'Bảng lương không tồn tại' });
      }

      const response = {
        payroll_id: payroll.payroll_id,
        employee_id: payroll.employee_id,
        employee_name: payroll.employee.full_name,
        employee_email: payroll.employee.email,
        employee_phone: payroll.employee.phone_number || 'Không có',
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
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết bảng lương:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}