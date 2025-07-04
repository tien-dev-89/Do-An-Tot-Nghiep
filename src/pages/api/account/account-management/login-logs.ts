import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const prisma = new PrismaClient();

const LoginLogFilterSchema = z.object({
  username: z.string().optional(),
  status: z.enum(['all', 'success', 'failed']).optional(),
  timeRange: z.enum(['today', 'week', 'month', 'all']).optional(),
  user_id: z.string().uuid('ID người dùng không hợp lệ').optional(),
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
    }

    const parsedQuery = LoginLogFilterSchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ success: false, error: parsedQuery.error.message });
    }

    const { username, status, timeRange, user_id } = parsedQuery.data;

    // Xây dựng điều kiện lọc
    const where: Record<string, unknown> = {};

    if (user_id) {
      where.user_id = user_id;
    }

    if (username) {
      where.username = { contains: username, mode: 'insensitive' };
    }

    if (status && status !== 'all') {
      where.status = status === 'success' ? 'Thành công' : 'Thất bại';
    }

    if (timeRange && timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }

      where.created_at = { gte: startDate };
    }

    const loginLogs = await prisma.loginLogs.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    const formattedLogs = loginLogs.map((log) => ({
      log_id: log.log_id,
      user_id: log.user_id,
      username: log.username,
      activity: log.activity,
      status: log.status,
      ip_address: log.ip_address || 'N/A',
      user_agent: log.user_agent || 'N/A',
      created_at: log.created_at.toISOString(),
    }));

    return res.status(200).json({ success: true, data: formattedLogs });
  } catch (error: unknown) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Lỗi server' });
  } finally {
    await prisma.$disconnect();
  }
}