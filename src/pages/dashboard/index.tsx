import React, { useState } from "react";
import {
  User,
  Calendar,
  Clock,
  FileText,
  Bell,
  Building2,
  Briefcase,
  DollarSign,
  BarChart4,
  UserCheck,
  Mail,
  Menu,
  X,
} from "lucide-react";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats] = useState({
    totalEmployees: 125,
    activeEmployees: 115,
    pendingLeaves: 8,
    departmentsCount: 6,
    attendanceToday: 98,
  });

  const [recentLeaveRequests] = useState([
    {
      id: "1",
      employee: "Nguyễn Văn A",
      type: "ANNUAL",
      startDate: "2025-05-20",
      endDate: "2025-05-22",
      status: "PENDING",
    },
    {
      id: "2",
      employee: "Trần Thị B",
      type: "SICK",
      startDate: "2025-05-19",
      endDate: "2025-05-19",
      status: "APPROVED",
    },
    {
      id: "3",
      employee: "Lê Văn C",
      type: "PERSONAL",
      startDate: "2025-05-25",
      endDate: "2025-05-26",
      status: "PENDING",
    },
  ]);

  const [todayAttendance] = useState([
    {
      id: "1",
      employee: "Nguyễn Văn A",
      department: "IT",
      clockIn: "08:05",
      status: "on-time",
    },
    {
      id: "2",
      employee: "Trần Thị B",
      department: "Marketing",
      clockIn: "08:30",
      status: "late",
    },
    {
      id: "3",
      employee: "Lê Văn C",
      department: "Nhân sự",
      clockIn: "08:00",
      status: "on-time",
    },
    {
      id: "4",
      employee: "Phạm Thị D",
      department: "Kế toán",
      clockIn: "07:55",
      status: "on-time",
    },
  ]);

  const [notifications] = useState([
    {
      id: "1",
      title: "Yêu cầu nghỉ phép mới",
      message: "Nguyễn Văn A đã yêu cầu nghỉ phép",
      time: "5 phút trước",
    },
    {
      id: "2",
      title: "Báo cáo tháng",
      message: "Báo cáo nhân sự tháng 5 đã hoàn thành",
      time: "1 giờ trước",
    },
    {
      id: "3",
      title: "Nhắc nhở",
      message: "Họp phòng vào 10:00 sáng mai",
      time: "3 giờ trước",
    },
  ]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Format status classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "badge badge-warning";
      case "APPROVED":
        return "badge badge-success";
      case "REJECTED":
        return "badge badge-error";
      default:
        return "badge";
    }
  };

  const getAttendanceStatusClass = (status: string) => {
    switch (status) {
      case "on-time":
        return "badge badge-success";
      case "late":
        return "badge badge-warning";
      case "absent":
        return "badge badge-error";
      default:
        return "badge";
    }
  };

  // Format leave type
  const formatLeaveType = (type: string) => {
    switch (type) {
      case "ANNUAL":
        return "Nghỉ phép năm";
      case "SICK":
        return "Nghỉ ốm";
      case "PERSONAL":
        return "Nghỉ cá nhân";
      default:
        return type;
    }
  };

  // Format leave status
  const formatLeaveStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "REJECTED":
        return "Từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex flex-col fixed w-64 h-full bg-base-200 shadow">
        <div className="flex items-center justify-center h-20 shadow-md">
          <h1 className="text-2xl font-bold text-primary">HR Manager</h1>
        </div>
        <div className="overflow-y-auto py-4 px-3">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg bg-primary text-white hover:bg-primary-focus"
              >
                <BarChart4 className="w-5 h-5 mr-2" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <User className="w-5 h-5 mr-2" />
                <span>Nhân viên</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <Building2 className="w-5 h-5 mr-2" />
                <span>Phòng ban</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <Briefcase className="w-5 h-5 mr-2" />
                <span>Vị trí</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <Clock className="w-5 h-5 mr-2" />
                <span>Chấm công</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <Calendar className="w-5 h-5 mr-2" />
                <span>Nghỉ phép</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                <span>Lương thưởng</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <FileText className="w-5 h-5 mr-2" />
                <span>Báo cáo</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <Bell className="w-5 h-5 mr-2" />
                <span>Thông báo</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center p-2 rounded-lg hover:bg-base-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                <span>Email</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="md:hidden rounded-md p-2 mr-2 bg-base-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
            </div>
            <div className="flex items-center">
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle"
                >
                  <div className="indicator">
                    <Bell className="h-5 w-5" />
                    <span className="badge badge-sm badge-primary indicator-item">
                      3
                    </span>
                  </div>
                </div>
                <div
                  tabIndex={0}
                  className="mt-3 z-50 card card-compact dropdown-content w-64 bg-base-100 shadow"
                >
                  <div className="card-body">
                    <h3 className="font-bold text-lg">Thông báo</h3>
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="text-sm">
                          <p className="font-semibold">{notification.title}</p>
                          <p>{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {notification.time}
                          </p>
                          <div className="divider my-1"></div>
                        </div>
                      ))}
                    </div>
                    <div className="card-actions">
                      <button className="btn btn-primary btn-sm btn-block">
                        Xem tất cả
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="dropdown dropdown-end ml-4">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-10 rounded-full">
                    <img alt="Avatar" src="/api/placeholder/128/128" />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-50 p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a>Hồ sơ</a>
                  </li>
                  <li>
                    <a>Cài đặt</a>
                  </li>
                  <li>
                    <a>Đăng xuất</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-base-200 shadow-lg">
            <ul className="menu p-4">
              <li>
                <a
                  href="#"
                  className="flex items-center p-2 rounded-lg bg-primary text-white"
                >
                  <BarChart4 className="w-5 h-5 mr-2" />
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 rounded-lg">
                  <User className="w-5 h-5 mr-2" />
                  <span>Nhân viên</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 rounded-lg">
                  <Building2 className="w-5 h-5 mr-2" />
                  <span>Phòng ban</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 rounded-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>Chấm công</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 rounded-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Nghỉ phép</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center p-2 rounded-lg">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>Lương thưởng</span>
                </a>
              </li>
            </ul>
          </div>
        )}

        {/* Main Dashboard Content */}
        <main className="flex-grow p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="card bg-white shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Tổng nhân viên</p>
                    <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <UserCheck className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Nhân viên đang làm việc
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.activeEmployees}
                    </p>
                  </div>
                  <div className="bg-success/10 p-3 rounded-full">
                    <User className="w-6 h-6 text-success" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Đơn nghỉ chờ duyệt</p>
                    <p className="text-2xl font-bold">{stats.pendingLeaves}</p>
                  </div>
                  <div className="bg-warning/10 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Số phòng ban</p>
                    <p className="text-2xl font-bold">
                      {stats.departmentsCount}
                    </p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <Building2 className="w-6 h-6 text-secondary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Chấm công hôm nay</p>
                    <p className="text-2xl font-bold">
                      {stats.attendanceToday}%
                    </p>
                  </div>
                  <div className="bg-info/10 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-info" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leave Requests Table */}
            <div className="lg:col-span-2 card bg-white shadow-md overflow-hidden">
              <div className="card-body p-0">
                <div className="p-4 border-b">
                  <h2 className="card-title text-lg">Đơn xin nghỉ gần đây</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Nhân viên</th>
                        <th>Loại nghỉ phép</th>
                        <th>Ngày bắt đầu</th>
                        <th>Ngày kết thúc</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLeaveRequests.map((leave) => (
                        <tr key={leave.id}>
                          <td>{leave.employee}</td>
                          <td>{formatLeaveType(leave.type)}</td>
                          <td>{leave.startDate}</td>
                          <td>{leave.endDate}</td>
                          <td>
                            <span className={getStatusClass(leave.status)}>
                              {formatLeaveStatus(leave.status)}
                            </span>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <button className="btn btn-xs btn-outline btn-info">
                                Chi tiết
                              </button>
                              {leave.status === "PENDING" && (
                                <>
                                  <button className="btn btn-xs btn-outline btn-success">
                                    Duyệt
                                  </button>
                                  <button className="btn btn-xs btn-outline btn-error">
                                    Từ chối
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-actions p-4 justify-end">
                  <button className="btn btn-primary btn-sm">Xem tất cả</button>
                </div>
              </div>
            </div>

            {/* Today's Attendance */}
            <div className="card bg-white shadow-md overflow-hidden">
              <div className="card-body p-0">
                <div className="p-4 border-b">
                  <h2 className="card-title text-lg">Chấm công hôm nay</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Nhân viên</th>
                        <th>Phòng ban</th>
                        <th>Giờ vào</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAttendance.map((attendance) => (
                        <tr key={attendance.id}>
                          <td>{attendance.employee}</td>
                          <td>{attendance.department}</td>
                          <td>{attendance.clockIn}</td>
                          <td>
                            <span
                              className={getAttendanceStatusClass(
                                attendance.status
                              )}
                            >
                              {attendance.status === "on-time"
                                ? "Đúng giờ"
                                : attendance.status === "late"
                                ? "Muộn"
                                : "Vắng mặt"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-actions p-4 justify-end">
                  <button className="btn btn-primary btn-sm">Xem tất cả</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities and Calendar Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Activities */}
            <div className="card bg-white shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Hoạt động gần đây</h2>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Nguyễn Văn A đã cập nhật thông tin cá nhân
                      </p>
                      <p className="text-sm text-gray-500">Hôm nay, 10:30</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="bg-success/10 p-2 rounded-full mr-3">
                      <FileText className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Báo cáo nhân sự tháng 5 đã được tạo
                      </p>
                      <p className="text-sm text-gray-500">Hôm nay, 09:15</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="bg-warning/10 p-2 rounded-full mr-3">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium">Trần Thị B đã đến muộn</p>
                      <p className="text-sm text-gray-500">Hôm nay, 08:30</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="bg-info/10 p-2 rounded-full mr-3">
                      <Calendar className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Lê Văn C đã yêu cầu nghỉ phép
                      </p>
                      <p className="text-sm text-gray-500">Hôm qua, 15:45</p>
                    </div>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-ghost btn-sm">Xem tất cả</button>
                </div>
              </div>
            </div>

            {/* Quick Access / Upcoming Calendar */}
            <div className="card bg-white shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Sự kiện sắp tới</h2>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-base-100 rounded-lg">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Họp phòng ban</p>
                      <p className="text-sm text-gray-500">19/05/2025, 10:00</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-base-100 rounded-lg">
                    <div className="bg-success/10 p-2 rounded-full mr-3">
                      <Briefcase className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Đào tạo nhân viên mới</p>
                      <p className="text-sm text-gray-500">21/05/2025, 14:00</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-base-100 rounded-lg">
                    <div className="bg-info/10 p-2 rounded-full mr-3">
                      <DollarSign className="w-5 h-5 text-info" />
                    </div>
                    <div>
                      <p className="font-medium">Thanh toán lương</p>
                      <p className="text-sm text-gray-500">30/05/2025</p>
                    </div>
                  </div>
                </div>

                <div className="divider my-4">Truy cập nhanh</div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="btn btn-outline btn-primary">
                    <User className="w-4 h-4 mr-2" /> Thêm nhân viên
                  </button>
                  <button className="btn btn-outline btn-primary">
                    <Calendar className="w-4 h-4 mr-2" /> Tạo đơn nghỉ
                  </button>
                  <button className="btn btn-outline btn-primary">
                    <Clock className="w-4 h-4 mr-2" /> Chấm công
                  </button>
                  <button className="btn btn-outline btn-primary">
                    <FileText className="w-4 h-4 mr-2" /> Báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white p-4 shadow-inner mt-auto">
          <div className="text-center text-gray-500 text-sm">
            &copy; 2025 HR Management System. Bản quyền thuộc về công ty của
            bạn.
          </div>
        </footer>
      </div>
    </div>
  );
}
