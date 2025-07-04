import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, NotificationType } from "@prisma/client";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const prisma = new PrismaClient();

interface Notification {
  notification_id: string;
  employee_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: Date;
  contract_id?: string;
  sender?: string;
}

interface JwtPayload {
  user_id: string;
  employee_id: string;
  username: string;
  email: string;
  role_id: string;
}

interface Response {
  success: boolean;
  message?: string;
  notifications?: Notification[];
  notification?: Notification;
  count?: number;
}

const postSchema = z.object({
  employee_id: z.string().uuid(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  message: z.string().min(1, "Nội dung không được để trống"),
  type: z.enum(["PERSONAL", "INTERNAL", "SYSTEM", "CONTRACT"]),
  contract_id: z.string().uuid().optional(),
});

const patchSchema = z.object({
  notification_id: z.string().uuid(),
  is_read: z.boolean(),
});

const deleteSchema = z.object({
  notification_ids: z.array(z.string().uuid()).min(1, "Phải chọn ít nhất một thông báo để xóa"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as JwtPayload;
  } catch (error: unknown) {
    console.error("JWT Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ success: false, message: "Token đã hết hạn" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ" });
  }

  const allowedRoles = ["role_admin", "role_hr"];
  if (!allowedRoles.includes(decoded.role_id)) {
    return res
      .status(403)
      .json({ success: false, message: "Không có quyền truy cập" });
  }

  if (req.method === "GET") {
    try {
      if (req.query.count === "true") {
        const count = await prisma.notifications.count({
          where: {
            employee_id: decoded.employee_id,
            is_read: false,
          },
        });
        return res.status(200).json({ success: true, count });
      }

      const notifications = await prisma.notifications.findMany({
        where: {
          employee_id: decoded.employee_id,
        },
        include: {
          contract: {
            select: { contract_id: true },
          },
          employee: {
            select: { full_name: true },
          },
        },
        orderBy: { created_at: "desc" },
      });

      const formattedNotifications: Notification[] = notifications.map((n) => ({
        notification_id: n.notification_id,
        employee_id: n.employee_id,
        title: n.title,
        message: n.message,
        type: n.type,
        is_read: n.is_read,
        created_at: n.created_at,
        contract_id: n.contract?.contract_id,
        sender: n.employee?.full_name,
      }));

      return res.status(200).json({ success: true, notifications: formattedNotifications });
    } catch (error: unknown) {
      console.error("Lỗi lấy thông báo:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res
        .status(500)
        .json({ success: false, message: "Lỗi máy chủ", notifications: [] });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === "PATCH") {
    try {
      const parseResult = patchSchema.safeParse({
        notification_id: req.query.notification_id,
        is_read: req.body.is_read,
      });

      if (!parseResult.success) {
        return res
          .status(400)
          .json({ success: false, message: parseResult.error.message });
      }

      const { notification_id, is_read } = parseResult.data;

      const notification = await prisma.notifications.findUnique({
        where: { notification_id },
      });

      if (!notification || notification.employee_id !== decoded.employee_id) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Không có quyền cập nhật thông báo này",
          });
      }

      const updatedNotification = await prisma.notifications.update({
        where: { notification_id },
        data: { is_read },
        include: {
          contract: {
            select: { contract_id: true },
          },
          employee: {
            select: { full_name: true },
          },
        },
      });

      const formattedNotification: Notification = {
        notification_id: updatedNotification.notification_id,
        employee_id: updatedNotification.employee_id,
        title: updatedNotification.title,
        message: updatedNotification.message,
        type: updatedNotification.type,
        is_read: updatedNotification.is_read,
        created_at: updatedNotification.created_at,
        contract_id: updatedNotification.contract?.contract_id,
        sender: updatedNotification.employee?.full_name,
      };

      return res
        .status(200)
        .json({ success: true, notification: formattedNotification });
    } catch (error: unknown) {
      console.error("Lỗi cập nhật thông báo:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === "POST") {
    try {
      const parseResult = postSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json({ success: false, message: parseResult.error.message });
      }

      const { employee_id, title, message, type, contract_id } = parseResult.data;

      const employee = await prisma.employees.findUnique({
        where: { employee_id },
      });

      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy nhân viên" });
      }

      if (contract_id) {
        const contract = await prisma.contracts.findUnique({
          where: { contract_id },
        });
        if (!contract) {
          return res
            .status(404)
            .json({ success: false, message: "Không tìm thấy hợp đồng" });
        }
      }

      const notification = await prisma.notifications.create({
        data: {
          notification_id: uuidv4(),
          employee_id,
          title,
          message,
          type,
          is_read: false,
          created_at: new Date(),
          contract_id,
        },
        include: {
          contract: {
            select: { contract_id: true },
          },
          employee: {
            select: { full_name: true },
          },
        },
      });

      const formattedNotification: Notification = {
        notification_id: notification.notification_id,
        employee_id: notification.employee_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: notification.is_read,
        created_at: notification.created_at,
        contract_id: notification.contract?.contract_id,
        sender: notification.employee?.full_name,
      };

      if (type === NotificationType.CONTRACT) {
        try {
          const adminHRUsers = await prisma.users.findMany({
            where: {
              employee: {
                user_roles: {
                  some: {
                    role: {
                      role_id: { in: ["role_admin", "role_hr"] },
                    },
                  },
                },
              },
            },
            include: {
              employee: true,
            },
          });

          const notificationPromises = adminHRUsers
            .filter((user) => user.employee.employee_id !== employee_id)
            .map((user) =>
              prisma.notifications.create({
                data: {
                  notification_id: uuidv4(),
                  employee_id: user.employee.employee_id,
                  title: "Hợp đồng mới được tạo",
                  message: `Hợp đồng mới cho nhân viên ${employee.full_name} đã được tạo.`,
                  type: NotificationType.CONTRACT,
                  is_read: false,
                  created_at: new Date(),
                  contract_id,
                },
              })
            );

          await Promise.all(notificationPromises);
        } catch (notificationError: unknown) {
          console.warn("Cảnh báo: Không thể tạo thông báo cho Admin/HR:", {
            error: notificationError instanceof Error ? notificationError.message : String(notificationError),
            stack: notificationError instanceof Error ? notificationError.stack : undefined,
          });
        }
      }

      return res.status(201).json({ success: true, notification: formattedNotification });
    } catch (error: unknown) {
      console.error("Lỗi tạo thông báo:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === "DELETE") {
    try {
      const parseResult = deleteSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res
          .status(400)
          .json({ success: false, message: parseResult.error.message });
      }

      const { notification_ids } = parseResult.data;

      const notifications = await prisma.notifications.findMany({
        where: {
          notification_id: { in: notification_ids },
          employee_id: decoded.employee_id,
        },
      });

      if (notifications.length !== notification_ids.length) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Một số thông báo không tồn tại hoặc bạn không có quyền xóa",
          });
      }

      await prisma.notifications.deleteMany({
        where: {
          notification_id: { in: notification_ids },
          employee_id: decoded.employee_id,
        },
      });

      return res.status(200).json({ success: true, message: "Xóa thông báo thành công" });
    } catch (error: unknown) {
      console.error("Lỗi xóa thông báo:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
    return res
      .status(405)
      .json({ success: false, message: `Phương thức ${req.method} không được phép` });
  }
}