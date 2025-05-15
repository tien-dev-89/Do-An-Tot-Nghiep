import { X } from "lucide-react";
import { useEffect, useRef } from "react";

// Định nghĩa kiểu dữ liệu cho Position
export interface Position {
  position_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Props cho modal thêm/chỉnh sửa
interface PositionFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  currentPosition: Position | { name: string; description: string };
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
}

// Props cho modal xác nhận xóa
interface DeleteConfirmModalProps {
  isOpen: boolean;
  positionToDelete: Position | null;
  onClose: () => void;
  onConfirm: () => void;
}

// Modal thêm/chỉnh sửa chức vụ
export const PositionFormModal: React.FC<PositionFormModalProps> = ({
  isOpen,
  isEditing,
  currentPosition,
  onClose,
  onSave,
  onChange,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (!isOpen && modalRef.current) {
      modalRef.current.close();
    }
  }, [isOpen]);

  return (
    <dialog id="position_form_modal" className="modal" ref={modalRef}>
      <div className="modal-box pl-10">
        <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-primary">
              {isEditing ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
            </h3>
            <button
              className="btn btn-sm btn-ghost btn-square absolute top-2 right-2"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="form-control grid">
            <label className="label">
              <span className="label-text">Tên chức vụ</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={"name" in currentPosition ? currentPosition.name : ""}
              onChange={(e) => onChange("name", e.target.value)}
            />
          </div>

          <div className="form-control grid pt-4">
            <label className="label">
              <span className="label-text">Mô tả</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={
                "description" in currentPosition
                  ? currentPosition.description
                  : ""
              }
              onChange={(e) => onChange("description", e.target.value)}
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
      </div>
    </dialog>
  );
};

// Modal xác nhận xóa
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  positionToDelete,
  onClose,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current && positionToDelete) {
      modalRef.current.showModal();
    } else if (!isOpen && modalRef.current) {
      modalRef.current.close();
    }
  }, [isOpen, positionToDelete]);

  if (!positionToDelete) return null;

  return (
    <dialog id="confirm_delete_modal" className="modal" ref={modalRef}>
      <div className="modal-box">
        <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
        <p className="py-4">
          Bạn có chắc chắn muốn xóa chức vụ &quot;
          <span className="font-semibold">{positionToDelete.name}</span>
          &quot;? Hành động này không thể hoàn tác.
        </p>

        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </dialog>
  );
};
