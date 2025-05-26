"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var uuid_1 = require("uuid");
var bcrypt_1 = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var roles, departments, positions, employees, users, _a, _b, _c, _d, _e, _f, _g;
        var _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0: 
                // Xóa dữ liệu cũ (cẩn thận khi dùng trên production)
                return [4 /*yield*/, prisma.userRoles.deleteMany()];
                case 1:
                    // Xóa dữ liệu cũ (cẩn thận khi dùng trên production)
                    _m.sent();
                    return [4 /*yield*/, prisma.users.deleteMany()];
                case 2:
                    _m.sent();
                    return [4 /*yield*/, prisma.emailQueue.deleteMany()];
                case 3:
                    _m.sent();
                    return [4 /*yield*/, prisma.notifications.deleteMany()];
                case 4:
                    _m.sent();
                    return [4 /*yield*/, prisma.payrolls.deleteMany()];
                case 5:
                    _m.sent();
                    return [4 /*yield*/, prisma.leaveRequests.deleteMany()];
                case 6:
                    _m.sent();
                    return [4 /*yield*/, prisma.attendanceRecords.deleteMany()];
                case 7:
                    _m.sent();
                    return [4 /*yield*/, prisma.employees.deleteMany()];
                case 8:
                    _m.sent();
                    return [4 /*yield*/, prisma.positions.deleteMany()];
                case 9:
                    _m.sent();
                    return [4 /*yield*/, prisma.departments.deleteMany()];
                case 10:
                    _m.sent();
                    return [4 /*yield*/, prisma.roles.deleteMany()];
                case 11:
                    _m.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.roles.create({
                                data: {
                                    role_id: (0, uuid_1.v4)(),
                                    name: client_1.RoleName.ADMIN,
                                    description: 'Quản trị viên hệ thống',
                                },
                            }),
                            prisma.roles.create({
                                data: {
                                    role_id: (0, uuid_1.v4)(),
                                    name: client_1.RoleName.HR,
                                    description: 'Nhân sự',
                                },
                            }),
                            prisma.roles.create({
                                data: {
                                    role_id: (0, uuid_1.v4)(),
                                    name: client_1.RoleName.MANAGER,
                                    description: 'Quản lý',
                                },
                            }),
                            prisma.roles.create({
                                data: {
                                    role_id: (0, uuid_1.v4)(),
                                    name: client_1.RoleName.EMPLOYEE,
                                    description: 'Nhân viên',
                                },
                            }),
                        ])];
                case 12:
                    roles = _m.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.departments.create({
                                data: {
                                    department_id: (0, uuid_1.v4)(),
                                    name: 'Phòng Công nghệ Thông tin',
                                    description: 'Quản lý và phát triển hệ thống CNTT',
                                },
                            }),
                            prisma.departments.create({
                                data: {
                                    department_id: (0, uuid_1.v4)(),
                                    name: 'Phòng Nhân sự',
                                    description: 'Quản lý tuyển dụng và hồ sơ nhân viên',
                                },
                            }),
                        ])];
                case 13:
                    departments = _m.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.positions.create({
                                data: {
                                    position_id: (0, uuid_1.v4)(),
                                    name: 'Lập trình viên',
                                    description: 'Phát triển phần mềm và hệ thống',
                                },
                            }),
                            prisma.positions.create({
                                data: {
                                    position_id: (0, uuid_1.v4)(),
                                    name: 'Chuyên viên nhân sự',
                                    description: 'Quản lý hồ sơ và phúc lợi nhân viên',
                                },
                            }),
                        ])];
                case 14:
                    positions = _m.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.employees.create({
                                data: {
                                    employee_id: (0, uuid_1.v4)(),
                                    full_name: 'Nguyễn Văn Anh',
                                    email: 'nguyenvananh@company.com',
                                    phone_number: '0912345678',
                                    birth_date: new Date('1990-05-15'),
                                    gender: client_1.Gender.MALE,
                                    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
                                    department_id: departments[0].department_id,
                                    position_id: positions[0].position_id,
                                    employment_status: client_1.EmploymentStatus.ACTIVE,
                                    join_date: new Date('2023-01-10'),
                                },
                            }),
                            prisma.employees.create({
                                data: {
                                    employee_id: (0, uuid_1.v4)(),
                                    full_name: 'Trần Thị Bình',
                                    email: 'tranthibinh@company.com',
                                    phone_number: '0987654321',
                                    birth_date: new Date('1992-08-20'),
                                    gender: client_1.Gender.FEMALE,
                                    address: '456 Đường Nguyễn Huệ, Quận 3, TP.HCM',
                                    department_id: departments[1].department_id,
                                    position_id: positions[1].position_id,
                                    employment_status: client_1.EmploymentStatus.ACTIVE,
                                    join_date: new Date('2023-06-01'),
                                },
                            }),
                        ])];
                case 15:
                    employees = _m.sent();
                    // Cập nhật manager cho Department
                    return [4 /*yield*/, prisma.departments.update({
                            where: { department_id: departments[0].department_id },
                            data: { manager_id: employees[0].employee_id },
                        })];
                case 16:
                    // Cập nhật manager cho Department
                    _m.sent();
                    _b = (_a = Promise).all;
                    _d = (_c = prisma.users).create;
                    _h = {};
                    _j = {
                        user_id: (0, uuid_1.v4)(),
                        employee_id: employees[0].employee_id,
                        username: 'nguyenvananh'
                    };
                    return [4 /*yield*/, bcrypt_1.default.hash('Anh123456', 10)];
                case 17:
                    _e = [
                        _d.apply(_c, [(_h.data = (_j.password_hash = _m.sent(),
                                _j.is_active = true,
                                _j),
                                _h)])
                    ];
                    _g = (_f = prisma.users).create;
                    _k = {};
                    _l = {
                        user_id: (0, uuid_1.v4)(),
                        employee_id: employees[1].employee_id,
                        username: 'tranthibinh'
                    };
                    return [4 /*yield*/, bcrypt_1.default.hash('Binh123456', 10)];
                case 18: return [4 /*yield*/, _b.apply(_a, [_e.concat([
                            _g.apply(_f, [(_k.data = (_l.password_hash = _m.sent(),
                                    _l.is_active = true,
                                    _l),
                                    _k)])
                        ])])];
                case 19:
                    users = _m.sent();
                    // 6. Tạo UserRoles
                    return [4 /*yield*/, Promise.all([
                            prisma.userRoles.create({
                                data: {
                                    user_role_id: (0, uuid_1.v4)(),
                                    user_id: users[0].user_id,
                                    role_id: roles.find(function (r) { return r.name === client_1.RoleName.ADMIN; }).role_id,
                                },
                            }),
                            prisma.userRoles.create({
                                data: {
                                    user_role_id: (0, uuid_1.v4)(),
                                    user_id: users[1].user_id,
                                    role_id: roles.find(function (r) { return r.name === client_1.RoleName.HR; }).role_id,
                                },
                            }),
                        ])];
                case 20:
                    // 6. Tạo UserRoles
                    _m.sent();
                    // 7. Tạo AttendanceRecords
                    return [4 /*yield*/, prisma.attendanceRecords.create({
                            data: {
                                attendance_id: (0, uuid_1.v4)(),
                                employee_id: employees[0].employee_id,
                                date: new Date('2025-05-18'),
                                clock_in_time: new Date('2025-05-18T08:00:00'),
                                clock_out_time: new Date('2025-05-18T17:30:00'),
                                late_minutes: 0,
                                early_leave_minutes: 0,
                                overtime_hours: 1.5,
                            },
                        })];
                case 21:
                    // 7. Tạo AttendanceRecords
                    _m.sent();
                    // 8. Tạo LeaveRequests
                    return [4 /*yield*/, prisma.leaveRequests.create({
                            data: {
                                leave_request_id: (0, uuid_1.v4)(),
                                employee_id: employees[0].employee_id,
                                leave_type: client_1.LeaveType.ANNUAL,
                                start_date: new Date('2025-06-01'),
                                end_date: new Date('2025-06-03'),
                                reason: 'Nghỉ phép năm để đi du lịch',
                                status: client_1.LeaveStatus.PENDING,
                                approver_id: employees[1].employee_id,
                            },
                        })];
                case 22:
                    // 8. Tạo LeaveRequests
                    _m.sent();
                    // 9. Tạo Payrolls
                    return [4 /*yield*/, prisma.payrolls.create({
                            data: {
                                payroll_id: (0, uuid_1.v4)(),
                                employee_id: employees[0].employee_id,
                                month: '2025-05',
                                base_salary: 15000000,
                                overtime_bonus: 750000,
                                late_penalty: 0,
                                total_salary: 15750000,
                                status: client_1.PayrollStatus.UNPAID,
                            },
                        })];
                case 23:
                    // 9. Tạo Payrolls
                    _m.sent();
                    // 10. Tạo Notifications
                    return [4 /*yield*/, prisma.notifications.create({
                            data: {
                                notification_id: (0, uuid_1.v4)(),
                                employee_id: employees[0].employee_id,
                                title: 'Yêu cầu nghỉ phép',
                                message: 'Yêu cầu nghỉ phép từ 01/06/2025 đang chờ phê duyệt',
                                type: client_1.NotificationType.PERSONAL,
                                is_read: false,
                            },
                        })];
                case 24:
                    // 10. Tạo Notifications
                    _m.sent();
                    // 11. Tạo EmailQueue
                    return [4 /*yield*/, prisma.emailQueue.create({
                            data: {
                                email_id: (0, uuid_1.v4)(),
                                to_email: employees[0].email,
                                subject: 'Thông báo yêu cầu nghỉ phép',
                                body: 'Yêu cầu nghỉ phép của bạn đã được gửi đến phòng nhân sự.',
                                status: client_1.EmailStatus.PENDING,
                                send_at: new Date('2025-05-19T10:30:00'),
                            },
                        })];
                case 25:
                    // 11. Tạo EmailQueue
                    _m.sent();
                    console.log('Seeding completed with real data!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Seeding error:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
