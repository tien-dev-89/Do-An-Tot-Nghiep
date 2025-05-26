import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface ForgotPasswordRequest {
  email: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được phép' });
  }

  const { email }: ForgotPasswordRequest = req.body;

  // Kiểm tra email hợp lệ
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Vui lòng cung cấp email hợp lệ' });
  }

  try {
    // Tìm user theo email
    const user = await prisma.users.findFirst({
      where: {
        employee: { email: email.toLowerCase() },
        is_active: true,
      },
      include: { employee: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });
    }

    // Tạo token reset mật khẩu
    const resetToken = jwt.sign(
      { user_id: user.user_id, email: user.employee.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Tạo link reset mật khẩu
    const resetLink = `${process.env.FRONTEND_URL}/auths/reset-password?token=${resetToken}`;

    // Thêm vào EmailQueue
    await prisma.emailQueue.create({
      data: {
        email_id: uuidv4(),
        to_email: email,
        subject: 'Yêu cầu đặt lại mật khẩu',
        body: `
          Xin chào ${user.employee.full_name},
          <br><br>
          Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu:
          <br>
          <a href="${resetLink}">Đặt lại mật khẩu</a>
          <br><br>
          Liên kết này có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
          <br><br>
          Trân trọng,<br>
          Đội ngũ quản lý nhân sự
        `,
        status: 'PENDING',
        send_at: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.',
    });
  } catch (error) {
    console.error('Lỗi khi xử lý yêu cầu forgot-password:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi server. Vui lòng thử lại sau.' });
  } finally {
    await prisma.$disconnect();
  }
}