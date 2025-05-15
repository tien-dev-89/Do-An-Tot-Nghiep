import React, { useState } from "react";
import { useRouter } from "next/router";
import { Department } from "./index";
import { Employee } from "../employees/index";
import Link from "next/link";

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

const DepartmentDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState<"details" | "members">("details");
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [newEmployeeId, setNewEmployeeId] = useState<string>("");
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const department = departments.find((dept) => dept.department_id === id);
  const departmentEmployees = employees.filter(
    (emp) => emp.department_id === id && emp.employment_status !== "Nghỉ việc"
  );
  const employeeCount = departmentEmployees.length;

  // Khởi tạo giá trị chỉnh sửa khi phòng ban được tải
  React.useEffect(() => {
    if (department) {
      setEditName(department.name);
      setEditDescription(department.description || "");
    }
  }, [department]);

  const handleAddEmployee = () => {
    if (newEmployeeId) {
      setEmployees((prev) => [
        ...prev,
        {
          employee_id: newEmployeeId,
          full_name: `Nhân viên ${newEmployeeId}`,
          department_id: id as string,
          employment_status: "Đang làm",
          email: `nhanvien${newEmployeeId}@example.com`,
          phone: `0905${newEmployeeId.padStart(6, "0")}`,
        },
      ]);
      setNewEmployeeId("");
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employee_id === employeeId
          ? { ...emp, employment_status: "Nghỉ việc" }
          : emp
      )
    );
  };

  const handleSaveDepartment = () => {
    if (!editName.trim()) {
      setError("Tên phòng ban không được để trống");
      setSuccess("");
      return;
    }

    setDepartments((prev) =>
      prev.map((dept) =>
        dept.department_id === id
          ? {
              ...dept,
              name: editName.trim(),
              description: editDescription.trim() || null,
            }
          : dept
      )
    );
    setError("");
    setSuccess("Cập nhật phòng ban thành công");
    setTimeout(() => setSuccess(""), 3000); // Xóa thông báo sau 3 giây
  };

  if (!department) {
    return <div className="p-6">Phòng ban không tồn tại</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Home</Link>
          </li>
          <li>
            <Link href={"/departments"}>Phòng ban</Link>
          </li>
          <li>
            {/* <Link href={"/departments/[id]"}>{department.name}</Link> */}
            <a>{department.name}</a>
          </li>
        </ul>
      </div>
      <h1 className="text-2xl font-bold mb-6">{department.name}</h1>
      <div className="tabs mb-6">
        <a
          className={`tab tab-lifted ${
            activeTab === "details" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("details")}
        >
          Chi tiết
        </a>
        <a
          className={`tab tab-lifted ${
            activeTab === "members" ? "tab-active" : ""
          }`}
          onClick={() => setActiveTab("members")}
        >
          Quản lý thành viên
        </a>
      </div>

      <div className="card bg-base-200 p-6">
        {activeTab === "details" && (
          <div>
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success mb-4">
                <span>{success}</span>
              </div>
            )}
            <div className="grid gap-2 form-control pb-6">
              <label className="label">
                <span className="label-text">Tên phòng ban</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nhập tên phòng ban"
              />
            </div>
            <div className="grid gap-2 form-control mb-4">
              <label className="label">
                <span className="label-text">Mô tả</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Nhập mô tả phòng ban"
              />
            </div>
            <p className="mb-4">
              <strong>Trưởng phòng:</strong>{" "}
              {department.manager_name || "Chưa chỉ định"}
            </p>
            <p className="mb-4">
              <strong>Số nhân viên:</strong> {employeeCount}
            </p>
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={handleSaveDepartment}
              >
                Lưu
              </button>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Thêm nhân viên (ID)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={newEmployeeId}
                  onChange={(e) => setNewEmployeeId(e.target.value)}
                  placeholder="Nhập ID nhân viên"
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleAddEmployee}
                >
                  Thêm
                </button>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Danh sách nhân viên:</h4>
              {departmentEmployees.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Họ và tên</th>
                        <th>ID nhân viên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Chức vụ</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentEmployees.map((emp, index) => (
                        <tr key={emp.employee_id}>
                          <td>{index + 1}</td>
                          <td>{emp.full_name}</td>
                          <td>{emp.employee_id}</td>
                          <td>{emp.email}</td>
                          <td>{emp.phone}</td>
                          <td>
                            {emp.employee_id === department.manager_id
                              ? "Trưởng phòng"
                              : "Nhân viên"}
                          </td>
                          <td>{emp.employment_status}</td>
                          <td>
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() =>
                                handleRemoveEmployee(emp.employee_id)
                              }
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>Chưa có nhân viên trong phòng ban này.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            className="btn btn-ghost"
            onClick={() => router.push("/departments")}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetail;
