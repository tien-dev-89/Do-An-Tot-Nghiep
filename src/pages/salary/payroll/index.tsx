import Link from "next/link";
import React, { useState } from "react";
import {
  Search,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  X,
  Check,
  ArrowUpDown,
} from "lucide-react";

// Define types based on database schema
type PayrollStatus = "Đã nhận" | "Chưa nhận";

interface Payroll {
  payroll_id: string;
  employee_id: string;
  employee_name: string; // Joined from employee table
  department: string; // Joined from department table
  position: string; // Joined from position table
  month: string;
  base_salary: number;
  overtime_bonus: number;
  late_penalty: number;
  total_salary: number;
  status: PayrollStatus;
  created_at: string;
  updated_at: string;
}

export default function Payroll() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getCurrentYearMonth()
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("employee_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Mock data for demonstration
  const departments = [
    { id: "dept1", name: "Kỹ thuật" },
    { id: "dept2", name: "Nhân sự" },
    { id: "dept3", name: "Kế toán" },
    { id: "dept4", name: "Marketing" },
  ];

  const mockPayrolls: Payroll[] = [
    {
      payroll_id: "p1",
      employee_id: "e1",
      employee_name: "Nguyễn Văn A",
      department: "Kỹ thuật",
      position: "Lập trình viên",
      month: "2025-05",
      base_salary: 15000000,
      overtime_bonus: 1500000,
      late_penalty: 0,
      total_salary: 16500000,
      status: "Đã nhận",
      created_at: "2025-05-01T08:00:00Z",
      updated_at: "2025-05-05T10:30:00Z",
    },
    {
      payroll_id: "p2",
      employee_id: "e2",
      employee_name: "Trần Thị B",
      department: "Nhân sự",
      position: "Trưởng phòng",
      month: "2025-05",
      base_salary: 20000000,
      overtime_bonus: 0,
      late_penalty: 500000,
      total_salary: 19500000,
      status: "Đã nhận",
      created_at: "2025-05-01T08:00:00Z",
      updated_at: "2025-05-05T10:30:00Z",
    },
    {
      payroll_id: "p3",
      employee_id: "e3",
      employee_name: "Lê Văn C",
      department: "Kế toán",
      position: "Kế toán viên",
      month: "2025-05",
      base_salary: 12000000,
      overtime_bonus: 800000,
      late_penalty: 200000,
      total_salary: 12600000,
      status: "Chưa nhận",
      created_at: "2025-05-01T08:00:00Z",
      updated_at: "2025-05-01T08:00:00Z",
    },
    {
      payroll_id: "p4",
      employee_id: "e4",
      employee_name: "Phạm Thị D",
      department: "Marketing",
      position: "Chuyên viên",
      month: "2025-05",
      base_salary: 13000000,
      overtime_bonus: 1000000,
      late_penalty: 0,
      total_salary: 14000000,
      status: "Chưa nhận",
      created_at: "2025-05-01T08:00:00Z",
      updated_at: "2025-05-01T08:00:00Z",
    },
    {
      payroll_id: "p5",
      employee_id: "e5",
      employee_name: "Hoàng Văn E",
      department: "Kỹ thuật",
      position: "QA Engineer",
      month: "2025-05",
      base_salary: 14000000,
      overtime_bonus: 1200000,
      late_penalty: 300000,
      total_salary: 14900000,
      status: "Chưa nhận",
      created_at: "2025-05-01T08:00:00Z",
      updated_at: "2025-05-01T08:00:00Z",
    },
  ];

  // Helper functions
  function getCurrentYearMonth() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  // Filter and sort payrolls
  const filteredPayrolls = mockPayrolls
    .filter((payroll) => {
      const matchesSearch = payroll.employee_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDepartment =
        selectedDepartment === "all" ||
        payroll.department === selectedDepartment;
      const matchesStatus =
        selectedStatus === "all" || payroll.status === selectedStatus;
      const matchesMonth = payroll.month === selectedMonth;

      return (
        matchesSearch && matchesDepartment && matchesStatus && matchesMonth
      );
    })
    .sort((a, b) => {
      if (sortColumn === "employee_name") {
        return sortDirection === "asc"
          ? a.employee_name.localeCompare(b.employee_name)
          : b.employee_name.localeCompare(a.employee_name);
      } else if (sortColumn === "base_salary") {
        return sortDirection === "asc"
          ? a.base_salary - b.base_salary
          : b.base_salary - a.base_salary;
      } else if (sortColumn === "total_salary") {
        return sortDirection === "asc"
          ? a.total_salary - b.total_salary
          : b.total_salary - a.total_salary;
      }
      return 0;
    });

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/employees"}>Employees</Link>
          </li>
        </ul>
      </div>

      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md rounded-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">Bảng Lương</h1>
            <div className="flex gap-2">
              <button className="btn btn-primary">
                <Download size={18} />
                Xuất Excel
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Tổng số nhân viên</div>
              <div className="text-2xl font-semibold">
                {filteredPayrolls.length}
              </div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Đã nhận lương</div>
              <div className="text-2xl font-semibold text-success">
                {filteredPayrolls.filter((p) => p.status === "Đã nhận").length}
              </div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Chưa nhận lương</div>
              <div className="text-2xl font-semibold text-warning">
                {
                  filteredPayrolls.filter((p) => p.status === "Chưa nhận")
                    .length
                }
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-base-100 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="flex flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên nhân viên..."
                  className="input input-bordered w-full pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  className="absolute right-3 top-3 text-gray-400"
                  size={20}
                />
              </div>

              {/* Month picker */}
              <div className="flex items-center gap-2">
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline flex gap-2">
                    <Calendar size={18} />
                    <span>{selectedMonth}</span>
                    <ChevronDown size={16} />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button onClick={() => setSelectedMonth("2025-05")}>
                        2025-05
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedMonth("2025-04")}>
                        2025-04
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedMonth("2025-03")}>
                        2025-03
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedMonth("2025-02")}>
                        2025-02
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedMonth("2025-01")}>
                        2025-01
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Department filter */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline flex gap-2">
                    <Filter size={18} />
                    <span>
                      {selectedDepartment === "all"
                        ? "Tất cả phòng ban"
                        : selectedDepartment}
                    </span>
                    <ChevronDown size={16} />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button onClick={() => setSelectedDepartment("all")}>
                        Tất cả phòng ban
                      </button>
                    </li>
                    {departments.map((dept) => (
                      <li key={dept.id}>
                        <button
                          onClick={() => setSelectedDepartment(dept.name)}
                        >
                          {dept.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status filter */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline flex gap-2">
                    <span>
                      {selectedStatus === "all"
                        ? "Tất cả trạng thái"
                        : selectedStatus}
                    </span>
                    <ChevronDown size={16} />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button onClick={() => setSelectedStatus("all")}>
                        Tất cả trạng thái
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedStatus("Đã nhận")}>
                        Đã nhận
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedStatus("Chưa nhận")}>
                        Chưa nhận
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>STT</th>
                  <th
                    onClick={() => handleSort("employee_name")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      Nhân viên
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th
                    onClick={() => handleSort("base_salary")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      Lương cơ bản
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th>Thưởng làm thêm</th>
                  <th>Phạt</th>
                  <th
                    onClick={() => handleSort("total_salary")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      Tổng thực lãnh
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th className="w-29">Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.length > 0 ? (
                  filteredPayrolls.map((payroll, index) => (
                    <tr key={payroll.payroll_id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="font-medium">
                          {payroll.employee_name}
                        </div>
                      </td>
                      <td>{payroll.department}</td>
                      <td>{payroll.position}</td>
                      <td>{formatCurrency(payroll.base_salary)}</td>
                      <td>{formatCurrency(payroll.overtime_bonus)}</td>
                      <td className="text-error">
                        {formatCurrency(payroll.late_penalty)}
                      </td>
                      <td className="font-semibold">
                        {formatCurrency(payroll.total_salary)}
                      </td>
                      <td>
                        <div
                          className={`text flex ${
                            payroll.status === "Đã nhận"
                              ? // ? "badge-success"
                                "text-success"
                              : "text-warning"
                          } gap-1`}
                        >
                          {payroll.status === "Đã nhận" ? (
                            <Check size={12} />
                          ) : (
                            <X size={12} />
                          )}
                          {payroll.status}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            href={`/salary/payroll/${payroll.payroll_id}`}
                            className="btn btn-sm btn-outline"
                          >
                            Chi tiết
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-gray-500 mb-2">
                          Không tìm thấy dữ liệu phù hợp
                        </p>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedDepartment("all");
                            setSelectedStatus("all");
                          }}
                        >
                          Xóa bộ lọc
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
