// File: src/components/modals/PositionModals.tsx
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export interface Position {
  position_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  employee_count?: number;
  department_ids?: string[];
}

interface Department {
  department_id: string;
  name: string;
}

interface PositionFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  currentPosition:
    | Position
    | { name: string; description: string; department_ids?: string[] };
  onClose: () => void;
  onChange: (field: string, value: string | string[]) => void;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  positionToDelete: Position | null;
  onClose: () => void;
}

export const PositionFormModal: React.FC<PositionFormModalProps> = ({
  isOpen,
  isEditing,
  currentPosition,
  onClose,
  onChange,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

  useEffect(() => {
    if (isOpen) {
      const fetchDepartments = async () => {
        try {
          setIsLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            toast.error("Vui lòng đăng nhập lại");
            return;
          }
          const res = await fetch("/api/departments", {
            headers: { Authorization: `x ${token}` },
          });
          const data = await res.json();
          console.log("Fetch departments response:", data); // Log để kiểm tra
          if (res.ok && Array.isArray(data.departments)) {
            setDepartments(data.departments);
          } else {
            if (res.status === 401) {
              localStorage.removeItem("token");
              toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
              window.location.href = "/login";
              return;
            }
            toast.error(data.error || "Lỗi khi tải danh sách phòng ban");
            setDepartments([]);
          }
        } catch (error) {
          console.error("Fetch departments error:", error);
          toast.error(`Lỗi: ${String(error)}`);
          setDepartments([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDepartments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.showModal();
    } else if (!isOpen && modalRef.current) {
      modalRef.current.close();
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!("name" in currentPosition) || !currentPosition.name?.trim()) {
      toast.error("Tên chức vụ không được để trống");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const url =
        isEditing && "position_id" in currentPosition
          ? `/api/positions/${currentPosition.position_id}`
          : "/api/positions";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        name: currentPosition.name.trim(),
        description: currentPosition.description?.trim() || null,
        department_ids:
          "department_ids" in currentPosition &&
          Array.isArray(currentPosition.department_ids)
            ? currentPosition.department_ids
            : [],
      };

      console.log("Sending payload to API:", payload); // Log để kiểm tra

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(`API ${method} response:`, { status: res.status, data });

      if (res.ok) {
        toast.success(
          isEditing ? "Cập nhật chức vụ thành công" : "Thêm chức vụ thành công"
        );
        onClose();
      } else {
        if (res.status === 401) {
          localStorage.removeItem("token");
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login";
          return;
        }
        toast.error(data.error || "Lỗi khi lưu chức vụ");
      }
    } catch (error) {
      console.error("Save position error:", error);
      toast.error(`Lỗi: ${String(error)}`);
    }
  };

  const handleDepartmentChange = (deptId: string) => {
    const currentDeptIds =
      "department_ids" in currentPosition &&
      Array.isArray(currentPosition.department_ids)
        ? currentPosition.department_ids
        : [];
    const newDeptIds = currentDeptIds.includes(deptId)
      ? currentDeptIds.filter((id) => id !== deptId)
      : [...currentDeptIds, deptId];
    onChange("department_ids", newDeptIds);
  };

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
                  ? currentPosition.description || ""
                  : ""
              }
              onChange={(e) => onChange("description", e.target.value)}
            ></textarea>
          </div>

          <div className="form-control grid pt-4">
            <label className="label">
              <span className="label-text">Phòng ban áp dụng</span>
            </label>
            <div className="max-h-40 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center">
                  <span className="loading loading-spinner loading-sm"></span>
                </div>
              ) : Array.isArray(departments) && departments.length > 0 ? (
                departments.map((dept) => (
                  <div key={dept.department_id} className="form-control">
                    <label className="label cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={
                          "department_ids" in currentPosition &&
                          Array.isArray(currentPosition.department_ids) &&
                          currentPosition.department_ids.includes(
                            dept.department_id
                          )
                        }
                        onChange={() =>
                          handleDepartmentChange(dept.department_id)
                        }
                      />
                      <span className="label-text ml-2">{dept.name}</span>
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-base-content/70">
                  Không có phòng ban nào
                </p>
              )}
            </div>
          </div>

          {isEditing && "employee_count" in currentPosition && (
            <div className="mt-4">
              <p className="text-sm">
                <strong>Số nhân viên sử dụng:</strong>{" "}
                {currentPosition.employee_count}
              </p>
            </div>
          )}

          <div className="modal-action mt-6">
            <button className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              {isEditing ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

// Giữ nguyên DeleteConfirmModal
export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  positionToDelete,
  onClose,
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

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        return;
      }

      const res = await fetch(
        `/api/positions/${positionToDelete.position_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `x ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("API DELETE response:", { status: res.status, data });

      if (res.ok) {
        toast.success("Xóa chức vụ thành công");
        onClose();
      } else {
        if (res.status === 401) {
          localStorage.removeItem("token");
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login";
          return;
        }
        toast.error(data.error || "Lỗi khi xóa chức vụ");
      }
    } catch (error) {
      console.error("Delete position error:", error);
      toast.error(`Lỗi: ${String(error)}`);
    }
  };

  return (
    <dialog id="confirm_delete_modal" className="modal" ref={modalRef}>
      <div className="modal-box">
        <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
        <p className="py-4">
          Bạn có chắc chắn muốn xóa chức vụ &quot;
          <span className="font-semibold">{positionToDelete.name}</span>
          &quot;?{" "}
          {positionToDelete.employee_count ? (
            <span className="text-error">
              Chức vụ đang được sử dụng bởi {positionToDelete.employee_count}{" "}
              nhân viên.
            </span>
          ) : (
            "Hành động này không thể hoàn tác."
          )}
        </p>

        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-error"
            onClick={handleConfirm}
            disabled={!!positionToDelete.employee_count}
          >
            Xóa
          </button>
        </div>
      </div>
    </dialog>
  );
};
