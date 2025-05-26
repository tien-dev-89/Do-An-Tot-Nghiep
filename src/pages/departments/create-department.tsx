import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import { Department, EmployeeOption } from "@/types/employee";

// Type guard để kiểm tra EmployeeOption
const isEmployeeOptionArray = (data: unknown): data is EmployeeOption[] => {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "employee_id" in item &&
        typeof item.employee_id === "string" &&
        "full_name" in item &&
        typeof item.full_name === "string"
    )
  );
};

const CreateDepartment: React.FC = () => {
  const router = useRouter();
  const [newDepartment, setNewDepartment] = useState<
    Omit<Department, "department_id" | "employee_count" | "employees">
  >({
    name: "",
    manager_id: null,
    manager_name: undefined,
    description: "",
  });
  const [availableEmployees, setAvailableEmployees] = useState<
    EmployeeOption[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Lấy danh sách nhân viên có thể làm trưởng phòng
  useEffect(() => {
    const fetchAvailableEmployees = async () => {
      try {
        const res = await fetch("/api/employees/available");
        const data = await res.json();
        if (res.ok && isEmployeeOptionArray(data)) {
          setAvailableEmployees(data);
        } else {
          setError(data.error || "Lỗi khi lấy danh sách nhân viên");
          toast.error(data.error || "Lỗi khi lấy danh sách nhân viên");
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError("Lỗi khi tải danh sách nhân viên");
        toast.error("Lỗi khi tải danh sách nhân viên");
      }
    };
    fetchAvailableEmployees();
  }, []);

  const handleCreateDepartment = async () => {
    if (!newDepartment.name.trim()) {
      setError("Tên phòng ban không được để trống");
      toast.error("Tên phòng ban không được để trống");
      setSuccess("");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDepartment.name,
          description: newDepartment.description,
          manager_id: newDepartment.manager_id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Tạo phòng ban thành công");
        toast.success("Tạo phòng ban thành công");
        setTimeout(() => {
          router.push({
            pathname: "/departments",
            query: { newDepartment: JSON.stringify(data) },
          });
        }, 1000);
      } else {
        setError(data.error || "Lỗi khi tạo phòng ban");
        toast.error(data.error || "Lỗi khi tạo phòng ban");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Lỗi khi tạo phòng ban");
      toast.error("Lỗi khi tạo phòng ban");
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa thông báo sau 3 giây
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/departments">Phòng ban</Link>
          </li>
          <li>
            <a>Tạo phòng ban</a>
          </li>
        </ul>
      </div>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tạo phòng ban mới</h1>
        <div className="card bg-base-200 p-6">
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
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2 form-control pb-6">
            <label className="label">
              <span className="label-text">Mô tả</span>
            </label>
            <textarea
              className="textarea textarea-bordered"
              value={newDepartment.description || ""}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  description: e.target.value || null,
                })
              }
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2 form-control pb-6">
            <label className="label">
              <span className="label-text">Trưởng phòng</span>
            </label>
            <select
              className="select select-bordered"
              value={newDepartment.manager_id || ""}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  manager_id: e.target.value || null,
                })
              }
              disabled={isLoading}
            >
              <option value="">Chọn trưởng phòng (tùy chọn)</option>
              {availableEmployees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.full_name} (ID: {emp.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-ghost"
              onClick={() => router.push("/departments")}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleCreateDepartment}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Tạo"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDepartment;
