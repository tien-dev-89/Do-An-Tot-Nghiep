import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { authenticateToken } from '../../../lib/auth';

const prisma = new PrismaClient();

const EmailQueueSchema = z.object({
  to_email: z.string().email('Email không hợp lệ'),
  subject: z.string().min(1, 'Chủ đề không được để trống'),
  body: z.string().min(1, 'Nội dung không được để trống'),
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  const allowedRoles = ['Admin', 'role_admin'];
  const user = await authenticateToken(req, res, allowedRoles);
  if (!user) {
    console.error("Authentication failed for /api/email/queue", req.headers.authorization);
    return;
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
    }

    const parsedBody = EmailQueueSchema.safeParse(req.body);
    if (!parsedBody.success) {
      console.error("Invalid email queue data:", parsedBody.error.message, req.body);
      return res.status(400).json({ success: false, error: parsedBody.error.message });
    }

    const { to_email, subject, body } = parsedBody.data;
    console.log("Creating email queue entry:", { to_email, subject, body });

    const email = await prisma.emailQueue.create({
      data: {
        email_id: crypto.randomUUID().toString(),
        to_email,
        subject,
        body,
        status: 'PENDING',
        send_at: new Date(),
        created_at: new Date(),
      },
    });
    console.log("Email queue entry created:", email);

    return res.status(201).json({ success: true, data: email });
  } catch (error: unknown) {
    console.error('API nhận email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi server';
    return res.status(500).json({ success: false, error: errorMessage });
  } finally {
    await prisma.$disconnect();
  }
}