import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../../lib/prisma";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    user_id: string;
    username: string;
    employee_id: string;
    email: string;
    roles: string[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Phương thức không được phép" });
  }

  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email và mật khẩu là bắt buộc" });
  }

  try {
    // Tìm người dùng qua email trong bảng Employees
    const user = await prisma.users.findFirst({
      where: {
        employee: { email: email }, // Tìm qua email của Employees
      },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
        employee: true,
      },
    });

    if (!user || !user.employee) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    // Xác minh mật khẩu
    // Dữ liệu seed: Anh123456, Binh123456, Chau123456
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    // Cập nhật last_login_at
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { last_login_at: new Date() },
    });

    // Tạo JWT
    const roles = user.user_roles.map((ur) => ur.role.name); // ADMIN, HR, EMPLOYEE
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        employee_id: user.employee_id,
        email: user.employee.email,
        roles,
      },
      process.env.JWT_SECRET || "your-secret-key",
      // { expiresIn: "1h" } // Token hết hạn sau 1 giờ
      { expiresIn: "30m" } // Token hết hạn sau 30 phút
    );

    // Phản hồi với token và thông tin người dùng
    const response: LoginResponse = {
      success: true,
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        employee_id: user.employee_id,
        email: user.employee.email,
        roles,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}
