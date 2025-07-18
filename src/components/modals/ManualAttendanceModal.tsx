import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Employee {
  employee_id: string;
  full_name: string;
  department_id: string;
  department_name?: string;
  email: string;
}

interface Shift {
  shift_id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    employee_id: string;
    date: string;
    clock_in_time: string;
    clock_out_time: string;
    shift_id: string;
  }) => Promise<void>;
  employees: Employee[];
  shifts: Shift[];
}

const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  shifts,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    date: format(new Date(), "yyyy-MM-dd"),
    clock_in_time: "",
    clock_out_time: "",
    shift_id: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [emailError, setEmailError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý khi email thay đổi
  useEffect(() => {
    if (formData.email) {
      const employee = employees.find(
        (emp) => emp.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (employee) {
        setSelectedEmployee(employee);
        setEmailError("");
      } else {
        setSelectedEmployee(null);
        setEmailError("Email không tồn tại");
      }
    } else {
      setSelectedEmployee(null);
      setEmailError("");
    }
  }, [formData.email, employees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      selectedEmployee &&
      formData.date &&
      formData.clock_in_time &&
      formData.clock_out_time &&
      formData.shift_id
    ) {
      setIsLoading(true);
      try {
        await onSubmit({
          employee_id: selectedEmployee.employee_id,
          date: formData.date,
          clock_in_time: formData.clock_in_time,
          clock_out_time: formData.clock_out_time,
          shift_id: formData.shift_id,
        });
        toast.success("Tạo bản ghi chấm công thành công", {
          position: "top-right",
          autoClose: 3000,
        });
        onClose();
        setFormData({
          email: "",
          date: format(new Date(), "yyyy-MM-dd"),
          clock_in_time: "",
          clock_out_time: "",
          shift_id: "",
        });
        setSelectedEmployee(null);
        setEmailError("");
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Lỗi khi tạo bản ghi chấm công",
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!selectedEmployee) {
        setEmailError("Vui lòng nhập email hợp lệ");
      } else {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-lg text-primary">Chấm công thủ công</h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email nhân viên</span>
              </label>
              <input
                type="email"
                className={`input input-bordered w-full ${
                  emailError ? "input-error" : ""
                }`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Nhập email nhân viên"
                required
                disabled={isLoading}
              />
              {emailError && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {emailError}
                  </span>
                </label>
              )}
              {selectedEmployee && (
                <div className="mt-2 p-3 bg-base-200 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Tên:</span>{" "}
                    {selectedEmployee.full_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Phòng ban:</span>{" "}
                    {selectedEmployee.department_name || "Không xác định"}
                  </p>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Ngày</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Giờ vào</span>
              </label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={formData.clock_in_time}
                onChange={(e) =>
                  setFormData({ ...formData, clock_in_time: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Giờ ra</span>
              </label>
              <input
                type="time"
                className="input input-bordered w-full"
                value={formData.clock_out_time}
                onChange={(e) =>
                  setFormData({ ...formData, clock_out_time: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Ca làm việc</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.shift_id}
                onChange={(e) =>
                  setFormData({ ...formData, shift_id: e.target.value })
                }
                required
                disabled={isLoading}
              >
                <option value="">Chọn ca làm việc</option>
                {shifts.map((shift) => (
                  <option key={shift.shift_id} value={shift.shift_id}>
                    {shift.name} ({shift.start_time} - {shift.end_time})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default ManualAttendanceModal;
