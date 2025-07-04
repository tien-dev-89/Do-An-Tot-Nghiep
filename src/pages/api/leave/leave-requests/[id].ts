import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { LeaveStatus, NotificationType } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { LeaveRequest } from '@/types/leaveRequest';

interface JwtPayload {
  employee_id: string;
  role_id: string;
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

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID đơn nghỉ phép không hợp lệ' });
  }

  if (req.method === 'GET') {
    try {
      const leaveRequest = await prisma.leaveRequests.findUnique({
        where: { leave_request_id: id },
        include: {
          employee: { include: { department: true } },
          approver: true,
        },
      });

      if (!leaveRequest) {
        return res.status(404).json({ message: `Không tìm thấy đơn nghỉ phép với ID ${id}` });
      }

      if (
        decoded.role_id === 'role_employee' &&
        leaveRequest.employee_id !== decoded.employee_id
      ) {
        return res.status(403).json({ message: 'Không có quyền truy cập đơn này' });
      }
      if (decoded.role_id === 'role_manager') {
        const manager = await prisma.employees.findUnique({
          where: { employee_id: decoded.employee_id },
          include: { managed_departments: true },
        });
        if (
          !manager?.managed_departments.some(
            (d) => d.department_id === leaveRequest.employee.department_id
          )
        ) {
          return res.status(403).json({ message: 'Không có quyền truy cập đơn này' });
        }
      }

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

      return res.status(200).json(formattedRequest);
    } catch (error: unknown) {
      console.error('Lỗi khi lấy chi tiết đơn nghỉ phép:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy chi tiết đơn nghỉ phép' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { status, approver_id, leave_type, start_date, end_date, reason } = req.body as {
        status?: unknown;
        approver_id?: unknown;
        leave_type?: unknown;
        start_date?: unknown;
        end_date?: unknown;
        reason?: unknown;
        employee_id?: unknown;
      };

      const leaveRequest = await prisma.leaveRequests.findUnique({
        where: { leave_request_id: id },
        include: { employee: { include: { department: true } } },
      });

      if (!leaveRequest) {
        return res.status(404).json({ message: `Không tìm thấy đơn nghỉ phép với ID ${id}` });
      }

      if (decoded.role_id === 'role_employee' && leaveRequest.employee_id !== decoded.employee_id) {
        return res.status(403).json({ message: 'Không có quyền cập nhật đơn này' });
      }
      if (decoded.role_id === 'role_manager') {
        const manager = await prisma.employees.findUnique({
          where: { employee_id: decoded.employee_id },
          include: { managed_departments: true },
        });
        if (
          !manager?.managed_departments.some(
            (d) => d.department_id === leaveRequest.employee.department_id
          )
        ) {
          return res.status(403).json({ message: 'Không có quyền cập nhật đơn này' });
        }
      }

      if (leaveRequest.status !== 'PENDING') {
        return res.status(400).json({ message: 'Chỉ có thể chỉnh sửa đơn ở trạng thái chờ duyệt' });
      }

      let approver = null;
      if (status) {
        if (!['APPROVED', 'REJECTED'].includes(status as string)) {
          console.error('Lỗi trong API: Trạng thái không hợp lệ');
          return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }
        if (typeof approver_id !== 'string') {
          console.error('Lỗi trong API: approver_id không hợp lệ');
          return res.status(400).json({ message: 'approver_id không hợp lệ' });
        }

        approver = await prisma.employees.findUnique({
          where: { employee_id: approver_id },
        });

        if (!approver) {
          return res.status(404).json({ message: `Không tìm thấy người phê duyệt với ID ${approver_id}` });
        }
      }

      const updateData: { [key: string]: unknown } = { updated_at: new Date() };
      if (leave_type) {
        if (!['ANNUAL', 'SICK', 'PERSONAL'].includes(leave_type as string)) {
          return res.status(400).json({ message: 'Loại nghỉ phép không hợp lệ' });
        }
        updateData.leave_type = leave_type;
      }
      if (start_date) {
        const startDate = new Date(start_date as string);
        if (isNaN(startDate.getTime())) {
          return res.status(400).json({ message: 'Ngày bắt đầu không hợp lệ' });
        }
        updateData.start_date = startDate;
      }
      if (end_date) {
        const endDate = new Date(end_date as string);
        if (isNaN(endDate.getTime())) {
          return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ' });
        }
        updateData.end_date = endDate;
      }
      if (reason !== undefined && reason !== null && typeof reason !== 'string') {
        return res.status(400).json({ message: 'Lý do không hợp lệ' });
      }
      if (reason !== undefined) {
        updateData.reason = reason;
      }
      if (status) {
        updateData.status = status as LeaveStatus;
      }
      if (approver_id) {
        updateData.approver_id = approver_id;
      }

      if (start_date && end_date) {
        const startDate = new Date(start_date as string);
        const endDate = new Date(end_date as string);
        if (startDate > endDate) {
          return res.status(400).json({ message: 'Ngày bắt đầu không được lớn hơn ngày kết thúc' });
        }
        if (startDate < new Date()) {
          return res.status(400).json({ message: 'Ngày bắt đầu không được trong quá khứ' });
        }
      }

      const updatedLeaveRequest = await prisma.leaveRequests.update({
        where: { leave_request_id: id },
        data: updateData,
        include: {
          employee: { include: { department: true } },
          approver: true,
        },
      });

      if (status && approver) {
        await prisma.notifications.create({
          data: {
            notification_id: uuidv4(),
            employee_id: leaveRequest.employee_id,
            title: `Đơn nghỉ phép ${id} đã được ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'}`,
            message: `Đơn nghỉ phép của bạn từ ${leaveRequest.start_date.toLocaleDateString('vi-VN')} đến ${leaveRequest.end_date.toLocaleDateString('vi-VN')} đã được ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} bởi ${approver.full_name}.`,
            type: NotificationType.PERSONAL,
            is_read: false,
            created_at: new Date(),
          },
        });

        await prisma.emailQueue.create({
          data: {
            email_id: uuidv4(),
            to_email: leaveRequest.employee.email,
            subject: `Đơn nghỉ phép ${id} đã được ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'}`,
            body: `Đơn nghỉ phép của bạn từ ${leaveRequest.start_date.toLocaleDateString('vi-VN')} đến ${leaveRequest.end_date.toLocaleDateString('vi-VN')} đã được ${status === 'APPROVED' ? 'phê duyệt' : 'từ chối'} bởi ${approver.full_name}.`,
            status: 'PENDING',
            send_at: new Date(),
          },
        });
      } else if (!status) {
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

        const managerUsers = leaveRequest.employee.department_id
          ? await prisma.users.findMany({
              where: {
                employee: {
                  managed_departments: {
                    some: { department_id: leaveRequest.employee.department_id },
                  },
                },
              },
              include: { employee: true },
            })
          : [];

        const notificationPromises = [
          ...adminHRUsers
            .filter((user) => user.employee.employee_id !== leaveRequest.employee_id)
            .map((user) =>
              prisma.notifications.create({
                data: {
                  notification_id: uuidv4(),
                  employee_id: user.employee.employee_id,
                  title: `Đơn nghỉ phép ${id} đã được chỉnh sửa`,
                  message: `Đơn nghỉ phép từ ${leaveRequest.employee.full_name} (${id}) đã được chỉnh sửa.`,
                  type: NotificationType.SYSTEM,
                  is_read: false,
                  created_at: new Date(),
                },
              })
            ),
          ...managerUsers
            .filter((user) => user.employee.employee_id !== leaveRequest.employee_id)
            .map((user) =>
              prisma.notifications.create({
                data: {
                  notification_id: uuidv4(),
                  employee_id: user.employee.employee_id,
                  title: `Đơn nghỉ phép ${id} đã được chỉnh sửa`,
                  message: `Đơn nghỉ phép từ ${leaveRequest.employee.full_name} (${id}) trong phòng ban của bạn đã được chỉnh sửa.`,
                  type: NotificationType.SYSTEM,
                  is_read: false,
                  created_at: new Date(),
                },
              })
            ),
        ];

        await Promise.all(notificationPromises);

        await prisma.emailQueue.create({
          data: {
            email_id: uuidv4(),
            to_email: leaveRequest.employee.email,
            subject: `Đơn nghỉ phép ${id} đã được chỉnh sửa`,
            body: `Đơn nghỉ phép của bạn từ ${updatedLeaveRequest.start_date.toLocaleDateString('vi-VN')} đến ${updatedLeaveRequest.end_date.toLocaleDateString('vi-VN')} đã được chỉnh sửa và đang chờ phê duyệt.`,
            status: 'PENDING',
            send_at: new Date(),
          },
        });
      }

      const formattedRequest: LeaveRequest = {
        leave_request_id: updatedLeaveRequest.leave_request_id,
        employee_id: updatedLeaveRequest.employee_id,
        employee_name: updatedLeaveRequest.employee.full_name,
        department: updatedLeaveRequest.employee.department?.name || '',
        leave_type: updatedLeaveRequest.leave_type,
        start_date: updatedLeaveRequest.start_date.toISOString(),
        end_date: updatedLeaveRequest.end_date.toISOString(),
        reason: updatedLeaveRequest.reason || null,
        status: updatedLeaveRequest.status === 'PENDING' ? 'Chờ duyệt' : updatedLeaveRequest.status === 'APPROVED' ? 'Đã duyệt' : 'Bị từ chối',
        approver_id: updatedLeaveRequest.approver_id,
        approver_name: updatedLeaveRequest.approver?.full_name || null,
        created_at: updatedLeaveRequest.created_at.toISOString(),
        updated_at: updatedLeaveRequest.updated_at.toISOString(),
      };

      return res.status(200).json(formattedRequest);
    } catch (error: unknown) {
      console.error('Lỗi khi cập nhật đơn nghỉ phép:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật đơn nghỉ phép' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const leaveRequest = await prisma.leaveRequests.findUnique({
        where: { leave_request_id: id },
        include: { employee: { include: { department: true } } },
      });

      if (!leaveRequest) {
        return res.status(404).json({ message: `Không tìm thấy đơn nghỉ phép với ID ${id}` });
      }

      if (decoded.role_id === 'role_employee' && leaveRequest.employee_id !== decoded.employee_id) {
        return res.status(403).json({ message: 'Không có quyền hủy đơn này' });
      }
      if (decoded.role_id === 'role_manager') {
        const manager = await prisma.employees.findUnique({
          where: { employee_id: decoded.employee_id },
          include: { managed_departments: true },
        });
        if (
          !manager?.managed_departments.some(
            (d) => d.department_id === leaveRequest.employee.department_id
          )
        ) {
          return res.status(403).json({ message: 'Không có quyền hủy đơn này' });
        }
      }

      if (leaveRequest.status !== 'PENDING') {
        return res.status(400).json({ message: 'Chỉ có thể hủy đơn ở trạng thái chờ duyệt' });
      }

      await prisma.leaveRequests.delete({
        where: { leave_request_id: id },
      });

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

      const managerUsers = leaveRequest.employee.department_id
        ? await prisma.users.findMany({
            where: {
              employee: {
                managed_departments: {
                  some: { department_id: leaveRequest.employee.department_id },
                },
              },
            },
            include: { employee: true },
          })
        : [];

      const notificationPromises = [
        ...adminHRUsers
          .filter((user) => user.employee.employee_id !== leaveRequest.employee_id)
          .map((user) =>
            prisma.notifications.create({
              data: {
                notification_id: uuidv4(),
                employee_id: user.employee.employee_id,
                title: `Đơn nghỉ phép ${id} đã bị hủy`,
                message: `Đơn nghỉ phép từ ${leaveRequest.employee.full_name} (${id}) đã bị hủy.`,
                type: NotificationType.SYSTEM,
                is_read: false,
                created_at: new Date(),
              },
            })
          ),
        ...managerUsers
          .filter((user) => user.employee.employee_id !== leaveRequest.employee_id)
          .map((user) =>
            prisma.notifications.create({
              data: {
                notification_id: uuidv4(),
                employee_id: user.employee.employee_id,
                title: `Đơn nghỉ phép ${id} đã bị hủy`,
                message: `Đơn nghỉ phép từ ${leaveRequest.employee.full_name} (${id}) trong phòng ban của bạn đã bị hủy.`,
                type: NotificationType.SYSTEM,
                is_read: false,
                created_at: new Date(),
              },
            })
          ),
      ];

      await Promise.all(notificationPromises);

      await prisma.emailQueue.create({
        data: {
          email_id: uuidv4(),
          to_email: leaveRequest.employee.email,
          subject: `Đơn nghỉ phép ${id} đã bị hủy`,
          body: `Đơn nghỉ phép của bạn từ ${leaveRequest.start_date.toLocaleDateString('vi-VN')} đến ${leaveRequest.end_date.toLocaleDateString('vi-VN')} đã bị hủy.`,
          status: 'PENDING',
          send_at: new Date(),
        },
      });

      return res.status(200).json({ message: 'Hủy đơn nghỉ phép thành công' });
    } catch (error: unknown) {
      console.error('Lỗi khi hủy đơn nghỉ phép:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ message: 'Lỗi máy chủ khi hủy đơn nghỉ phép' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Phương thức ${req.method} không được hỗ trợ` });
  }
}