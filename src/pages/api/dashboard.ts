import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // 1. Tổng số nhân viên, hợp đồng sắp hết hạn, đơn nghỉ phép
    const [employeeCount, expiringContracts, pendingLeaveRequests] = await Promise.all([
      prisma.employees.count(),
      prisma.contracts.count({
        where: {
          end_date: {
            gte: new Date(),
            lte: new Date(new Date().setDate(new Date().getDate() + 60)),
          },
          status: "EXPIRING",
        },
      }),
      prisma.leaveRequests.count({
        where: { status: "PENDING" },
      }),
    ]);

    // 2. Nhân viên theo phòng ban
    const departmentsData = await prisma.departments.findMany({
      select: {
        department_id: true,
        name: true,
        _count: { select: { employees: true } },
      },
    });

    // 3. Nhân viên theo chức vụ
    const positionsData = await prisma.positions.findMany({
      select: {
        position_id: true,
        name: true,
        _count: { select: { employees: true } },
      },
    });

    // 4. Hợp đồng sắp hết hạn
    const contractsData = await prisma.contracts.findMany({
      where: {
        end_date: {
          gte: new Date(),
          lte: new Date(new Date().setDate(new Date().getDate() + 60)),
        },
        status: "EXPIRING",
      },
      include: {
        employee: { select: { full_name: true } },
      },
    });

    // 5. Đơn nghỉ phép theo thời gian
    const leaveRequestsData = await prisma.leaveRequests.groupBy({
      by: ["start_date"],
      where: {
        start_date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      _count: { leave_request_id: true },
      orderBy: { start_date: "asc" },
    });

    // 6. Phân quyền người dùng
    const rolesData = await prisma.roles.findMany({
      select: {
        role_id: true,
        name: true,
        _count: { select: { user_roles: true } },
      },
    });

    // Dữ liệu giả định cho chấm công
    const mockTimekeeping = [
      { date: "2025-05-01", present: 50, late: 5, absent: 2 },
      { date: "2025-05-02", present: 48, late: 7, absent: 3 },
      { date: "2025-05-03", present: 49, late: 4, absent: 4 },
    ];

    // Dữ liệu giả định cho thưởng/phạt
    const mockRewardDiscipline = [
      { month: "2025-01", rewards: 10, penalties: 5 },
      { month: "2025-02", rewards: 12, penalties: 3 },
      { month: "2025-03", rewards: 8, penalties: 7 },
    ];

    // Trả về dữ liệu
    res.status(200).json({
      stats: {
        employees: employeeCount,
        expiringContracts,
        pendingLeaveRequests,
      },
      departments: departmentsData.map((d) => ({
        id: d.department_id,
        name: d.name,
        employeeCount: d._count.employees,
      })),
      positions: positionsData.map((p) => ({
        id: p.position_id,
        name: p.name,
        employeeCount: p._count.employees,
      })),
      contracts: contractsData.map((c) => ({
        id: c.contract_id,
        employee: c.employee.full_name,
        end_date: c.end_date,
      })),
      leaveRequests: leaveRequestsData.map((lr) => ({
        date: lr.start_date.toISOString().split("T")[0],
        count: lr._count.leave_request_id,
      })),
      roles: rolesData.map((r) => ({
        id: r.role_id,
        name: r.name,
        userCount: r._count.user_roles,
      })),
      timekeeping: mockTimekeeping,
      rewardDiscipline: mockRewardDiscipline,
    });
  } catch (error: unknown) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).json({ message: "Không thể tải dữ liệu. Vui lòng thử lại sau." });
  } finally {
    await prisma.$disconnect();
  }
}