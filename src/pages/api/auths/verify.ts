import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

interface VerifyResponse {
  success: boolean;
  message?: string;
  user?: {
    user_id: string;
    username: string;
    employee_id: string;
    email: string;
    roles: string[];
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Phương thức không được phép' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      user_id: string;
      username: string;
      employee_id: string;
      email: string;
      roles: string[];
    };

    // Lấy thông tin người dùng từ database để đảm bảo tài khoản còn hoạt động
    const user = await prisma.users.findUnique({
      where: { user_id: decoded.user_id },
      include: {
        user_roles: { include: { role: true } },
        employee: true,
      },
    });

    if (!user || !user.is_active || !user.employee) {
      return res.status(401).json({ success: false, message: 'Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa' });
    }

    // Trả về thông tin người dùng
    const roles = user.user_roles.map((ur) => ur.role.name);
    return res.status(200).json({
      success: true,
      user: {
        user_id: user.user_id,
        username: user.username,
        employee_id: user.employee_id,
        email: user.employee.email,
        roles,
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}