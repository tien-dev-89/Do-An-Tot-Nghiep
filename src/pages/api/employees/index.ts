import { PrismaClient, Prisma, Gender, EmploymentStatus } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// Ánh xạ giá trị từ client sang enum Prisma (chỉ dùng cho POST)
const genderMap: Record<string, Gender> = {
  "Nam": Gender.MALE,
  "Nữ": Gender.FEMALE,
};

const employmentStatusMap: Record<string, EmploymentStatus> = {
  "Đang làm": EmploymentStatus.ACTIVE,
  "Thử việc": EmploymentStatus.PROBATION,
  "Nghỉ việc": EmploymentStatus.TERMINATED,
  "Nghỉ thai sản": EmploymentStatus.MATERNITY_LEAVE,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("x ")) {
        return res.status(401).json({ error: "Thiếu hoặc sai định dạng token" });
      }
  
      const {
        page = "1",
        limit = "10",
        search = "",
        gender = "",
        status = "",
        department_id = "",
        position_id = "",
        joinDateFrom = "",
        joinDateTo = "",
      } = req.query;
  
      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;
  
      const where: Prisma.EmployeesWhereInput = {};
      if (search) {
        where.OR = [
          { full_name: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
        ];
      }
      if (gender) {
        where.gender = gender as Gender;
      }
      if (status) {
        where.employment_status = status as EmploymentStatus;
      }
      if (department_id) {
        where.department_id = department_id as string;
      }
      if (position_id) {
        where.position_id = position_id as string;
      }
      const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/");
        const parsedDate = new Date(`${year}-${month}-${day}`);
        if (isNaN(parsedDate.getTime())) return null;
        return parsedDate;
      };
      const fromDate = joinDateFrom ? parseDate(joinDateFrom as string) : null;
      const toDate = joinDateTo ? parseDate(joinDateTo as string) : null;
      if (fromDate && toDate) {
        where.join_date = { gte: fromDate, lte: toDate };
      } else if (fromDate) {
        where.join_date = { gte: fromDate };
      } else if (toDate) {
        where.join_date = { lte: toDate };
      }
  
      const employees = await prisma.employees.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          employee_id: true,
          full_name: true,
          email: true,
          phone_number: true,
          birth_date: true,
          gender: true,
          address: true,
          department_id: true,
          position_id: true,
          employment_status: true,
          join_date: true,
          leave_date: true,
          avatar_url: true,
          created_at: true,
          updated_at: true,
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      });
  
      const total = await prisma.employees.count({ where });
  
      const stats = {
        all: total,
        active: await prisma.employees.count({
          where: { ...where, employment_status: EmploymentStatus.ACTIVE },
        }),
        probation: await prisma.employees.count({
          where: { ...where, employment_status: EmploymentStatus.PROBATION },
        }),
        maternity: await prisma.employees.count({
          where: { ...where, employment_status: EmploymentStatus.MATERNITY_LEAVE },
        }),
        leave: await prisma.employees.count({
          where: { ...where, employment_status: EmploymentStatus.TERMINATED },
        }),
      };
  
      return res.status(200).json({
        employees: employees.map((emp) => ({
          ...emp,
          department_name: emp.department?.name || null,
          position_name: emp.position?.name || null,
        })),
        total,
        stats,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      return res.status(500).json({ error: "Lỗi máy chủ nội bộ", details: (error as Error).message });
    }
  } else if (req.method === "POST") {
    try {
      const {
        full_name,
        email,
        phone_number,
        birth_date,
        gender,
        address,
        department_id,
        position_id,
        employment_status,
        join_date,
        avatar_url,
      } = req.body;

      console.log("Payload nhận được:", req.body);

      if (!full_name || !email || !employment_status) {
        console.error("Thiếu các trường bắt buộc:", { full_name, email, employment_status });
        return res.status(400).json({ error: "Thiếu các trường bắt buộc: full_name, email, employment_status" });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error("Email không hợp lệ:", email);
        return res.status(400).json({ error: "Email không hợp lệ" });
      }

      const existingEmployee = await prisma.employees.findUnique({
        where: { email },
      });
      if (existingEmployee) {
        console.error("Email đã tồn tại:", email);
        return res.status(400).json({ error: "Email đã tồn tại" });
      }

      if (department_id) {
        const departmentExists = await prisma.departments.findUnique({
          where: { department_id },
        });
        if (!departmentExists) {
          console.error("Phòng ban không tồn tại:", department_id);
          return res.status(400).json({ error: "Phòng ban không tồn tại" });
        }
      }

      if (position_id) {
        const positionExists = await prisma.positions.findUnique({
          where: { position_id },
        });
        if (!positionExists) {
          console.error("Vị trí không tồn tại:", position_id);
          return res.status(400).json({ error: "Vị trí không tồn tại" });
        }
      }

      let mappedGender: Gender | undefined = undefined;
      if (gender) {
        mappedGender = genderMap[gender];
        if (!mappedGender) {
          console.error("Giới tính không hợp lệ:", gender);
          return res.status(400).json({ error: "Giới tính không hợp lệ. Phải là: Nam, Nữ" });
        }
      }

      const mappedEmploymentStatus = employmentStatusMap[employment_status];
      if (!mappedEmploymentStatus) {
        console.error("Trạng thái không hợp lệ:", employment_status);
        return res.status(400).json({ error: "Trạng thái không hợp lệ. Phải là: Đang làm, Thử việc, Nghỉ việc, Nghỉ thai sản" });
      }

      const parsedBirthDate = birth_date ? new Date(birth_date) : null;
      if (birth_date && (parsedBirthDate === null || isNaN(parsedBirthDate.getTime()))) {
        console.error("Ngày sinh không hợp lệ:", birth_date);
        return res.status(400).json({ error: "Ngày sinh không hợp lệ" });
      }

      const parsedJoinDate = join_date ? new Date(join_date) : null;
      if (join_date && (parsedJoinDate === null || isNaN(parsedJoinDate.getTime()))) {
        console.error("Ngày vào làm không hợp lệ:", join_date);
        return res.status(400).json({ error: "Ngày vào làm không hợp lệ" });
      }

      const employee = await prisma.employees.create({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          employee_id: require("uuid").v4(),
          full_name,
          email,
          phone_number: phone_number || null,
          birth_date: parsedBirthDate,
          gender: mappedGender || null,
          address: address || null,
          department_id: department_id || null,
          position_id: position_id || null,
          employment_status: mappedEmploymentStatus,
          join_date: parsedJoinDate,
          avatar_url: avatar_url || null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      console.log("Nhân viên đã tạo:", employee);
      return res.status(201).json(employee);
    } catch (error) {
      console.error("Lỗi khi thêm nhân viên:", error);
      return res.status(500).json({ error: "Lỗi máy chủ nội bộ", details: (error as Error).message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}