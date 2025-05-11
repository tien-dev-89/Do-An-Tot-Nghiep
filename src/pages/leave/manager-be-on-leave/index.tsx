import Link from "next/link";
import React, { useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Filter,
  Search,
  UserCheck,
  // Plus,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Định nghĩa kiểu dữ liệu cho đơn nghỉ phép
type LeaveRequestStatus = "Chờ duyệt" | "Đã duyệt" | "Bị từ chối";
type LeaveType = "Nghỉ phép" | "Nghỉ bệnh" | "Nghỉ việc riêng";

interface LeaveRequest {
  leave_request_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  status: LeaveRequestStatus;
  approver_id: string | null;
  approver_name: string | null;
  created_at: string;
}

// Mock data cho đơn nghỉ phép
const mockLeaveRequests: LeaveRequest[] = [
  {
    leave_request_id: "LR001",
    employee_id: "EMP001",
    employee_name: "Nguyễn Văn A",
    department: "Kỹ thuật",
    leave_type: "Nghỉ phép",
    start_date: "2025-05-10",
    end_date: "2025-05-12",
    reason: "Nghỉ phép năm",
    status: "Chờ duyệt",
    approver_id: null,
    approver_name: null,
    created_at: "2025-05-06T10:30:00",
  },
  {
    leave_request_id: "LR002",
    employee_id: "EMP002",
    employee_name: "Trần Thị B",
    department: "Nhân sự",
    leave_type: "Nghỉ bệnh",
    start_date: "2025-05-08",
    end_date: "2025-05-09",
    reason: "Điều trị nha khoa",
    status: "Đã duyệt",
    approver_id: "EMP003",
    approver_name: "Lê Văn C",
    created_at: "2025-05-05T14:15:00",
  },
  {
    leave_request_id: "LR003",
    employee_id: "EMP004",
    employee_name: "Phạm Văn D",
    department: "Marketing",
    leave_type: "Nghỉ việc riêng",
    start_date: "2025-05-15",
    end_date: "2025-05-15",
    reason: "Giải quyết công việc cá nhân",
    status: "Bị từ chối",
    approver_id: "EMP003",
    approver_name: "Lê Văn C",
    created_at: "2025-05-04T09:45:00",
  },
];

// Component chính
export default function TimeSheets() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );

  // Lọc đơn nghỉ phép theo trạng thái và tìm kiếm
  const filteredRequests = mockLeaveRequests.filter((request) => {
    // Lọc theo tab
    if (activeTab === "pending" && request.status !== "Chờ duyệt") return false;
    if (activeTab === "approved" && request.status !== "Đã duyệt") return false;
    if (activeTab === "rejected" && request.status !== "Bị từ chối")
      return false;

    // Lọc theo tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        request.employee_name.toLowerCase().includes(query) ||
        request.department.toLowerCase().includes(query) ||
        request.reason.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Xử lý khi click vào nút xem chi tiết
  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      {/* Breadcrumbs */}
      <div className="bg-base-100 px-6 py-2">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href={"/"}>Trang chủ</Link>
            </li>
            <li>
              <Link href={"/leave/manager-be-on-leave"}>Quản lý nghỉ phép</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Header */}
      <header className="bg-base-100 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">
            Quản Lý Nghỉ Phép
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-primary">
              <FileText size={36} />
            </div>
            <div className="stat-title">Tổng số đơn</div>
            <div className="stat-value text-primary">
              {mockLeaveRequests.length}
            </div>
            <div className="stat-desc">Đơn nghỉ phép mới trong tháng 5</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-warning">
              <Clock size={36} />
            </div>
            <div className="stat-title">Đang chờ duyệt</div>
            <div className="stat-value text-warning">
              {mockLeaveRequests.filter((r) => r.status === "Chờ duyệt").length}
            </div>
            <div className="stat-desc">Cần được xử lý</div>
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-success">
              <UserCheck size={36} />
            </div>
            <div className="stat-title">Đã duyệt</div>
            <div className="stat-value text-success">
              {mockLeaveRequests.filter((r) => r.status === "Đã duyệt").length}
            </div>
            <div className="stat-desc">Trong 30 ngày qua</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="tabs tabs-boxed bg-base-100">
            <a
              className={`tab ${activeTab === "all" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </a>
            <a
              className={`tab ${activeTab === "pending" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Chờ duyệt
            </a>
            <a
              className={`tab ${activeTab === "approved" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("approved")}
            >
              Đã duyệt
            </a>
            <a
              className={`tab ${activeTab === "rejected" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("rejected")}
            >
              Từ chối
            </a>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="input input-bordered w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search
                size={18}
                className="absolute right-3 top-3 text-gray-400"
              />
            </div>
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn btn-outline"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter size={18} />
              </label>
              {filterOpen && (
                <div
                  tabIndex={0}
                  className="dropdown-content z-10 p-4 shadow bg-base-100 rounded-box w-72"
                >
                  <h3 className="font-medium mb-2">Bộ lọc</h3>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Nghỉ phép</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Nghỉ bệnh</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">Nghỉ việc riêng</span>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                      />
                    </label>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Từ ngày</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Đến ngày</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm">Xóa lọc</button>
                    <button className="btn btn-primary btn-sm">Áp dụng</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nhân viên</th>
                <th>Loại nghỉ</th>
                <th>Thời gian</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.leave_request_id}>
                    <td className="font-medium">{request.leave_request_id}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span>{request.employee_name.charAt(0)}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {request.employee_name}
                          </div>
                          <div className="text-sm opacity-70">
                            {request.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span
                        className={`badge ${
                          request.leave_type === "Nghỉ phép"
                            ? "badge-primary"
                            : request.leave_type === "Nghỉ bệnh"
                            ? "badge-warning"
                            : "badge-info"
                        } badge-outline`}
                      >
                        {request.leave_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(request.start_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      {request.start_date !== request.end_date && (
                        <div className="flex items-center gap-1 text-sm opacity-70">
                          <span>
                            đến{" "}
                            {new Date(request.end_date).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="line-clamp-1">{request.reason}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          request.status === "Chờ duyệt"
                            ? "badge-warning"
                            : request.status === "Đã duyệt"
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye size={16} />
                        </button>
                        {request.status === "Chờ duyệt" && (
                          <>
                            <button className="btn btn-ghost btn-sm btn-square text-success">
                              <CheckCircle size={16} />
                            </button>
                            <button className="btn btn-ghost btn-sm btn-square text-error">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText size={48} className="text-gray-400" />
                      <h3 className="font-medium">
                        Không tìm thấy đơn nghỉ phép
                      </h3>
                      <p className="text-sm text-gray-500">
                        Thử thay đổi bộ lọc hoặc tìm kiếm lại
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Hiển thị {filteredRequests.length} trong tổng số{" "}
            {mockLeaveRequests.length} đơn
          </div>
          <div className="join">
            <button className="join-item btn btn-sm">«</button>
            <button className="join-item btn btn-sm btn-active">1</button>
            <button className="join-item btn btn-sm">2</button>
            <button className="join-item btn btn-sm">3</button>
            <button className="join-item btn btn-sm">»</button>
          </div>
        </div>
      </main>

      {/* Modal xem chi tiết */}
      {showModal && selectedRequest && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg">Chi tiết đơn nghỉ phép</h3>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Thông tin nhân viên
                  </h4>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-12">
                        <span>{selectedRequest.employee_name.charAt(0)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedRequest.employee_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedRequest.department}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Loại nghỉ phép
                      </p>
                      <p className="font-medium">
                        <span
                          className={`badge ${
                            selectedRequest.leave_type === "Nghỉ phép"
                              ? "badge-primary"
                              : selectedRequest.leave_type === "Nghỉ bệnh"
                              ? "badge-warning"
                              : "badge-info"
                          } badge-outline`}
                        >
                          {selectedRequest.leave_type}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Trạng thái
                      </p>
                      <p className="font-medium">
                        <span
                          className={`badge ${
                            selectedRequest.status === "Chờ duyệt"
                              ? "badge-warning"
                              : selectedRequest.status === "Đã duyệt"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {selectedRequest.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Thời gian nghỉ
                  </h4>
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Từ ngày:</p>
                      <p className="font-medium">
                        {new Date(
                          selectedRequest.start_date
                        ).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Đến ngày:</p>
                      <p className="font-medium">
                        {new Date(selectedRequest.end_date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-500">Tổng số ngày:</p>
                      <p className="font-medium">
                        {Math.round(
                          (new Date(selectedRequest.end_date).getTime() -
                            new Date(selectedRequest.start_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{" "}
                        ngày
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Ngày tạo đơn
                    </p>
                    <p className="font-medium">
                      {new Date(selectedRequest.created_at).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Lý do nghỉ phép
                </h4>
                <div className="bg-base-200 rounded-lg p-4">
                  <p>{selectedRequest.reason}</p>
                </div>
              </div>

              {selectedRequest.status !== "Chờ duyệt" && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Thông tin phê duyệt
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-8">
                        <span>
                          {selectedRequest.approver_name?.charAt(0) || "?"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedRequest.approver_name}
                      </p>
                      <p className="text-sm text-gray-500">Người phê duyệt</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action">
              {selectedRequest.status === "Chờ duyệt" && (
                <>
                  <button className="btn btn-error">
                    <XCircle size={16} className="mr-1" />
                    Từ chối
                  </button>
                  <button className="btn btn-success">
                    <CheckCircle size={16} className="mr-1" />
                    Phê duyệt
                  </button>
                </>
              )}
              <button className="btn" onClick={() => setShowModal(false)}>
                Đóng
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
