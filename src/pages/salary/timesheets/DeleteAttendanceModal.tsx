import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

interface AttendanceRecord {
  attendance_id: string;
  employee_id: string;
  employee_name?: string | null;
  date: string;
  clock_in_time?: string | null;
  clock_out_time?: string | null;
  shift_id?: string | null;
  shift_name?: string | null;
  late_minutes: number;
  early_leave_minutes: number;
  overtime_hours: number;
  status: string;
}

interface DeleteAttendanceModalProps {
  isOpen: boolean;
  attendanceToDelete: AttendanceRecord | null;
  onClose: () => void;
  onConfirm: (attendance_id: string) => Promise<void>;
}

export const DeleteAttendanceModal: React.FC<DeleteAttendanceModalProps> = ({
  isOpen,
  attendanceToDelete,
  onClose,
  onConfirm,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current && attendanceToDelete) {
      modalRef.current.showModal();
    } else if (!isOpen && modalRef.current) {
      modalRef.current.close();
    }
  }, [isOpen, attendanceToDelete]);

  if (!attendanceToDelete) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm(attendanceToDelete.attendance_id);
      toast.success("Xóa bản ghi chấm công thành công", {
        position: "top-right",
        autoClose: 3000,
      });
      onClose();
    } catch (error) {
      console.error("Delete attendance error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Lỗi khi xóa bản ghi chấm công",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <dialog
      id="confirm_delete_attendance_modal"
      className="modal"
      ref={modalRef}
    >
      <div className="modal-box">
        <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
        <p className="py-4">
          Bạn có chắc chắn muốn xóa bản ghi chấm công của{" "}
          <span className="font-semibold">
            {attendanceToDelete.employee_name}
          </span>{" "}
          vào ngày{" "}
          <span className="font-semibold">
            {new Date(attendanceToDelete.date).toLocaleDateString("vi-VN")}
          </span>
          ? Hành động này không thể hoàn tác.
        </p>

        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-error" onClick={handleConfirm}>
            Xóa
          </button>
        </div>
      </div>
    </dialog>
  );
};
