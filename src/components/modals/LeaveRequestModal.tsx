"use client";

import React from "react";
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "@/types/leaveRequest";
import axios from "axios";
import { toast } from "react-toastify";
import {
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  User,
  Clock,
  X,
  Trash2,
} from "lucide-react";

interface LeaveRequestModalProps {
  showModal: boolean;
  selectedRequest: LeaveRequest | null;
  setShowModal: (show: boolean) => void;
  handleUpdateStatus: (requestId: string, status: LeaveRequestStatus) => void;
  handleCancelRequest?: (requestId: string) => void;
  userRole: string;
  fromHistory?: boolean;
}

const getLeaveTypeText = (type: LeaveType): string => {
  switch (type) {
    case "ANNUAL":
      return "Nghỉ phép";
    case "SICK":
      return "Nghỉ bệnh";
    case "PERSONAL":
      return "Nghỉ việc riêng";
    default:
      return type;
  }
};

const getStatusBadgeClass = (status: LeaveRequestStatus): string => {
  switch (status) {
    case "Chờ duyệt":
      return "badge-warning";
    case "Đã duyệt":
      return "badge-success";
    case "Bị từ chối":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

const calculateDays = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Ngày không hợp lệ");
    }
    if (start > end) {
      throw new Error("Ngày bắt đầu lớn hơn ngày kết thúc");
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  } catch (error) {
    console.error("Lỗi khi tính toán số ngày:", error);
    return 0;
  }
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch (error: unknown) {
    console.error("Error formatting date:", error);
    return "Ngày không hợp lệ";
  }
};

const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString("vi-VN");
  } catch (error: unknown) {
    console.error("Error formatting datetime:", error);
    return "Thời gian không hợp lệ";
  }
};

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  showModal,
  selectedRequest,
  setShowModal,
  handleUpdateStatus,
  handleCancelRequest,
  userRole,
  fromHistory = false,
}) => {
  if (!showModal || !selectedRequest) return null;

  const handleCancel = async () => {
    if (!handleCancelRequest) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token");
      }

      await axios.delete(
        `/api/leave/leave-requests/${selectedRequest.leave_request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      handleCancelRequest(selectedRequest.leave_request_id);
      setShowModal(false);
      toast.success("Hủy đơn nghỉ phép thành công");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Không thể hủy đơn nghỉ phép";
      toast.error(errorMessage);
      console.error("Lỗi khi hủy đơn nghỉ phép:", error);
    }
  };

  const handleClose = (): void => {
    setShowModal(false);
  };

  const dayCount = calculateDays(
    selectedRequest.start_date,
    selectedRequest.end_date
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-primary">
            Chi Tiết Đơn Nghỉ Phép
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
            aria-label="Đóng modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <User size={18} className="text-primary" />
                Thông tin nhân viên
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm opacity-70">Họ tên:</span>
                  <p className="font-medium">{selectedRequest.employee_name}</p>
                </div>
                <div>
                  <span className="text-sm opacity-70">Phòng ban:</span>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-primary" />
                Thông tin nghỉ phép
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm opacity-70">Loại nghỉ:</span>
                  <p className="font-medium">
                    {getLeaveTypeText(selectedRequest.leave_type)}
                  </p>
                </div>
                <div>
                  <span className="text-sm opacity-70">Trạng thái:</span>
                  <div className="mt-1">
                    <span
                      className={`badge ${getStatusBadgeClass(
                        selectedRequest.status
                      )}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm opacity-70">Ngày bắt đầu:</span>
                  <p className="font-medium">
                    {formatDate(selectedRequest.start_date)}
                  </p>
                </div>
                <div>
                  <span className="text-sm opacity-70">Ngày kết thúc:</span>
                  <p className="font-medium">
                    {formatDate(selectedRequest.end_date)}
                  </p>
                </div>
                <div>
                  <span className="text-sm opacity-70">Số ngày nghỉ:</span>
                  <p className="font-medium">{dayCount} ngày</p>
                </div>
                <div>
                  <span className="text-sm opacity-70">Ngày tạo:</span>
                  <p className="font-medium">
                    {formatDate(selectedRequest.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <FileText size={18} className="text-primary" />
                Lý do nghỉ phép
              </h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedRequest.reason || "Không có lý do cụ thể"}
              </p>
            </div>
          </div>

          {(selectedRequest.approver_name ||
            selectedRequest.status !== "Chờ duyệt") && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-3">
                  <Clock size={18} className="text-primary" />
                  Thông tin phê duyệt
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.approver_name && (
                    <div>
                      <span className="text-sm opacity-70">
                        Người phê duyệt:
                      </span>
                      <p className="font-medium">
                        {selectedRequest.approver_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm opacity-70">Ngày cập nhật:</span>
                    <p className="font-medium">
                      {formatDateTime(selectedRequest.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action mt-6">
          {selectedRequest.status === "Chờ duyệt" && (
            <>
              {!fromHistory &&
                ["role_admin", "role_hr", "role_manager"].includes(
                  userRole
                ) && (
                  <>
                    <button
                      className="btn btn-success gap-2"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedRequest.leave_request_id,
                          "Đã duyệt"
                        )
                      }
                      type="button"
                      aria-label="Phê duyệt đơn xin nghỉ phép"
                    >
                      <CheckCircle size={16} />
                      Phê duyệt
                    </button>
                    <button
                      className="btn btn-error gap-2"
                      onClick={() =>
                        handleUpdateStatus(
                          selectedRequest.leave_request_id,
                          "Bị từ chối"
                        )
                      }
                      type="button"
                      aria-label="Từ chối đơn xin nghỉ phép"
                    >
                      <XCircle size={16} />
                      Từ chối
                    </button>
                  </>
                )}
              {["role_employee", "role_admin", "role_hr"].includes(userRole) &&
                handleCancelRequest && (
                  <button
                    className="btn btn-warning gap-2"
                    onClick={handleCancel}
                    type="button"
                    aria-label="Hủy đơn xin nghỉ phép"
                  >
                    <Trash2 size={16} />
                    Hủy đơn
                  </button>
                )}
            </>
          )}
          <button
            className="btn btn-ghost"
            onClick={handleClose}
            type="button"
            aria-label="Đóng modal"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestModal;
