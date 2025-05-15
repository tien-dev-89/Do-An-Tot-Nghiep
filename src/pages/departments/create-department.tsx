import React, { useState } from "react";
import { useRouter } from "next/router";
import { Department, Employee } from "./index";
import Link from "next/link";

// Dữ liệu giả lập từ context hoặc API
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

const CreateDepartment: React.FC = () => {
  const router = useRouter();
  const [newDepartment, setNewDepartment] = useState<Department>({
    department_id: "",
    name: "",
    manager_id: null,
    description: "",
  });

  const handleCreateDepartment = () => {
    if (newDepartment.name) {
      // Giả lập lưu vào context hoặc API
      console.log("Tạo phòng ban:", {
        ...newDepartment,
        department_id: String(Date.now()), // Giả lập ID
        manager_name: newDepartment.manager_id
          ? mockEmployees.find(
              (emp) => emp.employee_id === newDepartment.manager_id
            )?.full_name
          : "Chưa chỉ định",
      });
      router.push("/departments");
    }
  };

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Home</Link>
          </li>
          <li>
            <Link href={"/departments"}>Departments</Link>
          </li>
          <li>
            <a>Create Departments</a>
          </li>
        </ul>
      </div>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tạo phòng ban mới</h1>
        <div className="card bg-base-200 p-6">
          <div className="grid gap-2 form-control pb-6">
            <label className="label pr-2">
              <span className="label-text">Tên phòng ban</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2 form-control pb-6">
            <label className="label pr-2">
              <span className="label-text">Mô tả</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={newDepartment.description || ""}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2 form-control pb-6">
            <label className="label pr-2">
              <span className="label-text">Trưởng phòng (ID)</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={newDepartment.manager_id || ""}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  manager_id: e.target.value,
                })
              }
              placeholder="ID trưởng phòng (tùy chọn)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => router.push("/departments")}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleCreateDepartment}
            >
              Tạo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDepartment;
