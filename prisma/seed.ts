import { PrismaClient, Gender, EmploymentStatus, NotificationType, EmailStatus, LeaveType, LeaveStatus, PayrollStatus, RewardPenaltyType, RewardPenaltyStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function main() {
  try {
    // Xóa dữ liệu cũ
    await prisma.userRoles.deleteMany();
    await prisma.users.deleteMany();
    await prisma.emailQueue.deleteMany();
    await prisma.notifications.deleteMany();
    await prisma.payrolls.deleteMany();
    await prisma.rewardPenalties.deleteMany();
    await prisma.leaveRequests.deleteMany();
    await prisma.attendanceRecords.deleteMany();
    await prisma.employees.deleteMany();
    await prisma.positions.deleteMany();
    await prisma.departments.deleteMany();
    await prisma.shifts.deleteMany();
    await prisma.rolePermissions.deleteMany();
    await prisma.roles.deleteMany();
    await prisma.loginLogs.deleteMany();
    await prisma.contracts.deleteMany();

    // 1. Tạo Roles với role_id cố định
    const roles = await Promise.all([
      prisma.roles.create({
        data: {
          role_id: 'role_admin',
          name: 'Admin',
          description: 'Quản trị viên hệ thống với toàn quyền truy cập',
        },
      }),
      prisma.roles.create({
        data: {
          role_id: 'role_hr',
          name: 'HR',
          description: 'Nhân sự, quản lý hồ sơ và phúc lợi nhân viên',
        },
      }),
      prisma.roles.create({
        data: {
          role_id: 'role_manager',
          name: 'Manager',
          description: 'Quản lý nhóm hoặc phòng ban',
        },
      }),
      prisma.roles.create({
        data: {
          role_id: 'role_employee',
          name: 'Employee',
          description: 'Nhân viên thông thường',
        },
      }),
    ]);

    // 2. Tạo RolePermissions
    const rolePermissions = {
      Admin: [
        { resource: 'all', action: 'read' },
        { resource: 'all', action: 'write' },
        { resource: 'all', action: 'delete' },
        { resource: 'all', action: 'manage_roles' },
      ],
      HR: [
        { resource: 'employee', action: 'read' },
        { resource: 'employee', action: 'write' },
        { resource: 'user_roles', action: 'read' },
        { resource: 'user_roles', action: 'write' },
        { resource: 'user_roles', action: 'assign_roles' },
      ],
      Manager: [
        { resource: 'department', action: 'read' },
        { resource: 'department', action: 'write' },
        { resource: 'employee', action: 'read' },
        { resource: 'employee', action: 'write' },
      ],
      Employee: [
        { resource: 'task', action: 'read' },
        { resource: 'task', action: 'write' },
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'write' },
      ],
    };

    for (const role of roles) {
      const permissions = rolePermissions[role.name as keyof typeof rolePermissions] || [];
      for (const perm of permissions) {
        await prisma.rolePermissions.create({
          data: {
            permission_id: uuidv4(),
            role_id: role.role_id,
            resource: perm.resource,
            action: perm.action,
          },
        });
      }
    }

    // 3. Tạo Departments
    const departments = await Promise.all([
      prisma.departments.create({
        data: {
          department_id: uuidv4(),
          name: 'Phòng Công nghệ Thông tin',
          description: 'Quản lý và phát triển hệ thống CNTT',
          email: 'it@company.com',
          phone_number: '0123456789',
        },
      }),
      prisma.departments.create({
        data: {
          department_id: uuidv4(),
          name: 'Phòng Nhân sự',
          description: 'Quản lý tuyển dụng và hồ sơ nhân viên',
          email: 'hr@company.com',
          phone_number: '0987654321',
        },
      }),
      prisma.departments.create({
        data: {
          department_id: uuidv4(),
          name: 'Phòng Marketing',
          description: 'Quản lý chiến lược tiếp thị và quảng cáo',
          email: 'marketing@company.com',
          phone_number: '0901234567',
        },
      }),
    ]);

    // 4. Tạo Positions
    const positions = await Promise.all([
      prisma.positions.create({
        data: {
          position_id: uuidv4(),
          name: 'Lập trình viên',
          description: 'Phát triển phần mềm và hệ thống',
        },
      }),
      prisma.positions.create({
        data: {
          position_id: uuidv4(),
          name: 'Chuyên viên nhân sự',
          description: 'Quản lý hồ sơ và phúc lợi nhân viên',
        },
      }),
      prisma.positions.create({
        data: {
          position_id: uuidv4(),
          name: 'Chuyên viên Marketing',
          description: 'Thực hiện các chiến dịch tiếp thị',
        },
      }),
    ]);

    // 5. Tạo Shifts
    const shifts = await Promise.all([
      prisma.shifts.create({
        data: {
          shift_id: uuidv4(),
          name: 'Cả ngày',
          start_time: '09:00',
          end_time: '18:00',
          created_at: new Date(),
          updated_at: new Date(),
        },
      }),
      prisma.shifts.create({
        data: {
          shift_id: uuidv4(),
          name: 'Ca sáng',
          start_time: '09:00',
          end_time: '12:00',
          created_at: new Date(),
          updated_at: new Date(),
        },
      }),
      prisma.shifts.create({
        data: {
          shift_id: uuidv4(),
          name: 'Ca chiều',
          start_time: '13:30',
          end_time: '18:00',
          created_at: new Date(),
          updated_at: new Date(),
        },
      }),
    ]);

    // 6. Tạo Employees
    const employees = await Promise.all([
      prisma.employees.create({
        data: {
          employee_id: uuidv4(),
          full_name: 'Nguyễn Văn Anh',
          email: 'nhapt94@gmail.com',
          phone_number: '0912345678',
          birth_date: new Date('1990-05-15'),
          gender: Gender.MALE,
          address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
          department_id: departments[0].department_id,
          position_id: positions[0].position_id,
          employment_status: EmploymentStatus.ACTIVE,
          join_date: new Date('2023-01-10'),
          avatar_url: 'https://drive.google.com/uc?id=1s6Rrm9qd-epMFFNY39uuCzOg883epcLa',
        },
      }),
      prisma.employees.create({
        data: {
          employee_id: uuidv4(),
          full_name: 'Trần Thị Bình',
          email: 'tranthibinh@company.com',
          phone_number: '0987654321',
          birth_date: new Date('1992-08-20'),
          gender: Gender.FEMALE,
          address: '456 Đường Nguyễn Huệ, Quận 3, TP.HCM',
          department_id: departments[1].department_id,
          position_id: positions[1].position_id,
          employment_status: EmploymentStatus.ACTIVE,
          join_date: new Date('2023-06-01'),
          avatar_url: 'https://drive.google.com/uc?id=1s6Rrm9qd-epMFFNY39uuCzOg883epcLa',
        },
      }),
      prisma.employees.create({
        data: {
          employee_id: uuidv4(),
          full_name: 'Lê Minh Châu',
          email: 'leminhchau@company.com',
          phone_number: '0901234567',
          birth_date: new Date('1995-03-10'),
          gender: Gender.FEMALE,
          address: '789 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
          department_id: departments[2].department_id,
          position_id: positions[2].position_id,
          employment_status: EmploymentStatus.ACTIVE,
          join_date: new Date('2024-01-15'),
          avatar_url: 'https://drive.google.com/uc?id=1s6Rrm9qd-epMFFNY39uuCzOg883epcLa',
        },
      }),
    ]);

    // Cập nhật manager cho Department
    await prisma.departments.update({
      where: { department_id: departments[0].department_id },
      data: { manager_id: employees[0].employee_id },
    });
    await prisma.departments.update({
      where: { department_id: departments[1].department_id },
      data: { manager_id: employees[1].employee_id },
    });

    // 7. Tạo Users
    const users = await Promise.all([
      prisma.users.create({
        data: {
          user_id: uuidv4(),
          employee_id: employees[0].employee_id,
          username: 'nguyenvananh',
          email: 'nhapt94@gmail.com',
          password_hash: await bcrypt.hash('Anh123456', 10),
          is_active: true,
        },
      }),
      prisma.users.create({
        data: {
          user_id: uuidv4(),
          employee_id: employees[1].employee_id,
          username: 'tranthibinh',
          email: 'tranthibinh@company.com',
          password_hash: await bcrypt.hash('Binh123456', 10),
          is_active: true,
        },
      }),
      prisma.users.create({
        data: {
          user_id: uuidv4(),
          employee_id: employees[2].employee_id,
          username: 'leminhchau',
          email: 'leminhchau@company.com',
          password_hash: await bcrypt.hash('Chau123456', 10),
          is_active: true,
        },
      }),
    ]);

    // Tạo token mẫu
    const tokens = users.map((user, index) => {
      const role = roles.find((r) => r.name === (index === 0 ? 'Admin' : index === 1 ? 'HR' : 'Employee'));
      return {
        username: user.username,
        token: jwt.sign({ employee_id: user.employee_id, role_id: role!.role_id }, JWT_SECRET, { expiresIn: '7d' }),
      };
    });
    console.log('Tokens mẫu:', tokens);

    // 8. Tạo UserRoles
    await Promise.all([
      prisma.userRoles.create({
        data: {
          user_role_id: uuidv4(),
          employee_id: employees[0].employee_id,
          role_id: 'role_admin',
        },
      }),
      prisma.userRoles.create({
        data: {
          user_role_id: uuidv4(),
          employee_id: employees[1].employee_id,
          role_id: 'role_hr',
        },
      }),
      prisma.userRoles.create({
        data: {
          user_role_id: uuidv4(),
          employee_id: employees[2].employee_id,
          role_id: 'role_employee',
        },
      }),
    ]);

    // 9. Tạo AttendanceRecords
    const attendanceRecords = [
      {
        attendance_id: uuidv4(),
        employee_id: employees[0].employee_id,
        date: new Date('2025-07-09'),
        clock_in_time: new Date('2025-07-09T09:00:00'),
        clock_out_time: new Date('2025-07-09T18:30:00'),
        shift_id: shifts[0].shift_id,
        late_minutes: 0,
        early_leave_minutes: 0,
        overtime_hours: 0.5,
        status: 'Đúng giờ',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        attendance_id: uuidv4(),
        employee_id: employees[1].employee_id,
        date: new Date('2025-07-09'),
        clock_in_time: new Date('2025-07-09T09:15:00'),
        clock_out_time: new Date('2025-07-09T17:45:00'),
        shift_id: shifts[0].shift_id,
        late_minutes: 15,
        early_leave_minutes: 15,
        overtime_hours: 0,
        status: 'Đi muộn và về sớm',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        attendance_id: uuidv4(),
        employee_id: employees[2].employee_id,
        date: new Date('2025-07-09'),
        clock_in_time: new Date('2025-07-09T09:00:00'),
        clock_out_time: new Date('2025-07-09T11:30:00'),
        shift_id: shifts[1].shift_id,
        late_minutes: 0,
        early_leave_minutes: 30,
        overtime_hours: 0,
        status: 'Về sớm',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        attendance_id: uuidv4(),
        employee_id: employees[0].employee_id,
        date: new Date('2025-07-10'),
        clock_in_time: new Date('2025-07-10T09:10:00'),
        clock_out_time: new Date('2025-07-10T18:00:00'),
        shift_id: shifts[0].shift_id,
        late_minutes: 10,
        early_leave_minutes: 0,
        overtime_hours: 0,
        status: 'Đi muộn',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        attendance_id: uuidv4(),
        employee_id: employees[1].employee_id,
        date: new Date('2025-07-10'),
        clock_in_time: null,
        clock_out_time: null,
        shift_id: shifts[0].shift_id,
        late_minutes: 0,
        early_leave_minutes: 0,
        overtime_hours: 0,
        status: 'Vắng mặt',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await prisma.attendanceRecords.createMany({
      data: attendanceRecords,
    });

    // 10. Tạo LeaveRequests
    await Promise.all([
      prisma.leaveRequests.create({
        data: {
          leave_request_id: uuidv4(),
          employee_id: employees[0].employee_id,
          leave_type: LeaveType.ANNUAL,
          start_date: new Date('2025-07-15'),
          end_date: new Date('2025-07-17'),
          reason: 'Nghỉ phép năm để đi du lịch',
          status: LeaveStatus.PENDING,
          approver_id: employees[1].employee_id,
        },
      }),
      prisma.leaveRequests.create({
        data: {
          leave_request_id: uuidv4(),
          employee_id: employees[2].employee_id,
          leave_type: LeaveType.SICK,
          start_date: new Date('2025-07-20'),
          end_date: new Date('2025-07-21'),
          reason: 'Nghỉ ốm',
          status: LeaveStatus.PENDING,
          approver_id: employees[1].employee_id,
        },
      }),
    ]);

    // 11. Tạo Payrolls
    await Promise.all([
      prisma.payrolls.create({
        data: {
          payroll_id: uuidv4(),
          employee_id: employees[0].employee_id,
          month: '2025-07',
          base_salary: 15000000,
          overtime_bonus: 750000,
          late_penalty: 0,
          total_salary: 15750000,
          status: PayrollStatus.UNPAID,
        },
      }),
      prisma.payrolls.create({
        data: {
          payroll_id: uuidv4(),
          employee_id: employees[1].employee_id,
          month: '2025-07',
          base_salary: 12000000,
          overtime_bonus: 0,
          late_penalty: 100000,
          total_salary: 11900000,
          status: PayrollStatus.UNPAID,
        },
      }),
    ]);

    // 12. Tạo RewardPenalties
    await Promise.all([
      prisma.rewardPenalties.create({
        data: {
          id: uuidv4(),
          employee_id: employees[0].employee_id,
          type: RewardPenaltyType.REWARD,
          amount: 1500000,
          reason: 'Hoàn thành dự án trước hạn',
          month: '2025-07',
          status: RewardPenaltyStatus.APPROVED,
          approver_id: employees[1].employee_id,
        },
      }),
      prisma.rewardPenalties.create({
        data: {
          id: uuidv4(),
          employee_id: employees[1].employee_id,
          type: RewardPenaltyType.REWARD,
          amount: 2000000,
          reason: 'Đạt thành tích tuyển dụng xuất sắc Q3/2025',
          month: '2025-07',
          status: RewardPenaltyStatus.APPROVED,
          approver_id: employees[0].employee_id,
        },
      }),
      prisma.rewardPenalties.create({
        data: {
          id: uuidv4(),
          employee_id: employees[2].employee_id,
          type: RewardPenaltyType.PENALTY,
          amount: 200000,
          reason: 'Đi trễ 3 lần trong tháng',
          month: '2025-07',
          status: RewardPenaltyStatus.APPROVED,
          approver_id: employees[1].employee_id,
        },
      }),
    ]);

    // 13. Tạo Contracts
    const contracts = await Promise.all([
      prisma.contracts.create({
        data: {
          contract_id: uuidv4(),
          employee_id: employees[0].employee_id,
          start_date: new Date('2024-01-01'),
          end_date: new Date('2025-12-31'),
          status: 'ACTIVE',
        },
      }),
      prisma.contracts.create({
        data: {
          contract_id: uuidv4(),
          employee_id: employees[1].employee_id,
          start_date: new Date('2024-06-01'),
          end_date: new Date('2025-07-01'),
          status: 'EXPIRING',
        },
      }),
      prisma.contracts.create({
        data: {
          contract_id: uuidv4(),
          employee_id: employees[2].employee_id,
          start_date: new Date('2023-01-15'),
          end_date: new Date('2024-01-15'),
          status: 'EXPIRED',
        },
      }),
    ]);

    // 14. Tạo Notifications
    await Promise.all([
      prisma.notifications.create({
        data: {
          notification_id: uuidv4(),
          employee_id: employees[0].employee_id,
          title: 'Yêu cầu nghỉ phép',
          message: 'Yêu cầu nghỉ phép từ 15/07/2025 đang chờ phê duyệt',
          type: NotificationType.PERSONAL,
          is_read: false,
        },
      }),
      prisma.notifications.create({
        data: {
          notification_id: uuidv4(),
          employee_id: employees[0].employee_id,
          title: 'Hợp đồng mới',
          message: `Hợp đồng mới cho nhân viên ${employees[0].full_name} đã được tạo.`,
          type: NotificationType.CONTRACT,
          is_read: false,
          contract_id: contracts[0].contract_id,
        },
      }),
      prisma.notifications.create({
        data: {
          notification_id: uuidv4(),
          employee_id: employees[2].employee_id,
          title: 'Yêu cầu nghỉ phép',
          message: 'Yêu cầu nghỉ phép từ 20/07/2025 đang chờ phê duyệt',
          type: NotificationType.PERSONAL,
          is_read: false,
        },
      }),
    ]);

    // 15. Tạo EmailQueue
    await Promise.all([
      prisma.emailQueue.create({
        data: {
          email_id: uuidv4(),
          to_email: employees[0].email,
          subject: 'Thông báo yêu cầu nghỉ phép',
          body: 'Yêu cầu nghỉ phép của bạn đã được gửi đến phòng nhân sự.',
          status: EmailStatus.PENDING,
          send_at: new Date('2025-07-11T10:30:00'),
        },
      }),
      prisma.emailQueue.create({
        data: {
          email_id: uuidv4(),
          to_email: employees[2].email,
          subject: 'Thông báo yêu cầu nghỉ phép',
          body: 'Yêu cầu nghỉ phép của bạn đã được gửi đến phòng nhân sự.',
          status: EmailStatus.PENDING,
          send_at: new Date('2025-07-11T10:30:00'),
        },
      }),
    ]);

    // 16. Tạo LoginLogs
    await prisma.loginLogs.createMany({
      data: [
        {
          log_id: uuidv4(),
          user_id: users[0].user_id,
          username: users[0].username,
          activity: 'Đăng nhập',
          status: 'Thành công',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          created_at: new Date('2025-07-10T08:30:00Z'),
        },
        {
          log_id: uuidv4(),
          user_id: users[0].user_id,
          username: users[0].username,
          activity: 'Đăng xuất',
          status: 'Thành công',
          ip_address: '192.168.1.1',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
          created_at: new Date('2025-07-10T17:15:00Z'),
        },
        {
          log_id: uuidv4(),
          user_id: users[1].user_id,
          username: users[1].username,
          activity: 'Đăng nhập',
          status: 'Thất bại',
          ip_address: '192.168.1.2',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/16.0',
          created_at: new Date('2025-07-10T09:00:00Z'),
        },
      ],
    });

    console.log('Seeding completed with fixed role IDs, shifts, attendance records, and reward penalties!');
  } catch (error: unknown) {
    console.error('Seeding error:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seeding failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });