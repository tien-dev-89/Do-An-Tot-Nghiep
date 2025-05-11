import React from "react";
import Link from "next/link";

import { useState } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Search,
  Users,
  Shield,
  Key,
  UserPlus,
} from "lucide-react";

// Định nghĩa kiểu dữ liệu
interface Role {
  role_id: string;
  name: string;
  description: string;
}

interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  department_id: string;
  department_name: string;
  position_id: string;
  position_name: string;
}

interface UserRole {
  user_role_id: string;
  employee_id: string;
  role_id: string;
  employee_name?: string;
  role_name?: string;
}

// Dữ liệu mẫu
const initialRoles: Role[] = [
  {
    role_id: "1",
    name: "Admin",
    description: "Quản trị viên hệ thống, có toàn quyền truy cập",
  },
  {
    role_id: "2",
    name: "HR",
    description: "Quản lý nhân sự, phụ trách tuyển dụng và đào tạo",
  },
  {
    role_id: "3",
    name: "Manager",
    description: "Quản lý phòng ban, phê duyệt nghỉ phép và đánh giá nhân viên",
  },
  { role_id: "4", name: "Employee", description: "Nhân viên thông thường" },
];

const initialEmployees: Employee[] = [
  {
    employee_id: "1",
    full_name: "Nguyễn Văn A",
    email: "nguyenvana@company.com",
    department_id: "1",
    department_name: "Ban Giám đốc",
    position_id: "1",
    position_name: "Giám đốc",
  },
  {
    employee_id: "2",
    full_name: "Trần Thị B",
    email: "tranthib@company.com",
    department_id: "2",
    department_name: "Phòng Nhân sự",
    position_id: "2",
    position_name: "Trưởng phòng HR",
  },
  {
    employee_id: "3",
    full_name: "Lê Văn C",
    email: "levanc@company.com",
    department_id: "3",
    department_name: "Phòng IT",
    position_id: "3",
    position_name: "Trưởng phòng IT",
  },
  {
    employee_id: "4",
    full_name: "Phạm Thị D",
    email: "phamthid@company.com",
    department_id: "4",
    department_name: "Phòng Marketing",
    position_id: "4",
    position_name: "Nhân viên Marketing",
  },
  {
    employee_id: "5",
    full_name: "Hoàng Văn E",
    email: "hoangvane@company.com",
    department_id: "5",
    department_name: "Phòng Kế toán",
    position_id: "5",
    position_name: "Kế toán trưởng",
  },
];

const initialUserRoles: UserRole[] = [
  { user_role_id: "1", employee_id: "1", role_id: "1" },
  { user_role_id: "2", employee_id: "2", role_id: "2" },
  { user_role_id: "3", employee_id: "3", role_id: "3" },
  { user_role_id: "4", employee_id: "4", role_id: "4" },
  { user_role_id: "5", employee_id: "5", role_id: "4" },
];

// Quyền hạn cho mỗi vai trò (có thể mở rộng)
const rolePermissions = {
  Admin: [
    "Quản lý người dùng",
    "Quản lý vai trò",
    "Quản lý phòng ban",
    "Quản lý chức vụ",
    "Quản lý chấm công",
    "Quản lý lương",
    "Quản lý đơn nghỉ phép",
    "Xem báo cáo",
    "Cấu hình hệ thống",
  ],
  HR: [
    "Quản lý người dùng",
    "Quản lý phòng ban",
    "Quản lý chức vụ",
    "Quản lý chấm công",
    "Quản lý lương",
    "Quản lý đơn nghỉ phép",
    "Xem báo cáo",
  ],
  Manager: [
    "Quản lý chấm công (phòng ban)",
    "Duyệt đơn nghỉ phép",
    "Xem báo cáo (phòng ban)",
  ],
  Employee: ["Xem thông tin cá nhân", "Gửi đơn nghỉ phép", "Xem lương"],
};

const RolesPermissionsPage: React.FC = () => {
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState<"roles" | "assignments">("roles");

  // State cho phần quản lý vai trò
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchRoleTerm, setSearchRoleTerm] = useState<string>("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<
    Role | { name: string; description: string }
  >({ name: "", description: "" });
  const [isEditingRole, setIsEditingRole] = useState<boolean>(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] =
    useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [selectedRoleForDetails, setSelectedRoleForDetails] = useState<
    string | null
  >(null);

  // State cho phần gán quyền
  const [employees] = useState<Employee[]>(initialEmployees);
  const [userRoles, setUserRoles] = useState<UserRole[]>(initialUserRoles);
  const [searchUserTerm, setSearchUserTerm] = useState<string>("");
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] =
    useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isRemoveAssignmentModalOpen, setIsRemoveAssignmentModalOpen] =
    useState<boolean>(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<UserRole | null>(
    null
  );

  // Lọc vai trò dựa trên từ khóa tìm kiếm
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchRoleTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchRoleTerm.toLowerCase())
  );

  // Lọc nhân viên và vai trò đã gán dựa trên từ khóa tìm kiếm
  const userRolesWithNames = userRoles.map((ur) => {
    const employee = employees.find((e) => e.employee_id === ur.employee_id);
    const role = roles.find((r) => r.role_id === ur.role_id);
    return {
      ...ur,
      employee_name: employee?.full_name || "Không xác định",
      role_name: role?.name || "Không xác định",
    };
  });

  const filteredUserRoles = userRolesWithNames.filter(
    (ur) =>
      ur.employee_name.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      ur.role_name.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  // Hàm xử lý cho phần quản lý vai trò
  const handleAddRole = (): void => {
    setIsEditingRole(false);
    setCurrentRole({ name: "", description: "" });
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (role: Role): void => {
    setIsEditingRole(true);
    setCurrentRole(role);
    setIsRoleModalOpen(true);
  };

  const handleDeleteRoleConfirmation = (role: Role): void => {
    setRoleToDelete(role);
    setIsDeleteRoleModalOpen(true);
  };

  const handleDeleteRole = (): void => {
    if (!roleToDelete) return;
    setRoles(roles.filter((r) => r.role_id !== roleToDelete.role_id));
    // Xóa luôn các bản ghi gán quyền liên quan
    setUserRoles(userRoles.filter((ur) => ur.role_id !== roleToDelete.role_id));
    setIsDeleteRoleModalOpen(false);
    setRoleToDelete(null);
  };

  const handleSaveRole = (): void => {
    if ("name" in currentRole && currentRole.name.trim() === "") return;

    if (isEditingRole && "role_id" in currentRole) {
      setRoles(
        roles.map((r) =>
          r.role_id === currentRole.role_id ? { ...(currentRole as Role) } : r
        )
      );
    } else {
      const newRole: Role = {
        ...(currentRole as { name: string; description: string }),
        role_id: (
          Math.max(...roles.map((r) => parseInt(r.role_id))) + 1
        ).toString(),
      };
      setRoles([...roles, newRole]);
    }
    setIsRoleModalOpen(false);
  };

  const handleViewRoleDetails = (roleId: string): void => {
    setSelectedRoleForDetails(
      selectedRoleForDetails === roleId ? null : roleId
    );
  };

  // Hàm xử lý cho phần gán quyền
  const handleAssignRole = (): void => {
    setSelectedEmployee(null);
    setSelectedRole("");
    setIsAssignRoleModalOpen(true);
  };

  const handleSaveAssignment = (): void => {
    if (!selectedEmployee || !selectedRole) return;

    // Kiểm tra xem nhân viên đã có vai trò này chưa
    const existingAssignment = userRoles.find(
      (ur) =>
        ur.employee_id === selectedEmployee.employee_id &&
        ur.role_id === selectedRole
    );

    if (existingAssignment) {
      alert("Nhân viên này đã được gán vai trò này!");
      return;
    }

    const newAssignment: UserRole = {
      user_role_id: (
        Math.max(...userRoles.map((ur) => parseInt(ur.user_role_id))) + 1
      ).toString(),
      employee_id: selectedEmployee.employee_id,
      role_id: selectedRole,
    };

    setUserRoles([...userRoles, newAssignment]);
    setIsAssignRoleModalOpen(false);
  };

  const handleRemoveAssignmentConfirmation = (assignment: UserRole): void => {
    setAssignmentToRemove(assignment);
    setIsRemoveAssignmentModalOpen(true);
  };

  const handleRemoveAssignment = (): void => {
    if (!assignmentToRemove) return;
    setUserRoles(
      userRoles.filter(
        (ur) => ur.user_role_id !== assignmentToRemove.user_role_id
      )
    );
    setIsRemoveAssignmentModalOpen(false);
    setAssignmentToRemove(null);
  };

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Home</Link>
          </li>
          <li>
            <Link href={"/decentralization"}>decentralization</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Quản lý Vai trò & Phân quyền
            </h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === "roles" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("roles")}
            >
              <Shield className="w-4 h-4 mr-2" />
              Vai trò
            </button>
            <button
              className={`tab ${
                activeTab === "assignments" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("assignments")}
            >
              <Users className="w-4 h-4 mr-2" />
              Phân quyền người dùng
            </button>
          </div>

          {/* Quản lý vai trò */}
          {activeTab === "roles" && (
            <div>
              <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm vai trò..."
                    className="pl-10 input input-bordered w-full focus:input-primary"
                    value={searchRoleTerm}
                    onChange={(e) => setSearchRoleTerm(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleAddRole}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Thêm vai trò
                </button>
              </div>

              {/* Danh sách vai trò */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <div
                      key={role.role_id}
                      className="card bg-base-100 shadow-md"
                    >
                      <div className="card-body">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="card-title flex items-center">
                              <Shield className="w-5 h-5 mr-2 text-primary" />
                              {role.name}
                            </h2>
                            <p className="text-sm mt-2">{role.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-ghost btn-square text-primary"
                              onClick={() => handleEditRole(role)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-sm btn-ghost btn-square text-error"
                              onClick={() => handleDeleteRoleConfirmation(role)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="divider my-2"></div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {
                              userRoles.filter(
                                (ur) => ur.role_id === role.role_id
                              ).length
                            }{" "}
                            người dùng
                          </span>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => handleViewRoleDetails(role.role_id)}
                          >
                            {selectedRoleForDetails === role.role_id
                              ? "Ẩn chi tiết"
                              : "Xem chi tiết"}
                          </button>
                        </div>

                        {selectedRoleForDetails === role.role_id && (
                          <div className="mt-4 bg-base-200 p-4 rounded-lg">
                            <h3 className="font-medium mb-2 flex items-center">
                              <Key className="w-4 h-4 mr-2" /> Quyền hạn:
                            </h3>
                            <ul className="list-disc list-inside">
                              {rolePermissions[
                                role.name as keyof typeof rolePermissions
                              ]?.map((perm, idx) => (
                                <li key={idx} className="text-sm py-1">
                                  {perm}
                                </li>
                              ))}
                            </ul>

                            <h3 className="font-medium mt-4 mb-2 flex items-center">
                              <Users className="w-4 h-4 mr-2" /> Người dùng có
                              vai trò này:
                            </h3>
                            {userRolesWithNames.filter(
                              (ur) => ur.role_id === role.role_id
                            ).length > 0 ? (
                              <ul className="space-y-1">
                                {userRolesWithNames
                                  .filter((ur) => ur.role_id === role.role_id)
                                  .map((ur, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm py-1 flex justify-between items-center"
                                    >
                                      <span>{ur.employee_name}</span>
                                      <button
                                        className="btn btn-xs btn-ghost text-error"
                                        onClick={() =>
                                          handleRemoveAssignmentConfirmation(ur)
                                        }
                                      >
                                        <X className="w-3 h-3 mr-1" /> Hủy
                                      </button>
                                    </li>
                                  ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Chưa có người dùng nào được gán vai trò này
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center">
                    <p>Không tìm thấy vai trò nào</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Phân quyền người dùng */}
          {activeTab === "assignments" && (
            <div>
              <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm nhân viên hoặc vai trò..."
                    className="pl-10 input input-bordered w-full focus:input-primary"
                    value={searchUserTerm}
                    onChange={(e) => setSearchUserTerm(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleAssignRole}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Gán vai trò
                </button>
              </div>

              {/* Bảng phân quyền */}
              <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="w-16">STT</th>
                      <th>Nhân viên</th>
                      <th>Phòng ban</th>
                      <th>Chức vụ</th>
                      <th>Vai trò</th>
                      <th className="w-24">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUserRoles.length > 0 ? (
                      filteredUserRoles.map((assignment, index) => {
                        const employee = employees.find(
                          (e) => e.employee_id === assignment.employee_id
                        );
                        return (
                          <tr key={assignment.user_role_id} className="hover">
                            <td>{index + 1}</td>
                            <td>
                              <div>
                                <div className="font-medium">
                                  {assignment.employee_name}
                                </div>
                                <div className="text-sm opacity-70">
                                  {employee?.email || ""}
                                </div>
                              </div>
                            </td>
                            <td>{employee?.department_name || ""}</td>
                            <td>{employee?.position_name || ""}</td>
                            <td>
                              <div className="badge badge-primary">
                                {assignment.role_name}
                              </div>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-error btn-outline"
                                onClick={() =>
                                  handleRemoveAssignmentConfirmation(assignment)
                                }
                              >
                                Hủy
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          Không tìm thấy phân quyền nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang */}
              <div className="mt-4 flex justify-center">
                <div className="join">
                  <button className="join-item btn btn-sm">«</button>
                  <button className="join-item btn btn-sm btn-active">1</button>
                  <button className="join-item btn btn-sm">2</button>
                  <button className="join-item btn btn-sm">3</button>
                  <button className="join-item btn btn-sm">»</button>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modal thêm/chỉnh sửa vai trò */}
        {isRoleModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-primary">
                  {isEditingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
                </h3>
                <button
                  className="btn btn-sm btn-ghost btn-square"
                  onClick={() => setIsRoleModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tên vai trò</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={"name" in currentRole ? currentRole.name : ""}
                  onChange={(e) =>
                    setCurrentRole({ ...currentRole, name: e.target.value })
                  }
                />
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Mô tả</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  value={
                    "description" in currentRole ? currentRole.description : ""
                  }
                  onChange={(e) =>
                    setCurrentRole({
                      ...currentRole,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="modal-action mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsRoleModalOpen(false)}
                >
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSaveRole}>
                  {isEditingRole ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận xóa vai trò */}
        {isDeleteRoleModalOpen && roleToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
              <p className="py-4">
                Bạn có chắc chắn muốn xóa vai trò &quot;
                <span className="font-semibold">{roleToDelete.name}</span>
                &quot;?
                <br />
                <br />
                <span className="text-error">
                  Lưu ý: Hành động này sẽ xóa tất cả phân quyền liên quan đến
                  vai trò này.
                </span>
              </p>

              <div className="modal-action">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsDeleteRoleModalOpen(false)}
                >
                  Hủy
                </button>
                <button className="btn btn-error" onClick={handleDeleteRole}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal gán vai trò */}
        {isAssignRoleModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-primary">
                  Gán vai trò cho nhân viên
                </h3>
                <button
                  className="btn btn-sm btn-ghost btn-square"
                  onClick={() => setIsAssignRoleModalOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Chọn nhân viên</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedEmployee?.employee_id || ""}
                  onChange={(e) => {
                    const employee = employees.find(
                      (emp) => emp.employee_id === e.target.value
                    );
                    setSelectedEmployee(employee || null);
                  }}
                >
                  <option value="" disabled>
                    -- Chọn nhân viên --
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} - {emp.position_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Chọn vai trò</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="" disabled>
                    -- Chọn vai trò --
                  </option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-action mt-6">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsAssignRoleModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveAssignment}
                  disabled={!selectedEmployee || !selectedRole}
                >
                  Gán vai trò
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal xác nhận hủy phân quyền */}
        {isRemoveAssignmentModalOpen && assignmentToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-2">
                Xác nhận hủy phân quyền
              </h3>
              <p className="py-4">
                Bạn có chắc chắn muốn hủy vai trò &quot;
                {assignmentToRemove.role_name}&quot; của nhân viên &quot;
                {assignmentToRemove.employee_name}&quot;?
              </p>

              <div className="modal-action">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsRemoveAssignmentModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-error"
                  onClick={handleRemoveAssignment}
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
