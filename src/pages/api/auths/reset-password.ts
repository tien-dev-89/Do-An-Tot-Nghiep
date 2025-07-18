import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không được để trống'),
});

interface ApiResponse {
  message?: string;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Phương thức không được phép' });
  }

  try {
    const { token } = req.query;
    const parsed = ResetPasswordSchema.safeParse({ token });
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((err) => err.message).join(', ');
      return res
        .status(400)
        .redirect(`/auths/login?error=${encodeURIComponent(errorMessage)}`);
    }

    const { token: validatedToken } = parsed.data;

    // Verify token
    let decoded: unknown;
    try {
      decoded = jwt.verify(validatedToken, process.env.JWT_SECRET || 'your-secret-key');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
      return res
        .status(400)
        .redirect(
          `/auths/login?error=${encodeURIComponent('Token không hợp lệ hoặc đã hết hạn')}`
        );
    }

    // Type guard for decoded token
    if (typeof decoded !== 'object' || !decoded || !('user_id' in decoded) || !('email' in decoded)) {
      return res
        .status(400)
        .redirect(`/auths/login?error=${encodeURIComponent('Token không hợp lệ')}`);
    }

    const { user_id, email } = decoded as { user_id: string; email: string };

    // Check if token exists and is valid
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token: validatedToken,
        user_id,
        expires_at: { gte: new Date() },
      },
    });

    if (!resetToken) {
      return res
        .status(400)
        .redirect(
          `/auths/login?error=${encodeURIComponent('Token không hợp lệ hoặc đã hết hạn')}`
        );
    }

    // Fetch user and employee
    const user = await prisma.users.findFirst({
      where: {
        user_id,
        email,
        is_active: true,
      },
      include: { employee: true },
    });

    if (!user || !user.employee) {
      return res
        .status(404)
        .redirect(`/auths/login?error=${encodeURIComponent('Người dùng không tồn tại')}`);
    }

    // Generate new password: FullName + DDMMYYYY
    const { full_name, birth_date } = user.employee;
    if (!birth_date) {
      return res
        .status(400)
        .redirect(
          `/auths/login?error=${encodeURIComponent('Không tìm thấy ngày sinh của nhân viên')}`
        );
    }

    const cleanFullName = full_name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');
    const birthDateStr = birth_date.toISOString().split('T')[0].split('-').reverse().join('');
    const newPassword = `${cleanFullName}${birthDateStr}`;

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.users.update({
      where: { user_id },
      data: { password_hash: passwordHash },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { token_id: resetToken.token_id },
    });

    // Add email to EmailQueue
    await prisma.emailQueue.create({
      data: {
        email_id: uuidv4(),
        to_email: email,
        subject: 'Đặt lại mật khẩu thành công',
        body: `
          Xin chào ${full_name},
           
          Mật khẩu của bạn đã được đặt lại thành công. Mật khẩu mới của bạn là: ${newPassword}
           
          Vui lòng đăng nhập và thay đổi mật khẩu này ngay khi có thể để đảm bảo an toàn.
           
          Đăng nhập ngay: ${process.env.FRONTEND_URL}/auths/login

           
          Trân trọng,
          Đội ngũ quản lý nhân sự.
        `,
        status: 'PENDING',
        send_at: new Date(),
      },
    });

    return res.redirect(
      `/auths/login?success=${encodeURIComponent(
        'Mật khẩu đã được đặt lại thành công. Vui lòng kiểm tra email để nhận mật khẩu mới.'
      )}`
    );
  } catch (error: unknown) {
    console.error('Lỗi khi xử lý yêu cầu reset-password:', error);
    return res
      .status(500)
      .redirect(
        `/auths/login?error=${encodeURIComponent('Đã xảy ra lỗi server. Vui lòng thử lại sau.')}`
      );
  } finally {
    await prisma.$disconnect();
  }
}