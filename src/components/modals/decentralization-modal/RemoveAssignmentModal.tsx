import React from "react";
import { UserRole } from "@/types/decentralization";

interface RemoveAssignmentModalProps {
  isOpen: boolean;
  assignmentToRemove: UserRole | null;
  onClose: () => void;
  onRemove: () => void;
}

export const RemoveAssignmentModal: React.FC<RemoveAssignmentModalProps> = ({
  isOpen,
  assignmentToRemove,
  onClose,
  onRemove,
}) => {
  if (!isOpen || !assignmentToRemove) return null;

  return (
    <dialog id="remove_assignment" className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold text-error">
          Xác nhận hủy phân quyền
        </h3>
        <p className="py-4">
          Bạn có chắc chắn muốn hủy phân quyền cho{" "}
          <strong>{assignmentToRemove.employee_name}</strong> với vai trò{" "}
          <strong>{assignmentToRemove.role_name}</strong>?
        </p>
        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-error" onClick={onRemove}>
            Hủy phân quyền
          </button>
        </div>
      </div>
    </dialog>
  );
};
