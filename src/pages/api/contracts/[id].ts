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
  contract?: unknown; // Có thể định nghĩa kiểu chi tiết hơn dựa trên model Contracts
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Phương thức không được phép" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Thiếu hoặc sai định dạng header Authorization" });
  }

  const token = authHeader.split(" ")[1];
  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;
    if (!decoded.roles.some((role) => ["Admin", "HR"].includes(role))) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập chi tiết hợp đồng" });
    }
  } catch (error: unknown) {
    console.error("Lỗi xác minh token:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: "Token đã hết hạn" });
    }
    return res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }

  try {
    const { id } = req.query;
    const contract = await prisma.contracts.findUnique({
      where: { contract_id: id as string },
      include: {
        employee: {
          include: {
            department: { select: { name: true } },
            position: { select: { name: true } },
          },
        },
      },
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: "Hợp đồng không tồn tại" });
    }

    const formattedContract = {
      contract_id: contract.contract_id,
      employee: {
        full_name: contract.employee.full_name,
        email: contract.employee.email,
        phone_number: contract.employee.phone_number,
        department: contract.employee.department,
        position: contract.employee.position,
      },
      start_date: contract.start_date.toISOString(),
      end_date: contract.end_date.toISOString(),
      status: contract.status,
    };

    return res.status(200).json({ success: true, contract: formattedContract });
  } catch (error: unknown) {
    console.error("Lỗi tải hợp đồng:", error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  } finally {
    await prisma.$disconnect();
  }
}