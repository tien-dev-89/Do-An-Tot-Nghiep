import React, { forwardRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { Role } from "@/types/decentralization";

interface AddEditRoleModalProps {
  isOpen: boolean;
  isEditing: boolean;
  currentRole: Partial<Role>;
  setCurrentRole: React.Dispatch<React.SetStateAction<Partial<Role>>>;
  onClose: () => void;
  onSave: () => void;
}

export const AddEditRoleModal = forwardRef<
  HTMLDialogElement,
  AddEditRoleModalProps
>(
  (
    { isOpen, isEditing, currentRole, setCurrentRole, onClose, onSave },
    ref
  ) => {
    const [error, setError] = React.useState<string>("");

    const handleSave = () => {
      if (!isEditing) {
        setError("Thêm vai trò mới đã bị vô hiệu hóa.");
        return;
      }
      if (!currentRole.name?.trim()) {
        setError("Tên vai trò là bắt buộc");
        return;
      }
      setError("");
      onSave();
    };

    if (!isOpen) return null;

    return (
      <dialog id="add_edit_role" className="modal" ref={ref}>
        <div className="modal-box">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary">
              {isEditing ? "Sửa vai trò" : "Thêm vai trò (Vô hiệu hóa)"}
            </h3>
            <button
              className="btn btn-sm btn-ghost btn-square"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid gap-4">
            <div className="form-control grid gap-1">
              <label className="label">
                <span className="label-text">Tên vai trò</span>
              </label>
              <input
                type="text"
                className={`input input-bordered ${error ? "input-error" : ""}`}
                value={currentRole.name || ""}
                onChange={(e) =>
                  setCurrentRole({ ...currentRole, name: e.target.value })
                }
                disabled={!isEditing}
              />
              {error && (
                <div className="flex items-center gap-1 mt-1 text-error text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
            <div className="form-control grid gap-1">
              <label className="label">
                <span className="label-text">Mô tả</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={currentRole.description || ""}
                onChange={(e) =>
                  setCurrentRole({
                    ...currentRole,
                    description: e.target.value,
                  })
                }
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="modal-action mt-6">
            <button className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!isEditing}
            >
              {isEditing ? "Cập nhật" : "Thêm mới (Vô hiệu hóa)"}
            </button>
          </div>
        </div>
      </dialog>
    );
  }
);

AddEditRoleModal.displayName = "AddEditRoleModal";
