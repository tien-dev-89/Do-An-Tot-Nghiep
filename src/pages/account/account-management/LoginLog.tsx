import React, { useState } from "react";
import { Filter, ArrowUpDown, RefreshCw } from "lucide-react";

interface User {
  user_id: string;
  last_login_at: string;
}

interface LoginLog {
  log_id: string;
  user_id: string;
  username: string;
  login_time: string;
  status: "success" | "failed";
  failure_reason?: string;
}

interface LoginLogProps {
  loginLogs: LoginLog[];
  users: User[];
}

const LoginLog: React.FC<LoginLogProps> = ({ loginLogs, users }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loginStatusFilter, setLoginStatusFilter] = useState<
    "all" | "success" | "failed"
  >("all");
  const [timeFilter, setTimeFilter] = useState<
    "all" | "today" | "7days" | "30days"
  >("all");

  // Format date and time
  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Lọc nhật ký đăng nhập
  const filteredLoginLogs = loginLogs.filter((log) => {
    const searchMatch = log.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const statusMatch =
      loginStatusFilter === "all" ||
      (loginStatusFilter === "success" && log.status === "success") ||
      (loginStatusFilter === "failed" && log.status === "failed");

    const now = new Date();
    const logDate = new Date(log.login_time);
    const daysDiff = Math.floor(
      (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const timeMatch =
      timeFilter === "all" ||
      (timeFilter === "today" && daysDiff < 1) ||
      (timeFilter === "7days" && daysDiff < 7) ||
      (timeFilter === "30days" && daysDiff < 30);

    return searchMatch && statusMatch && timeMatch;
  });

  return (
    <>
      {/* Search and filter bar */}
      <div className="p-4 border-b border-base-300 flex flex-wrap gap-4 items-center">
        <div className="join flex-1">
          <label className="input">
            <svg
              className="h-[1em] opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              required
              type="text"
              placeholder="Tìm kiếm theo tên đăng nhập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-outline gap-1">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52 mt-1"
          >
            <li className="menu-title">Trạng thái</li>
            <li>
              <a
                onClick={() => setLoginStatusFilter("all")}
                className={loginStatusFilter === "all" ? "active" : ""}
              >
                Tất cả
              </a>
            </li>
            <li>
              <a
                onClick={() => setLoginStatusFilter("success")}
                className={loginStatusFilter === "success" ? "active" : ""}
              >
                Thành công
              </a>
            </li>
            <li>
              <a
                onClick={() => setLoginStatusFilter("failed")}
                className={loginStatusFilter === "failed" ? "active" : ""}
              >
                Thất bại
              </a>
            </li>
            <li className="menu-title pt-2">Thời gian</li>
            <li>
              <a
                onClick={() => setTimeFilter("today")}
                className={timeFilter === "today" ? "active" : ""}
              >
                Hôm nay
              </a>
            </li>
            <li>
              <a
                onClick={() => setTimeFilter("7days")}
                className={timeFilter === "7days" ? "active" : ""}
              >
                7 ngày qua
              </a>
            </li>
            <li>
              <a
                onClick={() => setTimeFilter("30days")}
                className={timeFilter === "30days" ? "active" : ""}
              >
                30 ngày qua
              </a>
            </li>
            <li>
              <a
                onClick={() => setTimeFilter("all")}
                className={timeFilter === "all" ? "active" : ""}
              >
                Tất cả
              </a>
            </li>
          </ul>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => {
            setSearchTerm("");
            setLoginStatusFilter("all");
            setTimeFilter("all");
          }}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Đặt lại
        </button>
      </div>

      {/* Table content */}
      <div className="overflow-x-auto w-full">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Tên đăng nhập
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Thời gian
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="cursor-pointer">
                <div className="flex items-center gap-1">
                  Lần đăng nhập gần nhất
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th>Trạng thái</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoginLogs.map((log) => (
              <tr key={log.log_id}>
                <td>
                  <div className="font-medium">{log.username}</div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {formatDateTime(log.login_time)}
                    </span>
                  </div>
                </td>
                <td>
                  {formatDateTime(
                    users.find((u) => u.user_id === log.user_id)
                      ?.last_login_at || log.login_time
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    {log.status === "success" ? (
                      <span className="badge badge-success">Thành công</span>
                    ) : (
                      <span className="badge badge-error">Thất bại</span>
                    )}
                  </div>
                </td>
                <td>
                  {log.status === "failed" && log.failure_reason && (
                    <span className="text-sm text-error">
                      {log.failure_reason}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 border-t border-base-300">
        <div className="text-sm">
          Hiển thị{" "}
          <span className="font-medium">1-{filteredLoginLogs.length}</span>{" "}
          trong tổng số{" "}
          <span className="font-medium">{filteredLoginLogs.length}</span> mục
        </div>
        <div className="join">
          <button className="join-item btn btn-sm">«</button>
          <button className="join-item btn btn-sm btn-active">1</button>
          <button className="join-item btn btn-sm">»</button>
        </div>
      </div>
    </>
  );
};

export default LoginLog;
