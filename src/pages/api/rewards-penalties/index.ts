import { PrismaClient, RewardPenaltyType, RewardPenaltyStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

// Định nghĩa interface cho input của RewardPenalties
interface RewardPenaltyInput {
  employee_id: string;
  type: string;
  amount: number;
  reason: string;
  month: string;
  status?: string;
  approver_id?: string | null;
}

// Định nghĩa interface cho where clause dựa trên Prisma.RewardPenaltiesWhereInput
interface RewardPenaltiesWhereInput {
  OR?: Array<{
    employee?: { full_name?: { contains: string; mode?: 'insensitive' } };
    reason?: { contains: string; mode?: 'insensitive' };
  }>;
  month?: string;
  employee?: { department_id?: string };
  type?: RewardPenaltyType;
  status?: RewardPenaltyStatus;
}

// Kiểm tra định dạng input
const isRewardPenaltyInput = (data: unknown): data is RewardPenaltyInput => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'employee_id' in data && typeof data.employee_id === 'string' &&
    'type' in data && typeof data.type === 'string' &&
    'amount' in data && typeof data.amount === 'number' &&
    'reason' in data && typeof data.reason === 'string' &&
    'month' in data && typeof data.month === 'string' &&
    (!('status' in data) || data.status === null || typeof data.status === 'string') &&
    (!('approver_id' in data) || data.approver_id === null || typeof data.approver_id === 'string')
  );
};

// Ánh xạ giá trị từ client sang enum Prisma
const typeMap: Record<string, RewardPenaltyType> = {
  'Thưởng': RewardPenaltyType.REWARD,
  'Phạt': RewardPenaltyType.PENALTY,
};

const statusMap: Record<string, RewardPenaltyStatus> = {
  'Đã duyệt': RewardPenaltyStatus.APPROVED,
  'Chờ duyệt': RewardPenaltyStatus.PENDING,
  'Đã từ chối': RewardPenaltyStatus.REJECTED,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Kiểm tra token cho tất cả các method
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('x ')) {
    return res.status(401).json({ error: 'Thiếu hoặc sai định dạng token' });
  }

  // GET: Lấy danh sách thưởng/phạt
  if (req.method === 'GET') {
    try {
      const {
        page = '1',
        limit = '10',
        search = '',
        month = '',
        department_id = '',
        type = '',
        status = '',
      } = req.query;

      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;

      const where: RewardPenaltiesWhereInput = {};
      if (search) {
        where.OR = [
          { employee: { full_name: { contains: search as string, mode: 'insensitive' } } },
          { reason: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      if (month) {
        where.month = month as string;
      }
      if (department_id) {
        where.employee = { department_id: department_id as string };
      }
      if (type) {
        where.type = typeMap[type as string];
      }
      if (status) {
        where.status = statusMap[status as string];
      }

      const rewardsPenalties = await prisma.rewardPenalties.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true,
          employee_id: true,
          employee: {
            select: {
              full_name: true,
              department: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
          type: true,
          amount: true,
          reason: true,
          month: true,
          status: true,
          approver_id: true,
          approver: { select: { full_name: true } },
          created_at: true,
        },
      });

      const total = await prisma.rewardPenalties.count({ where });

      const response = rewardsPenalties.map((rp) => ({
        id: rp.id,
        employee_id: rp.employee_id,
        employee_name: rp.employee.full_name,
        department: rp.employee.department?.name || null,
        position: rp.employee.position?.name || null,
        type: rp.type === RewardPenaltyType.REWARD ? 'Thưởng' : 'Phạt',
        amount: Number(rp.amount),
        reason: rp.reason,
        month: rp.month,
        status: statusMap[rp.status] || rp.status,
        approver: rp.approver?.full_name || null,
        created_at: rp.created_at.toISOString(),
      }));

      return res.status(200).json({ rewardsPenalties: response, total });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thưởng/phạt:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // POST: Tạo mới thưởng/phạt
  else if (req.method === 'POST') {
    try {
      const input = req.body;
      if (!isRewardPenaltyInput(input)) {
        return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ' });
      }

      const { employee_id, type, amount, reason, month, status, approver_id } = input;

      if (!employee_id || !type || !amount || !reason || !month) {
        return res.status(400).json({ error: 'Thiếu các trường bắt buộc: employee_id, type, amount, reason, month' });
      }

      const employeeExists = await prisma.employees.findUnique({
        where: { employee_id },
      });
      if (!employeeExists) {
        return res.status(404).json({ error: 'Nhân viên không tồn tại' });
      }

      if (employeeExists.employment_status === 'TERMINATED') {
        return res.status(400).json({ error: 'Nhân viên đã nghỉ việc không thể được thưởng/phạt' });
      }

      if (approver_id) {
        const approverExists = await prisma.employees.findUnique({
          where: { employee_id: approver_id },
        });
        if (!approverExists) {
          return res.status(404).json({ error: 'Người duyệt không tồn tại' });
        }
      }

      const mappedType = typeMap[type];
      if (!mappedType) {
        return res.status(400).json({ error: 'Loại không hợp lệ. Phải là: Thưởng, Phạt' });
      }

      const mappedStatus = status ? statusMap[status] : RewardPenaltyStatus.PENDING;
      if (status && !mappedStatus) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ. Phải là: Đã duyệt, Chờ duyệt, Đã từ chối' });
      }

      const rewardPenalty = await prisma.rewardPenalties.create({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          id: require('uuid').v4(),
          employee_id,
          type: mappedType,
          amount,
          reason,
          month,
          status: mappedStatus,
          approver_id: approver_id || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        select: {
          id: true,
          employee_id: true,
          employee: {
            select: {
              full_name: true,
              department: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
          type: true,
          amount: true,
          reason: true,
          month: true,
          status: true,
          approver_id: true,
          approver: { select: { full_name: true } },
          created_at: true,
        },
      });

      const response = {
        id: rewardPenalty.id,
        employee_id: rewardPenalty.employee_id,
        employee_name: rewardPenalty.employee.full_name,
        department: rewardPenalty.employee.department?.name || null,
        position: rewardPenalty.employee.position?.name || null,
        type: rewardPenalty.type === RewardPenaltyType.REWARD ? 'Thưởng' : 'Phạt',
        amount: Number(rewardPenalty.amount),
        reason: rewardPenalty.reason,
        month: rewardPenalty.month,
        status: statusMap[rewardPenalty.status] || rewardPenalty.status,
        approver: rewardPenalty.approver?.full_name || null,
        created_at: rewardPenalty.created_at.toISOString(),
      };

      return res.status(201).json(response);
    } catch (error) {
      console.error('Lỗi khi tạo thưởng/phạt:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // PUT: Cập nhật thưởng/phạt
  else if (req.method === 'PUT') {
    try {
      const input = req.body;
      if (!isRewardPenaltyInput(input) || !('id' in input) || typeof input.id !== 'string') {
        return res.status(400).json({ error: 'Dữ liệu đầu vào hoặc id không hợp lệ' });
      }

      const { id, employee_id, type, amount, reason, month, status, approver_id } = input;

      const rewardPenaltyExists = await prisma.rewardPenalties.findUnique({
        where: { id },
      });
      if (!rewardPenaltyExists) {
        return res.status(404).json({ error: 'Thưởng/phạt không tồn tại' });
      }

      const employeeExists = await prisma.employees.findUnique({
        where: { employee_id },
      });
      if (!employeeExists) {
        return res.status(404).json({ error: 'Nhân viên không tồn tại' });
      }

      if (employeeExists.employment_status === 'TERMINATED') {
        return res.status(400).json({ error: 'Nhân viên đã nghỉ việc không thể được thưởng/phạt' });
      }

      if (approver_id) {
        const approverExists = await prisma.employees.findUnique({
          where: { employee_id: approver_id },
        });
        if (!approverExists) {
          return res.status(404).json({ error: 'Người duyệt không tồn tại' });
        }
      }

      const mappedType = typeMap[type];
      if (!mappedType) {
        return res.status(400).json({ error: 'Loại không hợp lệ. Phải là: Thưởng, Phạt' });
      }

      const mappedStatus = status ? statusMap[status] : rewardPenaltyExists.status;
      if (status && !mappedStatus) {
        return res.status(400).json({ error: 'Trạng thái không hợp lệ. Phải là: Đã duyệt, Chờ duyệt, Đã từ chối' });
      }

      const updatedRewardPenalty = await prisma.rewardPenalties.update({
        where: { id },
        data: {
          employee_id,
          type: mappedType,
          amount,
          reason,
          month,
          status: mappedStatus,
          approver_id: approver_id || null,
          updated_at: new Date(),
        },
        select: {
          id: true,
          employee_id: true,
          employee: {
            select: {
              full_name: true,
              department: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
          type: true,
          amount: true,
          reason: true,
          month: true,
          status: true,
          approver_id: true,
          approver: { select: { full_name: true } },
          created_at: true,
        },
      });

      const response = {
        id: updatedRewardPenalty.id,
        employee_id: updatedRewardPenalty.employee_id,
        employee_name: updatedRewardPenalty.employee.full_name,
        department: updatedRewardPenalty.employee.department?.name || null,
        position: updatedRewardPenalty.employee.position?.name || null,
        type: updatedRewardPenalty.type === RewardPenaltyType.REWARD ? 'Thưởng' : 'Phạt',
        amount: Number(updatedRewardPenalty.amount),
        reason: updatedRewardPenalty.reason,
        month: updatedRewardPenalty.month,
        status: statusMap[updatedRewardPenalty.status] || updatedRewardPenalty.status,
        approver: updatedRewardPenalty.approver?.full_name || null,
        created_at: updatedRewardPenalty.created_at.toISOString(),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Lỗi khi cập nhật thưởng/phạt:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  // DELETE: Xóa thưởng/phạt
  else if (req.method === 'DELETE') {
    try {
      const input = req.body;
      if (typeof input !== 'object' || input === null || !('id' in input) || typeof input.id !== 'string') {
        return res.status(400).json({ error: 'id không hợp lệ' });
      }

      const { id } = input;

      const rewardPenaltyExists = await prisma.rewardPenalties.findUnique({
        where: { id },
      });
      if (!rewardPenaltyExists) {
        return res.status(404).json({ error: 'Thưởng/phạt không tồn tại' });
      }

      await prisma.rewardPenalties.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Xóa thưởng/phạt thành công' });
    } catch (error) {
      console.error('Lỗi khi xóa thưởng/phạt:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: String(error) });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}