import { BookPlus, ClockFading } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { LeaveRequest } from "@/components/modals/LeaveRequestModal";
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveHistory from "./LeaveHistory";

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
    department: "",
    approver_name: null,
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
    department: "",
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
    department: "",
  },
];

export default function BeOnLeave() {
  const [activeTab, setActiveTab] = useState<"request" | "history">("request");
  const [leaveRequests, setLeaveRequests] =
    useState<LeaveRequest[]>(mockLeaveRequests);

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
        <header className="bg-base-100 shadow-md rounded-sm">
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
              <LeaveRequestForm
                setLeaveRequests={setLeaveRequests}
                setActiveTab={setActiveTab}
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
              <LeaveHistory
                leaveRequests={leaveRequests}
                setLeaveRequests={setLeaveRequests}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
