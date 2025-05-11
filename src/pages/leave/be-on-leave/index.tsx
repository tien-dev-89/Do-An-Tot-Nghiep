import {
  BookPlus,
  ClockFading,
  Check,
  X,
  Trash2,
  Edit,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// Định nghĩa các kiểu dữ liệu dựa trên cơ sở dữ liệu
type LeaveType = "Nghỉ phép" | "Nghỉ bệnh" | "Nghỉ việc riêng";
type LeaveStatus = "Chờ duyệt" | "Đã duyệt" | "Bị từ chối";

interface LeaveRequest {
  leave_request_id: string;
  employee_id: string;
  employee_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveStatus;
  approver_id: string | null;
  approver_name?: string;
  created_at: string;
  updated_at: string;
}

// Tạo dữ liệu mẫu cho demo
const mockLeaveRequests: LeaveRequest[] = [
  {
    leave_request_id: "1",
    employee_id: "101",
    employee_name: "Nguyễn Văn A",
    leave_type: "Nghỉ phép",
    start_date: "2025-05-20",
    end_date: "2025-05-22",
    reason: "Nghỉ phép năm",
    status: "Chờ duyệt",
    approver_id: null,
    created_at: "2025-05-07T08:30:00Z",
    updated_at: "2025-05-07T08:30:00Z",
  },
  {
    leave_request_id: "2",
    employee_id: "101",
    employee_name: "Nguyễn Văn A",
    leave_type: "Nghỉ bệnh",
    start_date: "2025-04-15",
    end_date: "2025-04-16",
    reason: "Khám sức khỏe định kỳ",
    status: "Đã duyệt",
    approver_id: "201",
    approver_name: "Trần Thị B",
    created_at: "2025-04-14T10:15:00Z",
    updated_at: "2025-04-14T14:20:00Z",
  },
  {
    leave_request_id: "3",
    employee_id: "101",
    employee_name: "Nguyễn Văn A",
    leave_type: "Nghỉ việc riêng",
    start_date: "2025-03-10",
    end_date: "2025-03-10",
    reason: "Giải quyết việc gia đình",
    status: "Bị từ chối",
    approver_id: "201",
    approver_name: "Trần Thị B",
    created_at: "2025-03-08T09:00:00Z",
    updated_at: "2025-03-09T11:30:00Z",
  },
];

// Function tính số ngày nghỉ
const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

export default function BeOnLeave() {
  const [activeTab, setActiveTab] = useState<"request" | "history">("history");
  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>(mockLeaveRequests);
  const [filteredRequests, setFilteredRequests] =
    useState<LeaveRequest[]>(mockLeaveRequests);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "Tất cả">(
    "Tất cả"
  );
  const [typeFilter, setTypeFilter] = useState<LeaveType | "Tất cả">("Tất cả");

  // Form state
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "Nghỉ phép" as LeaveType,
    start_date: "",
    end_date: "",
    reason: "",
  });

  // Cập nhật bộ lọc khi có sự thay đổi
  useEffect(() => {
    let filtered = [...leaveRequests];

    if (statusFilter !== "Tất cả") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    if (typeFilter !== "Tất cả") {
      filtered = filtered.filter(
        (request) => request.leave_type === typeFilter
      );
    }

    setFilteredRequests(filtered);
  }, [statusFilter, typeFilter, leaveRequests]);

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

  // Xử lý hủy đơn
  const handleCancelRequest = (id: string) => {
    if (confirm("Bạn có chắc muốn hủy đơn nghỉ phép này?")) {
      setLeaveRequests((prev) =>
        prev.filter((request) => request.leave_request_id !== id)
      );
    }
  };

  // Xử lý chỉnh sửa đơn (chỉ cho phép với đơn đang ở trạng thái Chờ duyệt)
  const handleEditRequest = (request: LeaveRequest) => {
    setLeaveForm({
      leave_type: request.leave_type,
      start_date: request.start_date,
      end_date: request.end_date,
      reason: request.reason,
    });

    // Xóa đơn cũ
    setLeaveRequests((prev) =>
      prev.filter((r) => r.leave_request_id !== request.leave_request_id)
    );

    // Chuyển sang tab tạo đơn
    setActiveTab("request");
  };

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/leave/be-on-leave"}>Yêu cầu nghỉ phép</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Yêu Cầu Nghỉ Phép
            </h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          {/* Tabs */}
          <div className="tabs tabs-lift">
            <label
              className={`tab ${activeTab === "request" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("request")}
            >
              <BookPlus className="w-4 h-4 mr-2" />
              Nghỉ phép
            </label>
            <div
              className={`tab-content bg-base-100 border-base-300 p-6 ${
                activeTab === "request" ? "block" : "hidden"
              }`}
            >
              <div className="card bg-base-100">
                <div className="card-body">
                  <h2 className="card-title flex items-center mb-4">
                    <Calendar className="w-5 h-5 mr-2" />
                    Tạo đơn xin nghỉ phép
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="form-control">
                        <label className="label">
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
                          <option value="Nghỉ việc riêng">
                            Nghỉ việc riêng
                          </option>
                        </select>
                      </div>

                      <div className="form-control">
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

                      <div className="form-control">
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
                            leaveForm.start_date ||
                            new Date().toISOString().split("T")[0]
                          }
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Số ngày nghỉ</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={
                            leaveForm.start_date && leaveForm.end_date
                              ? calculateDays(
                                  leaveForm.start_date,
                                  leaveForm.end_date
                                )
                              : 0
                          }
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-control mt-4">
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
            </div>

            <label
              className={`tab ${activeTab === "history" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <ClockFading className="w-4 h-4 mr-2" />
              Lịch sử nghỉ phép
            </label>
            <div
              className={`tab-content bg-base-100 border-base-300 p-6 ${
                activeTab === "history" ? "block" : "hidden"
              }`}
            >
              <div className="card bg-base-100">
                <div className="card-body">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h2 className="card-title flex items-center mb-4 sm:mb-0">
                      <FileText className="w-5 h-5 mr-2" />
                      Danh sách đơn xin nghỉ phép
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        className="select select-bordered select-sm"
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(
                            e.target.value as LeaveStatus | "Tất cả"
                          )
                        }
                      >
                        <option value="Tất cả">Tất cả trạng thái</option>
                        <option value="Chờ duyệt">Chờ duyệt</option>
                        <option value="Đã duyệt">Đã duyệt</option>
                        <option value="Bị từ chối">Bị từ chối</option>
                      </select>
                      <select
                        className="select select-bordered select-sm"
                        value={typeFilter}
                        onChange={(e) =>
                          setTypeFilter(e.target.value as LeaveType | "Tất cả")
                        }
                      >
                        <option value="Tất cả">Tất cả loại nghỉ</option>
                        <option value="Nghỉ phép">Nghỉ phép</option>
                        <option value="Nghỉ bệnh">Nghỉ bệnh</option>
                        <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Loại nghỉ</th>
                          <th>Thời gian</th>
                          <th>Số ngày</th>
                          <th>Lý do</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.length > 0 ? (
                          filteredRequests.map((request) => (
                            <tr key={request.leave_request_id}>
                              <td>{request.leave_type}</td>
                              <td>
                                <div className="flex flex-col">
                                  <span>
                                    Từ:{" "}
                                    {new Date(
                                      request.start_date
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                  <span>
                                    Đến:{" "}
                                    {new Date(
                                      request.end_date
                                    ).toLocaleDateString("vi-VN")}
                                  </span>
                                </div>
                              </td>
                              <td>
                                {calculateDays(
                                  request.start_date,
                                  request.end_date
                                )}
                              </td>
                              <td>
                                <div
                                  className="max-w-xs truncate"
                                  title={request.reason}
                                >
                                  {request.reason}
                                </div>
                              </td>
                              <td>
                                <div
                                  className={`badge ${
                                    request.status === "Đã duyệt"
                                      ? "badge-success"
                                      : request.status === "Bị từ chối"
                                      ? "badge-error"
                                      : "badge-warning"
                                  } gap-1`}
                                >
                                  {request.status === "Đã duyệt" && (
                                    <Check className="w-3 h-3" />
                                  )}
                                  {request.status === "Bị từ chối" && (
                                    <X className="w-3 h-3" />
                                  )}
                                  {request.status}
                                </div>
                              </td>
                              <td>
                                <div className="flex space-x-2">
                                  {request.status === "Chờ duyệt" && (
                                    <>
                                      <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() =>
                                          handleEditRequest(request)
                                        }
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={() =>
                                          handleCancelRequest(
                                            request.leave_request_id
                                          )
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="text-center py-4">
                              Không có đơn xin nghỉ phép nào
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
