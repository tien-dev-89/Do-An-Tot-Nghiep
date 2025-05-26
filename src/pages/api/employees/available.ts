import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const employees = await prisma.employees.findMany({
        where: {
          employment_status: { not: 'TERMINATED' },
          department: {
            is: null, // Nhân viên chưa thuộc phòng ban
          },
        },
        select: {
          employee_id: true,
          full_name: true,
        },
      });

      return res.status(200).json(employees);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
      return res.status(500).json({
        error: 'Lỗi máy chủ khi lấy danh sách nhân viên',
        details: (error as Error).message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}