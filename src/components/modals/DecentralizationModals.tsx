import React from "react";
import { X } from "lucide-react";

// Định nghĩa kiểu dữ liệu
export interface Role {
  role_id: string;
  name: string;
  description: string;
}

export interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  department_id: string;
  department_name: string;
  position_id: string;
  position_name: string;
}

export interface UserRole {
  user_role_id: string;
  employee_id: string;
  role_id: string;
  employee_name?: string;
  role_name?: string;
}

// Props cho các modal
interface AddEditRoleModalProps {
  isOpen: boolean;
  isEditing: boolean;
  currentRole: Role | { name: string; description: string };
  setCurrentRole: (role: Role | { name: string; description: string }) => void;
  onClose: () => void;
  onSave: () => void;
}

interface DeleteRoleModalProps {
  isOpen: boolean;
  roleToDelete: Role | null;
  onClose: () => void;
  onDelete: () => void;
}

interface AssignRoleModalProps {
  isOpen: boolean;
  employees: Employee[];
  roles: Role[];
  selectedEmployee: Employee | null;
  selectedRole: string;
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedRole: (roleId: string) => void;
  onClose: () => void;
  onSave: () => void;
}

interface RemoveAssignmentModalProps {
  isOpen: boolean;
  assignmentToRemove: UserRole | null;
  onClose: () => void;
  onRemove: () => void;
}

// Modal thêm/chỉnh sửa vai trò
export const AddEditRoleModal: React.FC<AddEditRoleModalProps> = ({
  isOpen,
  isEditing,
  currentRole,
  setCurrentRole,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <dialog id="add_edit_role" className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-primary">
            {isEditing ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
          </h3>
          <button className="btn btn-sm btn-ghost btn-square" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid gap-2 form-control">
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
        <div className="grid gap-2 form-control pt-5">
          <label className="label">
            <span className="label-text">Mô tả</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            value={"description" in currentRole ? currentRole.description : ""}
            onChange={(e) =>
              setCurrentRole({ ...currentRole, description: e.target.value })
            }
          ></textarea>
        </div>
        <div className="modal-action mt-6">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={onSave}>
            {isEditing ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

// Modal xác nhận xóa vai trò
export const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({
  isOpen,
  roleToDelete,
  onClose,
  onDelete,
}) => {
  if (!isOpen || !roleToDelete) return null;

  return (
    <dialog id="delete_role" className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
        <p className="py-4">
          Bạn chắc chắn muốn xóa vai trò &quot;
          <span className="font-medium">{roleToDelete.name}</span>&quot;?
        </p>
        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-error" onClick={onDelete}>
            Xóa
          </button>
        </div>
      </div>
    </dialog>
  );
};

// Modal gán vai trò
export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  employees,
  roles,
  selectedEmployee,
  selectedRole,
  setSelectedEmployee,
  setSelectedRole,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <dialog id="assign_role" className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-primary">
            Gán vai trò cho nhân viên
          </h3>
          <button className="btn btn-sm btn-ghost btn-square" onClick={onClose}>
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
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={onSave}
            disabled={!selectedEmployee || !selectedRole}
          >
            Gán vai trò
          </button>
        </div>
      </div>
    </dialog>
  );
};

// Modal xác nhận hủy phân quyền
export const RemoveAssignmentModal: React.FC<RemoveAssignmentModalProps> = ({
  isOpen,
  assignmentToRemove,
  onClose,
  onRemove,
}) => {
  if (!isOpen || !assignmentToRemove) return null;

  return (
    <dialog id="confirm_cancel" className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold mb-2">Xác nhận hủy phân quyền</h3>
        <p className="py-4">
          Bạn có chắc chắn muốn hủy bỏ vai trò &quot;
          <span className="font-medium">{assignmentToRemove.role_name}</span>
          &quot; của nhân viên &quot;
          <span className="font-medium">
            {assignmentToRemove.employee_name}
          </span>
          &quot;?
        </p>
        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-error" onClick={onRemove}>
            Xác nhận
          </button>
        </div>
      </div>
    </dialog>
  );
};
