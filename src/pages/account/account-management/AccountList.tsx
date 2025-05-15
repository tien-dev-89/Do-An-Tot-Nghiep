import React, { useState } from "react";
import Image from "next/image";
import {
  Filter,
  Trash,
  ArrowUpDown,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

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

interface AccountListProps {
  users: User[];
}

const AccountList: React.FC<AccountListProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "Admin" | "HR" | "Manager" | "Employee"
  >("all");

  // Lọc danh sách tài khoản
  const filteredUsers = users.filter((user) => {
    const searchMatch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employee.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.employee.email.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);

    const roleMatch =
      roleFilter === "all" ||
      user.roles.some((role) => role.name === roleFilter);

    return searchMatch && statusMatch && roleMatch;
  });

  return (
    <>
      {/* Search and filter bar */}
      <div className="p-4 border-b border-base-300 flex flex-wrap gap-4 items-center">
        <div className="join flex-1">
          <label className="input">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              required
              type="text"
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
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
                className={statusFilter === "inactive" ? "active" : ""}
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
          </ul>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setRoleFilter("all");
          }}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Đặt lại
        </button>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto w-full">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="w-12">
                <label>
                  <input type="checkbox" className="checkbox checkbox-sm" />
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
                    <input type="checkbox" className="checkbox checkbox-sm" />
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
                            width={40}
                            height={40}
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
                      <div className="font-bold">{user.employee.full_name}</div>
                      <div className="text-sm opacity-70">{user.username}</div>
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
                <td className="p-0">
                  <div className="flex items-center gap-1">
                    {user.is_active ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-success" />
                        <span className="badge badge-success badge-sm">
                          Hoạt động
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-error" />
                        <span className="badge badge-error badge-sm">Khóa</span>
                      </>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link href={"/account/account-management/detail-account"}>
                      <button
                        className="btn btn-ghost btn-xs"
                        title="Quản lý quyền"
                      >
                        <UserCog className="w-4 h-4" />
                      </button>
                    </Link>
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

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 border-t border-base-300">
        <div className="text-sm">
          Hiển thị <span className="font-medium">1-{filteredUsers.length}</span>{" "}
          trong tổng số{" "}
          <span className="font-medium">{filteredUsers.length}</span> mục
        </div>
        <div className="join">
          <button className="join-item btn btn-sm">«</button>
          <button className="join-item btn btn-sm btn-active">1</button>
          <button className="join-item btn btn-sm">»</button>
        </div>
      </div>
    </>
  );
};

export default AccountList;
