import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { UAParser } from "ua-parser-js";
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
    role_id?: string; // Thêm role_id tùy chọn
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
    const ipAddress =
      req.headers["x-forwarded-for"]?.toString() ||
      req.socket.remoteAddress ||
      "Unknown";
    const userAgentRaw = req.headers["user-agent"] || "Unknown";

    // Phân tích user-agent
    const parser = new UAParser(userAgentRaw);
    const uaResult = parser.getResult();
    const os = uaResult.os.name || "Unknown";
    const osVersion = uaResult.os.version || "";
    let browser = uaResult.browser.name || "Unknown";
    const browserVersion = uaResult.browser.version || "Unknown";
    const bitness =
      uaResult.cpu.architecture === "amd64"
        ? "bản 64-bit"
        : uaResult.cpu.architecture === "ia32"
        ? "bản 32-bit"
        : "";

    // Điều chỉnh tên trình duyệt
    if (browser === "Edge") {
      browser = "Microsoft Edge (Chromium-based)";
    } else if (browser === "CocCoc") {
      browser = "Cốc Cốc";
    } else if (browser === "Chrome") {
      browser = "Google Chrome";
    } else if (browser === "OPR") {
      browser = "Opera";
    } else if (browser === "UCBrowser") {
      browser = "UC Browser";
    } else if (browser === "Samsung Internet") {
      browser = "Samsung Internet";
    } else if (browser === "Mobile Safari") {
      browser = "Safari"; // Để thống nhất tên trên thiết bị di động
    }

    // Tạo chuỗi user-agent
    // const userAgent = `Hệ điều hành: ${os}${osVersion ? ` ${osVersion}` : ""}${
    //   bitness ? `, ${bitness}` : ""
    // }\n${browser}${
    //   browserVersion !== "Unknown" ? `, phiên bản ${browserVersion}` : ""
    // }`;
    const osFull = `Hệ điều hành: ${os || "Không rõ"}${
      osVersion ? ` ${osVersion}` : ""
    }${bitness ? `, ${bitness}` : ""}`;
    const browserFull = `${browser || "Trình duyệt không xác định"}${
      browserVersion && browserVersion !== "Unknown"
        ? `, phiên bản ${browserVersion}`
        : ""
    }`;

    const userAgent = `${osFull}\n${browserFull}`;

    const employee = (await prisma.employees.findFirst({
      where: {
        email: email.toLowerCase(),
        user: { is_active: true },
      },
      select: {
        employee_id: true,
        email: true,
        user: {
          select: {
            user_id: true,
            username: true,
            password_hash: true,
            is_active: true,
          },
        },
        user_roles: { select: { role: { select: { name: true, role_id: true } } } },
      },
    })) as Prisma.EmployeesGetPayload<{
      select: {
        employee_id: true;
        email: true;
        user: {
          select: {
            user_id: true;
            username: true;
            password_hash: true;
            is_active: true;
          };
        };
        user_roles: { select: { role: { select: { name: true, role_id: true } } } };
      };
    }> | null;

    // Ghi nhật ký đăng nhập nếu không tìm thấy nhân viên hoặc user
    if (!employee || !employee.user) {
      await prisma.loginLogs.create({
        data: {
          log_id: crypto.randomUUID(),
          user_id: "unknown",
          username: email,
          activity: "Đăng nhập",
          status: "Thất bại",
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date(),
        },
      });
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra mật khẩu
    const passwordMatch = await bcrypt.compare(
      password,
      employee.user.password_hash
    );
    if (!passwordMatch) {
      await prisma.loginLogs.create({
        data: {
          log_id: crypto.randomUUID(),
          user_id: employee.user.user_id,
          username: employee.user.username,
          activity: "Đăng nhập",
          status: "Thất bại",
          ip_address: ipAddress,
          user_agent: userAgent,
          created_at: new Date(),
        },
      });
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    // Cập nhật thời gian đăng nhập cuối
    await prisma.users.update({
      where: { user_id: employee.user.user_id },
      data: { last_login_at: new Date() },
    });

    // Ghi nhật ký đăng nhập thành công
    await prisma.loginLogs.create({
      data: {
        log_id: crypto.randomUUID(),
        user_id: employee.user.user_id,
        username: employee.user.username,
        activity: "Đăng nhập",
        status: "Thành công",
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date(),
      },
    });

    // Tạo token JWT
    const roles = employee.user_roles.map((ur) => ur.role.name);
    const role_id = employee.user_roles[0]?.role.role_id || ""; // Lấy role_id đầu tiên
    const token = jwt.sign(
      {
        user_id: employee.user.user_id,
        username: employee.user.username,
        employee_id: employee.employee_id,
        email: employee.email,
        roles,
        role_id, // Thêm role_id vào token
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30m" }
    );

    const response: LoginResponse = {
      success: true,
      token,
      user: {
        user_id: employee.user.user_id,
        username: employee.user.username,
        employee_id: employee.employee_id,
        email: employee.email,
        roles,
        role_id,
      },
    };

    return res.status(200).json(response);
  } catch (error: unknown) {
    console.error("Lỗi đăng nhập:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ" });
  } finally {
    await prisma.$disconnect();
  }
}
