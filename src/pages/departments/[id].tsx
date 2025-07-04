import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import { Department } from "@/types/employee";

const DepartmentDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState<"details" | "members">("details");
  const [department, setDepartment] = useState<Department | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch dữ liệu phòng ban
  useEffect(() => {
    if (!id) return;
    const fetchDepartment = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching department with id: ${id}`);
        const res = await fetch(`/api/departments/${id}`);
        const data = await res.json();
        console.log("API GET response:", { status: res.status, data });
        if (res.ok) {
          setDepartment(data);
          setEditName(data.name);
          setEditDescription(data.description || "");
        } else {
          toast.error(data.error || "Không tìm thấy phòng ban", {
            autoClose: 3000,
            position: "top-right",
            theme: "light",
          });
        }
      } catch (error) {
        console.error("Fetch department error:", error);
        toast.error(`Lỗi khi tải dữ liệu phòng ban: ${String(error)}`, {
          autoClose: 3000,
          position: "top-right",
          theme: "light",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDepartment();
  }, [id]);

  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      console.log(`Removing employee: ${employeeId}`);
      const res = await fetch(`/api/departments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", employee_id: employeeId }),
      });
      const data = await res.json();
      console.log("Remove employee response:", { status: res.status, data });
      if (res.ok) {
        setDepartment((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            employees:
              prev.employees?.filter((emp) => emp.employee_id !== employeeId) ||
              [],
            employee_count:
              data.employee_count ?? (prev.employee_count || 0) - 1,
          };
        });
        toast.success("Xóa nhân viên hoàn thành", {
          autoClose: 3000,
          position: "top-right",
          theme: "light",
        });
      } else {
        toast.error(data.error || "Lỗi khi xóa nhân viên", {
          autoClose: 3000,
          position: "top-right",
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Remove employee error:", error);
      toast.error(`Lỗi khi xóa nhân viên: ${String(error)}`, {
        autoClose: 3000,
        position: "top-right",
        theme: "light",
      });
    }
  };

  const handleSaveDepartment = async () => {
    if (!editName.trim()) {
      toast.error("Tên phòng ban không được để trống", {
        autoClose: 3000,
        position: "top-right",
        theme: "light",
      });
      return;
    }

    try {
      console.log("Saving department:", {
        name: editName,
        description: editDescription,
      });
      const res = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      const data = await res.json();
      console.log("Save department response:", { status: res.status, data });
      if (res.ok) {
        setDepartment((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            name: data.name,
            description: data.description || null,
            employee_count: data.employee_count ?? prev.employee_count,
          };
        });
        toast.success("Cập nhật phòng ban hoàn thành", {
          autoClose: 3000,
          position: "top-right",
          theme: "light",
        });
      } else {
        toast.error(data.error || "Lỗi khi cập nhật phòng ban", {
          autoClose: 3000,
          position: "top-right",
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Save department error:", error);
      toast.error(`Lỗi khi cập nhật phòng ban: ${String(error)}`, {
        autoClose: 3000,
        position: "top-right",
        theme: "light",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!department) {
    return <div className="p-6">Phòng ban không tồn tại</div>;
  }

  // Lọc nhân viên theo tìm kiếm
  const departmentEmployees =
    department.employees
      ?.filter((emp) => emp.employment_status !== "Nghỉ việc")
      .filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/departments">Phòng ban</Link>
          </li>
          <li>
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
              <strong>Số nhân viên:</strong> {department.employee_count || 0}
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
            <div className="form-control mb-4 grid gap-1">
              <label className="label">
                <span className="label-text">Tìm kiếm nhân viên</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Nhập tên hoặc email nhân viên"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
                        <th>Giới tính</th>
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
                          <td>{emp.gender || "Chưa xác định"}</td>
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
                <p>Chưa có nhân viên phù hợp trong phòng ban này.</p>
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
