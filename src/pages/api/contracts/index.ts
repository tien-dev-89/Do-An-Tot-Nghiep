import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  employee_id: string;
  roles: string[];
}

interface Contract {
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
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
}

interface Response {
  success: boolean;
  message?: string;
  contracts?: Contract[];
  total?: number;
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
      return res.status(403).json({ success: false, message: "Không có quyền truy cập danh sách hợp đồng" });
    }
  } catch (error: unknown) {
    console.error("Lỗi xác minh token trong /api/contracts:", {
      error: error instanceof Error ? error.message : String(error),
      token: token.substring(0, 10) + "...",
    });
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: "Token đã hết hạn" });
    }
    return res.status(401).json({ success: false, message: "Token không hợp lệ" });
  }

  try {
    const { page = "1", limit = "10", search = "", status = "" } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Định nghĩa kiểu Prisma.ContractsWhereInput
    const where: Prisma.ContractsWhereInput = {
      employee: {
        OR: [
          { full_name: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ],
      },
    };

    if (status) {
      where.status = status as "ACTIVE" | "EXPIRING" | "EXPIRED";
    }

    const [contracts, total] = await Promise.all([
      prisma.contracts.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          employee: {
            include: {
              department: { select: { name: true } },
              position: { select: { name: true } },
            },
          },
        },
      }),
      prisma.contracts.count({ where }),
    ]);

    const formattedContracts: Contract[] = contracts.map((contract) => ({
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
      status: contract.status as "ACTIVE" | "EXPIRING" | "EXPIRED",
    }));

    return res.status(200).json({
      success: true,
      contracts: formattedContracts,
      total,
    });
  } catch (error: unknown) {
    console.error("Lỗi tải hợp đồng:", error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  } finally {
    await prisma.$disconnect();
  }
}