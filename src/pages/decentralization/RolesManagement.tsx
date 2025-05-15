import React, { useState } from "react";
import { PlusCircle, Pencil, Trash2, Shield, Key, Users } from "lucide-react";
import {
  Role,
  UserRole,
  AddEditRoleModal,
  DeleteRoleModal,
} from "@/components/modals/DecentralizationModals";

// Quyền hạn cho mỗi vai trò
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
  "Nhân viên": ["Xem thông tin cá nhân", "Gửi đơn nghỉ phép", "Xem lương"],
};

interface RolesManagementProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  userRoles: UserRole[];
  setUserRoles: React.Dispatch<React.SetStateAction<UserRole[]>>;
}

const RolesManagement: React.FC<RolesManagementProps> = ({
  roles,
  setRoles,
  userRoles,
  setUserRoles,
}) => {
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

  // Lọc vai trò dựa trên từ khóa tìm kiếm
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchRoleTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchRoleTerm.toLowerCase())
  );

  // Hàm xử lý
  const handleAddRole = (): void => {
    setIsEditingRole(false);
    setCurrentRole({ name: "", description: "" });
    setIsRoleModalOpen(true);
    setTimeout(() => {
      const modal = document.getElementById(
        "add_edit_role"
      ) as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  };

  const handleEditRole = (role: Role): void => {
    setIsEditingRole(true);
    setCurrentRole(role);
    setIsRoleModalOpen(true);
    setTimeout(() => {
      const modal = document.getElementById(
        "add_edit_role"
      ) as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  };

  const handleDeleteRoleConfirmation = (role: Role): void => {
    setRoleToDelete(role);
    setIsDeleteRoleModalOpen(true);
    setTimeout(() => {
      const modal = document.getElementById("delete_role") as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  };

  const handleDeleteRole = (): void => {
    if (!roleToDelete) return;
    setRoles(roles.filter((r) => r.role_id !== roleToDelete.role_id));
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

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
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
              type="text"
              placeholder="Tìm kiếm vai trò..."
              value={searchRoleTerm}
              onChange={(e) => setSearchRoleTerm(e.target.value)}
            />
          </label>
        </div>
        <button
          onClick={handleAddRole}
          className="btn btn-primary flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Thêm vai trò
        </button>
      </div>
      {/* Danh sách vai trò */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <div key={role.role_id} className="card bg-base-100 shadow-md">
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
                      userRoles.filter((ur) => ur.role_id === role.role_id)
                        .length
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
                      <Users className="w-4 h-4 mr-2" /> Người dùng có vai trò
                      này:
                    </h3>
                    {userRoles.filter((ur) => ur.role_id === role.role_id)
                      .length > 0 ? (
                      <ul className="space-y-1">
                        {userRoles
                          .filter((ur) => ur.role_id === role.role_id)
                          .map((ur, idx) => (
                            <li
                              key={idx}
                              className="text-sm py-1 flex justify-between items-center"
                            >
                              <span>
                                {userRoles.find(
                                  (u) => u.user_role_id === ur.user_role_id
                                )?.employee_name || "Không xác định"}
                              </span>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Chưa có người dùng nào được chỉ định vai trò này
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
      {/* Modals */}
      <AddEditRoleModal
        isOpen={isRoleModalOpen}
        isEditing={isEditingRole}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onClose={() => setIsRoleModalOpen(false)}
        onSave={handleSaveRole}
      />
      <DeleteRoleModal
        isOpen={isDeleteRoleModalOpen}
        roleToDelete={roleToDelete}
        onClose={() => setIsDeleteRoleModalOpen(false)}
        onDelete={handleDeleteRole}
      />
    </div>
  );
};

export default RolesManagement;
