import React, { forwardRef } from "react";
import { Role } from "@/types/decentralization";

interface DeleteRoleModalProps {
  isOpen: boolean;
  roleToDelete: Role | null;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteRoleModal = forwardRef<
  HTMLDialogElement,
  DeleteRoleModalProps
>(({ isOpen, roleToDelete, onClose, onDelete }, ref) => {
  if (!isOpen || !roleToDelete) return null;

  return (
    <dialog id="delete_role" className="modal" ref={ref}>
      <div className="modal-box">
        <h3 className="text-lg font-bold text-error">Xác nhận xóa vai trò</h3>
        <p className="py-4">
          Bạn có chắc chắn muốn xóa vai trò <strong>{roleToDelete.name}</strong>
          ?
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
});

DeleteRoleModal.displayName = "DeleteRoleModal";
