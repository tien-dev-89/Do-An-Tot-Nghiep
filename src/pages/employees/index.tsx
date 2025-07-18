import Pagination from "@/components/Pagination";
import React, { useState, useEffect } from "react";
import DetailEmployee from "./detail-employee";
import AddEmployee from "./add-employee";
import Image from "next/image";
import Link from "next/link";
import { Filter, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import router from "next/router";

type Gender = "Nam" | "Nữ";
type EmploymentStatus = "Đang làm" | "Thử việc" | "Nghỉ việc" | "Nghỉ thai sản";

interface ApiEmployee {
  employee_id: string;
  avatar_url: string | null;
  full_name: string;
  email: string;
  phone_number: string | null;
  birth_date: string | null;
  gender: "MALE" | "FEMALE" | null;
  address: string | null;
  department_id: string | null;
  department_name: string | null;
  position_id: string | null;
  position_name: string | null;
  employment_status: "ACTIVE" | "PROBATION" | "TERMINATED" | "MATERNITY_LEAVE";
  join_date: string | null;
  leave_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Employee {
  employee_id: string;
  avatar_url: string | null;
  full_name: string;
  email: string;
  phone_number: string;
  birth_date: string;
  gender: Gender;
  address: string;
  department_id: string;
  department_name: string;
  position_id: string;
  position_name: string;
  employment_status: EmploymentStatus;
  join_date: string;
  leave_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Department {
  department_id: string;
  name: string;
}

interface Position {
  position_id: string;
  name: string;
}

const Index: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedItem, setSelectedItem] = useState<Employee | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(3);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    gender: "",
    department_id: "",
    position_id: "",
    joinDateFrom: "",
    joinDateTo: "",
    search: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false); // Thêm trạng thái loading cho chi tiết

  const formatDateToDisplay = (date: string | null): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatDateForAPI = (date: string): string => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  };

  const fetchEmployees = async (page: number = currentPage) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const apiFilters = {
        ...filters,
        status:
          filters.status === "Đang làm"
            ? "ACTIVE"
            : filters.status === "Thử việc"
            ? "PROBATION"
            : filters.status === "Nghỉ việc"
            ? "TERMINATED"
            : filters.status === "Nghỉ thai sản"
            ? "MATERNITY_LEAVE"
            : "",
        gender:
          filters.gender === "Nam"
            ? "MALE"
            : filters.gender === "Nữ"
            ? "FEMALE"
            : "",
        joinDateFrom: filters.joinDateFrom
          ? formatDateForAPI(filters.joinDateFrom)
          : "",
        joinDateTo: filters.joinDateTo
          ? formatDateForAPI(filters.joinDateTo)
          : "",
      };

      const filteredApiFilters = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(apiFilters).filter(([_, v]) => v !== "")
      );

      const query = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...filteredApiFilters,
      }).toString();

      const response = await fetch(`/api/employees?${query}`, {
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = "/login";
          return;
        }
        throw new Error("Lỗi khi lấy danh sách nhân viên");
      }

      const data: {
        employees: ApiEmployee[];
        total: number;
        stats: {
          all: number;
          active: number;
          probation: number;
          maternity: number;
          leave: number;
        };
      } = await response.json();

      const mappedEmployees: Employee[] = data.employees.map((emp) => ({
        employee_id: emp.employee_id,
        avatar_url: emp.avatar_url,
        full_name: emp.full_name,
        email: emp.email,
        phone_number: emp.phone_number ?? "",
        birth_date: emp.birth_date ?? "",
        gender:
          emp.gender === "MALE"
            ? "Nam"
            : emp.gender === "FEMALE"
            ? "Nữ"
            : "Nam",
        address: emp.address ?? "",
        department_id: emp.department_id ?? "",
        department_name: emp.department_name ?? "",
        position_id: emp.position_id ?? "",
        position_name: emp.position_name ?? "",
        employment_status:
          emp.employment_status === "ACTIVE"
            ? "Đang làm"
            : emp.employment_status === "PROBATION"
            ? "Thử việc"
            : emp.employment_status === "TERMINATED"
            ? "Nghỉ việc"
            : "Nghỉ thai sản",
        join_date: emp.join_date ?? "",
        leave_date: emp.leave_date,
        created_at: emp.created_at,
        updated_at: emp.updated_at,
      }));

      setEmployees(mappedEmployees);
      setTotalItems(data.total);
      // statusCounts(data.stats); // Cập nhật số liệu tổng quan
      setCurrentPage(page);

      if (selectedItem) {
        const updatedEmployee = mappedEmployees.find(
          (emp) => emp.employee_id === selectedItem.employee_id
        );
        if (updatedEmployee) {
          setSelectedItem(updatedEmployee);
          setEmployeeDetail(updatedEmployee);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      toast.error(
        error instanceof Error
          ? error.message || "Không thể tải danh sách nhân viên"
          : "Không thể tải danh sách nhân viên"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetail = async (employeeId: string) => {
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const response = await fetch(`/api/employees/${employeeId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Lỗi khi lấy chi tiết nhân viên");
      }

      const data: Employee = await response.json();
      console.log("API employee detail response:", data);
      setEmployeeDetail(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết nhân viên:", error);
      toast.error("Không thể tải chi tiết nhân viên");
      setEmployeeDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }
      const response = await fetch("/api/departments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.departments)) {
        setDepartments(data.departments);
      } else {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          router.push("/login");
          return;
        }
        toast.error(data.error || "Lỗi khi lấy danh sách phòng ban");
        setDepartments([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy phòng ban:", error);
      toast.error("Không thể tải danh sách phòng ban");
      setDepartments([]);
    }
  };

  const fetchPositions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const response = await fetch("/api/positions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi lấy danh sách vị trí: ${response.status}`);
      }

      const data: Position[] = await response.json();
      setPositions(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vị trí:", error);
      toast.error(
        error instanceof Error
          ? error.message || "Không thể tải danh sách vị trí"
          : "Không thể tải danh sách vị trí"
      );
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchEmployees(1);
    // fetchEmployees(); // Cập nhật số liệu tổng quan khi bộ lọc thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (selectedItem) {
      fetchEmployeeDetail(selectedItem.employee_id);
    } else {
      setEmployeeDetail(null);
    }
  }, [selectedItem]);

  const handlePageChange = (newPage: number) => {
    fetchEmployees(newPage);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setIsFiltersVisible(false);
    fetchEmployees(1);
  };

  const handleResetFilters = () => {
    setFilters({
      status: "",
      gender: "",
      department_id: "",
      position_id: "",
      joinDateFrom: "",
      joinDateTo: "",
      search: "",
    });
    setCurrentPage(1);
    fetchEmployees(1);
  };

  const handleDelete = async (employee_id: string, full_name: string) => {
    if (confirm(`Bạn có chắc muốn xóa ${full_name}?`)) {
      try {
        const response = await fetch(`/api/employees/${employee_id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `x ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          toast.success("Xóa nhân viên thành công");
          fetchEmployees(1);
          if (selectedItem?.employee_id === employee_id) {
            setSelectedItem(null);
          }
        } else {
          toast.error("Lỗi khi xóa nhân viên");
        }
      } catch (error) {
        console.error("Lỗi khi xóa nhân viên:", error);
        toast.error("Lỗi máy chủ nội bộ");
      }
    }
  };

  const statusCounts = {
    all: totalItems,
    active: employees.filter((emp) => emp.employment_status === "Đang làm")
      .length,
    leave: employees.filter((emp) => emp.employment_status === "Nghỉ việc")
      .length,
    probation: employees.filter((emp) => emp.employment_status === "Thử việc")
      .length,
    maternity: employees.filter(
      (emp) => emp.employment_status === "Nghỉ thai sản"
    ).length,
  };

  return (
    <div className="min-h-screen">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"} className="text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link href={"/employees"} className="text-primary">
              Employees
            </Link>
          </li>
        </ul>
      </div>

      <header className="bg-white shadow-sm rounded-sm">
        <div className="max-w-7xl mx-auto py-6 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Quản lý Nhân Sự</h1>
            <button
              onClick={() => {
                (
                  document.getElementById("drawer-add") as HTMLInputElement
                ).checked = true;
              }}
              className="btn btn-primary btn-md flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Thêm nhân viên
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tổng quan số liệu */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          <div className="card bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="card-body p-4">
              <h2 className="card-title text-lg mb-1">Tất cả nhân viên</h2>
              <p className="text-3xl font-bold">{statusCounts.all}</p>
            </div>
          </div>
          <div className="card bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="card-body p-4">
              <h2 className="card-title text-lg text-success mb-1">
                Đang làm việc
              </h2>
              <p className="text-3xl font-bold text-success">
                {statusCounts.active}
              </p>
            </div>
          </div>
          <div className="card bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="card-body p-4">
              <h2 className="card-title text-lg text-error mb-1">Thử việc</h2>
              <p className="text-3xl font-bold text-error">
                {statusCounts.probation}
              </p>
            </div>
          </div>
          <div className="card bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="card-body p-4">
              <h2 className="card-title text-lg text-warning mb-1">
                Nghỉ thai sản
              </h2>
              <p className="text-3xl font-bold text-warning">
                {statusCounts.maternity}
              </p>
            </div>
          </div>
          <div className="card bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="card-body p-4">
              <h2 className="card-title text-lg text-error mb-1">Nghỉ việc</h2>
              <p className="text-3xl font-bold text-error">
                {statusCounts.leave}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <label className="input input-bordered flex items-center gap-2">
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
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="grow"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                className={`btn ${
                  isFiltersVisible ? "btn-primary" : "btn-outline"
                } gap-2`}
              >
                <Filter className="w-4 h-4" />
                {isFiltersVisible ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
              </button>
            </div>
          </div>
          <div className={`mt-4 ${isFiltersVisible ? "block" : "hidden"}`}>
            <div className="border rounded-lg p-4 bg-base-100">
              <h3 className="text-lg font-medium mb-4">Bộ lọc nâng cao</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Trạng thái</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đang làm">Đang làm</option>
                    <option value="Thử việc">Thử việc</option>
                    <option value="Nghỉ việc">Nghỉ việc</option>
                    <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Giới tính</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.gender}
                    onChange={(e) =>
                      handleFilterChange("gender", e.target.value)
                    }
                  >
                    <option value="">Tất cả giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Phòng ban</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.department_id}
                    onChange={(e) =>
                      handleFilterChange("department_id", e.target.value)
                    }
                    disabled={departments.length === 0}
                  >
                    {Array.isArray(departments) &&
                      departments.map((dep) => (
                        <option
                          key={dep.department_id}
                          value={dep.department_id}
                        >
                          {dep.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Vị trí công việc
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={filters.position_id}
                    onChange={(e) =>
                      handleFilterChange("position_id", e.target.value)
                    }
                    disabled={positions.length === 0}
                  >
                    <option value="">Tất cả vị trí</option>
                    {positions.map((pos) => (
                      <option key={pos.position_id} value={pos.position_id}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Ngày vào từ</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filters.joinDateFrom}
                    onChange={(e) =>
                      handleFilterChange("joinDateFrom", e.target.value)
                    }
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Ngày vào đến</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={filters.joinDateTo}
                    onChange={(e) =>
                      handleFilterChange("joinDateTo", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="divider"></div>
              <div className="flex flex-wrap justify-end gap-3 mt-2">
                <button
                  className="btn btn-outline"
                  onClick={handleResetFilters}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Xoá bộ lọc
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleApplyFilters}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                    />
                  </svg>
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200">
                  <th className="px-2 py-3 w-12">STT</th>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Liên hệ</th>
                  <th className="px-4 py-3">Phòng ban</th>
                  <th className="px-4 py-3">Vị trí</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 w-24">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, idx) => (
                    <tr
                      key={emp.employee_id}
                      className="hover:bg-base-100 border-b border-base-200 cursor-pointer"
                      onClick={() => {
                        console.log("Selecting employee:", emp);
                        setSelectedItem(emp);
                        (
                          document.getElementById(
                            "drawer-detail"
                          ) as HTMLInputElement
                        ).checked = true;
                      }}
                    >
                      <td className="px-2 py-3 text-center font-medium text-gray-500">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full bg-base-300 ring-2 ring-offset-2 ring-base-100">
                              <Image
                                src={
                                  emp.avatar_url || "https://i.pravatar.cc/300"
                                }
                                alt="Avatar"
                                width={48}
                                height={48}
                                className="rounded-full"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{emp.full_name}</div>
                            <div className="text-sm opacity-70">
                              {emp.gender} •{" "}
                              {formatDateToDisplay(emp.join_date)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium">{emp.email}</div>
                          <div className="text-sm opacity-70">
                            {emp.phone_number}
                          </div>
                          <div className="text-xs opacity-50 truncate max-w-xs">
                            {emp.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="badge badge-outline badge-lg h-[50px]">
                          {emp.department_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{emp.position_name}</td>
                      <td className="px-4 py-3">
                        <div
                          className={`badge h-[45px] ${
                            emp.employment_status === "Đang làm"
                              ? "badge-success text-white"
                              : emp.employment_status === "Nghỉ việc"
                              ? "badge-error text-white"
                              : "badge-warning text-white"
                          } badge-lg`}
                        >
                          {emp.employment_status}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex gap-1">
                          <button
                            className="btn btn-square btn-sm btn-ghost text-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(emp);
                              (
                                document.getElementById(
                                  "drawer-detail"
                                ) as HTMLInputElement
                              ).checked = true;
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            className="btn btn-square btn-sm btn-ghost text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(emp.employee_id, emp.full_name);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
        <div className="drawer drawer-end z-20">
          <input id="drawer-detail" type="checkbox" className="drawer-toggle" />
          <div className="drawer-side">
            <label htmlFor="drawer-detail" className="drawer-overlay"></label>
            <div className="bg-white min-h-full w-96 lg:w-120 p-0 shadow-xl">
              <div className="sticky top-0 bg-primary text-primary-content z-10 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    Thông tin chi tiết nhân viên
                  </h3>
                  <label
                    htmlFor="drawer-detail"
                    className="btn btn-circle btn-sm btn-ghost text-primary-content"
                    onClick={() => setSelectedItem(null)} // Reset selectedItem khi đóng
                  >
                    ✕
                  </label>
                </div>
              </div>
              <div className="p-6">
                {loadingDetail ? (
                  <p>Đang tải...</p>
                ) : employeeDetail ? (
                  <DetailEmployee
                    item={employeeDetail}
                    drawerId="drawer-detail"
                    fetchTasks={fetchEmployees}
                  />
                ) : (
                  <p>Không có dữ liệu hoặc xảy ra lỗi</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="drawer drawer-end z-20">
          <input id="drawer-add" type="checkbox" className="drawer-toggle" />
          <div className="drawer-side">
            <label htmlFor="drawer-add" className="drawer-overlay"></label>
            <div className="bg-white min-h-full w-96 lg:w-120 p-0 shadow-xl">
              <div className="sticky top-0 bg-primary text-primary-content z-10 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Thêm mới nhân viên</h3>
                  <label
                    htmlFor="drawer-add"
                    className="btn btn-circle btn-sm btn-ghost text-primary-content"
                  >
                    ✕
                  </label>
                </div>
              </div>
              <div className="p-6">
                <AddEmployee
                  drawerId="drawer-add"
                  fetchTasks={fetchEmployees}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
