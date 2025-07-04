import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface VerifyResponse {
  success: boolean;
  message?: string;
  user?: {
    user_id: string;
    username: string;
    employee_id: string;
    email: string;
    roles: string[];
    role_id?: string; // Thêm role_id tùy chọn
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Phương thức không được phép" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Xác minh token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      user_id: string;
      username: string;
      employee_id: string;
      email: string;
      roles: string[];
    };

    // Lấy thông tin từ Employees dựa trên employee_id
    const employee = await prisma.employees.findUnique({
      where: { employee_id: decoded.employee_id },
      select: {
        employee_id: true,
        email: true,
        user: {
          select: {
            user_id: true,
            username: true,
            is_active: true,
          },
        },
        user_roles: {
          select: {
            role: {
              select: {
                name: true,
                role_id: true
              },
            },
          },
        },
      },
    }) as Prisma.EmployeesGetPayload<{
      select: {
        employee_id: true;
        email: true;
        user: {
          select: {
            user_id: true;
            username: true;
            is_active: true;
          };
        };
        user_roles: {
          select: {
            role: {
              select: {
                name: true;
                role_id: true;
              };
            };
          };
        };
      };
    }> | null;

    if (!employee || !employee.user || !employee.user.is_active) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Tài khoản không hợp lệ hoặc đã bị vô hiệu hóa",
        });
    }

    // Lấy danh sách roles
    const roles = employee.user_roles.map((ur) => ur.role.name);
    const role_id = employee.user_roles[0]?.role.role_id || ""; // Lấy role_id đầu tiên
    // Trả về thông tin người dùng
    return res.status(200).json({
      success: true,
      user: {
        user_id: employee.user.user_id,
        username: employee.user.username,
        employee_id: employee.employee_id,
        email: employee.email,
        roles,
        role_id, // Thêm role_id
      },
    });
  } catch (error) {
    console.error("JWT Error:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ success: false, message: "Token đã hết hạn" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(401)
        .json({ success: false, message: "Token không hợp lệ" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server" });
  }
  // đóng kết nối Prisma, tránh rò rỉ tài nguyên
  finally {
    await prisma.$disconnect();
  }
}