import Link from "next/link";
import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  Calendar,
  ChevronDown,
  Edit,
  Trash,
  ArrowUpDown,
  Award,
  AlertTriangle,
} from "lucide-react";

// Define types based on database schema
type RewardPenaltyType = "Thưởng" | "Phạt";
type RewardPenaltyStatus = "Đã duyệt" | "Chờ duyệt" | "Đã từ chối";

interface RewardPenalty {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  position: string;
  type: RewardPenaltyType;
  amount: number;
  reason: string;
  month: string;
  created_at: string;
  status: RewardPenaltyStatus;
  approver?: string;
}

export default function RewardsPenalties() {
  // State for filters
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

  // Mock data for demonstration
  const departments = [
    { id: "dept1", name: "Kỹ thuật" },
    { id: "dept2", name: "Nhân sự" },
    { id: "dept3", name: "Kế toán" },
    { id: "dept4", name: "Marketing" },
  ];

  const mockEmployees = [
    {
      id: "e1",
      name: "Nguyễn Văn A",
      department: "Kỹ thuật",
      position: "Lập trình viên",
    },
    {
      id: "e2",
      name: "Trần Thị B",
      department: "Nhân sự",
      position: "Trưởng phòng",
    },
    {
      id: "e3",
      name: "Lê Văn C",
      department: "Kế toán",
      position: "Kế toán viên",
    },
    {
      id: "e4",
      name: "Phạm Thị D",
      department: "Marketing",
      position: "Chuyên viên",
    },
    {
      id: "e5",
      name: "Hoàng Văn E",
      department: "Kỹ thuật",
      position: "QA Engineer",
    },
  ];

  const mockRewardsPenalties: RewardPenalty[] = [
    {
      id: "rp1",
      employee_id: "e1",
      employee_name: "Nguyễn Văn A",
      department: "Kỹ thuật",
      position: "Lập trình viên",
      type: "Thưởng",
      amount: 1500000,
      reason: "Hoàn thành dự án trước hạn",
      month: "2025-05",
      created_at: "2025-05-02T08:30:00Z",
      status: "Đã duyệt",
      approver: "Hoàng Minh Quản lý",
    },
    {
      id: "rp2",
      employee_id: "e2",
      employee_name: "Trần Thị B",
      department: "Nhân sự",
      position: "Trưởng phòng",
      type: "Thưởng",
      amount: 2000000,
      reason: "Đạt thành tích tuyển dụng xuất sắc Q1/2025",
      month: "2025-05",
      created_at: "2025-05-01T10:15:00Z",
      status: "Đã duyệt",
      approver: "Hoàng Minh Quản lý",
    },
    {
      id: "rp3",
      employee_id: "e3",
      employee_name: "Lê Văn C",
      department: "Kế toán",
      position: "Kế toán viên",
      type: "Phạt",
      amount: 200000,
      reason: "Đi trễ 3 lần trong tháng",
      month: "2025-05",
      created_at: "2025-05-03T14:20:00Z",
      status: "Đã duyệt",
      approver: "Hoàng Minh Quản lý",
    },
    {
      id: "rp4",
      employee_id: "e4",
      employee_name: "Phạm Thị D",
      department: "Marketing",
      position: "Chuyên viên",
      type: "Phạt",
      amount: 500000,
      reason: "Không hoàn thành KPI tháng",
      month: "2025-05",
      created_at: "2025-05-04T09:45:00Z",
      status: "Chờ duyệt",
    },
    {
      id: "rp5",
      employee_id: "e5",
      employee_name: "Hoàng Văn E",
      department: "Kỹ thuật",
      position: "QA Engineer",
      type: "Thưởng",
      amount: 1000000,
      reason: "Phát hiện và báo cáo lỗi nghiêm trọng",
      month: "2025-05",
      created_at: "2025-05-05T11:30:00Z",
      status: "Chờ duyệt",
    },
    {
      id: "rp6",
      employee_id: "e1",
      employee_name: "Nguyễn Văn A",
      department: "Kỹ thuật",
      position: "Lập trình viên",
      type: "Phạt",
      amount: 300000,
      reason: "Không tuân thủ quy trình code review",
      month: "2025-05",
      created_at: "2025-05-06T13:10:00Z",
      status: "Đã từ chối",
      approver: "Hoàng Minh Quản lý",
    },
  ];

  // Form state for adding new reward/penalty
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

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In a real application, you would send this to your API
    console.log("Submitting new reward/penalty:", newRewardPenalty);
    setShowAddModal(false);
    // Reset form
    setNewRewardPenalty({
      employee_id: "",
      type: "Thưởng",
      amount: 0,
      reason: "",
      month: getCurrentYearMonth(),
    });
  }

  // Filter and sort rewards/penalties
  const filteredRewardsPenalties = mockRewardsPenalties
    .filter((item) => {
      const matchesSearch =
        item.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        selectedDepartment === "all" || item.department === selectedDepartment;
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      const matchesMonth = item.month === selectedMonth;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesType &&
        matchesStatus &&
        matchesMonth
      );
    })
    .sort((a, b) => {
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

  // Calculate total rewards and penalties for the current filtered view
  const totalRewards = filteredRewardsPenalties
    .filter((item) => item.type === "Thưởng" && item.status === "Đã duyệt")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalPenalties = filteredRewardsPenalties
    .filter((item) => item.type === "Phạt" && item.status === "Đã duyệt")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/salary/rewards-penalties"}>Thưởng | Phạt</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md">
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
          {/* Filters */}
          <div className="bg-base-100 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="flex flex-1 relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên nhân viên hoặc lý do..."
                  className="input input-bordered w-full pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  className="absolute right-3 top-3 text-gray-400"
                  size={20}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Month picker */}
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
                  <th>Loại</th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      Số tiền
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th>Lý do</th>
                  <th
                    onClick={() => handleSort("created_at")}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      Ngày tạo
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th>Trạng thái</th>
                  <th>Người duyệt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRewardsPenalties.length > 0 ? (
                  filteredRewardsPenalties.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="font-medium">{item.employee_name}</div>
                        <div className="text-xs text-gray-500">
                          {item.position}
                        </div>
                      </td>
                      <td>{item.department}</td>
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
                        <div className="max-w-xs truncate" title={item.reason}>
                          {item.reason}
                        </div>
                      </td>
                      <td>
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td>
                        <div
                          className={`badge ${
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
                          <button className="btn btn-sm btn-outline btn-square">
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-sm btn-outline btn-square btn-error">
                            <Trash size={16} />
                          </button>
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
        </main>
      </div>

      {/* Add New Modal */}
      {showAddModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Thêm Thưởng/Phạt Mới</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Nhân viên</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newRewardPenalty.employee_id}
                  onChange={(e) =>
                    setNewRewardPenalty({
                      ...newRewardPenalty,
                      employee_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    Chọn nhân viên
                  </option>
                  {mockEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Loại</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={newRewardPenalty.type}
                  onChange={(e) =>
                    setNewRewardPenalty({
                      ...newRewardPenalty,
                      type: e.target.value as RewardPenaltyType,
                    })
                  }
                  required
                >
                  <option value="Thưởng">Thưởng</option>
                  <option value="Phạt">Phạt</option>
                </select>
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Số tiền (VNĐ)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  placeholder="Nhập số tiền"
                  value={newRewardPenalty.amount}
                  onChange={(e) =>
                    setNewRewardPenalty({
                      ...newRewardPenalty,
                      amount: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  required
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Lý do</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Nhập lý do thưởng/phạt"
                  value={newRewardPenalty.reason}
                  onChange={(e) =>
                    setNewRewardPenalty({
                      ...newRewardPenalty,
                      reason: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">
                  <span className="label-text">Tháng áp dụng</span>
                </label>
                <input
                  type="month"
                  className="input input-bordered w-full"
                  value={newRewardPenalty.month}
                  onChange={(e) =>
                    setNewRewardPenalty({
                      ...newRewardPenalty,
                      month: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Lưu
                </button>
              </div>
            </form>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowAddModal(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
