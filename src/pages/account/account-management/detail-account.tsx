import Link from "next/link";
import React, { useState } from "react";
import {
  User,
  Mail,
  Key,
  Building,
  Briefcase,
  Tag,
  Activity,
  UserCheck,
  Calendar,
  Clock,
  Edit2,
  Save,
  X,
} from "lucide-react";

export default function DetailAccount() {
  const [isEditing, setIsEditing] = useState(false);

  const [accountData, setAccountData] = useState({
    name: "Nguyễn Văn A",
    username: "nguyen.van.a",
    email: "nguyen.van.a@company.com",
    password: "123456789012345",
    department: "Kỹ thuật",
    position: "Trưởng phòng",
    roles: ["Admin", "Manager"],
    status: "Hoạt động",
    createdAt: "01/01/2024",
    lastLogin: "13/05/2025 08:30",
  });

  const [editedData, setEditedData] = useState({ ...accountData });

  const handleToggleEdit = () => {
    if (isEditing) {
      // Save changes
      setAccountData(editedData);
    }
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setEditedData({ ...accountData });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedData({
      ...editedData,
      [field]: value,
    });
  };

  const handleRoleToggle = (role: string) => {
    const currentRoles = [...editedData.roles];
    if (currentRoles.includes(role)) {
      setEditedData({
        ...editedData,
        roles: currentRoles.filter((r) => r !== role),
      });
    } else {
      setEditedData({
        ...editedData,
        roles: [...currentRoles, role],
      });
    }
  };

  const getRoleBadgeClass = (role: string, isSelected: boolean) => {
    if (!isSelected) return "badge badge-outline cursor-pointer";

    switch (role) {
      case "Admin":
        return "badge bg-blue-100 text-blue-800 border-blue-800 cursor-pointer";
      case "Manager":
        return "badge bg-green-100 text-green-800 border-green-800 cursor-pointer";
      case "HR":
        return "badge bg-pink-100 text-pink-800 border-pink-800 cursor-pointer";
      case "Employee":
        return "badge bg-gray-100 text-gray-800 border-gray-800 cursor-pointer";
      default:
        return "badge badge-primary cursor-pointer";
    }
  };

  return (
    <div className="bg-base-100 min-h-screen">
      {/* Breadcrumbs */}
      <div className="p-4 bg-base-100">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href={"/"}>Trang chủ</Link>
            </li>
            <li>
              <Link href={"/account/account-management"}>
                Quản lý Tài Khoản
              </Link>
            </li>
            <li>
              <span>Chi Tiết Tài Khoản</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Header */}
      <header className="bg-base-100 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">
            Chi Tiết Tài Khoản
          </h1>
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={handleToggleEdit}>
                  <Save size={18} />
                  Lưu thay đổi
                </button>
                <button
                  className="btn btn-outline btn-error"
                  onClick={handleCancelEdit}
                >
                  <X size={18} />
                  Hủy
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={handleToggleEdit}>
                <Edit2 size={18} />
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="card bg-white shadow-lg">
            <div className="card-body items-center text-center">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-24">
                  <span className="text-3xl">{accountData.name.charAt(0)}</span>
                </div>
              </div>
              <h2 className="card-title text-2xl mt-4">
                {isEditing ? editedData.name : accountData.name}
              </h2>
              <p className="text-gray-500">
                {isEditing ? editedData.username : accountData.username}
              </p>

              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {(isEditing ? editedData.roles : accountData.roles).map(
                  (role, index) => (
                    <span key={index} className={getRoleBadgeClass(role, true)}>
                      {role}
                    </span>
                  )
                )}
              </div>

              <div className="mt-4 w-full">
                <div className="badge badge-success badge-lg w-full">
                  {isEditing ? editedData.status : accountData.status}
                </div>
              </div>

              <div className="divider"></div>

              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Ngày tạo: {accountData.createdAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Đăng nhập cuối: {accountData.lastLogin}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2">
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">Thông tin tài khoản</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <User size={16} />
                        Họ và tên
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered"
                        value={editedData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    ) : (
                      <div className="input input-bordered flex items-center bg-gray-50">
                        {accountData.name}
                      </div>
                    )}
                  </div>

                  {/* Username */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <UserCheck size={16} />
                        Tên đăng nhập
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered"
                        value={editedData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                      />
                    ) : (
                      <div className="input input-bordered flex items-center bg-gray-50">
                        {accountData.username}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        className="input input-bordered"
                        value={editedData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    ) : (
                      <div className="input input-bordered flex items-center bg-gray-50">
                        {accountData.email}
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Key size={16} />
                        Mật khẩu
                      </span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered"
                        value={editedData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                      />
                    ) : (
                      <div className="input input-bordered flex items-center bg-gray-50">
                        {accountData.password}
                      </div>
                    )}
                  </div>

                  {/* Department */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Building size={16} />
                        Phòng ban
                      </span>
                    </label>
                    {isEditing ? (
                      <select
                        className="select select-bordered w-full"
                        value={editedData.department}
                        onChange={(e) =>
                          handleInputChange("department", e.target.value)
                        }
                      >
                        <option value="Kỹ thuật">Kỹ thuật</option>
                        <option value="Nhân sự">Nhân sự</option>
                        <option value="Kế toán">Kế toán</option>
                        <option value="Marketing">Marketing</option>
                      </select>
                    ) : (
                      <div className="input input-bordered flex items-center bg-gray-50">
                        {accountData.department}
                      </div>
                    )}
                  </div>

                  {/* Position */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Briefcase size={16} />
                        Chức vụ
                      </span>
                    </label>
                    {isEditing ? (
                      <select
                        className="select select-bordered w-full"
                        value={editedData.position}
                        onChange={(e) =>
                          handleInputChange("position", e.target.value)
                        }
                      >
                        <option value="Trưởng phòng">Trưởng phòng</option>
                        <option value="Nhân viên">Nhân viên</option>
                        <option value="Kế toán trưởng">Kế toán trưởng</option>
                      </select>
                    ) : (
                      <div className="input input-bordered flex items-center bg-gray-50">
                        {accountData.position}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Activity size={16} />
                        Trạng thái
                      </span>
                    </label>
                    {isEditing ? (
                      <select
                        className="select select-bordered w-full"
                        value={editedData.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                      >
                        <option value="Hoạt động">Hoạt động</option>
                        <option value="Khóa">Khóa</option>
                      </select>
                    ) : (
                      <div className="input input-bordered flex items-center bg-gray-50">
                        {accountData.status}
                      </div>
                    )}
                  </div>

                  {/* Roles */}
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Tag size={16} />
                        Vai trò
                      </span>
                    </label>
                    {isEditing ? (
                      <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
                        {["Admin", "Manager", "HR", "Employee"].map((role) => (
                          <span
                            key={role}
                            className={getRoleBadgeClass(
                              role,
                              editedData.roles.includes(role)
                            )}
                            onClick={() => handleRoleToggle(role)}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
                        {accountData.roles.map((role, index) => (
                          <span
                            key={index}
                            className={getRoleBadgeClass(role, true)}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="card bg-white shadow-lg mt-6">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">Nhật ký hoạt động</h2>

                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Hoạt động</th>
                        <th>Chi tiết</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>13/05/2025 08:30</td>
                        <td>Đăng nhập</td>
                        <td>Đăng nhập thành công vào hệ thống</td>
                      </tr>
                      <tr>
                        <td>12/05/2025 17:15</td>
                        <td>Đăng xuất</td>
                        <td>Đăng xuất khỏi hệ thống</td>
                      </tr>
                      <tr>
                        <td>12/05/2025 09:00</td>
                        <td>Cập nhật thông tin</td>
                        <td>Cập nhật thông tin cá nhân</td>
                      </tr>
                      <tr>
                        <td>12/05/2025 08:45</td>
                        <td>Đăng nhập</td>
                        <td>Đăng nhập thành công vào hệ thống</td>
                      </tr>
                      <tr>
                        <td>10/05/2025 15:30</td>
                        <td>Thay đổi mật khẩu</td>
                        <td>Thay đổi mật khẩu thành công</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
