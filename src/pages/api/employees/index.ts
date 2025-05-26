import { PrismaClient, Prisma, Gender, EmploymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

// Ánh xạ giá trị từ client sang enum Prisma
const genderMap: Record<string, Gender> = {
  'Nam': Gender.MALE,
  'Nữ': Gender.FEMALE,
};

const employmentStatusMap: Record<string, EmploymentStatus> = {
  'Đang làm': EmploymentStatus.ACTIVE,
  'Thử việc': EmploymentStatus.PROBATION,
  'Nghỉ việc': EmploymentStatus.TERMINATED,
  'Nghỉ thai sản': EmploymentStatus.MATERNITY_LEAVE,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', search = '' } = req.query;

      const pageNumber = parseInt(page as string, 10) || 1;
      const pageSize = parseInt(limit as string, 10) || 10;
      const skip = (pageNumber - 1) * pageSize;

      const where: Prisma.EmployeesWhereInput = search
        ? {
            OR: [
              { full_name: { contains: search as string, mode: 'insensitive' } },
              { email: { contains: search as string, mode: 'insensitive' } },
            ],
          }
        : {};

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

      return res.status(200).json({
        employees: employees.map((emp) => ({
          ...emp,
          department_name: emp.department?.name || null,
          position_name: emp.position?.name || null,
        })),
        total,
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: (error as Error).message });
    }
  } else if (req.method === 'POST') {
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

      console.log('Payload nhận được:', req.body);

      // Kiểm tra các trường bắt buộc
      if (!full_name || !email || !employment_status) {
        console.error('Thiếu các trường bắt buộc:', { full_name, email, employment_status });
        return res.status(400).json({ error: 'Thiếu các trường bắt buộc: full_name, email, employment_status' });
      }

      // Kiểm tra định dạng email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error('Email không hợp lệ:', email);
        return res.status(400).json({ error: 'Email không hợp lệ' });
      }

      // Kiểm tra email trùng lặp
      const existingEmployee = await prisma.employees.findUnique({
        where: { email },
      });
      if (existingEmployee) {
        console.error('Email đã tồn tại:', email);
        return res.status(400).json({ error: 'Email đã tồn tại' });
      }

      // Kiểm tra department_id (nếu có)
      if (department_id) {
        const departmentExists = await prisma.departments.findUnique({
          where: { department_id },
        });
        if (!departmentExists) {
          console.error('Phòng ban không tồn tại:', department_id);
          return res.status(400).json({ error: 'Phòng ban không tồn tại' });
        }
      }

      // Kiểm tra position_id (nếu có)
      if (position_id) {
        const positionExists = await prisma.positions.findUnique({
          where: { position_id },
        });
        if (!positionExists) {
          console.error('Vị trí không tồn tại:', position_id);
          return res.status(400).json({ error: 'Vị trí không tồn tại' });
        }
      }

      // Ánh xạ gender
      let mappedGender: Gender | undefined;
      if (gender) {
        mappedGender = genderMap[gender];
        if (!mappedGender) {
          console.error('Giới tính không hợp lệ:', gender);
          return res.status(400).json({ error: 'Giới tính không hợp lệ. Phải là: Nam, Nữ' });
        }
      }

      // Ánh xạ employment_status
      const mappedEmploymentStatus = employmentStatusMap[employment_status];
      if (!mappedEmploymentStatus) {
        console.error('Trạng thái không hợp lệ:', employment_status);
        return res.status(400).json({ error: 'Trạng thái không hợp lệ. Phải là: Đang làm, Thử việc, Nghỉ việc, Nghỉ thai sản' });
      }

      // Kiểm tra định dạng ngày
      const parsedBirthDate = birth_date ? new Date(birth_date) : null;
      if (birth_date && (parsedBirthDate === null || isNaN(parsedBirthDate.getTime()))) {
        console.error('Ngày sinh không hợp lệ:', birth_date);
        return res.status(400).json({ error: 'Ngày sinh không hợp lệ' });
      }

      const parsedJoinDate = join_date ? new Date(join_date) : null;
      if (join_date && (parsedJoinDate === null || isNaN(parsedJoinDate.getTime()))) {
        console.error('Ngày vào làm không hợp lệ:', join_date);
        return res.status(400).json({ error: 'Ngày vào làm không hợp lệ' });
      }

      // Tạo nhân viên mới
      const employee = await prisma.employees.create({
        data: {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          employee_id: require('uuid').v4(),
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

      console.log('Nhân viên đã tạo:', employee);
      return res.status(201).json(employee);
    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
      return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}