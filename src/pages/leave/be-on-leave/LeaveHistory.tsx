import React, { useState, useEffect } from "react";
import { FileText, Eye, Edit2 } from "lucide-react";
import {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "@/types/leaveRequest";

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
  handleViewDetails: (request: LeaveRequest, fromHistory?: boolean) => void;
  setEditRequest: (request: LeaveRequest | null) => void;
}

const LeaveHistory: React.FC<LeaveHistoryProps> = ({
  leaveRequests,
  setActiveTab,
  handleViewDetails,
  setEditRequest,
}) => {
  const [filteredRequests, setFilteredRequests] =
    useState<LeaveRequest[]>(leaveRequests);
  const [statusFilter, setStatusFilter] = useState<
    LeaveRequestStatus | "Tất cả"
  >("Tất cả");
  const [typeFilter, setTypeFilter] = useState<LeaveType | "Tất cả">("Tất cả");

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

  const handleEditRequest = (request: LeaveRequest) => {
    setEditRequest(request);
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
              <option value="ANNUAL">Nghỉ phép</option>
              <option value="SICK">Nghỉ bệnh</option>
              <option value="PERSONAL">Nghỉ việc riêng</option>
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
                    <td>
                      {request.leave_type === "ANNUAL"
                        ? "Nghỉ phép"
                        : request.leave_type === "SICK"
                        ? "Nghỉ bệnh"
                        : "Nghỉ việc riêng"}
                    </td>
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
                      <div
                        className="max-w-xs truncate"
                        title={request.reason || ""}
                      >
                        {request.reason || "Không có lý do"}
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
                        {request.status}
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => handleViewDetails(request, true)}
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.status === "Chờ duyệt" && (
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleEditRequest(request)}
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
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
