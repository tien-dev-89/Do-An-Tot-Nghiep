import Pagination from "@/components/Pagination";
import React, { useState } from "react";
import DetailEmployee from "./detail-employee";
import AddEmployee from "./add-employee";
import Image from "next/image";
import Link from "next/link";
import { Filter, UserPlus } from "lucide-react";

type Gender = "Nam" | "Nữ" | "Khác";
type EmploymentStatus = "Đang làm" | "Nghỉ việc" | "Nghỉ thai sản";

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
  position_id: string;
  employment_status: EmploymentStatus;
  join_date: string;
  leave_date: string | null;
  created_at: string;
  updated_at: string;
}

const mockEmployees: Employee[] = [
  {
    employee_id: "1",
    avatar_url: null,
    full_name: "Nguyễn Văn A",
    email: "a.nguyen@example.com",
    phone_number: "0901234567",
    birth_date: "1990-01-15",
    gender: "Nam",
    address: "Hà Nội",
    department_id: "Nhân sự",
    position_id: "Trưởng phòng nhân sự",
    employment_status: "Đang làm",
    join_date: "2020-06-01",
    leave_date: null,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2025-05-04T09:30:00Z",
  },
  {
    employee_id: "2",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Trần Thị B",
    email: "b.tran@example.com",
    phone_number: "0912345678",
    birth_date: "1992-04-20",
    gender: "Nữ",
    address: "TP. Hồ Chí Minh",
    department_id: "Kế toán",
    position_id: "Trưởng phòng kế toán",
    employment_status: "Nghỉ việc",
    join_date: "2018-03-10",
    leave_date: "2023-12-01",
    created_at: "2018-03-10T08:00:00Z",
    updated_at: "2023-12-02T09:00:00Z",
  },
  {
    employee_id: "3",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Phạm Văn C",
    email: "c.pham@example.com",
    phone_number: "0934567890",
    birth_date: "1988-11-05",
    gender: "Nam",
    address: "Đà Nẵng",
    department_id: "Kế toán",
    position_id: "Nhân viên kế toán",
    employment_status: "Đang làm",
    join_date: "2015-01-01",
    leave_date: null,
    created_at: "2015-01-01T08:00:00Z",
    updated_at: "2025-05-04T09:00:00Z",
  },
  {
    employee_id: "4",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Lê Thị D",
    email: "d.le@example.com",
    phone_number: "0945678901",
    birth_date: "1995-07-19",
    gender: "Nữ",
    address: "Huế",
    department_id: "IT",
    position_id: "pos-004",
    employment_status: "Nghỉ thai sản",
    join_date: "2022-08-01",
    leave_date: null,
    created_at: "2022-08-01T09:00:00Z",
    updated_at: "2025-05-01T10:00:00Z",
  },
  {
    employee_id: "5",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Hoàng Văn E",
    email: "e.hoang@example.com",
    phone_number: "0956789012",
    birth_date: "1993-02-28",
    gender: "Nam",
    address: "Cần Thơ",
    department_id: "IT",
    position_id: "pos-005",
    employment_status: "Đang làm",
    join_date: "2019-10-10",
    leave_date: null,
    created_at: "2019-10-10T10:00:00Z",
    updated_at: "2025-04-28T12:00:00Z",
  },
  {
    employee_id: "6",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Đặng Thị F",
    email: "f.dang@example.com",
    phone_number: "0967890123",
    birth_date: "1996-09-09",
    gender: "Nữ",
    address: "Hải Phòng",
    department_id: "IT",
    position_id: "pos-006",
    employment_status: "Đang làm",
    join_date: "2021-01-15",
    leave_date: null,
    created_at: "2021-01-15T08:00:00Z",
    updated_at: "2025-05-02T11:00:00Z",
  },
  {
    employee_id: "7",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Ngô Văn G",
    email: "g.ngo@example.com",
    phone_number: "0978901234",
    birth_date: "1987-12-25",
    gender: "Nam",
    address: "Quảng Ninh",
    department_id: "IT",
    position_id: "pos-007",
    employment_status: "Nghỉ việc",
    join_date: "2010-04-01",
    leave_date: "2020-06-30",
    created_at: "2010-04-01T07:00:00Z",
    updated_at: "2020-07-01T08:00:00Z",
  },
  {
    employee_id: "8",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Vũ Thị H",
    email: "h.vu@example.com",
    phone_number: "0989012345",
    birth_date: "1998-10-10",
    gender: "Nữ",
    address: "Bình Dương",
    department_id: "IT",
    position_id: "pos-008",
    employment_status: "Đang làm",
    join_date: "2024-01-01",
    leave_date: null,
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2025-05-04T09:30:00Z",
  },
  {
    employee_id: "9",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Trịnh Văn I",
    email: "i.trinh@example.com",
    phone_number: "0990123456",
    birth_date: "1991-06-06",
    gender: "Nam",
    address: "Nghệ An",
    department_id: "IT",
    position_id: "pos-009",
    employment_status: "Đang làm",
    join_date: "2017-07-01",
    leave_date: null,
    created_at: "2017-07-01T08:00:00Z",
    updated_at: "2025-05-03T10:00:00Z",
  },
  {
    employee_id: "10",
    avatar_url: "https://i.pravatar.cc/",
    full_name: "Phan Thị J",
    email: "j.phan@example.com",
    phone_number: "0909876543",
    birth_date: "1994-03-03",
    gender: "Nữ",
    address: "Đắk Lắk",
    department_id: "IT",
    position_id: "pos-010",
    employment_status: "Đang làm",
    join_date: "2023-09-01",
    leave_date: null,
    created_at: "2023-09-01T08:00:00Z",
    updated_at: "2025-05-04T10:00:00Z",
  },
];

export default function Index() {
  const [selectedItem, setSelectedItem] = useState<Employee | null>(null);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const statusCounts = {
    all: mockEmployees.length,
    active: mockEmployees.filter((emp) => emp.employment_status === "Đang làm")
      .length,
    leave: mockEmployees.filter((emp) => emp.employment_status === "Nghỉ việc")
      .length,
    maternity: mockEmployees.filter(
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

      {/* Header */}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
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
              <h2 className="card-title text-lg text-error mb-1">Nghỉ việc</h2>
              <p className="text-3xl font-bold text-error">
                {statusCounts.leave}
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
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
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
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                {/* Status Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Trạng thái</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option value="">Tất cả trạng thái</option>
                    <option>Đang làm</option>
                    <option>Nghỉ việc</option>
                    <option>Nghỉ thai sản</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Giới tính</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option value="">Tất cả giới tính</option>
                    <option>Nam</option>
                    <option>Nữ</option>
                    <option>Khác</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Phòng ban</span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option value="">Tất cả phòng ban</option>
                    <option>Nhân sự</option>
                    <option>Kế toán</option>
                    <option>IT</option>
                  </select>
                </div>

                {/* Position Filter */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Vị trí công việc
                    </span>
                  </label>
                  <select className="select select-bordered w-full">
                    <option value="">Tất cả vị trí</option>
                    <option>Trưởng phòng</option>
                    <option>Nhân viên</option>
                  </select>
                </div>

                {/* Join Date From */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Ngày vào từ</span>
                  </label>
                  <input type="date" className="input input-bordered w-full" />
                </div>

                {/* Join Date To */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Ngày vào đến</span>
                  </label>
                  <input type="date" className="input input-bordered w-full" />
                </div>
              </div>

              <div className="divider"></div>

              <div className="flex flex-wrap justify-end gap-3 mt-2">
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    // Reset filter logic would go here
                    // This is where you'd clear your filter state variables
                    alert("Đã xoá bộ lọc");
                  }}
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
                  onClick={() => {
                    // Apply filter logic would go here
                    // This would filter your employee list based on selected values
                    alert("Đã áp dụng bộ lọc");
                    setIsFiltersVisible(false); // Optionally hide filters after applying
                  }}
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

        {/* Table */}
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
                {mockEmployees.map((emp, idx) => (
                  <tr
                    key={emp.employee_id}
                    className="hover:bg-base-100 border-b border-base-200 cursor-pointer"
                    onClick={() => {
                      setSelectedItem(emp);
                    }}
                  >
                    <td className="px-2 py-3 text-center font-medium text-gray-500">
                      {idx + 1}
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
                            {emp.gender} • {emp.join_date}
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
                      <div className="badge badge-outline badge-lg">
                        {emp.department_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{emp.position_id}</td>
                    <td className="px-4 py-3">
                      <div
                        className={`badge ${
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
                          onClick={() => {
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
                            alert(`Xoá ${emp.full_name}`);
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-4 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Drawer chi tiết */}
        <div className="drawer drawer-end z-20">
          <input id="drawer-detail" type="checkbox" className="drawer-toggle" />
          <div className="drawer-side">
            <label className="drawer-overlay"></label>
            <div className="bg-white min-h-full w-96 lg:w-120 p-0 shadow-xl">
              <div className="sticky top-0 bg-primary text-primary-content z-10 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    Thông tin chi tiết nhân viên
                  </h3>
                  <label
                    htmlFor="drawer-detail"
                    className="btn btn-circle btn-sm btn-ghost text-primary-content"
                  >
                    ✕
                  </label>
                </div>
              </div>
              <div className="p-6">
                {selectedItem ? (
                  <DetailEmployee
                    item={selectedItem}
                    drawerId="drawer-detail"
                    fetchTasks={function (): Promise<void> {
                      throw new Error("Function not implemented.");
                    }}
                  />
                ) : (
                  <p>Không có dữ liệu</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer thêm dữ liệu */}
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
                  item={selectedItem}
                  drawerId="drawer-add"
                  fetchTasks={function (): Promise<void> {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
