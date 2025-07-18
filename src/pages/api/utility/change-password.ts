import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const ChangePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu cũ')
    .min(8, 'Mật khẩu cũ phải có ít nhất 8 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu cũ phải chứa ít nhất một chữ hoa, một chữ thường và một số'
    ),
  newPassword: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu mới')
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu mới phải chứa ít nhất một chữ hoa, một chữ thường và một số'
    ),
  confirmNewPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword'],
});

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được phép' });
  }

  try {
    // Validate request body
    const parsed = ChangePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((err) => err.message).join(', ');
      return res.status(400).json({ error: errorMessage });
    }

    const { oldPassword, newPassword } = parsed.data;

    // Get token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Không tìm thấy token xác thực' });
    }

    // Verify token
    let decoded: unknown;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // Type guard for decoded token
    if (typeof decoded !== 'object' || !decoded || !('employee_id' in decoded)) {
      return res.status(401).json({ error: 'Token không hợp lệ' });
    }

    const { employee_id } = decoded as { employee_id: string };

    // Fetch user
    const user = await prisma.users.findFirst({
      where: {
        employee_id,
        is_active: true,
      },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isOldPasswordValid) {
      return res.status(400).json({ error: 'Mật khẩu cũ không đúng' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { password_hash: newPasswordHash },
    });

    // Log activity
    await prisma.loginLogs.create({
      data: {
        log_id: uuidv4(),
        user_id: user.user_id,
        username: user.username,
        activity: 'Thay đổi mật khẩu',
        status: 'Thành công',
        ip_address: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
        created_at: new Date(),
      },
    });

    // Queue confirmation email
    await prisma.emailQueue.create({
      data: {
        email_id: uuidv4(),
        to_email: user.email,
        subject: 'Thay đổi mật khẩu thành công',
        body: `
          Xin chào ${user.employee.full_name},
          
          Mật khẩu của bạn đã được thay đổi thành công vào lúc ${new Date().toLocaleString('vi-VN')}.
          Nếu bạn không thực hiện hành động này, vui lòng liên hệ đội ngũ quản lý ngay lập tức.
          
          Đăng nhập ngay: ${process.env.FRONTEND_URL}/auths/login
          
          Trân trọng,
          Đội ngũ quản lý nhân sự
        `,
        status: 'PENDING',
        send_at: new Date(),
      },
    });

    return res.status(200).json({
      message: 'Thay đổi mật khẩu thành công. Vui lòng kiểm tra email để xác nhận.',
    });
  } catch (error: unknown) {
    console.error('Lỗi khi xử lý yêu cầu change-password:', error);
    return res.status(500).json({ error: 'Đã xảy ra lỗi server. Vui lòng thử lại sau.' });
  } finally {
    await prisma.$disconnect();
  }
}