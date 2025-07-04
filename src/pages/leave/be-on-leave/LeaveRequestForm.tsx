import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import axios, { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { LeaveRequest, LeaveType } from "@/types/leaveRequest";

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

interface LeaveRequestFormProps {
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<"request" | "history">>;
  editRequest: LeaveRequest | null;
  setEditRequest: React.Dispatch<React.SetStateAction<LeaveRequest | null>>;
}

const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
  setLeaveRequests,
  setActiveTab,
  editRequest,
  setEditRequest,
}) => {
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "ANNUAL" as LeaveType,
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (editRequest) {
      setLeaveForm({
        leave_type: editRequest.leave_type,
        start_date: editRequest.start_date.split("T")[0],
        end_date: editRequest.end_date.split("T")[0],
        reason: editRequest.reason || "",
      });
    }
  }, [editRequest]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (new Date(leaveForm.start_date) > new Date(leaveForm.end_date)) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }
    if (new Date(leaveForm.start_date) < new Date()) {
      toast.error("Ngày bắt đầu không được trong quá khứ");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token");
      }

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      const user = JSON.parse(userData) as {
        employee_id: string;
        role_id: string;
      };

      let response: AxiosResponse<never, unknown>;
      if (editRequest) {
        response = await axios.put(
          `/api/leave/leave-requests/${editRequest.leave_request_id}`,
          {
            employee_id: user.employee_id,
            leave_type: leaveForm.leave_type,
            start_date: leaveForm.start_date,
            end_date: leaveForm.end_date,
            reason: leaveForm.reason,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setLeaveRequests((prev) =>
          prev.map((req) =>
            req.leave_request_id === editRequest.leave_request_id
              ? response.data
              : req
          )
        );
      } else {
        response = await axios.post(
          "/api/leave/leave-requests",
          {
            employee_id: user.employee_id,
            leave_type: leaveForm.leave_type,
            start_date: leaveForm.start_date,
            end_date: leaveForm.end_date,
            reason: leaveForm.reason,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setLeaveRequests((prev) => [response.data, ...prev]);
      }

      setLeaveForm({
        leave_type: "ANNUAL",
        start_date: "",
        end_date: "",
        reason: "",
      });
      setEditRequest(null);
      toast.dismiss();
      setActiveTab("history");
      toast.success(
        editRequest
          ? "Cập nhật đơn nghỉ phép thành công!"
          : "Đã gửi yêu cầu nghỉ phép thành công!"
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : editRequest
          ? "Không thể cập nhật đơn nghỉ phép"
          : "Không thể tạo đơn nghỉ phép";
      toast.error(errorMessage);
      console.error(
        editRequest
          ? "Lỗi khi cập nhật đơn nghỉ phép:"
          : "Lỗi khi tạo đơn nghỉ phép:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setLeaveForm({
      leave_type: "ANNUAL",
      start_date: "",
      end_date: "",
      reason: "",
    });
    setEditRequest(null);
  };

  return (
    <div className="card bg-base-100">
      <div className="card-body">
        <h2 className="card-title flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2" />
          {editRequest
            ? "Chỉnh sửa đơn xin nghỉ phép"
            : "Tạo đơn xin nghỉ phép"}
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
                <option value="ANNUAL">Nghỉ phép</option>
                <option value="SICK">Nghỉ bệnh</option>
                <option value="PERSONAL">Nghỉ việc riêng</option>
              </select>
            </div>

            <div className="form-control grid">
              <label className="label pb-2">
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

            <div className="form-control grid">
              <label className="label pb-2">
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

            <div className="form-control grid">
              <label className="label pb-2">
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

          <div className="form-control mt-4 grid">
            <label className="label pb-2">
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
              onClick={handleCancel}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? "Đang xử lý..."
                : editRequest
                ? "Cập nhật yêu cầu"
                : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
