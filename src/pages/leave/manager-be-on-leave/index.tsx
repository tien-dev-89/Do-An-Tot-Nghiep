import {
  Calendar,
  Clock,
  FileText,
  Search,
  UserCheck,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import LeaveRequestModal from "@/components/modals/LeaveRequestModal";
import Pagination from "@/components/Pagination";
import axios from "axios";
import { toast } from "react-toastify";
import { LeaveRequest, LeaveRequestStatus } from "@/types/leaveRequest";

interface User {
  employee_id: string;
  role_id: string;
}

export default function LeaveManagement() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [user, setUser] = useState<User | null>(null);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token");
      }

      const params: {
        status?: string;
        search?: string;
        page?: number;
        pageSize?: number;
      } = { page: currentPage, pageSize };

      if (activeTab !== "all") {
        params.status = activeTab.toUpperCase();
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get("/api/leave/leave-requests", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const data = response.data;
      if (data.success && Array.isArray(data.requests)) {
        setLeaveRequests(data.requests);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalCount || 0);
      } else {
        throw new Error("Dữ liệu trả về không hợp lệ");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách đơn nghỉ phép";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Lỗi khi lấy danh sách đơn nghỉ phép:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, currentPage, pageSize]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
      } catch (error: unknown) {
        console.error("Lỗi phân tích user từ localStorage:", error);
        setError("Không thể tải thông tin người dùng");
      }
    }
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleViewDetails = async (request: LeaveRequest) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token");
      }

      const response = await axios.get(
        `/api/leave/leave-requests/${request.leave_request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedRequest(response.data);
      setShowModal(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết đơn nghỉ phép";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Lỗi khi lấy chi tiết đơn nghỉ phép:", error);
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    status: LeaveRequestStatus
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !user) {
        throw new Error("Không tìm thấy token hoặc thông tin người dùng");
      }

      const response = await axios.put(
        `/api/leave/leave-requests/${requestId}`,
        {
          status: status === "Đã duyệt" ? "APPROVED" : "REJECTED",
          approver_id: user.employee_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.leave_request_id === requestId ? response.data : req
        )
      );
      setShowModal(false);
      toast.success(`Đã ${status.toLowerCase()} đơn nghỉ phép`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Không thể ${status.toLowerCase()} đơn nghỉ phép`;
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Lỗi khi cập nhật trạng thái đơn nghỉ phép:", error);
    }
  };

  const handleCancelRequest = (requestId: string) => {
    setLeaveRequests((prev) =>
      prev.filter((req) => req.leave_request_id !== requestId)
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredRequests = leaveRequests.filter((request) => {
    if (activeTab === "pending" && request.status !== "Chờ duyệt") return false;
    if (activeTab === "approved" && request.status !== "Đã duyệt") return false;
    if (activeTab === "rejected" && request.status !== "Bị từ chối")
      return false;
    return true;
  });

  // Thêm kiểm tra quyền trong giao diện
  if (
    !user ||
    !["role_admin", "role_hr", "role_manager"].includes(user.role_id)
  ) {
    return <div>Bạn không có quyền truy cập trang này</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <div className="bg-base-100 px-6 py-2">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/" className="text-primary">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/leave/manager-be-on-leave" className="text-primary">
                Quản lý nghỉ phép
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <header className="bg-base-100 shadow-md rounded-sm">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">
            Quản Lý Nghỉ Phép
          </h1>
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}

        {["role_admin", "role_hr", "role_manager"].includes(
          user?.role_id || ""
        ) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="stat bg-base-100 shadow rounded-lg">
              <div className="stat-figure text-primary">
                <FileText size={36} />
              </div>
              <div className="stat-title">Tổng số đơn</div>
              <div className="stat-value text-primary">
                {leaveRequests.length}
              </div>
              <div className="stat-desc">Đơn nghỉ phép mới trong tháng</div>
            </div>

            <div className="stat bg-base-100 shadow rounded-lg">
              <div className="stat-figure text-warning">
                <Clock size={36} />
              </div>
              <div className="stat-title">Đang chờ duyệt</div>
              <div className="stat-value text-warning">
                {leaveRequests.filter((r) => r.status === "Chờ duyệt").length}
              </div>
              <div className="stat-desc">Cần được xử lý</div>
            </div>

            <div className="stat bg-base-100 shadow rounded-lg">
              <div className="stat-figure text-success">
                <UserCheck size={36} />
              </div>
              <div className="stat-title">Đã duyệt</div>
              <div className="stat-value text-success">
                {leaveRequests.filter((r) => r.status === "Đã duyệt").length}
              </div>
              <div className="stat-desc">Trong 30 ngày qua</div>
            </div>
          </div>
        )}

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
          </div>
        </div>

        <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>STT</th>
                <th>Nhân viên</th>
                <th>Loại nghỉ</th>
                <th>Thời gian</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="loading loading-spinner loading-lg"></div>
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((request, index) => (
                  <tr key={request.leave_request_id}>
                    <td className="font-medium">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
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
                          request.leave_type === "ANNUAL"
                            ? "badge-primary"
                            : request.leave_type === "SICK"
                            ? "badge-warning"
                            : "badge-info"
                        } badge-outline`}
                      >
                        {request.leave_type === "ANNUAL"
                          ? "Nghỉ phép"
                          : request.leave_type === "SICK"
                          ? "Nghỉ bệnh"
                          : "Nghỉ việc riêng"}
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
                      <span className="line-clamp-1">
                        {request.reason || "Không có lý do"}
                      </span>
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
                        {request.status === "Chờ duyệt" &&
                          ["role_admin", "role_hr", "role_manager"].includes(
                            user?.role_id || ""
                          ) && (
                            <>
                              <button
                                className="btn btn-ghost btn-sm btn-square text-success"
                                onClick={() =>
                                  handleUpdateStatus(
                                    request.leave_request_id,
                                    "Đã duyệt"
                                  )
                                }
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                className="btn btn-ghost btn-sm btn-square text-error"
                                onClick={() =>
                                  handleUpdateStatus(
                                    request.leave_request_id,
                                    "Bị từ chối"
                                  )
                                }
                              >
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
        />

        <LeaveRequestModal
          showModal={showModal}
          selectedRequest={selectedRequest}
          setShowModal={setShowModal}
          handleUpdateStatus={handleUpdateStatus}
          handleCancelRequest={handleCancelRequest}
          userRole={user?.role_id || ""}
        />
      </main>
    </div>
  );
}
