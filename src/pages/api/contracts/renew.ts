import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  employee_id: string;
  roles: string[];
}

interface Response {
  success: boolean;
  message?: string;
  contract?: {
    contract_id: string;
    employee: {
      full_name: string;
      email: string;
      phone_number: string | null;
      department: { name: string } | null;
      position: { name: string } | null;
    };
    start_date: string;
    end_date: string;
    status: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Phương thức không được phép" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Thiếu hoặc sai định dạng header Authorization",
      });
  }

  const token = authHeader.split(" ")[1];
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as JwtPayload;
    if (!decoded.roles.some((role) => ["Admin", "HR"].includes(role))) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền gia hạn hợp đồng" });
    }
  } catch (error: unknown) {
    console.error("Lỗi xác minh token:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(401)
        .json({ success: false, message: "Token đã hết hạn" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ" });
  }

  try {
    const { contract_id, start_date, end_date } = req.body;

    // Validate request body
    if (!contract_id || !start_date || !end_date) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Thiếu các trường bắt buộc: contract_id, start_date, end_date",
        });
    }

    // Validate contract existence
    const existingContract = await prisma.contracts.findUnique({
      where: { contract_id },
    });

    if (!existingContract) {
      return res
        .status(404)
        .json({ success: false, message: "Hợp đồng không tồn tại" });
    }

    // Validate date format and logic
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Định dạng ngày không hợp lệ" });
    }

    if (startDate >= endDate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
        });
    }

    // Update contract
    const updatedContract = await prisma.contracts.update({
      where: { contract_id },
      data: {
        start_date: startDate,
        end_date: endDate,
        status: "ACTIVE", // Reset to ACTIVE on renewal
        updated_at: new Date(),
      },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
            position: { select: { name: true } },
          },
        },
      },
    });

    const formattedContract = {
      contract_id: updatedContract.contract_id,
      employee: {
        full_name: updatedContract.employee.full_name,
        email: updatedContract.employee.email,
        phone_number: updatedContract.employee.phone_number,
        department: updatedContract.employee.department,
        position: updatedContract.employee.position,
      },
      start_date: updatedContract.start_date.toISOString(),
      end_date: updatedContract.end_date.toISOString(),
      status: updatedContract.status,
    };

    // Optionally create a notification
    await prisma.notifications.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        notification_id: require("uuid").v4(),
        employee_id: updatedContract.employee_id,
        title: "Hợp đồng được gia hạn",
        message: `Hợp đồng của bạn đã được gia hạn đến ${endDate.toLocaleDateString(
          "vi-VN"
        )}.`,
        type: "CONTRACT",
        is_read: false,
        contract_id: updatedContract.contract_id,
      },
    });

    return res.status(200).json({ success: true, contract: formattedContract });
  } catch (error: unknown) {
    console.error("Lỗi gia hạn hợp đồng:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ" });
  } finally {
    await prisma.$disconnect();
  }
}
