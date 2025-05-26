import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được phép' });
  }

  const { token, newPassword }: ResetPasswordRequest = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng cung cấp token và mật khẩu mới' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 8 ký tự' });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      user_id: string;
      email: string;
    };

    // Tìm user theo user_id
    const user = await prisma.users.findUnique({
      where: { user_id: decoded.user_id },
      include: { employee: true },
    });

    if (!user || user.employee.email !== decoded.email) {
      return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Mã hóa mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu trong database
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { password_hash: passwordHash },
    });

    // Thêm thông báo vào EmailQueue để xác nhận đổi mật khẩu thành công
    await prisma.emailQueue.create({
      data: {
        email_id: crypto.randomUUID(),
        to_email: user.employee.email,
        subject: 'Mật khẩu của bạn đã được thay đổi',
        body: `
          Xin chào ${user.employee.full_name},
          <br><br>
          Mật khẩu của bạn đã được thay đổi thành công vào lúc ${new Date().toLocaleString()}.
          <br>
          Nếu bạn không thực hiện hành động này, vui lòng liên hệ với bộ phận hỗ trợ ngay lập tức.
          <br><br>
          Trân trọng,<br>
          Đội ngũ quản lý nhân sự
        `,
        status: 'PENDING',
        send_at: new Date(),
      },
    });

    return res.status(200).json({ message: 'Mật khẩu đã được đặt lại thành công' });
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
    // if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token đã hết hạn' });
    }
    console.error('Lỗi khi xử lý yêu cầu reset-password:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi server. Vui lòng thử lại sau.' });
  } finally {
    await prisma.$disconnect();
  }
}