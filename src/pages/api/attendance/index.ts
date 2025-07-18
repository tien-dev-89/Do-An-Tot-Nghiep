import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("x ")) {
        return res
          .status(401)
          .json({ error: "Thiếu hoặc sai định dạng token" });
      }

      const {
        page = "1",
        limit = "10",
        search = "",
        employee_id = "",
        shift_id = "",
        status = "",
        dateFrom = "",
        dateTo = "",
      } = req.query;

      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;

      const where: Prisma.AttendanceRecordsWhereInput = {};
      if (search) {
        where.OR = [
          {
            employee: {
              full_name: { contains: search as string, mode: "insensitive" },
            },
          },
          {
            employee: {
              email: { contains: search as string, mode: "insensitive" },
            },
          },
        ];
      }
      if (employee_id) {
        where.employee_id = employee_id as string;
      }
      if (shift_id) {
        where.shift_id = shift_id as string;
      }
      if (status) {
        const validStatuses = [
          "Đúng giờ",
          "Đi muộn",
          "Về sớm",
          "Đi muộn và về sớm",
          "Vắng mặt",
        ];
        if (!validStatuses.includes(status as string)) {
          return res.status(400).json({ error: "Trạng thái không hợp lệ" });
        }
        where.status = status as string;
      }
      const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/");
        const parsedDate = new Date(`${year}-${month}-${day}`);
        if (isNaN(parsedDate.getTime())) return null;
        return parsedDate;
      };
      const fromDate = dateFrom ? parseDate(dateFrom as string) : null;
      const toDate = dateTo ? parseDate(dateTo as string) : null;
      if (fromDate && toDate) {
        where.date = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        where.date = { gte: fromDate };
      } else if (toDate) {
        where.date = { lte: toDate };
      }

      const attendanceRecords = await prisma.attendanceRecords.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          employee: { select: { full_name: true, email: true } },
          shift: { select: { name: true } },
        },
      });

      const total = await prisma.attendanceRecords.count({ where });

      const stats = {
        all: total,
        onTime: await prisma.attendanceRecords.count({
          where: { ...where, status: "Đúng giờ" },
        }),
        late: await prisma.attendanceRecords.count({
          where: { ...where, status: "Đi muộn" },
        }),
        earlyLeave: await prisma.attendanceRecords.count({
          where: { ...where, status: "Về sớm" },
        }),
        lateAndEarly: await prisma.attendanceRecords.count({
          where: { ...where, status: "Đi muộn và về sớm" },
        }),
        absent: await prisma.attendanceRecords.count({
          where: { ...where, status: "Vắng mặt" },
        }),
      };

      return res.status(200).json({
        attendanceRecords: attendanceRecords.map((record) => ({
          ...record,
          employee_name: record.employee?.full_name || null,
          shift_name: record.shift?.name || null,
          overtime_hours:
            typeof record.overtime_hours === "number"
              ? record.overtime_hours
              : 0,
        })),
        total,
        stats,
      });
    } catch (error: unknown) {
      console.error("Lỗi khi lấy danh sách chấm công:", error);
      return res.status(500).json({
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "POST") {
    try {
      const { employee_id, date, clock_in_time, clock_out_time, shift_id } =
        req.body as {
          employee_id: string;
          date: string;
          clock_in_time?: string;
          clock_out_time?: string;
          shift_id?: string;
        };

      if (!employee_id || !date) {
        return res
          .status(400)
          .json({ error: "Thiếu các trường bắt buộc: employee_id, date" });
      }

      const employee = await prisma.employees.findUnique({
        where: { employee_id },
      });
      if (!employee) {
        return res.status(400).json({ error: "Nhân viên không tồn tại" });
      }

      let shift = null;
      if (shift_id) {
        shift = await prisma.shifts.findUnique({
          where: { shift_id },
        });
        if (!shift) {
          return res.status(400).json({ error: "Ca làm việc không tồn tại" });
        }
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Ngày không hợp lệ" });
      }

      let lateMinutes = 0;
      let earlyLeaveMinutes = 0;
      let overtimeHours = 0;
      let status: string = "Đúng giờ";

      if (shift && clock_in_time && clock_out_time) {
        const [shiftStartHour, shiftStartMinute] = shift.start_time
          .split(":")
          .map(Number);
        const [shiftEndHour, shiftEndMinute] = shift.end_time
          .split(":")
          .map(Number);
        const [clockInHour, clockInMinute] = clock_in_time
          .split(":")
          .map(Number);
        const [clockOutHour, clockOutMinute] = clock_out_time
          .split(":")
          .map(Number);

        const shiftStartMinutes = shiftStartHour * 60 + shiftStartMinute;
        const shiftEndMinutes = shiftEndHour * 60 + shiftEndMinute;
        const clockInMinutes = clockInHour * 60 + clockInMinute;
        const clockOutMinutes = clockOutHour * 60 + clockOutMinute;

        lateMinutes = Math.max(0, clockInMinutes - shiftStartMinutes);
        earlyLeaveMinutes = Math.max(0, shiftEndMinutes - clockOutMinutes);
        overtimeHours = Math.max(0, (clockOutMinutes - shiftEndMinutes) / 60);

        if (lateMinutes > 0 && earlyLeaveMinutes > 0) {
          status = "Đi muộn và về sớm";
        } else if (lateMinutes > 0) {
          status = "Đi muộn";
        } else if (earlyLeaveMinutes > 0) {
          status = "Về sớm";
        }
      } else if (!clock_in_time || !clock_out_time) {
        status = "Vắng mặt";
      }

      const attendanceRecord = await prisma.attendanceRecords.create({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          attendance_id: require("uuid").v4(),
          employee_id,
          date: parsedDate,
          clock_in_time: clock_in_time
            ? new Date(`${date}T${clock_in_time}`)
            : null,
          clock_out_time: clock_out_time
            ? new Date(`${date}T${clock_out_time}`)
            : null,
          shift_id: shift_id || null,
          late_minutes: lateMinutes,
          early_leave_minutes: earlyLeaveMinutes,
          overtime_hours: parseFloat(overtimeHours.toFixed(2)),
          created_at: new Date(),
          updated_at: new Date(),
          status,
        },
        include: {
          employee: { select: { full_name: true, email: true } },
          shift: { select: { name: true } },
        },
      });

      return res.status(201).json({
        ...attendanceRecord,
        employee_name: attendanceRecord.employee?.full_name || null,
        shift_name: attendanceRecord.shift?.name || null,
        overtime_hours:
          typeof attendanceRecord.overtime_hours === "number"
            ? attendanceRecord.overtime_hours
            : 0,
      });
    } catch (error: unknown) {
      console.error("Lỗi khi tạo bản ghi chấm công:", error);
      return res.status(500).json({
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "PUT") {
    try {
      const {
        attendance_id,
        employee_id,
        date,
        clock_in_time,
        clock_out_time,
        shift_id,
      } = req.body;

      if (!attendance_id || !employee_id || !date) {
        return res
          .status(400)
          .json({ error: "Thiếu các trường bắt buộc: attendance_id, employee_id, date" });
      }

      const employee = await prisma.employees.findUnique({
        where: { employee_id },
      });
      if (!employee) {
        return res.status(400).json({ error: "Nhân viên không tồn tại" });
      }

      let shift = null;
      if (shift_id) {
        shift = await prisma.shifts.findUnique({
          where: { shift_id },
        });
        if (!shift) {
          return res.status(400).json({ error: "Ca làm việc không tồn tại" });
        }
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Ngày không hợp lệ" });
      }

      let lateMinutes = 0;
      let earlyLeaveMinutes = 0;
      let overtimeHours = 0;
      let status: string = "Đúng giờ";

      if (shift && clock_in_time && clock_out_time) {
        const [shiftStartHour, shiftStartMinute] = shift.start_time
          .split(":")
          .map(Number);
        const [shiftEndHour, shiftEndMinute] = shift.end_time
          .split(":")
          .map(Number);
        const [clockInHour, clockInMinute] = clock_in_time
          .split(":")
          .map(Number);
        const [clockOutHour, clockOutMinute] = clock_out_time
          .split(":")
          .map(Number);

        const shiftStartMinutes = shiftStartHour * 60 + shiftStartMinute;
        const shiftEndMinutes = shiftEndHour * 60 + shiftEndMinute;
        const clockInMinutes = clockInHour * 60 + clockInMinute;
        const clockOutMinutes = clockOutHour * 60 + clockOutMinute;

        lateMinutes = Math.max(0, clockInMinutes - shiftStartMinutes);
        earlyLeaveMinutes = Math.max(0, shiftEndMinutes - clockOutMinutes);
        overtimeHours = Math.max(0, (clockOutMinutes - shiftEndMinutes) / 60);

        if (lateMinutes > 0 && earlyLeaveMinutes > 0) {
          status = "Đi muộn và về sớm";
        } else if (lateMinutes > 0) {
          status = "Đi muộn";
        } else if (earlyLeaveMinutes > 0) {
          status = "Về sớm";
        }
      } else if (!clock_in_time || !clock_out_time) {
        status = "Vắng mặt";
      }

      const updatedRecord = await prisma.attendanceRecords.update({
        where: { attendance_id },
        data: {
          employee_id,
          date: parsedDate,
          clock_in_time: clock_in_time
            ? new Date(`${date}T${clock_in_time}`)
            : null,
          clock_out_time: clock_out_time
            ? new Date(`${date}T${clock_out_time}`)
            : null,
          shift_id: shift_id || null,
          late_minutes: lateMinutes,
          early_leave_minutes: earlyLeaveMinutes,
          overtime_hours: parseFloat(overtimeHours.toFixed(2)),
          updated_at: new Date(),
          status,
        },
        include: {
          employee: { select: { full_name: true, email: true } },
          shift: { select: { name: true } },
        },
      });

      return res.status(200).json({
        ...updatedRecord,
        employee_name: updatedRecord.employee?.full_name || null,
        shift_name: updatedRecord.shift?.name || null,
        overtime_hours:
          typeof updatedRecord.overtime_hours === "number"
            ? updatedRecord.overtime_hours
            : 0,
      });
    } catch (error: unknown) {
      console.error("Lỗi khi cập nhật bản ghi chấm công:", error);
      return res.status(500).json({
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else if (req.method === "DELETE") {
    try {
      const { attendance_id } = req.body;
      await prisma.attendanceRecords.delete({ where: { attendance_id } });
      return res.status(204).json({});
    } catch (error: unknown) {
      console.error("Lỗi khi xóa bản ghi chấm công:", error);
      return res.status(500).json({
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}