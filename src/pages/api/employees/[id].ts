import { PrismaClient, Gender, EmploymentStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

// Ánh xạ giá trị từ client sang enum Prisma
const genderMap: Record<string, Gender | null> = {
  'Nam': Gender.MALE,
  'Nữ': Gender.FEMALE
};

const employmentStatusMap: Record<string, EmploymentStatus> = {
  'Đang làm': EmploymentStatus.ACTIVE,
  'Thử việc': EmploymentStatus.PROBATION,
  'Nghỉ việc': EmploymentStatus.TERMINATED,
  'Nghỉ thai sản': EmploymentStatus.MATERNITY_LEAVE,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET': {
      try {
        const employee = await prisma.employees.findUnique({
          where: { employee_id: id as string },
          include: {
            department: { select: { department_id: true, name: true } },
            position: { select: { position_id: true, name: true } },
          },
        });

        if (!employee) {
          return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
        }

        const formattedEmployee = {
          employee_id: employee.employee_id,
          avatar_url: employee.avatar_url,
          full_name: employee.full_name,
          email: employee.email,
          phone_number: employee.phone_number || '',
          birth_date: employee.birth_date ? employee.birth_date.toISOString().split('T')[0] : '',
          gender: employee.gender === Gender.MALE ? 'Nam' : employee.gender === Gender.FEMALE ? 'Nữ' : '',
          address: employee.address || '',
          department_id: employee.department ? employee.department.department_id : '',
          department_name: employee.department ? employee.department.name : '',
          position_id: employee.position ? employee.position.position_id : '',
          position_name: employee.position ? employee.position.name : '',
          employment_status:
            employee.employment_status === EmploymentStatus.ACTIVE ? 'Đang làm' :
            employee.employment_status === EmploymentStatus.PROBATION ? 'Thử việc' :
            employee.employment_status === EmploymentStatus.TERMINATED ? 'Nghỉ việc' :
            'Nghỉ thai sản',
          join_date: employee.join_date ? employee.join_date.toISOString().split('T')[0] : '',
          leave_date: employee.leave_date ? employee.leave_date.toISOString().split('T')[0] : null,
          created_at: employee.created_at.toISOString(),
          updated_at: employee.updated_at.toISOString(),
        };

        return res.status(200).json(formattedEmployee);
      } catch (error) {
        console.error('Lỗi khi lấy chi tiết nhân viên:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: (error as Error).message });
      }
    }

    case 'PUT': {
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
        console.log('Giá trị gender nhận được:', `"${gender}"`, 'Type:', typeof gender, 'Length:', gender?.length);

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
        const existingEmployee = await prisma.employees.findFirst({
          where: {
            email,
            employee_id: { not: id as string },
          },
        });
        if (existingEmployee) {
          console.error('Email đã tồn tại:', email);
          return res.status(400).json({ error: 'Email đã tồn tại' });
        }

        // Kiểm tra nhân viên tồn tại
        const employee = await prisma.employees.findUnique({
          where: { employee_id: id as string },
        });
        if (!employee) {
          console.error('Không tìm thấy nhân viên:', id);
          return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
        }

        // Kiểm tra department_id (nếu có)
        if (department_id) {
          const department = await prisma.departments.findUnique({
            where: { department_id },
          });
          if (!department) {
            console.error('Phòng ban không hợp lệ:', department_id);
            return res.status(400).json({ error: 'Phòng ban không hợp lệ' });
          }
        }

        // Kiểm tra position_id (nếu có)
        if (position_id) {
          const position = await prisma.positions.findUnique({
            where: { position_id },
          });
          if (!position) {
            console.error('Vị trí không hợp lệ:', position_id);
            return res.status(400).json({ error: 'Vị trí không hợp lệ' });
          }
        }

        // Xử lý gender
        let mappedGender = null;
        console.log('Kiểm tra gender:', `"${gender}"`, gender === 'Nam', gender === 'Nữ');

        const cleanGender = gender ? gender.toString().trim() : '';
        console.log('Gender sau khi trim:', `"${cleanGender}"`);

        // Chấp nhận cả "Nam"/"Nữ" và "MALE"/"FEMALE"
        if (cleanGender === 'MALE' || cleanGender === 'FEMALE') {
          mappedGender = cleanGender; // Giữ nguyên giá trị enum
        } else if (cleanGender === 'Nam' || cleanGender === 'Nữ') {
          mappedGender = genderMap[cleanGender];
        } else if (cleanGender !== '') {
          console.error('Giới tính không hợp lệ:', `"${cleanGender}"`);
          return res.status(400).json({ error: 'Giới tính chỉ chấp nhận: Nam, Nữ, MALE hoặc FEMALE' });
        }

        // Ánh xạ employment_status
        const mappedEmploymentStatus = employmentStatusMap[employment_status];
        if (!mappedEmploymentStatus) {
          console.error('Trạng thái không hợp lệ:', employment_status);
          return res.status(400).json({ error: 'Trạng thái không hợp lệ. Phải là: Đang làm, Thử việc, Nghỉ việc, Nghỉ thai sản' });
        }

        // Kiểm tra định dạng ngày
        const parsedBirthDate = birth_date ? new Date(birth_date) : null;
        if (birth_date && (!parsedBirthDate || isNaN(parsedBirthDate.getTime()))) {
          console.error('Ngày sinh không hợp lệ:', birth_date);
          return res.status(400).json({ error: 'Ngày sinh không hợp lệ' });
        }

        const parsedJoinDate = join_date ? new Date(join_date) : null;
        if (join_date && (!parsedJoinDate || isNaN(parsedJoinDate.getTime()))) {
          console.error('Ngày vào làm không hợp lệ:', join_date);
          return res.status(400).json({ error: 'Ngày vào làm không hợp lệ' });
        }

        // Cập nhật nhân viên
        const updatedEmployee = await prisma.employees.update({
          where: { employee_id: id as string },
          data: {
            full_name,
            email,
            phone_number: phone_number || null,
            birth_date: parsedBirthDate,
            gender: mappedGender,
            address: address || null,
            department_id: department_id || null,
            position_id: position_id || null,
            employment_status: mappedEmploymentStatus,
            join_date: parsedJoinDate,
            avatar_url: avatar_url || null,
            updated_at: new Date(),
          },
        });

        console.log('Nhân viên đã cập nhật:', updatedEmployee);
        return res.status(200).json({ message: 'Cập nhật nhân viên thành công', employee: updatedEmployee });
      } catch (error) {
        console.error('Lỗi khi cập nhật nhân viên:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: (error as Error).message });
      }
    }

    case 'DELETE': {
      try {
        const employee = await prisma.employees.findUnique({
          where: { employee_id: id as string },
        });

        if (!employee) {
          console.error('Không tìm thấy nhân viên:', id);
          return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
        }

        await prisma.employees.delete({
          where: { employee_id: id as string },
        });

        return res.status(200).json({ message: 'Xóa nhân viên thành công' });
      } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        return res.status(500).json({ error: 'Lỗi máy chủ nội bộ', details: (error as Error).message });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Phương thức ${req.method} không được phép` });
  }
}