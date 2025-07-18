import Link from "next/link";
import React, { useState, useEffect } from "react";
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
import Pagination from "@/components/Pagination";
import * as XLSX from "xlsx";

type PayrollStatus = "Đã nhận" | "Chưa nhận";

interface Department {
  department_id: string;
  name: string;
}

interface Payroll {
  payroll_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  position: string;
  month: string;
  base_salary: number;
  overtime_bonus: number;
  late_penalty: number;
  total_salary: number;
  status: PayrollStatus;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  payrolls: Payroll[];
  total: number;
  page: number;
  limit: number;
}

interface DepartmentsResponse {
  departments: Department[];
  total: number;
}

export default function Payroll() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getCurrentYearMonth()
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<PayrollStatus | "all">(
    "all"
  );
  const [sortColumn, setSortColumn] = useState<keyof Payroll>("employee_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

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

  function handleSort(column: keyof Payroll) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const handleExportExcel = () => {
    const exportData = payrolls.map((payroll, index) => ({
      STT: index + 1,
      "Nhân viên": payroll.employee_name,
      "Phòng ban": payroll.department,
      "Chức vụ": payroll.position,
      Tháng: payroll.month,
      "Lương cơ bản": payroll.base_salary,
      "Thưởng làm thêm": payroll.overtime_bonus,
      Phạt: payroll.late_penalty,
      "Tổng thực lãnh": payroll.total_salary,
      "Trạng thái": payroll.status,
      "Ngày tạo": new Date(payroll.created_at).toLocaleDateString("vi-VN"),
      "Ngày cập nhật": new Date(payroll.updated_at).toLocaleDateString("vi-VN"),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bảng lương");
    XLSX.writeFile(workbook, `Bang_luong_${selectedMonth}.xlsx`);
  };

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Không thể lấy danh sách phòng ban");
        }
        const data = (await response.json()) as DepartmentsResponse;
        setDepartments(data.departments);
      } catch (err) {
        setError("Lỗi khi tải danh sách phòng ban");
        console.error(err);
      }
    }
    fetchDepartments();
  }, []);

  useEffect(() => {
    async function fetchPayrolls() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          month: selectedMonth,
          ...(selectedDepartment !== "all" && {
            department: selectedDepartment,
          }),
          ...(selectedStatus !== "all" && { status: selectedStatus }),
          ...(searchQuery && { search: searchQuery }),
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });
        const response = await fetch(`/api/payrolls?${queryParams}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Không thể lấy danh sách bảng lương");
        }
        const data = (await response.json()) as ApiResponse;
        const sortedPayrolls = data.payrolls.sort((a, b) => {
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
        setPayrolls(sortedPayrolls);
        setTotalItems(data.total);
        setError(null);
      } catch (err) {
        setError("Lỗi khi tải danh sách bảng lương");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayrolls();
  }, [
    selectedMonth,
    selectedDepartment,
    selectedStatus,
    searchQuery,
    currentPage,
    sortColumn,
    sortDirection,
  ]);

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
            <Link href={"/employees"} className="text-primary">
              Employees
            </Link>
          </li>
        </ul>
      </div>

      <div className="flex flex-col min-h-screen bg-base-200">
        <header className="bg-base-100 shadow-md rounded-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">Bảng Lương</h1>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleExportExcel}>
                <Download size={18} />
                Xuất Excel
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6">
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Tổng số nhân viên</div>
              <div className="text-2xl font-semibold">{totalItems}</div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Đã nhận lương</div>
              <div className="text-2xl font-semibold text-success">
                {payrolls.filter((p) => p.status === "Đã nhận").length}
              </div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Chưa nhận lương</div>
              <div className="text-2xl font-semibold text-warning">
                {payrolls.filter((p) => p.status === "Chưa nhận").length}
              </div>
            </div>
          </div>

          <div className="bg-base-100 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
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
                      <button onClick={() => setSelectedMonth("2025-07")}>
                        2025-07
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedMonth("2025-06")}>
                        2025-06
                      </button>
                    </li>
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
                  </ul>
                </div>

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
                      <li key={dept.department_id}>
                        <button
                          onClick={() => setSelectedDepartment(dept.name)}
                        >
                          {dept.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

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

          <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8">
                <p className="text-error">{error}</p>
                <button
                  className="btn btn-sm btn-outline mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDepartment("all");
                    setSelectedStatus("all");
                    setSelectedMonth(getCurrentYearMonth());
                    setCurrentPage(1);
                  }}
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <>
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
                    {payrolls.length > 0 ? (
                      payrolls.map((payroll, index) => (
                        <tr key={payroll.payroll_id}>
                          <td>
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
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
                                  ? "text-success"
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
                                setSelectedMonth(getCurrentYearMonth());
                                setCurrentPage(1);
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
                <div className="pb-5 pl-5 pr-5">
                  {payrolls.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalItems / itemsPerPage)}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
