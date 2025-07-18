import { PrismaClient, Prisma } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("x ")) {
        return res.status(401).json({ error: "Thiếu hoặc sai định dạng token" });
      }

      const { page = "1", limit = "10", search = "" } = req.query;

      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;

      const where: Prisma.ShiftsWhereInput = {};
      if (search) {
        where.name = { contains: search as string, mode: "insensitive" };
      }

      const shifts = await prisma.shifts.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
        select: {
          shift_id: true,
          name: true,
          start_time: true,
          end_time: true,
        },
      });

      const total = await prisma.shifts.count({ where });

      return res.status(200).json({
        shifts,
        total,
      });
    } catch (error: unknown) {
      console.error("Lỗi khi lấy danh sách ca làm việc:", error);
      return res.status(500).json({
        error: "Lỗi máy chủ nội bộ",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ error: `Phương thức ${req.method} không được phép` });
  }
}