import {
  CirclePlus,
  CircleUser,
  Search,
  Filter,
  Eye,
  Trash,
  UserCheck,
  Clock,
  ArrowUpDown,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";

// Dựa trên cấu trúc database đã cung cấp
interface User {
  user_id: string;
  employee_id: string;
  username: string;
  password_hash: string;
  is_active: boolean;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  employee: {
    employee_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url: string | null;
    department: {
      department_id: string;
      name: string;
    };
    position: {
      position_id: string;
      name: string;
    };
    employment_status: "Đang làm" | "Thử việc" | "Nghỉ việc" | "Nghỉ thai sản";
  };
  roles: {
    role_id: string;
    name: "Admin" | "HR" | "Manager" | "Employee";
  }[];
}

// Cấu trúc dữ liệu cho nhật ký đăng nhập (đã đơn giản hóa)
interface LoginLog {
  log_id: string;
  user_id: string;
  username: string;
  login_time: string;
  status: "success" | "failed";
  failure_reason?: string;
}

export default function AccountManagement() {
  // Mặc định hiển thị tab Danh sách tài khoản trước
  const [activeTab, setActiveTab] = useState<"account-list" | "login-log">(
    "account-list"
  );

  // Sample data for demonstration
  const users: User[] = [
    {
      user_id: "1",
      employee_id: "EMP001",
      username: "nguyen.van.a",
      password_hash: "123456789012345",
      is_active: true,
      last_login_at: "2025-05-10T08:30:00",
      created_at: "2024-01-15T08:30:00",
      updated_at: "2025-05-10T08:30:00",
      employee: {
        employee_id: "EMP001",
        full_name: "Nguyễn Văn A",
        email: "nguyen.van.a@company.com",
        phone_number: "0901234567",
        avatar_url: null,
        department: {
          department_id: "DEP001",
          name: "Kỹ thuật",
        },
        position: {
          position_id: "POS001",
          name: "Trưởng phòng",
        },
        employment_status: "Đang làm",
      },
      roles: [
        { role_id: "R001", name: "Admin" },
        { role_id: "R003", name: "Manager" },
      ],
    },
    {
      user_id: "2",
      employee_id: "EMP002",
      username: "tran.thi.b",
      password_hash: "987654321098765",
      is_active: true,
      last_login_at: "2025-05-11T09:15:00",
      created_at: "2024-02-20T10:15:00",
      updated_at: "2025-05-11T09:15:00",
      employee: {
        employee_id: "EMP002",
        full_name: "Trần Thị B",
        email: "tran.thi.b@company.com",
        phone_number: "0912345678",
        avatar_url: null,
        department: {
          department_id: "DEP002",
          name: "Nhân sự",
        },
        position: {
          position_id: "POS002",
          name: "Nhân viên",
        },
        employment_status: "Đang làm",
      },
      roles: [{ role_id: "R002", name: "HR" }],
    },
    {
      user_id: "3",
      employee_id: "EMP003",
      username: "le.van.c",
      password_hash: "112233445566778",
      is_active: false,
      last_login_at: "2025-05-01T10:45:00",
      created_at: "2024-03-10T08:00:00",
      updated_at: "2025-05-01T10:45:00",
      employee: {
        employee_id: "EMP003",
        full_name: "Lê Văn C",
        email: "le.van.c@company.com",
        phone_number: "0923456789",
        avatar_url: null,
        department: {
          department_id: "DEP003",
          name: "Kế toán",
        },
        position: {
          position_id: "POS003",
          name: "Kế toán trưởng",
        },
        employment_status: "Nghỉ việc",
      },
      roles: [{ role_id: "R004", name: "Employee" }],
    },
    {
      user_id: "4",
      employee_id: "EMP004",
      username: "pham.thi.d",
      password_hash: "998877665544332",
      is_active: true,
      last_login_at: "2025-05-10T14:20:00",
      created_at: "2024-04-05T09:30:00",
      updated_at: "2025-05-10T14:20:00",
      employee: {
        employee_id: "EMP004",
        full_name: "Phạm Thị D",
        email: "pham.thi.d@company.com",
        phone_number: "0934567890",
        avatar_url: null,
        department: {
          department_id: "DEP004",
          name: "Marketing",
        },
        position: {
          position_id: "POS002",
          name: "Nhân viên",
        },
        employment_status: "Thử việc",
      },
      roles: [{ role_id: "R004", name: "Employee" }],
    },
  ];

  // Dữ liệu nhật ký đăng nhập đã đơn giản hóa (bỏ IP và thiết bị)
  const loginLogs: LoginLog[] = [
    {
      log_id: "l1",
      user_id: "1",
      username: "nguyen.van.a",
      login_time: "2025-05-11T08:30:00",
      status: "success",
    },
    {
      log_id: "l2",
      user_id: "2",
      username: "tran.thi.b",
      login_time: "2025-05-11T09:15:00",
      status: "success",
    },
    {
      log_id: "l3",
      user_id: "3",
      username: "le.van.c",
      login_time: "2025-05-10T10:45:00",
      status: "failed",
      failure_reason: "Mật khẩu không chính xác",
    },
    {
      log_id: "l4",
      user_id: "4",
      username: "pham.thi.d",
      login_time: "2025-05-10T14:20:00",
      status: "success",
    },
    {
      log_id: "l5",
      user_id: "1",
      username: "nguyen.van.a",
      login_time: "2025-05-10T07:30:00",
      status: "success",
    },
    {
      log_id: "l6",
      user_id: "3",
      username: "le.van.c",
      login_time: "2025-05-10T10:30:00",
      status: "failed",
      failure_reason: "Tài khoản đã bị khóa",
    },
  ];

  // Format date and time
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Các state cho phần lọc và tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "Admin" | "HR" | "Manager" | "Employee"
  >("all");
  const [loginStatusFilter, setLoginStatusFilter] = useState<
    "all" | "success" | "failed"
  >("all");
  const [timeFilter, setTimeFilter] = useState<
    "all" | "today" | "7days" | "30days"
  >("all");

  // Lọc danh sách tài khoản
  const filteredUsers = users.filter((user) => {
    // Tìm kiếm
    const searchMatch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Lọc trạng thái
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    // Lọc vai trò
    const roleMatch =
      roleFilter === "all" ||
      user.roles.some((role) => role.name === roleFilter);

    return searchMatch && statusMatch && roleMatch;
  });

  // Lọc nhật ký đăng nhập
  const filteredLoginLogs = loginLogs.filter((log) => {
    // Tìm kiếm
    const searchMatch = log.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Lọc trạng thái
    const statusMatch =
      loginStatusFilter === "all" ||
      (loginStatusFilter === "success" && log.status === "success") ||
      (loginStatusFilter === "failed" && log.status === "failed");

    // Lọc thời gian
    const now = new Date();
    const logDate = new Date(log.login_time);
    const daysDiff = Math.floor(
      (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const timeMatch =
      timeFilter === "all" ||
      (timeFilter === "today" && daysDiff < 1) ||
      (timeFilter === "7days" && daysDiff < 7) ||
      (timeFilter === "30days" && daysDiff < 30);

    return searchMatch && statusMatch && timeMatch;
  });

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/account/account-management"}>Tài Khoản</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md">
          <div className="max-w-7xl mx-auto py-6 px-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary">
                Quản lý Tài Khoản
              </h1>
              <button className="btn btn-primary btn-md flex items-center gap-2">
                <CirclePlus className="w-5 h-5" />
                Thêm tài khoản
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          {/* Tabs */}
          <div className="tabs tabs-lifted mb-6">
            {/* Danh sách tài khoản */}
            <button
              className={`tab ${
                activeTab === "account-list" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("account-list")}
            >
              <CircleUser className="w-4 h-4 mr-2" />
              Danh sách tài khoản
            </button>

            {/* Nhật ký đăng nhập */}
            <button
              className={`tab ${activeTab === "login-log" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("login-log")}
            >
              <Clock className="w-4 h-4 mr-2" />
              Nhật ký đăng nhập
            </button>
          </div>

          {/* Tab content */}
          <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm">
            {/* Search and filter bar */}
            <div className="p-4 border-b border-base-300 flex flex-wrap gap-4 items-center">
              <div className="join flex-1">
                <div className="join-item flex items-center bg-base-200 px-3 rounded-l-md">
                  <Search className="w-4 h-4 text-base-content/70" />
                </div>
                <input
                  type="text"
                  placeholder={
                    activeTab === "account-list"
                      ? "Tìm kiếm theo tên, email, username..."
                      : "Tìm kiếm theo tên đăng nhập..."
                  }
                  className="input join-item input-bordered w-full max-w-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline gap-1">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52 mt-1"
                >
                  {activeTab === "account-list" ? (
                    <>
                      <li className="menu-title">Trạng thái</li>
                      <li>
                        <a
                          onClick={() => setStatusFilter("all")}
                          className={statusFilter === "all" ? "active" : ""}
                        >
                          Tất cả
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setStatusFilter("active")}
                          className={statusFilter === "active" ? "active" : ""}
                        >
                          Đang hoạt động
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setStatusFilter("inactive")}
                          className={
                            statusFilter === "inactive" ? "active" : ""
                          }
                        >
                          Bị khóa
                        </a>
                      </li>
                      <li className="menu-title pt-2">Vai trò</li>
                      <li>
                        <a
                          onClick={() => setRoleFilter("all")}
                          className={roleFilter === "all" ? "active" : ""}
                        >
                          Tất cả
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setRoleFilter("Admin")}
                          className={roleFilter === "Admin" ? "active" : ""}
                        >
                          Admin
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setRoleFilter("HR")}
                          className={roleFilter === "HR" ? "active" : ""}
                        >
                          HR
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setRoleFilter("Manager")}
                          className={roleFilter === "Manager" ? "active" : ""}
                        >
                          Manager
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setRoleFilter("Employee")}
                          className={roleFilter === "Employee" ? "active" : ""}
                        >
                          Employee
                        </a>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="menu-title">Trạng thái</li>
                      <li>
                        <a
                          onClick={() => setLoginStatusFilter("all")}
                          className={
                            loginStatusFilter === "all" ? "active" : ""
                          }
                        >
                          Tất cả
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setLoginStatusFilter("success")}
                          className={
                            loginStatusFilter === "success" ? "active" : ""
                          }
                        >
                          Thành công
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setLoginStatusFilter("failed")}
                          className={
                            loginStatusFilter === "failed" ? "active" : ""
                          }
                        >
                          Thất bại
                        </a>
                      </li>
                      <li className="menu-title pt-2">Thời gian</li>
                      <li>
                        <a
                          onClick={() => setTimeFilter("today")}
                          className={timeFilter === "today" ? "active" : ""}
                        >
                          Hôm nay
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setTimeFilter("7days")}
                          className={timeFilter === "7days" ? "active" : ""}
                        >
                          7 ngày qua
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setTimeFilter("30days")}
                          className={timeFilter === "30days" ? "active" : ""}
                        >
                          30 ngày qua
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setTimeFilter("all")}
                          className={timeFilter === "all" ? "active" : ""}
                        >
                          Tất cả
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setSearchTerm("");
                  if (activeTab === "account-list") {
                    setStatusFilter("all");
                    setRoleFilter("all");
                  } else {
                    setLoginStatusFilter("all");
                    setTimeFilter("all");
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Đặt lại
              </button>
            </div>

            {/* Table content based on active tab */}
            {activeTab === "account-list" ? (
              <div className="overflow-x-auto w-full">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th className="w-12">
                        <label>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                          />
                        </label>
                      </th>
                      <th className="cursor-pointer">
                        <div className="flex items-center gap-1">
                          Tên người dùng
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="cursor-pointer">
                        <div className="flex items-center gap-1">
                          Email
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th>Mật khẩu</th>
                      <th>Phòng ban</th>
                      <th>Chức vụ</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th className="w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.user_id}>
                        <td>
                          <label>
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm"
                            />
                          </label>
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar">
                              <div className="mask mask-squircle w-10 h-10 bg-base-300 flex items-center justify-center">
                                {user.employee.avatar_url ? (
                                  <Image
                                    src={user.employee.avatar_url}
                                    alt={user.employee.full_name}
                                    width={40} // Adjust width as needed
                                    height={40} // Adjust height as needed
                                    className="rounded-full"
                                  />
                                ) : (
                                  <span className="text-lg font-semibold">
                                    {user.employee.full_name.charAt(0)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">
                                {user.employee.full_name}
                              </div>
                              <div className="text-sm opacity-70">
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{user.employee.email}</td>
                        <td>
                          <span className="font-mono text-xs bg-base-200 px-2 py-1 rounded">
                            {user.password_hash}
                          </span>
                        </td>
                        <td>{user.employee.department.name}</td>
                        <td>{user.employee.position.name}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, idx) => (
                              <span
                                key={idx}
                                className={`badge ${
                                  role.name === "Admin"
                                    ? "badge-primary"
                                    : role.name === "HR"
                                    ? "badge-secondary"
                                    : role.name === "Manager"
                                    ? "badge-accent"
                                    : "badge-ghost"
                                } badge-sm`}
                              >
                                {role.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {user.is_active ? (
                              <>
                                <span className="badge badge-success badge-sm">
                                  Hoạt động
                                </span>
                                <ShieldCheck className="w-4 h-4 text-success" />
                              </>
                            ) : (
                              <>
                                <span className="badge badge-error badge-sm">
                                  Khóa
                                </span>
                                <ShieldAlert className="w-4 h-4 text-error" />
                              </>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-ghost btn-xs"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              title="Quản lý quyền"
                            >
                              <UserCog className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              title="Khóa/Mở khóa"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Xóa tài khoản"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th className="cursor-pointer">
                        <div className="flex items-center gap-1">
                          Tên đăng nhập
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="cursor-pointer">
                        <div className="flex items-center gap-1">
                          Thời gian
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="cursor-pointer">
                        <div className="flex items-center gap-1">
                          Lần đăng nhập gần nhất
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th>Trạng thái</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLoginLogs.map((log) => (
                      <tr key={log.log_id}>
                        <td>
                          <div className="font-medium">{log.username}</div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {formatDateTime(log.login_time)}
                            </span>
                          </div>
                        </td>
                        <td>
                          {/* Tìm và hiển thị thời gian đăng nhập gần nhất của user này */}
                          {formatDateTime(
                            users.find((u) => u.user_id === log.user_id)
                              ?.last_login_at || log.login_time
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            {log.status === "success" ? (
                              <span className="badge badge-success">
                                Thành công
                              </span>
                            ) : (
                              <span className="badge badge-error">
                                Thất bại
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {log.status === "failed" && log.failure_reason && (
                            <span className="text-sm text-error">
                              {log.failure_reason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center p-4 border-t border-base-300">
              <div className="text-sm">
                Hiển thị{" "}
                <span className="font-medium">
                  1-
                  {activeTab === "account-list"
                    ? filteredUsers.length
                    : filteredLoginLogs.length}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">
                  {activeTab === "account-list"
                    ? filteredUsers.length
                    : filteredLoginLogs.length}
                </span>{" "}
                mục
              </div>
              <div className="join">
                <button className="join-item btn btn-sm">«</button>
                <button className="join-item btn btn-sm btn-active">1</button>
                <button className="join-item btn btn-sm">»</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
