import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema xác thực cho GET
const UserQuerySchema = z.object({
  id: z.string().uuid('ID người dùng không hợp lệ').optional(),
  available: z.enum(['true']).optional(),
  email: z.string().optional(),
});

// Schema xác thực cho POST
const UserCreateSchema = z.object({
  employeeId: z.string().uuid('ID nhân viên không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  roles: z.array(z.string().uuid('Vai trò không hợp lệ')).optional(),
});

// Schema xác thực cho PUT
const UserUpdateSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống').optional(),
  fullName: z.string().min(1, 'Họ và tên không được để trống').optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').optional(),
  departmentId: z.string().uuid('ID phòng ban không hợp lệ').optional(),
  positionId: z.string().uuid('ID chức vụ không hợp lệ').optional(),
  roles: z.array(z.string().uuid('Vai trò không hợp lệ')).optional(),
  is_active: z.boolean().optional(),
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<unknown>>) {
  try {
    switch (req.method) {
      case 'GET': {
        const parsedQuery = UserQuerySchema.safeParse(req.query);
        if (!parsedQuery.success) {
          return res.status(400).json({ success: false, error: parsedQuery.error.message });
        }

        const { id, available, email } = parsedQuery.data;

        if (id) {
          // Lấy thông tin chi tiết của một người dùng
          const user = await prisma.users.findUnique({
            where: { user_id: id },
            include: {
              employee: {
                include: {
                  department: true,
                  position: true,
                  user_roles: {
                    include: {
                      role: true,
                    },
                  },
                },
              },
            },
          });

          if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
          }

          const formattedUser = {
            user_id: user.user_id,
            employee_id: user.employee_id,
            username: user.username,
            password_hash: user.password_hash,
            is_active: user.is_active,
            last_login_at: user.last_login_at?.toISOString() || '',
            created_at: user.created_at.toISOString(),
            updated_at: user.updated_at.toISOString(),
            employee: {
              employee_id: user.employee.employee_id,
              full_name: user.employee.full_name,
              email: user.employee.email,
              phone_number: user.employee.phone_number || '',
              avatar_url: user.employee.avatar_url || '',
              birth_date: user.employee.birth_date?.toISOString() || null,
              gender: user.employee.gender,
              department: user.employee.department
                ? {
                    department_id: user.employee.department.department_id,
                    name: user.employee.department.name,
                  }
                : null,
              position: user.employee.position
                ? {
                    position_id: user.employee.position.position_id,
                    name: user.employee.position.name,
                  }
                : null,
              employment_status: user.employee.employment_status,
              user_roles: user.employee.user_roles.map((ur) => ({
                role: {
                  role_id: ur.role_id,
                  name: ur.role.name,
                },
              })),
            },
            roles: user.employee.user_roles.map((ur) => ({
              role_id: ur.role_id,
              name: ur.role.name,
            })),
          };

          return res.status(200).json({ success: true, data: [formattedUser] });
        }

        if (available === 'true') {
          // Lấy danh sách nhân viên chưa có tài khoản
          const employeesWithoutAccount = await prisma.employees.findMany({
            where: {
              user: null,
              ...(email && { email: { contains: email, mode: 'insensitive' } }),
            },
            select: {
              employee_id: true,
              full_name: true,
              email: true,
              birth_date: true,
              gender: true,
              avatar_url: true,
              department: { select: { department_id: true, name: true } },
              position: { select: { position_id: true, name: true } },
              user_roles: { include: { role: true } },
            },
          });
          return res.status(200).json({ success: true, data: employeesWithoutAccount });
        }

        // Lấy danh sách tất cả người dùng
        const users = await prisma.users.findMany({
          include: {
            employee: {
              include: {
                department: true,
                position: true,
                user_roles: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        });

        const formattedUsers = users.map((user) => ({
          user_id: user.user_id,
          employee_id: user.employee_id,
          username: user.username,
          password_hash: user.password_hash,
          is_active: user.is_active,
          last_login_at: user.last_login_at?.toISOString() || '',
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
          employee: {
            employee_id: user.employee.employee_id,
            full_name: user.employee.full_name,
            email: user.employee.email,
            phone_number: user.employee.phone_number || '',
            avatar_url: user.employee.avatar_url || '',
            birth_date: user.employee.birth_date?.toISOString() || null,
            gender: user.employee.gender,
            department: user.employee.department
              ? {
                  department_id: user.employee.department.department_id,
                  name: user.employee.department.name,
                }
              : null,
            position: user.employee.position
              ? {
                  position_id: user.employee.position.position_id,
                  name: user.employee.position.name,
                }
              : null,
            employment_status: user.employee.employment_status,
            user_roles: user.employee.user_roles.map((ur) => ({
              role: {
                role_id: ur.role_id,
                name: ur.role.name,
              },
            })),
          },
          roles: user.employee.user_roles.map((ur) => ({
            role_id: ur.role_id,
            name: ur.role.name,
          })),
        }));

        return res.status(200).json({ success: true, data: formattedUsers });
      }

      case 'POST': {
        const parsedCreate = UserCreateSchema.safeParse(req.body);
        if (!parsedCreate.success) {
          return res.status(400).json({ success: false, error: parsedCreate.error.message });
        }

        const { employeeId, password, roles } = parsedCreate.data;

        const employee = await prisma.employees.findUnique({
          where: { employee_id: employeeId },
          include: { user: true },
        });
        if (!employee) {
          return res.status(404).json({ success: false, error: 'Không tìm thấy nhân viên' });
        }
        if (employee.user) {
          return res.status(400).json({ success: false, error: 'Nhân viên đã có tài khoản' });
        }

        const username = employee.email.split('@')[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
          data: {
            user_id: crypto.randomUUID(),
            employee_id: employee.employee_id,
            username,
            email: employee.email,
            password_hash: hashedPassword,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        if (roles && roles.length > 0) {
          await prisma.userRoles.createMany({
            data: roles.map((roleId) => ({
              user_role_id: crypto.randomUUID(),
              employee_id: employee.employee_id,
              role_id: roleId,
              created_at: new Date(),
              updated_at: new Date(),
            })),
          });
        }

        return res.status(201).json({ success: true, data: user });
      }

      case 'PUT': {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ success: false, error: 'ID người dùng không hợp lệ' });
        }

        const parsedUpdate = UserUpdateSchema.safeParse(req.body);
        if (!parsedUpdate.success) {
          return res.status(400).json({ success: false, error: parsedUpdate.error.message });
        }

        const { username, fullName, email, password, departmentId, positionId, roles, is_active } = parsedUpdate.data;

        const user = await prisma.users.findUnique({
          where: { user_id: id },
          include: { employee: true },
        });
        if (!user) {
          console.error('Người dùng không tìm thấy cho ID:', id);
          return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        // Cập nhật thông tin nhân viên
        if (fullName || email || departmentId || positionId) {
          await prisma.employees.update({
            where: { employee_id: user.employee_id },
            data: {
              ...(fullName && { full_name: fullName }),
              ...(email && { email }),
              ...(departmentId && { department_id: departmentId }),
              ...(positionId && { position_id: positionId }),
              updated_at: new Date(),
            },
          });
        }

        // Cập nhật thông tin người dùng
        const updateData: {
          username?: string;
          email?: string;
          password_hash?: string;
          is_active?: boolean;
          updated_at: Date;
        } = {
          ...(username && { username }),
          ...(email && { email }),
          ...(is_active !== undefined && { is_active }),
          updated_at: new Date(),
        };

        if (password) {
          updateData.password_hash = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.users.update({
          where: { user_id: id },
          data: updateData,
        });

        // Cập nhật vai trò
        if (roles) {
          await prisma.userRoles.deleteMany({
            where: { employee_id: user.employee_id },
          });
          if (roles.length > 0) {
            await prisma.userRoles.createMany({
              data: roles.map((roleId) => ({
                user_role_id: crypto.randomUUID(),
                employee_id: user.employee_id,
                role_id: roleId,
                created_at: new Date(),
                updated_at: new Date(),
              })),
            });
          }
        }

        return res.status(200).json({ success: true, data: updatedUser });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
          return res.status(400).json({ success: false, error: 'ID người dùng không hợp lệ' });
        }

        const user = await prisma.users.findUnique({
          where: { user_id: id },
        });
        if (!user) {
          return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        await prisma.userRoles.deleteMany({
          where: { employee_id: user.employee_id },
        });

        await prisma.users.delete({
          where: { user_id: id },
        });

        return res.status(200).json({ success: true, data: { message: 'Xóa tài khoản thành công' } });
      }

      default:
        return res.status(405).json({ success: false, error: 'Phương thức không được hỗ trợ' });
    }
  } catch (error: unknown) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Lỗi server: Không xác định';
    return res.status(500).json({ success: false, error: errorMessage });
  } finally {
    await prisma.$disconnect();
  }
}