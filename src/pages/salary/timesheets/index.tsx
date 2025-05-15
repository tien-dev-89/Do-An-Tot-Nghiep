import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DownloadCloud,
  CalendarCheck,
  ArrowUpDown,
} from "lucide-react";

// Định nghĩa các kiểu dữ liệu dựa trên cơ sở dữ liệu
interface AttendanceRecord {
  attendance_id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  clock_in_time: string;
  clock_out_time: string;
  shift_id: string | null;
  shift_name?: string;
  late_minutes: number;
  early_leave_minutes: number;
  overtime_hours: number;
  created_at: string;
  updated_at: string;
  status?: "Đúng giờ" | "Đi muộn" | "Về sớm" | "Đi muộn và về sớm" | "Vắng mặt";
}

interface Employee {
  employee_id: string;
  full_name: string;
  department_id: string;
  department_name?: string;
}

interface Shift {
  shift_id: string;
  name: string;
  start_time: string;
  end_time: string;
}

// Dữ liệu mẫu cho demo
const mockEmployees: Employee[] = [
  {
    employee_id: "E001",
    full_name: "Nguyễn Văn A",
    department_id: "D001",
    department_name: "Kỹ thuật",
  },
  {
    employee_id: "E002",
    full_name: "Trần Thị B",
    department_id: "D002",
    department_name: "Nhân sự",
  },
  {
    employee_id: "E003",
    full_name: "Lê Văn C",
    department_id: "D001",
    department_name: "Kỹ thuật",
  },
  {
    employee_id: "E004",
    full_name: "Phạm Thị D",
    department_id: "D003",
    department_name: "Kinh doanh",
  },
  {
    employee_id: "E005",
    full_name: "Hoàng Văn E",
    department_id: "D003",
    department_name: "Kinh doanh",
  },
];

const mockShifts: Shift[] = [
  { shift_id: "S001", name: "Ca sáng", start_time: "08:00", end_time: "12:00" },
  {
    shift_id: "S002",
    name: "Ca chiều",
    start_time: "13:00",
    end_time: "17:00",
  },
  { shift_id: "S003", name: "Ca đêm", start_time: "18:00", end_time: "22:00" },
  {
    shift_id: "S004",
    name: "Ca hành chính",
    start_time: "08:00",
    end_time: "17:00",
  },
];

// Tạo dữ liệu mẫu cho bảng chấm công
const generateMockAttendanceData = (): AttendanceRecord[] => {
  const currentDate = new Date();
  const records: AttendanceRecord[] = [];

  // Tạo bản ghi cho 30 ngày gần đây
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(currentDate.getDate() - i);

    // Thêm bản ghi cho mỗi nhân viên
    mockEmployees.forEach((employee) => {
      // Bỏ qua ngày cuối tuần (thứ 7, chủ nhật)
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return;

      // Lấy random ca làm việc
      const shift = mockShifts[Math.floor(Math.random() * mockShifts.length)];

      // Tạo ngẫu nhiên thời gian vào và ra
      const isLate = Math.random() < 0.2; // 20% trường hợp đi muộn
      const isEarlyLeave = Math.random() < 0.2; // 20% trường hợp về sớm
      const isAbsent = Math.random() < 0.05; // 5% trường hợp vắng mặt

      if (isAbsent) {
        // Nếu vắng mặt, không có giờ vào/ra
        records.push({
          attendance_id: `A${Date.now()}${records.length}`,
          employee_id: employee.employee_id,
          employee_name: employee.full_name,
          date: date.toISOString().split("T")[0],
          clock_in_time: "",
          clock_out_time: "",
          shift_id: shift.shift_id,
          shift_name: shift.name,
          late_minutes: 0,
          early_leave_minutes: 0,
          overtime_hours: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: "Vắng mặt",
        });
        return;
      }

      // Tính thời gian vào và ra
      const lateMinutes = isLate ? Math.floor(Math.random() * 30) + 1 : 0;
      const earlyLeaveMinutes = isEarlyLeave
        ? Math.floor(Math.random() * 30) + 1
        : 0;

      // Tính giờ thực tế vào và ra
      const [shiftStartHour, shiftStartMinute] = shift.start_time
        .split(":")
        .map(Number);
      const [shiftEndHour, shiftEndMinute] = shift.end_time
        .split(":")
        .map(Number);

      const clockInHour =
        shiftStartHour + Math.floor((shiftStartMinute + lateMinutes) / 60);
      const clockInMinute = (shiftStartMinute + lateMinutes) % 60;

      const clockOutHour =
        shiftEndHour - Math.floor((shiftEndMinute + earlyLeaveMinutes) / 60);
      const clockOutMinute = shiftEndMinute - earlyLeaveMinutes;

      // Format thời gian
      const clockInTime = `${String(clockInHour).padStart(2, "0")}:${String(
        clockInMinute
      ).padStart(2, "0")}`;
      const clockOutTime = `${String(clockOutHour).padStart(2, "0")}:${String(
        clockOutMinute
      ).padStart(2, "0")}`;

      // Tính giờ làm thêm (ngẫu nhiên)
      const overtimeHours =
        Math.random() < 0.1 ? parseFloat((Math.random() * 2).toFixed(2)) : 0;

      // Xác định trạng thái
      let status: AttendanceRecord["status"] = "Đúng giờ";
      if (isLate && isEarlyLeave) {
        status = "Đi muộn và về sớm";
      } else if (isLate) {
        status = "Đi muộn";
      } else if (isEarlyLeave) {
        status = "Về sớm";
      }

      records.push({
        attendance_id: `A${Date.now()}${records.length}`,
        employee_id: employee.employee_id,
        employee_name: employee.full_name,
        date: date.toISOString().split("T")[0],
        clock_in_time: clockInTime,
        clock_out_time: clockOutTime,
        shift_id: shift.shift_id,
        shift_name: shift.name,
        late_minutes: lateMinutes,
        early_leave_minutes: earlyLeaveMinutes,
        overtime_hours: overtimeHours,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status,
      });
    });
  }

  return records;
};

export default function TimeSheets() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AttendanceRecord | null;
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });

  // Tạo dữ liệu mẫu khi tải trang
  useEffect(() => {
    setIsLoading(true);
    // Giả lập tải dữ liệu từ API
    setTimeout(() => {
      const records = generateMockAttendanceData();
      setAttendanceRecords(records);
      setFilteredRecords(records);
      setIsLoading(false);
    }, 500);
  }, []);

  // Lọc dữ liệu khi thay đổi các điều kiện lọc
  useEffect(() => {
    let filtered = [...attendanceRecords];

    // Lọc theo tháng và năm
    filtered = filtered.filter((record) => {
      const date = new Date(record.date);
      return (
        date.getMonth() + 1 === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });

    // Lọc theo nhân viên
    if (selectedEmployee !== "all") {
      filtered = filtered.filter(
        (record) => record.employee_id === selectedEmployee
      );
    }

    // Lọc theo trạng thái
    if (selectedStatus !== "all") {
      filtered = filtered.filter((record) => record.status === selectedStatus);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.employee_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.date.includes(searchTerm) ||
          record.clock_in_time.includes(searchTerm) ||
          record.clock_out_time.includes(searchTerm) ||
          record.shift_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sắp xếp dữ liệu
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof AttendanceRecord];
        const bValue = b[sortConfig.key as keyof AttendanceRecord];

        if (aValue === null || aValue === undefined)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (bValue === null || bValue === undefined)
          return sortConfig.direction === "asc" ? 1 : -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortConfig.direction === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset về trang đầu tiên sau khi lọc
  }, [
    attendanceRecords,
    selectedMonth,
    selectedYear,
    selectedEmployee,
    selectedStatus,
    searchTerm,
    sortConfig,
  ]);

  // Xử lý thay đổi sắp xếp
  const handleSort = (key: keyof AttendanceRecord) => {
    setSortConfig({
      key: key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Tính toán phân trang
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Tạo mảng các tháng
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Tạo mảng các năm (từ năm hiện tại - 2 đến năm hiện tại + 1)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i);

  // Hiển thị trạng thái chấm công
  const renderStatus = (record: AttendanceRecord) => {
    switch (record.status) {
      case "Đúng giờ":
        return (
          <span className="badge badge-success gap-1">
            <CheckCircle className="w-3 h-3" />
            Đúng giờ
          </span>
        );
      case "Đi muộn":
        return (
          <span className="badge badge-warning gap-1">
            <AlertCircle className="w-3 h-3" />
            Đi muộn ({record.late_minutes} phút)
          </span>
        );
      case "Về sớm":
        return (
          <span className="badge badge-warning gap-1">
            <AlertCircle className="w-3 h-3" />
            Về sớm ({record.early_leave_minutes} phút)
          </span>
        );
      case "Đi muộn và về sớm":
        return (
          <span className="badge badge-error gap-1">
            <XCircle className="w-3 h-3" />
            Đi muộn và về sớm
          </span>
        );
      case "Vắng mặt":
        return (
          <span className="badge badge-error gap-1">
            <XCircle className="w-3 h-3" />
            Vắng mặt
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/salary/timesheets"}>Bảng chấm công</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md rounded-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Bảng Chấm Công
            </h1>
            <div className="flex space-x-2">
              <button className="btn btn-outline btn-primary flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                Xuất báo cáo
              </button>
              <button className="btn btn-primary flex items-center gap-2">
                <DownloadCloud className="w-4 h-4" />
                Tải xuống
              </button>
            </div>
          </div>
        </header>

        {/* Summary */}
        <div className="mt-6 p-4 bg-base-200 rounded-lg">
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Đúng giờ</div>
              <div className="stat-value text-primary">
                {filteredRecords.filter((r) => r.status === "Đúng giờ").length}
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-warning">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Đi muộn/Về sớm</div>
              <div className="stat-value text-warning">
                {
                  filteredRecords.filter(
                    (r) =>
                      r.status === "Đi muộn" ||
                      r.status === "Về sớm" ||
                      r.status === "Đi muộn và về sớm"
                  ).length
                }
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-error">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Vắng mặt</div>
              <div className="stat-value text-error">
                {filteredRecords.filter((r) => r.status === "Vắng mặt").length}
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-success">
                <Clock className="w-8 h-8" />
              </div>
              <div className="stat-title">Tổng giờ tăng ca</div>
              <div className="stat-value text-success">
                {filteredRecords
                  .reduce((sum, r) => sum + r.overtime_hours, 0)
                  .toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              {/* Filters */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="form-control">
                    <div className="input-group">
                      <select
                        className="select select-bordered"
                        value={selectedMonth}
                        onChange={(e) =>
                          setSelectedMonth(Number(e.target.value))
                        }
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            Tháng {month}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <div className="input-group">
                      <select
                        className="select select-bordered"
                        value={selectedYear}
                        onChange={(e) =>
                          setSelectedYear(Number(e.target.value))
                        }
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>
                            Năm {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <div className="input-group">
                      <select
                        className="select select-bordered"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                      >
                        <option value="all">Tất cả nhân viên</option>
                        {mockEmployees.map((employee) => (
                          <option
                            key={employee.employee_id}
                            value={employee.employee_id}
                          >
                            {employee.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-control">
                    <div className="input-group">
                      <select
                        className="select select-bordered"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Đúng giờ">Đúng giờ</option>
                        <option value="Đi muộn">Đi muộn</option>
                        <option value="Về sớm">Về sớm</option>
                        <option value="Đi muộn và về sớm">
                          Đi muộn và về sớm
                        </option>
                        <option value="Vắng mặt">Vắng mặt</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-control md:w-64">
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
                      type="search"
                      required
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              {/* Data table */}
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th
                        className="cursor-pointer"
                        onClick={() =>
                          handleSort("employee_name" as keyof AttendanceRecord)
                        }
                      >
                        <div className="flex items-center gap-1">
                          Nhân viên
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center gap-1">
                          Ngày
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() =>
                          handleSort("shift_name" as keyof AttendanceRecord)
                        }
                      >
                        <div className="flex items-center gap-1">
                          Ca làm việc
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("clock_in_time")}
                      >
                        <div className="flex items-center gap-1">
                          Giờ vào
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("clock_out_time")}
                      >
                        <div className="flex items-center gap-1">
                          Giờ ra
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("late_minutes")}
                      >
                        <div className="flex items-center gap-1">
                          Đi muộn
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("early_leave_minutes")}
                      >
                        <div className="flex items-center gap-1">
                          Về sớm
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() => handleSort("overtime_hours")}
                      >
                        <div className="flex items-center gap-1">
                          Tăng ca
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="cursor-pointer"
                        onClick={() =>
                          handleSort("status" as keyof AttendanceRecord)
                        }
                      >
                        <div className="flex items-center gap-1">
                          Trạng thái
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="text-center py-10">
                          <span className="loading loading-spinner loading-lg"></span>
                        </td>
                      </tr>
                    ) : currentRecords.length > 0 ? (
                      currentRecords.map((record) => (
                        <tr key={record.attendance_id}>
                          <td>{record.employee_name}</td>
                          <td>
                            {new Date(record.date).toLocaleDateString("vi-VN")}
                          </td>
                          <td>{record.shift_name}</td>
                          <td>{record.clock_in_time || "-"}</td>
                          <td>{record.clock_out_time || "-"}</td>
                          <td>
                            {record.late_minutes > 0
                              ? `${record.late_minutes} phút`
                              : "-"}
                          </td>
                          <td>
                            {record.early_leave_minutes > 0
                              ? `${record.early_leave_minutes} phút`
                              : "-"}
                          </td>
                          <td>
                            {record.overtime_hours > 0
                              ? `${record.overtime_hours} giờ`
                              : "-"}
                          </td>
                          <td>{renderStatus(record)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="text-center py-10">
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="join">
                    <button
                      className="join-item btn"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      «
                    </button>
                    <button
                      className="join-item btn"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Hiển thị 5 trang gần nhất với trang hiện tại
                        const min = Math.max(1, currentPage - 2);
                        const max = Math.min(totalPages, currentPage + 2);
                        return page >= min && page <= max;
                      })
                      .map((page) => (
                        <button
                          key={page}
                          className={`join-item btn ${
                            currentPage === page ? "btn-active" : ""
                          }`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ))}

                    <button
                      className="join-item btn"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      ›
                    </button>
                    <button
                      className="join-item btn"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
