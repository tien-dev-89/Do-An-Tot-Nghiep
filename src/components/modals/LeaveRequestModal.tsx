import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

export type LeaveRequestStatus = "Chờ duyệt" | "Đã duyệt" | "Bị từ chối";
export type LeaveType = "Nghỉ phép" | "Nghỉ bệnh" | "Nghỉ việc riêng";

export interface LeaveRequest {
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
  updated_at: string;
}

interface LeaveRequestModalProps {
  showModal: boolean;
  selectedRequest: LeaveRequest | null;
  setShowModal: (show: boolean) => void;
}

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  showModal,
  selectedRequest,
  setShowModal,
}) => {
  if (!showModal || !selectedRequest) return null;

  return (
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
                  <p className="font-medium">{selectedRequest.employee_name}</p>
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
                    {new Date(selectedRequest.start_date).toLocaleDateString(
                      "vi-VN"
                    )}
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
                  {new Date(selectedRequest.created_at).toLocaleString("vi-VN")}
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
                  <p className="font-medium">{selectedRequest.approver_name}</p>
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
      <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
    </div>
  );
};

export default LeaveRequestModal;
