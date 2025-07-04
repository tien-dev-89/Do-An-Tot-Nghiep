import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { LeaveStatus, NotificationType, Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { LeaveRequest } from '@/types/leaveRequest';

interface JwtPayload {
  employee_id: string;
  role_id: string;
}

// Định nghĩa kiểu cho where clause
interface LeaveRequestWhereInput extends Prisma.LeaveRequestsWhereInput {
  employee_id?: string;
  status?: LeaveStatus | Prisma.EnumLeaveStatusFilter<"LeaveRequests"> | undefined;
  OR?: Array<{
    employee?: {
      full_name?: { contains: string; mode?: 'insensitive' };
      department?: { name?: { contains: string; mode?: 'insensitive' } };
    };
    reason?: { contains: string; mode?: 'insensitive' };
  }>;
  employee?: {
    department_id?: { in: string[] };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
  } catch (error: unknown) {
    console.error('JWT Error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }

  if (req.method === 'GET') {
    try {
      const { employee_id, status, search, page = '1', pageSize = '10' } = req.query;

      const pageNum = parseInt(page as string, 10);
      const size = parseInt(pageSize as string, 10);
      if (isNaN(pageNum) || isNaN(size) || pageNum < 1 || size < 1) {
        return res.status(400).json({ message: 'Tham số phân trang không hợp lệ' });
      }

      const where: LeaveRequestWhereInput = {};
      if (employee_id && typeof employee_id === 'string') {
        where.employee_id = employee_id;
      }
      if (status && typeof status === 'string') {
        // Validate status belongs to LeaveStatus enum
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
          return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }
        where.status = status as LeaveStatus;
      }
      if (search && typeof search === 'string') {
        where.OR = [
          { employee: { full_name: { contains: search, mode: 'insensitive' } } },
          { employee: { department: { name: { contains: search, mode: 'insensitive' } } } },
          { reason: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Phân quyền
      if (decoded.role_id === 'role_employee' && employee_id !== decoded.employee_id) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
      if (decoded.role_id === 'role_manager') {
        const manager = await prisma.employees.findUnique({
          where: { employee_id: decoded.employee_id },
          include: { managed_departments: true },
        });
        if (manager?.managed_departments.length) {
          where.employee = {
            department_id: { in: manager.managed_departments.map((d) => d.department_id) },
          };
        } else {
          return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
      }

      const leaveRequests = await prisma.leaveRequests.findMany({
        where,
        include: {
          employee: { include: { department: true } },
          approver: true,
        },
        orderBy: { created_at: 'desc' },
        skip: (pageNum - 1) * size,
        take: size,
      });

      const totalCount = await prisma.leaveRequests.count({ where });

      const formattedRequests: LeaveRequest[] = leaveRequests.map((request) => ({
        leave_request_id: request.leave_request_id,
        employee_id: request.employee_id,
        employee_name: request.employee.full_name,
        department: request.employee.department?.name || '',
        leave_type: request.leave_type,
        start_date: request.start_date.toISOString(),
        end_date: request.end_date.toISOString(),
        reason: request.reason || null,
        status: request.status === 'PENDING' ? 'Chờ duyệt' : request.status === 'APPROVED' ? 'Đã duyệt' : 'Bị từ chối',
        approver_id: request.approver_id,
        approver_name: request.approver?.full_name || null,
        created_at: request.created_at.toISOString(),
        updated_at: request.updated_at.toISOString(),
      }));

      return res.status(200).json({
        success: true,
        requests: formattedRequests,
        totalCount,
        totalPages: Math.ceil(totalCount / size),
      });
    } catch (error: unknown) {
      console.error('Lỗi khi lấy danh sách đơn nghỉ phép:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách đơn nghỉ phép' });
    }
  } else if (req.method === 'POST') {
    try {
      const { employee_id, leave_type, start_date, end_date, reason } = req.body as {
        employee_id: unknown;
        leave_type: unknown;
        start_date: unknown;
        end_date: unknown;
        reason: unknown;
      };

      // Validate inputs
      if (typeof employee_id !== 'string') {
        console.error('Lỗi trong API: employee_id không hợp lệ');
        return res.status(400).json({ message: 'employee_id không hợp lệ' });
      }
      if (!['ANNUAL', 'SICK', 'PERSONAL'].includes(leave_type as string)) {
        console.error('Lỗi trong API: Loại nghỉ phép không hợp lệ');
        return res.status(400).json({ message: 'Loại nghỉ phép không hợp lệ' });
      }
      if (!start_date || !end_date || isNaN(Date.parse(start_date as string)) || isNaN(Date.parse(end_date as string))) {
        console.error('Lỗi trong API: Ngày không hợp lệ');
        return res.status(400).json({ message: 'Ngày không hợp lệ' });
      }
      if (reason !== undefined && reason !== null && typeof reason !== 'string') {
        console.error('Lỗi trong API: Lý do không hợp lệ');
        return res.status(400).json({ message: 'Lý do không hợp lệ' });
      }

      // Phân quyền
      if (decoded.role_id === 'role_employee' && employee_id !== decoded.employee_id) {
        return res.status(403).json({ message: 'Không có quyền tạo đơn cho người khác' });
      }
      if (!['role_employee', 'role_admin', 'role_hr'].includes(decoded.role_id)) {
        return res.status(403).json({ message: 'Không có quyền tạo đơn nghỉ phép' });
      }

      const employee = await prisma.employees.findUnique({
        where: { employee_id },
        include: { department: true },
      });

      if (!employee) {
        console.error('Lỗi trong API: Không tìm thấy nhân viên với employee_id:', employee_id);
        return res.status(404).json({ message: `Không tìm thấy nhân viên với ID ${employee_id}` });
      }

      const startDate = new Date(start_date as string);
      const endDate = new Date(end_date as string);
      if (startDate > endDate) {
        console.error('Lỗi trong API: Ngày bắt đầu lớn hơn ngày kết thúc');
        return res.status(400).json({ message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' });
      }

      const leaveRequest = await prisma.leaveRequests.create({
        data: {
          leave_request_id: uuidv4(),
          employee_id,
          leave_type: leave_type as 'ANNUAL' | 'SICK' | 'PERSONAL',
          start_date: startDate,
          end_date: endDate,
          reason: reason as string | null,
          status: LeaveStatus.PENDING,
          created_at: new Date(),
          updated_at: new Date(),
        },
        include: {
          employee: { include: { department: true } },
          approver: true,
        },
      });

      // Notify Admin, HR, and Manager (if applicable)
      const adminHRUsers = await prisma.users.findMany({
        where: {
          employee: {
            user_roles: {
              some: { role: { role_id: { in: ['role_admin', 'role_hr'] } } },
            },
          },
        },
        include: { employee: true },
      });

      const managerUsers = employee.department_id
        ? await prisma.users.findMany({
            where: {
              employee: {
                managed_departments: {
                  some: { department_id: employee.department_id },
                },
              },
            },
            include: { employee: true },
          })
        : [];

      const notificationPromises = [
        ...adminHRUsers
          .filter((user) => user.employee.employee_id !== employee_id)
          .map((user) =>
            prisma.notifications.create({
              data: {
                notification_id: uuidv4(),
                employee_id: user.employee.employee_id,
                title: `Đơn nghỉ phép mới từ ${employee.full_name}`,
                message: `Đơn nghỉ phép mới từ ${employee.full_name} (${leaveRequest.leave_request_id}) đang chờ phê duyệt.`,
                type: NotificationType.SYSTEM,
                is_read: false,
                created_at: new Date(),
              },
            })
          ),
        ...managerUsers
          .filter((user) => user.employee.employee_id !== employee_id)
          .map((user) =>
            prisma.notifications.create({
              data: {
                notification_id: uuidv4(),
                employee_id: user.employee.employee_id,
                title: `Đơn nghỉ phép mới từ ${employee.full_name}`,
                message: `Đơn nghỉ phép mới từ ${employee.full_name} (${leaveRequest.leave_request_id}) trong phòng ban của bạn đang chờ phê duyệt.`,
                type: NotificationType.SYSTEM,
                is_read: false,
                created_at: new Date(),
              },
            })
          ),
      ];

      await Promise.all(notificationPromises);

      // Email notification to employee
      await prisma.emailQueue.create({
        data: {
          email_id: uuidv4(),
          to_email: employee.email,
          subject: `Đơn nghỉ phép ${leaveRequest.leave_request_id} đã được tạo`,
          body: `Đơn nghỉ phép của bạn từ ${leaveRequest.start_date.toLocaleDateString('vi-VN')} đến ${leaveRequest.end_date.toLocaleDateString('vi-VN')} đã được tạo và đang chờ phê duyệt.`,
          status: 'PENDING',
          send_at: new Date(),
        },
      });

      const formattedRequest: LeaveRequest = {
        leave_request_id: leaveRequest.leave_request_id,
        employee_id: leaveRequest.employee_id,
        employee_name: leaveRequest.employee.full_name,
        department: leaveRequest.employee.department?.name || '',
        leave_type: leaveRequest.leave_type,
        start_date: leaveRequest.start_date.toISOString(),
        end_date: leaveRequest.end_date.toISOString(),
        reason: leaveRequest.reason || null,
        status: leaveRequest.status === 'PENDING' ? 'Chờ duyệt' : leaveRequest.status === 'APPROVED' ? 'Đã duyệt' : 'Bị từ chối',
        approver_id: leaveRequest.approver_id,
        approver_name: leaveRequest.approver?.full_name || null,
        created_at: leaveRequest.created_at.toISOString(),
        updated_at: leaveRequest.updated_at.toISOString(),
      };

      return res.status(201).json(formattedRequest);
    } catch (error: unknown) {
      console.error('Lỗi khi tạo đơn nghỉ phép:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: 'Lỗi máy chủ khi tạo đơn nghỉ phép' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Phương thức ${req.method} không được hỗ trợ` });
  }
}