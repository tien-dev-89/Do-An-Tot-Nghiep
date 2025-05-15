import React, { useState } from "react";
import { Calendar } from "lucide-react";
import { LeaveRequest, LeaveType } from "@/components/modals/LeaveRequestModal";

// Hàm tính số ngày nghỉ
const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

interface LeaveRequestFormProps {
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<"request" | "history">>;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  setLeaveRequests,
  setActiveTab,
}) => {
  // Form state
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "Nghỉ phép" as LeaveType,
    start_date: "",
    end_date: "",
    reason: "",
  });

  // Xử lý khi thay đổi form
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý gửi form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra dữ liệu
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Tạo đơn nghỉ phép mới
    const newRequest: LeaveRequest = {
      leave_request_id: `${Date.now()}`,
      employee_id: "101", // Giả định ID nhân viên đang đăng nhập
      employee_name: "Nguyễn Văn A",
      leave_type: leaveForm.leave_type,
      start_date: leaveForm.start_date,
      end_date: leaveForm.end_date,
      reason: leaveForm.reason,
      status: "Chờ duyệt",
      approver_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      department: "",
      approver_name: null,
    };

    // Cập nhật danh sách
    setLeaveRequests((prev) => [newRequest, ...prev]);

    // Reset form
    setLeaveForm({
      leave_type: "Nghỉ phép",
      start_date: "",
      end_date: "",
      reason: "",
    });

    // Chuyển sang tab lịch sử
    setActiveTab("history");
  };

  return (
    <div className="card bg-base-100">
      <div className="card-body">
        <h2 className="card-title flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2" />
          Tạo đơn xin nghỉ phép
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="form-control">
              <label className="label pb-2">
                <span className="label-text">Loại nghỉ phép</span>
              </label>
              <select
                className="select select-bordered w-full"
                name="leave_type"
                value={leaveForm.leave_type}
                onChange={handleFormChange}
              >
                <option value="Nghỉ phép">Nghỉ phép</option>
                <option value="Nghỉ bệnh">Nghỉ bệnh</option>
                <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
              </select>
            </div>

            <div className="grid gap-2 form-control">
              <label className="label">
                <span className="label-text">Ngày bắt đầu</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                name="start_date"
                value={leaveForm.start_date}
                onChange={handleFormChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="grid gap-2 form-control">
              <label className="label">
                <span className="label-text">Ngày kết thúc</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                name="end_date"
                value={leaveForm.end_date}
                onChange={handleFormChange}
                min={
                  leaveForm.start_date || new Date().toISOString().split("T")[0]
                }
              />
            </div>

            <div className="grid gap-2 form-control">
              <label className="label">
                <span className="label-text">Số ngày nghỉ</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={
                  leaveForm.start_date && leaveForm.end_date
                    ? calculateDays(leaveForm.start_date, leaveForm.end_date)
                    : 0
                }
                disabled
              />
            </div>
          </div>

          <div className="grid gap-2 form-control mt-4">
            <label className="label">
              <span className="label-text">Lý do nghỉ phép</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Nhập lý do xin nghỉ phép"
              name="reason"
              value={leaveForm.reason}
              onChange={handleFormChange}
            ></textarea>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setLeaveForm({
                  leave_type: "Nghỉ phép",
                  start_date: "",
                  end_date: "",
                  reason: "",
                });
              }}
            >
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
