import {
  PlusCircle,
  Trash2,
  UserRoundPen,
  Building2,
  Users,
  Briefcase,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

// Định nghĩa interface cho dữ liệu
export interface Employee {
  employee_id: string;
  full_name: string;
  department_id: string;
  employment_status: "Đang làm" | "Thử việc" | "Nghỉ việc" | "Nghỉ thai sản";
  email: string;
  phone: string;
}

export interface Department {
  department_id: string;
  name: string;
  manager_id: string | null;
  manager_name?: string;
  description: string | null;
  employee_count?: number;
}

// Dữ liệu giả lập
const mockDepartments: Department[] = [
  {
    department_id: "1",
    name: "Phòng Kỹ thuật",
    manager_id: "101",
    manager_name: "Nguyễn Văn An",
    description: "Phòng chịu trách nhiệm phát triển và bảo trì phần mềm",
  },
  {
    department_id: "2",
    name: "Phòng Nhân sự",
    manager_id: "102",
    manager_name: "Trần Thị Bình",
    description: "Phòng quản lý tuyển dụng, đào tạo và phúc lợi nhân sự",
  },
  {
    department_id: "3",
    name: "Phòng Marketing",
    manager_id: "104",
    manager_name: "Phạm Minh Đức",
    description: "Phòng phụ trách chiến lược quảng bá và thương hiệu",
  },
  {
    department_id: "4",
    name: "Phòng Tài chính",
    manager_id: "107",
    manager_name: "Lê Thị Hoa",
    description: "Phòng quản lý ngân sách và kế toán",
  },
];

const mockEmployees: Employee[] = [
  {
    employee_id: "101",
    full_name: "Nguyễn Văn An",
    department_id: "1",
    employment_status: "Đang làm",
    email: "nguyenvanan@example.com",
    phone: "0905123456",
  },
  {
    employee_id: "102",
    full_name: "Trần Thị Bình",
    department_id: "2",
    employment_status: "Đang làm",
    email: "tranthibinh@example.com",
    phone: "0916234567",
  },
  {
    employee_id: "103",
    full_name: "Lê Văn Cường",
    department_id: "1",
    employment_status: "Thử việc",
    email: "levancuong@example.com",
    phone: "0927345678",
  },
  {
    employee_id: "104",
    full_name: "Phạm Minh Đức",
    department_id: "3",
    employment_status: "Đang làm",
    email: "phamminhduc@example.com",
    phone: "0938456789",
  },
  {
    employee_id: "105",
    full_name: "Hoàng Thị E",
    department_id: "3",
    employment_status: "Đang làm",
    email: "hoangthie@example.com",
    phone: "0949567890",
  },
  {
    employee_id: "106",
    full_name: "Đỗ Quang Phát",
    department_id: "1",
    employment_status: "Đang làm",
    email: "doquangphat@example.com",
    phone: "0950678901",
  },
  {
    employee_id: "107",
    full_name: "Lê Thị Hoa",
    department_id: "4",
    employment_status: "Đang làm",
    email: "lethihoa@example.com",
    phone: "0961789012",
  },
  {
    employee_id: "108",
    full_name: "Nguyễn Thanh Hùng",
    department_id: "4",
    employment_status: "Thử việc",
    email: "nguyenthanhhung@example.com",
    phone: "0972890123",
  },
  {
    employee_id: "109",
    full_name: "Vũ Thị Kim",
    department_id: "2",
    employment_status: "Đang làm",
    email: "vuthikim@example.com",
    phone: "0983901234",
  },
  {
    employee_id: "110",
    full_name: "Trương Văn Long",
    department_id: "3",
    employment_status: "Nghỉ thai sản",
    email: "truongvanlong@example.com",
    phone: "0994012345",
  },
];

// Hàm lấy màu ngẫu nhiên cho avatar
const getDepartmentColor = (id: string) => {
  const colors = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-info text-info-content",
  ];
  return colors[parseInt(id) % colors.length];
};

const Departments: React.FC = () => {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
  const [success, setSuccess] = useState<string>("");

  // Nhận phòng ban mới từ query parameters
  useEffect(() => {
    if (router.query.newDepartment) {
      const newDepartment = JSON.parse(router.query.newDepartment as string);
      setDepartments((prev) => {
        // Kiểm tra xem phòng ban đã tồn tại chưa để tránh trùng lặp
        if (
          !prev.some(
            (dept) => dept.department_id === newDepartment.department_id
          )
        ) {
          return [...prev, newDepartment];
        }
        return prev;
      });
      setSuccess("Đã thêm phòng ban mới thành công");
      setTimeout(() => setSuccess(""), 3000);

      // Xóa query parameters khỏi URL
      router.replace("/departments", undefined, { shallow: true });
    }
  }, [router, router.query]);

  // Lọc phòng ban theo tìm kiếm
  const filteredDepartments = departments
    .map((dept) => ({
      ...dept,
      employee_count: employees.filter(
        (emp) =>
          emp.department_id === dept.department_id &&
          emp.employment_status !== "Nghỉ việc"
      ).length,
    }))
    .filter((dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Xử lý xóa phòng ban
  const handleDeleteDepartment = () => {
    if (departmentToDelete) {
      setDepartments(
        departments.filter(
          (dept) => dept.department_id !== departmentToDelete.department_id
        )
      );
      setDepartmentToDelete(null);
      (document.getElementById("delete_modal") as HTMLDialogElement)?.close();
    }
  };

  // Tính toán tổng số phòng ban và nhân viên
  const totalDepartments = departments.length;
  const totalEmployees = employees.filter(
    (emp) => emp.employment_status !== "Nghỉ việc"
  ).length;

  return (
    <div className="bg-base-100 min-h-screen">
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"} className="text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link href={"/departments"} className="text-primary">
              Phòng ban
            </Link>
          </li>
        </ul>
      </div>

      {/* Header */}
      <header className="bg-base-100 shadow-md rounded-sm">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-primary">
              Quản lý Phòng Ban
            </h1>
          </div>
          <div className="flex space-x-2">
            <Link href="/departments/create-department">
              <button className="btn btn-primary">
                <PlusCircle className="w-5 h-5 mr-1" /> Tạo phòng ban mới
              </button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Thông báo thành công */}
        {success && (
          <div className="alert alert-success shadow-md mb-6 animate-fadeIn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="stat bg-base-200 rounded-box shadow hover:shadow-md transition-all">
            <div className="stat-figure text-primary">
              <Building2 size={36} />
            </div>
            <div className="stat-title">Tổng số phòng ban</div>
            <div className="stat-value text-primary">{totalDepartments}</div>
            <div className="stat-desc">Phòng ban đang hoạt động</div>
          </div>
          <div className="stat bg-base-200 rounded-box shadow hover:shadow-md transition-all">
            <div className="stat-figure text-secondary">
              <Users size={36} />
            </div>
            <div className="stat-title">Tổng số nhân viên</div>
            <div className="stat-value text-secondary">{totalEmployees}</div>
            <div className="stat-desc">Nhân viên đang làm việc</div>
          </div>
        </div>

        {/* Tiêu đề và tìm kiếm */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h2 className="text-2xl font-semibold">Danh sách phòng ban</h2>
          <div className="form-control w-full md:w-80">
            <div className="input-group">
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
                  placeholder="Tìm kiếm phòng ban..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Danh sách phòng ban */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((dept) => (
              <div
                key={dept.department_id}
                className="card bg-base-100 border border-base-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="card-body p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className={`avatar placeholder mr-3`}>
                        <div
                          className={`${getDepartmentColor(
                            dept.department_id
                          )} rounded-md w-12 h-12 flex items-center justify-center`}
                        >
                          <span className="text-xl font-bold">
                            {dept.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Link href={`/departments/${dept.department_id}`}>
                          <h2 className="card-title text-lg hover:text-primary transition-colors">
                            {dept.name}
                          </h2>
                        </Link>
                        <p className="text-sm text-base-content/70 line-clamp-1">
                          {dept.description || "Không có mô tả"}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-square btn-sm btn-ghost text-error hover:bg-error hover:text-error-content"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDepartmentToDelete(dept);
                        (
                          document.getElementById(
                            "delete_modal"
                          ) as HTMLDialogElement
                        )?.showModal();
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="divider my-1"></div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-base-content/70" />
                      <p className="text-sm">
                        <span className="font-medium">Trưởng phòng:</span>{" "}
                        {dept.manager_name || "Chưa chỉ định"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-base-content/70" />
                      <p className="text-sm">
                        <span className="font-medium">Số nhân viên:</span>{" "}
                        <span className="badge badge-primary badge-sm">
                          {dept.employee_count}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="card-actions justify-end mt-auto">
                    <Link href={`/departments/${dept.department_id}`}>
                      <button className="btn btn-primary btn-sm">
                        <UserRoundPen size={16} className="mr-1" />
                        Quản lý
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-12">
              <svg
                className="h-16 w-16 text-base-content/30"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-lg font-medium text-base-content/70">
                Không tìm thấy phòng ban nào
              </p>
              <p className="text-base-content/50">
                Vui lòng thử lại với từ khóa khác hoặc tạo phòng ban mới
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Xác nhận xóa</h3>
          <p className="py-4">
            Bạn có chắc chắn muốn xóa phòng ban{" "}
            <strong className="text-error">{departmentToDelete?.name}</strong>{" "}
            không?
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">Hủy</button>
              <button
                className="btn btn-error"
                type="button"
                onClick={handleDeleteDepartment}
              >
                Xác nhận
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Departments;
