import React, { useState, useEffect } from "react";
import { Filter, RefreshCw } from "lucide-react";

interface LoginLog {
  log_id: string;
  user_id: string;
  username: string;
  activity: string;
  status: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const LoginLog: React.FC = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "success" | "failed"
  >("all");
  const [timeFilter, setTimeFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(searchTerm && { username: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(timeFilter !== "all" && { timeRange: timeFilter }),
      }).toString();

      const response = await fetch(
        `/api/account/account-management/login-logs?${query}`
      );
      const result = await response.json();
      if (result.success) {
        setLogs(result.data);
      } else {
        console.error("Lỗi khi lấy nhật ký đăng nhập:", result.error);
      }
    } catch (error: unknown) {
      console.error("Lỗi khi lấy nhật ký đăng nhập:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(); // Gọi lần đầu
    const interval = setInterval(fetchLogs, 5000); // Gọi lại mỗi 5 giây
    return () => clearInterval(interval); // Dọn dẹp khi component unmount
  }, [searchTerm, statusFilter, timeFilter]);

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-4 items-center">
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
              placeholder="Tìm kiếm theo username..."
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
                onClick={() => setStatusFilter("all")}
                className={statusFilter === "all" ? "active" : ""}
              >
                Tất cả
              </a>
            </li>
            <li>
              <a
                onClick={() => setStatusFilter("success")}
                className={statusFilter === "success" ? "active" : ""}
              >
                Thành công
              </a>
            </li>
            <li>
              <a
                onClick={() => setStatusFilter("failed")}
                className={statusFilter === "failed" ? "active" : ""}
              >
                Thất bại
              </a>
            </li>
            <li className="menu-title pt-2">Thời gian</li>
            <li>
              <a
                onClick={() => setTimeFilter("all")}
                className={timeFilter === "all" ? "active" : ""}
              >
                Tất cả
              </a>
            </li>
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
                onClick={() => setTimeFilter("week")}
                className={timeFilter === "week" ? "active" : ""}
              >
                Tuần này
              </a>
            </li>
            <li>
              <a
                onClick={() => setTimeFilter("month")}
                className={timeFilter === "month" ? "active" : ""}
              >
                Tháng này
              </a>
            </li>
          </ul>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setTimeFilter("all");
          }}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Đặt lại
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center p-4">Đang tải...</div>
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên đăng nhập</th>
                <th>Hoạt động</th>
                <th>Trạng thái</th>
                <th>Địa chỉ IP</th>
                <th>Trình duyệt</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.log_id}>
                  <td>{index + 1}</td>
                  <td>{log.username}</td>
                  <td>{log.activity}</td>
                  <td>
                    <span
                      className={`badge ${
                        log.status === "Thành công"
                          ? "badge-success"
                          : "badge-error"
                      } badge-sm`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td>{log.ip_address}</td>
                  <td className="whitespace-pre-line">{log.user_agent}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LoginLog;
