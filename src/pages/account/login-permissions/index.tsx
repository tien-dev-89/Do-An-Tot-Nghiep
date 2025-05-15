import Link from "next/link";
import React, { useState } from "react";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronDown,
  Eye,
  UserPlus,
  ShieldCheck,
  Users,
  UserCheck,
  ShieldUser,
} from "lucide-react";
import UserModals from "@/components/modals/LoginPermissionsModal";
import { User, Role } from "@/components/modals/LoginPermissionsModal";

export default function LoginPermissions() {
  // Dữ liệu mẫu cho Users
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "nguyenvan.a",
      fullName: "Nguyễn Văn A",
      email: "nguyenvan.a@company.com",
      department: "Nhân sự",
      position: "Trưởng phòng",
      roles: ["Admin", "HR"],
      isActive: true,
      lastLogin: "2025-05-10 08:30:22",
    },
    {
      id: "2",
      username: "tranthib",
      fullName: "Trần Thị B",
      email: "tranthib@company.com",
      department: "Kế toán",
      position: "Nhân viên",
      roles: ["Employee"],
      isActive: true,
      lastLogin: "2025-05-11 09:15:47",
    },
    {
      id: "3",
      username: "lequangc",
      fullName: "Lê Quang C",
      email: "lequangc@company.com",
      department: "IT",
      position: "Manager",
      roles: ["Manager", "Employee"],
      isActive: false,
      lastLogin: "2025-05-09 14:22:35",
    },
    {
      id: "4",
      username: "phamthid",
      fullName: "Phạm Thị D",
      email: "phamthid@company.com",
      department: "Kinh doanh",
      position: "Nhân viên",
      roles: ["Employee"],
      isActive: true,
      lastLogin: "2025-05-11 10:45:18",
    },
    {
      id: "5",
      username: "hoanganhe",
      fullName: "Hoàng Anh E",
      email: "hoanganhe@company.com",
      department: "Marketing",
      position: "Trưởng nhóm",
      roles: ["Manager"],
      isActive: true,
      lastLogin: "2025-05-10 16:08:51",
    },
  ]);

  // Dữ liệu mẫu cho Roles
  const roles: Role[] = [
    { id: "1", name: "Admin", description: "Quyền quản trị cao nhất" },
    { id: "2", name: "HR", description: "Quản lý nhân sự" },
    { id: "3", name: "Manager", description: "Quản lý phòng ban" },
    { id: "4", name: "Employee", description: "Nhân viên thông thường" },
  ];

  // State cho form thêm/sửa user
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Thêm các state mới vào component chính (LoginPermissions.tsx)
  const [isViewRoleUsersModalOpen, setIsViewRoleUsersModalOpen] =
    useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Lọc users theo tìm kiếm và trạng thái - Quản Lý Quyền Truy Cập
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "active") return matchesSearch && user.isActive;
    if (filterStatus === "inactive") return matchesSearch && !user.isActive;

    return matchesSearch;
  });

  // Hàm xử lý hiển thị chi tiết user
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  // Hàm xử lý chỉnh sửa user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // Hàm xử lý xóa user
  const handleDeleteUser = (userId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  // Hàm xử lý thay đổi trạng thái active
  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          return { ...user, isActive: !user.isActive };
        }
        return user;
      })
    );
  };

  // Hàm xử lý khi nhấn nút "Xem người dùng"
  const handleViewRoleUsers = (role: Role) => {
    setSelectedRole(role);
    setIsViewRoleUsersModalOpen(true);
  };

  // Hàm xử lý khi nhấn nút "Sửa" vai trò
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditRoleModalOpen(true);
  };

  // Lọc người dùng theo vai trò
  const getUsersInRole = (roleName: string) => {
    return users.filter((user) => user.roles.includes(roleName));
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="breadcrumbs text-sm px-6 py-2 bg-base-100">
        <ul>
          <li>
            <Link href={"/"} className="text-primary">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href={"/account/login-permissions"} className="text-primary">
              Phân quyền đăng nhập
            </Link>
          </li>
        </ul>
      </div>

      {/* Header */}
      <header className="bg-base-100 shadow-md rounded-md">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" />
            Phân quyền đăng nhập
          </h1>
          <div className="flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddRoleModalOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Thêm quyền mới
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="tabs tabs-lift">
          {/* Quản Lý Quyền Truy Cập */}
          <input
            type="radio"
            name="my_tabs_3"
            className="tab"
            aria-label="Quản Lý Quyền Truy Cập"
            defaultChecked
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShieldUser className="h-5 w-5" />
              Quản Lý Quyền Truy Cập
            </h2>
            <div className="p-4">
              {/* Filters and search */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex gap-2">
                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-outline btn-sm">
                      <Filter className="h-4 w-4" />
                      Trạng thái
                      <ChevronDown className="h-4 w-4" />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <button onClick={() => setFilterStatus("all")}>
                          Tất cả
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setFilterStatus("active")}>
                          Đang hoạt động
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setFilterStatus("inactive")}>
                          Không hoạt động
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-outline btn-sm">
                      <Filter className="h-4 w-4" />
                      Phòng ban
                      <ChevronDown className="h-4 w-4" />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <button>Tất cả</button>
                      </li>
                      <li>
                        <button>Nhân sự</button>
                      </li>
                      <li>
                        <button>Kế toán</button>
                      </li>
                      <li>
                        <button>IT</button>
                      </li>
                      <li>
                        <button>Kinh doanh</button>
                      </li>
                      <li>
                        <button>Marketing</button>
                      </li>
                    </ul>
                  </div>
                  <div className="dropdown">
                    <label tabIndex={0} className="btn btn-outline btn-sm">
                      <Filter className="h-4 w-4" />
                      Quyền
                      <ChevronDown className="h-4 w-4" />
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <button>Tất cả</button>
                      </li>
                      <li>
                        <button>Admin</button>
                      </li>
                      <li>
                        <button>HR</button>
                      </li>
                      <li>
                        <button>Manager</button>
                      </li>
                      <li>
                        <button>Employee</button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="join">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        className="input input-bordered input-sm w-full md:w-80 pl-10 join-item"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* User list */}
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Tên đăng nhập</th>
                      <th>Phòng ban</th>
                      <th>Chức vụ</th>
                      <th>Quyền hạn</th>
                      <th>Trạng thái</th>
                      <th>Đăng nhập gần nhất</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullName}</td>
                        <td>{user.username}</td>
                        <td>{user.department}</td>
                        <td>{user.position}</td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, index) => (
                              <span
                                key={index}
                                className={`badge ${
                                  role === "Admin"
                                    ? "badge-primary"
                                    : role === "HR"
                                    ? "badge-secondary"
                                    : role === "Manager"
                                    ? "badge-accent"
                                    : "badge-outline"
                                }`}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="form-control">
                            <label className="cursor-pointer label justify-start gap-2 p-0">
                              <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm"
                                checked={user.isActive}
                                onChange={() => toggleUserStatus(user.id)}
                              />
                              <span className="label-text">
                                {user.isActive ? "Hoạt động" : "Khóa"}
                              </span>
                            </label>
                          </div>
                        </td>
                        <td>{user.lastLogin}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleViewDetails(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Hiển thị 1-5 trên tổng số 5 bản ghi
                </div>
                <div className="join">
                  <button className="join-item btn btn-sm">«</button>
                  <button className="join-item btn btn-sm btn-active">1</button>
                  <button className="join-item btn btn-sm">2</button>
                  <button className="join-item btn btn-sm">3</button>
                  <button className="join-item btn btn-sm">»</button>
                </div>
              </div>
            </div>
          </div>

          {/* Quản Lý Vai Trò */}
          <input
            type="radio"
            name="my_tabs_3"
            className="tab"
            aria-label="Quản lý vai trò"
          />
          <div className="tab-content bg-base-100 border-base-300 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Quản lý vai trò
            </h2>
            <div className="p-4 pt-8">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Tên vai trò</th>
                      <th>Mô tả</th>
                      <th>Số người dùng</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id}>
                        <td>
                          <div className="font-medium">{role.name}</div>
                        </td>
                        <td>{role.description}</td>
                        <td>
                          {
                            users.filter((user) =>
                              user.roles.includes(role.name)
                            ).length
                          }
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleViewRoleUsers(role)}
                            >
                              <Users className="h-4 w-4" />
                              <span className="hidden sm:inline">
                                Xem người dùng
                              </span>
                            </button>

                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="hidden sm:inline">Sửa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* User Modals - Quản Lý Quyền Truy Cập - Quản Lý Vai Trò */}
      <UserModals
        selectedUser={selectedUser}
        roles={roles}
        isDetailModalOpen={isDetailModalOpen}
        setIsDetailModalOpen={setIsDetailModalOpen}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isAddRoleModalOpen={isAddRoleModalOpen}
        setIsAddRoleModalOpen={setIsAddRoleModalOpen}
        isViewRoleUsersModalOpen={isViewRoleUsersModalOpen}
        setIsViewRoleUsersModalOpen={setIsViewRoleUsersModalOpen}
        isEditRoleModalOpen={isEditRoleModalOpen}
        setIsEditRoleModalOpen={setIsEditRoleModalOpen}
        selectedRole={selectedRole}
        usersInRole={selectedRole ? getUsersInRole(selectedRole.name) : []}
        handleEditUser={handleEditUser}
      />
    </div>
  );
}
