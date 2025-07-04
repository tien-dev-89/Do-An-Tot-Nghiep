import { BookPlus, ClockFading } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveHistory from "./LeaveHistory";
import LeaveRequestModal from "@/components/modals/LeaveRequestModal";
import axios from "axios";
import { toast } from "react-toastify";
import { LeaveRequest, LeaveRequestStatus } from "@/types/leaveRequest";

interface User {
  employee_id: string;
  role_id: string;
}

export default function BeOnLeave() {
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [editRequest, setEditRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [fromHistory, setFromHistory] = useState<boolean>(false);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token");
      }

      const response = await axios.get("/api/leave/leave-requests", {
        headers: { Authorization: `Bearer ${token}` },
        params: { employee_id: user?.employee_id },
      });

      const data = response.data;
      if (data.success && Array.isArray(data.requests)) {
        setLeaveRequests(data.requests);
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
  }, [user]);

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
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user, fetchLeaveRequests]);

  const handleViewDetails = async (
    request: LeaveRequest,
    fromHistory: boolean = false
  ) => {
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
      setFromHistory(fromHistory);
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

  const handleCancelRequest = async (requestId: string) => {
    setLeaveRequests((prev) =>
      prev.filter((req) => req.leave_request_id !== requestId)
    );
    await fetchLeaveRequests();
  };

  if (
    !user ||
    !["role_employee", "role_admin", "role_hr"].includes(user.role_id)
  ) {
    return <div>Bạn không có quyền truy cập trang này</div>;
  }

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/">Trang chủ</Link>
          </li>
          <li>
            <Link href="/leave/be-on-leave">Yêu cầu nghỉ phép</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}
        <header className="bg-base-100 shadow-md rounded-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Yêu Cầu Nghỉ Phép
            </h1>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
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
              <LeaveRequestForm
                setLeaveRequests={setLeaveRequests}
                setActiveTab={setActiveTab}
                editRequest={editRequest}
                setEditRequest={setEditRequest}
              />
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
              {loading ? (
                <div className="text-center">
                  <div className="loading loading-spinner loading-lg"></div>
                </div>
              ) : (
                <LeaveHistory
                  leaveRequests={leaveRequests}
                  setLeaveRequests={setLeaveRequests}
                  setActiveTab={setActiveTab}
                  handleViewDetails={handleViewDetails}
                  setEditRequest={setEditRequest}
                />
              )}
            </div>
          </div>
        </main>

        <LeaveRequestModal
          showModal={showModal}
          selectedRequest={selectedRequest}
          setShowModal={setShowModal}
          handleUpdateStatus={handleUpdateStatus}
          handleCancelRequest={handleCancelRequest}
          userRole={user?.role_id || ""}
          fromHistory={fromHistory}
        />
      </div>
    </div>
  );
}
