import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  PlusCircle,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import ManualAttendanceModal from "@/components/modals/ManualAttendanceModal";
import EditAttendanceModal from "./EditAttendanceModal";
import { DeleteAttendanceModal } from "./DeleteAttendanceModal"; // Thêm import
import { AttendanceRecord, Employee, Shift } from "@/types/salary";

interface AttendanceResponse {
  attendanceRecords: (AttendanceRecord & {
    employee_name: string | null;
    shift_name: string | null;
    status: string;
  })[];
  total: number;
  stats: {
    all: number;
    onTime: number;
    late: number;
    earlyLeave: number;
    lateAndEarly: number;
    absent: number;
  };
}

interface EmployeesResponse {
  employees: Employee[];
  total: number;
}

const fetchWithAuth = async (url: string, token: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `x ${token}` },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export default function TimeSheets() {
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceResponse["attendanceRecords"]
  >([]);
  const [filteredRecords, setFilteredRecords] = useState<
    AttendanceResponse["attendanceRecords"]
  >([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [isManualAttendanceOpen, setIsManualAttendanceOpen] = useState(false);
  const [isEditAttendanceOpen, setIsEditAttendanceOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [isDeleteAttendanceOpen, setIsDeleteAttendanceOpen] = useState(false); // Thêm state cho modal xóa
  const [attendanceToDelete, setAttendanceToDelete] =
    useState<AttendanceRecord | null>(null); // Bản ghi cần xóa
  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState<AttendanceResponse["stats"]>({
    all: 0,
    onTime: 0,
    late: 0,
    earlyLeave: 0,
    lateAndEarly: 0,
    absent: 0,
  });

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AttendanceRecord | "employee_name" | "shift_name" | "status";
    direction: "asc" | "desc";
  }>({ key: "date", direction: "desc" });

  // Token xác thực
  const TOKEN = localStorage.getItem("authToken") || "your-token-from-seed";

  // Lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const employeesData: EmployeesResponse = await fetchWithAuth(
          "/api/employees?page=1&limit=100",
          TOKEN
        );
        setEmployees(employeesData.employees);

        const shiftsData = await fetchWithAuth(
          "/api/shifts?page=1&limit=100",
          TOKEN
        );
        setShifts(shiftsData.shifts || []);

        const attendanceData: AttendanceResponse = await fetchWithAuth(
          `/api/attendance?page=1&limit=100&search=${encodeURIComponent(
            searchTerm
          )}&shift_id=${selectedShift !== "all" ? selectedShift : ""}&status=${
            selectedStatus !== "all" ? selectedStatus : ""
          }&dateFrom=${selectedDate}`,
          TOKEN
        );
        setAttendanceRecords(attendanceData.attendanceRecords);
        setFilteredRecords(attendanceData.attendanceRecords);
        setTotalRecords(attendanceData.total);
        setStats(attendanceData.stats);
      } catch (error: unknown) {
        console.error(
          "Lỗi khi lấy dữ liệu:",
          error instanceof Error ? error.message : "Unknown error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, selectedShift, selectedStatus, selectedDate]);

  // Xử lý chấm công thủ công
  const handleManualAttendanceSubmit = useCallback(
    async (data: {
      employee_id: string;
      date: string;
      clock_in_time: string;
      clock_out_time: string;
      shift_id: string;
    }) => {
      try {
        const response = await fetch("/api/attendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `x ${TOKEN}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newRecord = await response.json();
        setAttendanceRecords((prev) => [...prev, newRecord]);
        setFilteredRecords((prev) => [...prev, newRecord]);
        setTotalRecords((prev) => prev + 1);

        // Tự động chuyển trang nếu số bản ghi trên trang hiện tại vượt quá 10
        const newTotalRecords = totalRecords + 1;
        const newPage = Math.ceil(newTotalRecords / recordsPerPage);
        setCurrentPage(newPage);
      } catch (error: unknown) {
        console.error(
          "Lỗi khi tạo bản ghi chấm công:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    [totalRecords, recordsPerPage]
  );

  // Xử lý chỉnh sửa bản ghi
  const handleEditAttendanceSubmit = useCallback(
    async (data: {
      attendance_id: string;
      employee_id: string;
      date: string;
      clock_in_time: string;
      clock_out_time: string;
      shift_id: string;
    }) => {
      try {
        const response = await fetch(`/api/attendance`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `x ${TOKEN}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedRecord = await response.json();
        setAttendanceRecords((prev) =>
          prev.map((record) =>
            record.attendance_id === updatedRecord.attendance_id
              ? updatedRecord
              : record
          )
        );
        setFilteredRecords((prev) =>
          prev.map((record) =>
            record.attendance_id === updatedRecord.attendance_id
              ? updatedRecord
              : record
          )
        );
        setIsEditAttendanceOpen(false);
        setSelectedRecord(null);
      } catch (error: unknown) {
        console.error(
          "Lỗi khi cập nhật bản ghi chấm công:",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    []
  );

  // Xử lý xóa bản ghi
  const handleDelete = async (attendance_id: string) => {
    try {
      const response = await fetch("/api/attendance", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${TOKEN}`,
        },
        body: JSON.stringify({ attendance_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAttendanceRecords((prev) =>
        prev.filter((record) => record.attendance_id !== attendance_id)
      );
      setFilteredRecords((prev) =>
        prev.filter((record) => record.attendance_id !== attendance_id)
      );
      setTotalRecords((prev) => prev - 1);
    } catch (error: unknown) {
      console.error(
        "Lỗi khi xóa bản ghi chấm công:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  // Xử lý sắp xếp dữ liệu
  useEffect(() => {
    const filtered = [...attendanceRecords];

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
    setCurrentPage(1);
  }, [attendanceRecords, sortConfig]);

  // Xử lý thay đổi sắp xếp
  const handleSort = (
    key: keyof AttendanceRecord | "employee_name" | "shift_name" | "status"
  ) => {
    setSortConfig({
      key,
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
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  // Hàm định dạng giờ
  const formatTime = (time: string | null | undefined) => {
    if (!time) return "-";
    try {
      return format(new Date(time), "HH:mm");
    } catch {
      return "-";
    }
  };

  // Hiển thị trạng thái chấm công
  const renderStatus = (record: AttendanceRecord & { status: string }) => {
    const baseClasses =
      "badge badge-sm font-semibold text-center px-2 py-5 transition-all duration-200 hover:shadow-md hover:scale-105";
    switch (record.status) {
      case "Đúng giờ":
        return (
          <span
            className={`${baseClasses} badge-success bg-green-500 text-white border-green-600`}
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Đúng giờ
          </span>
        );
      case "Đi muộn":
        return (
          <span
            className={`${baseClasses} badge-warning bg-yellow-500 text-white border-yellow-600`}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Đi muộn
          </span>
        );
      case "Về sớm":
        return (
          <span
            className={`${baseClasses} badge-warning bg-orange-500 text-white border-orange-600`}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            Về sớm
          </span>
        );
      case "Đi muộn và về sớm":
        return (
          <span
            className={`${baseClasses} badge-error bg-red-500 text-white border-red-600`}
          >
            <XCircle className="w-3 h-3 mr-1" />
            Muộn & Về sớm
          </span>
        );
      case "Vắng mặt":
        return (
          <span
            className={`${baseClasses} badge-error bg-gray-600 text-white border-gray-700`}
          >
            <XCircle className="w-3 h-3 mr-1" />
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
            <Link href={"/"} className="text-primary">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href={"/salary/timesheets"} className="text-primary">
              Bảng chấm công
            </Link>
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
              <button
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setIsManualAttendanceOpen(true)}
              >
                <PlusCircle className="w-4 h-4" />
                Chấm công thủ công
              </button>
            </div>
          </div>
        </header>

        {/* Modal chấm công thủ công */}
        <ManualAttendanceModal
          isOpen={isManualAttendanceOpen}
          onClose={() => setIsManualAttendanceOpen(false)}
          onSubmit={handleManualAttendanceSubmit}
          employees={employees}
          shifts={shifts}
        />

        {/* Modal chỉnh sửa bản ghi */}
        <EditAttendanceModal
          isOpen={isEditAttendanceOpen}
          onClose={() => {
            setIsEditAttendanceOpen(false);
            setSelectedRecord(null);
          }}
          onSubmit={handleEditAttendanceSubmit}
          employees={employees}
          shifts={shifts}
          currentRecord={selectedRecord}
        />

        {/* Modal xác nhận xóa */}
        <DeleteAttendanceModal
          isOpen={isDeleteAttendanceOpen}
          attendanceToDelete={attendanceToDelete}
          onClose={() => {
            setIsDeleteAttendanceOpen(false);
            setAttendanceToDelete(null);
          }}
          onConfirm={handleDelete}
        />

        {/* Summary */}
        <div className="mt-6 p-4 bg-base-200 rounded-lg">
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Đúng giờ</div>
              <div className="stat-value text-primary">{stats.onTime}</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-warning">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Đi muộn/Về sớm</div>
              <div className="stat-value text-warning">
                {stats.late + stats.earlyLeave + stats.lateAndEarly}
              </div>
            </div>

            <div className="stat">
              <div className="stat-figure text-error">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="stat-title">Vắng mặt</div>
              <div className="stat-value text-error">{stats.absent}</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-success">
                <Clock className="w-8 h-8" />
              </div>
              <div className="stat-title">Tổng giờ tăng ca</div>
              <div className="stat-value text-success">
                {filteredRecords.length > 0
                  ? filteredRecords
                      .reduce(
                        (sum, r) =>
                          sum +
                          (typeof r.overtime_hours === "number" &&
                          !isNaN(r.overtime_hours)
                            ? r.overtime_hours
                            : 0),
                        0
                      )
                      .toFixed(1)
                  : "0.0"}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-5">
          <div className="card bg-base-100 shadow-md">
            <div className="card-body">
              {/* Filters */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="form-control">
                    <div className="input-group">
                      <input
                        type="date"
                        className="input input-bordered"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <div className="input-group">
                      <select
                        className="select select-bordered"
                        value={selectedShift}
                        onChange={(e) => setSelectedShift(e.target.value)}
                      >
                        <option value="all">Tất cả ca làm việc</option>
                        {shifts.map((shift) => (
                          <option key={shift.shift_id} value={shift.shift_id}>
                            {shift.name}
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
                        onClick={() => handleSort("employee_name")}
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
                        onClick={() => handleSort("shift_name")}
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
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center gap-1">
                          Trạng thái
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={10} className="text-center py-10">
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
                          <td>{formatTime(record.clock_in_time)}</td>
                          <td>{formatTime(record.clock_out_time)}</td>
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
                          <td className="grid">
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsEditAttendanceOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setAttendanceToDelete(record);
                                setIsDeleteAttendanceOpen(true);
                              }}
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="text-center py-10">
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
