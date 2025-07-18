import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Calendar,
  ChevronDown,
  Edit,
  ArrowUpDown,
  Award,
  AlertTriangle,
} from "lucide-react";
import AddRewardPenaltyModal from "./AddRewardPenaltyModal";
import EditRewardPenaltyModal from "./EditRewardPenaltyModal";
import DeleteRewardPenaltyButton from "./DeleteRewardPenaltyButton";
import {
  RewardPenalty,
  Employee,
  EmployeeApiResponse,
  Department,
  RewardPenaltyType,
} from "@/types/rewards-penalties";

export default function RewardsPenalties() {
  // State for filters and data
  const [rewardsPenalties, setRewardsPenalties] = useState<RewardPenalty[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getCurrentYearMonth()
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRewardPenalty, setCurrentRewardPenalty] =
    useState<RewardPenalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for adding/editing reward/penalty
  const [newRewardPenalty, setNewRewardPenalty] = useState({
    employee_id: "",
    type: "Thưởng" as RewardPenaltyType,
    amount: 0,
    reason: "",
    month: getCurrentYearMonth(),
  });

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

  // Fetch data from APIs
  const fetchRewardsPenalties = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/rewards-penalties?search=${searchQuery}&month=${selectedMonth}&department_id=${
          selectedDepartment === "all" ? "" : selectedDepartment
        }&type=${selectedType === "all" ? "" : selectedType}&status=${
          selectedStatus === "all" ? "" : selectedStatus
        }`,
        {
          headers: { Authorization: "x your-token" },
        }
      );
      if (!response.ok) throw new Error("Lỗi khi lấy danh sách thưởng/phạt");
      const data = await response.json();
      setRewardsPenalties(data.rewardsPenalties);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees", {
        headers: { Authorization: "x your-token" },
      });
      if (!response.ok) throw new Error("Lỗi khi lấy danh sách nhân viên");
      const data = await response.json();
      setEmployees(
        data.employees.map((emp: EmployeeApiResponse) => ({
          id: emp.employee_id,
          name: emp.full_name,
          department: emp.department_name,
          position: emp.position_name,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments", {
        headers: { Authorization: "x your-token" },
      });
      if (!response.ok) throw new Error("Lỗi khi lấy danh sách phòng ban");
      const data = await response.json();
      setDepartments(data.departments);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchRewardsPenalties();
  }, [
    searchQuery,
    selectedMonth,
    selectedDepartment,
    selectedType,
    selectedStatus,
  ]);

  // Handle add/edit/delete
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/rewards-penalties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "x your-token",
        },
        body: JSON.stringify(newRewardPenalty),
      });
      if (!response.ok) throw new Error("Lỗi khi thêm thưởng/phạt");
      setShowAddModal(false);
      setNewRewardPenalty({
        employee_id: "",
        type: "Thưởng",
        amount: 0,
        reason: "",
        month: getCurrentYearMonth(),
      });
      fetchRewardsPenalties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRewardPenalty) return;
    try {
      const response = await fetch("/api/rewards-penalties", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "x your-token",
        },
        body: JSON.stringify({
          ...newRewardPenalty,
          id: currentRewardPenalty.id,
        }),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật thưởng/phạt");
      setShowEditModal(false);
      setCurrentRewardPenalty(null);
      setNewRewardPenalty({
        employee_id: "",
        type: "Thưởng",
        amount: 0,
        reason: "",
        month: getCurrentYearMonth(),
      });
      fetchRewardsPenalties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/rewards-penalties", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "x your-token",
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa thưởng/phạt");
      fetchRewardsPenalties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    }
  };

  // Filter and sort rewards/penalties
  const filteredRewardsPenalties = rewardsPenalties.sort((a, b) => {
    if (sortColumn === "employee_name") {
      return sortDirection === "asc"
        ? a.employee_name.localeCompare(b.employee_name)
        : b.employee_name.localeCompare(a.employee_name);
    } else if (sortColumn === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortColumn === "created_at") {
      return sortDirection === "asc"
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return 0;
  });

  // Calculate total rewards and penalties
  const totalRewards = filteredRewardsPenalties
    .filter((item) => item.type === "Thưởng" && item.status === "Đã duyệt")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPenalties = filteredRewardsPenalties
    .filter((item) => item.type === "Phạt" && item.status === "Đã duyệt")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-[1158px]">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"} className="text-primary">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href={"/salary/rewards-penalties"} className="text-primary">
              Thưởng | Phạt
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md rounded-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Thưởng | Phạt
            </h1>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={18} />
                Thêm mới
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          {/* Filters */}
          <div className="bg-base-100 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="flex flex-1 relative">
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
                    type="text"
                    placeholder="Tìm kiếm theo tên nhân viên hoặc lý do..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Month picker */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline flex gap-2">
                    <Calendar size={18} />
                    <span>Tháng</span>
                    <ChevronDown size={16} />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, "0");
                      const label = `Tháng ${month}`;
                      return (
                        <li key={month}>
                          <button
                            onClick={() =>
                              setSelectedMonth(
                                `${new Date().getFullYear()}-${month}`
                              )
                            }
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Department filter */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline flex gap-2">
                    <Filter size={18} />
                    <span>
                      {selectedDepartment === "all"
                        ? "Tất cả phòng ban"
                        : departments.find((d) => d.id === selectedDepartment)
                            ?.name || "Tất cả phòng ban"}
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
                        <button onClick={() => setSelectedDepartment(dept.id)}>
                          {dept.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Type filter */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-outline flex gap-2">
                    <span>
                      {selectedType === "all" ? "Tất cả loại" : selectedType}
                    </span>
                    <ChevronDown size={16} />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <button onClick={() => setSelectedType("all")}>
                        Tất cả loại
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedType("Thưởng")}>
                        Thưởng
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedType("Phạt")}>
                        Phạt
                      </button>
                    </li>
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
                      <button onClick={() => setSelectedStatus("Đã duyệt")}>
                        Đã duyệt
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedStatus("Chờ duyệt")}>
                        Chờ duyệt
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setSelectedStatus("Đã từ chối")}>
                        Đã từ chối
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="text-sm text-gray-500">Tổng số bản ghi</div>
              <div className="text-2xl font-semibold">
                {filteredRewardsPenalties.length}
              </div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-1">
                <Award size={16} className="text-success" />
                <div className="text-sm text-gray-500">Tổng thưởng</div>
              </div>
              <div className="text-2xl font-semibold text-success">
                {formatCurrency(totalRewards)}
              </div>
            </div>
            <div className="bg-base-100 p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-1">
                <AlertTriangle size={16} className="text-error" />
                <div className="text-sm text-gray-500">Tổng phạt</div>
              </div>
              <div className="text-2xl font-semibold text-error">
                {formatCurrency(totalPenalties)}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-base-100 rounded-lg shadow overflow-x-hidden">
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th
                      onClick={() => handleSort("employee_name")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Nhân viên <ArrowUpDown size={16} className="ml-1" />
                      </div>
                    </th>
                    <th>Phòng ban</th>
                    <th>Loại</th>
                    <th
                      onClick={() => handleSort("amount")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Số tiền <ArrowUpDown size={16} className="ml-1" />
                      </div>
                    </th>
                    <th>Lý do</th>
                    <th
                      onClick={() => handleSort("created_at")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Ngày tạo <ArrowUpDown size={16} className="ml-1" />
                      </div>
                    </th>
                    <th>Trạng thái</th>
                    <th>Người duyệt</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center">
                        Đang tải...
                      </td>
                    </tr>
                  ) : filteredRewardsPenalties.length > 0 ? (
                    filteredRewardsPenalties.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="font-medium">
                            {item.employee_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.position || "-"}
                          </div>
                        </td>
                        <td>{item.department || "-"}</td>
                        <td>
                          <div
                            className={`badge ${
                              item.type === "Thưởng"
                                ? "badge-success"
                                : "badge-error"
                            } gap-1`}
                          >
                            {item.type === "Thưởng" ? (
                              <Award size={12} />
                            ) : (
                              <AlertTriangle size={12} />
                            )}
                            {item.type}
                          </div>
                        </td>
                        <td
                          className={
                            item.type === "Thưởng"
                              ? "text-success font-medium"
                              : "text-error font-medium"
                          }
                        >
                          {formatCurrency(item.amount)}
                        </td>
                        <td>
                          <div
                            className="max-w-xs truncate"
                            title={item.reason}
                          >
                            {item.reason}
                          </div>
                        </td>
                        <td>
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td>
                          <div
                            className={`text-xs p-1 badge ${
                              item.status === "Đã duyệt"
                                ? "badge-success"
                                : item.status === "Chờ duyệt"
                                ? "badge-warning"
                                : "badge-error"
                            } gap-1`}
                          >
                            {item.status}
                          </div>
                        </td>
                        <td>{item.approver || "-"}</td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-sm btn-outline btn-square"
                              onClick={() => {
                                setCurrentRewardPenalty(item);
                                setNewRewardPenalty({
                                  employee_id: item.employee_id,
                                  type: item.type,
                                  amount: item.amount,
                                  reason: item.reason,
                                  month: item.month,
                                });
                                setShowEditModal(true);
                              }}
                            >
                              <Edit size={16} />
                            </button>
                            <DeleteRewardPenaltyButton
                              id={item.id}
                              onDelete={handleDelete}
                            />
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
                              setSelectedMonth(getCurrentYearMonth());
                              setSelectedDepartment("all");
                              setSelectedType("all");
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
          </div>
        </main>
      </div>

      <AddRewardPenaltyModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        employees={employees}
        newRewardPenalty={newRewardPenalty}
        setNewRewardPenalty={setNewRewardPenalty}
        onSubmit={handleAddSubmit}
      />

      <EditRewardPenaltyModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        employees={employees}
        currentRewardPenalty={currentRewardPenalty}
        newRewardPenalty={newRewardPenalty}
        setNewRewardPenalty={setNewRewardPenalty}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
