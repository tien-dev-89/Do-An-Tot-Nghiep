import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

interface Response {
  success: boolean;
  message?: string;
  token?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Phương thức không được phép" });
  }

  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Thiếu refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "your-refresh-secret") as {
      user_id: string;
      employee_id: string;
    };

    const employee = await prisma.employees.findUnique({
      where: { employee_id: decoded.employee_id },
      include: {
        user: true,
        // user_roles: { include: { role: true } },
        user_roles: {
          include: {
            role: {
              select: {
                name: true,
                role_id: true, // Thêm role_id
              },
            },
          },
        },
      },
    });

    if (!employee || !employee.user || !employee.user.is_active) {
      return res.status(401).json({ success: false, message: "Tài khoản không hợp lệ" });
    }

    const roles = employee.user_roles.map((ur) => ur.role.name);
    const role_id = employee.user_roles[0]?.role.role_id || "";
    const newToken = jwt.sign(
      {
        user_id: employee.user.user_id,
        username: employee.user.username,
        employee_id: employee.employee_id,
        email: employee.email,
        roles,
        role_id, // Thêm role_id
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30m" }
    );

    return res.status(200).json({ success: true, token: newToken });
  } catch (error: unknown) {
    console.error("Lỗi refresh token:", error);
    return res.status(401).json({ success: false, message: "Refresh token không hợp lệ" });
  } finally {
    await prisma.$disconnect();
  }
}