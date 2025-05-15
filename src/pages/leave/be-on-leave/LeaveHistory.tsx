import React, { useState, useEffect } from "react";
import { FileText, Check, X, Edit, Trash2 } from "lucide-react";
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "@/components/modals/LeaveRequestModal";

// Hàm tính số ngày nghỉ
const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

interface LeaveHistoryProps {
  leaveRequests: LeaveRequest[];
  setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<"request" | "history">>;
}

const LeaveHistory: React.FC<LeaveHistoryProps> = ({
  leaveRequests,
  setLeaveRequests,
  setActiveTab,
}) => {
  const [filteredRequests, setFilteredRequests] =
    useState<LeaveRequest[]>(leaveRequests);
  const [statusFilter, setStatusFilter] = useState<
    LeaveRequestStatus | "Tất cả"
  >("Tất cả");
  const [typeFilter, setTypeFilter] = useState<LeaveType | "Tất cả">("Tất cả");

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

  // Xử lý hủy đơn
  const handleCancelRequest = (id: string) => {
    if (confirm("Bạn có chắc muốn hủy đơn nghỉ phép này?")) {
      setLeaveRequests((prev) =>
        prev.filter((request) => request.leave_request_id !== id)
      );
    }
  };

  // Xử lý chỉnh sửa đơn
  const handleEditRequest = (request: LeaveRequest) => {
    setLeaveRequests((prev) =>
      prev.filter((r) => r.leave_request_id !== request.leave_request_id)
    );
    setActiveTab("request");
  };

  return (
    <div className="card bg-base-100">
      <div className="card-body">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="card-title flex items-center mb-4 sm:mb-0">
            <FileText className="w-5 h-5 mr-2" />
            Danh sách đơn xin nghỉ phép
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 w-68">
            <select
              className="select select-bordered select-sm"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as LeaveRequestStatus | "Tất cả")
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
                          {new Date(request.start_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span>
                          Đến:{" "}
                          {new Date(request.end_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </td>
                    <td>
                      {calculateDays(request.start_date, request.end_date)}
                    </td>
                    <td>
                      <div className="max-w-xs truncate" title={request.reason}>
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
                              onClick={() => handleEditRequest(request)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() =>
                                handleCancelRequest(request.leave_request_id)
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
  );
};

export default LeaveHistory;
