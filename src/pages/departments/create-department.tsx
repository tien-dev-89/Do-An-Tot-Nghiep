import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import { Department } from "@/types/employee";

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
  const [managerEmail, setManagerEmail] = useState<string>("");
  const [managerName, setManagerName] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Kiểm tra email để lấy manager_id
  const validateEmail = async (email: string) => {
    if (!email.trim()) {
      setEmailError("");
      setManagerName(null);
      setNewDepartment({
        ...newDepartment,
        manager_id: null,
        manager_name: "",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const res = await fetch(
        `/api/employees/by-email?email=${encodeURIComponent(email)}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `x ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setEmailError("");
        setManagerName(data.full_name);
        setNewDepartment({
          ...newDepartment,
          manager_id: data.employee_id,
          manager_name: data.full_name,
        });
      } else {
        setEmailError(data.error || "Không tìm thấy nhân viên với email này");
        setManagerName(null);
        setNewDepartment({
          ...newDepartment,
          manager_id: null,
          manager_name: "",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setEmailError("Lỗi khi kiểm tra email");
      setManagerName(null);
      setNewDepartment({
        ...newDepartment,
        manager_id: null,
        manager_name: "",
      });
    }
  };

  const handleCreateDepartment = async () => {
    if (!newDepartment.name.trim()) {
      setError("Tên phòng ban không được để trống");
      toast.error("Tên phòng ban không được để trống");
      setSuccess("");
      return;
    }

    if (managerEmail && emailError) {
      toast.error(emailError);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      const res = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `x ${token}`,
        },
        body: JSON.stringify({
          name: newDepartment.name,
          description: newDepartment.description || null,
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
            <Link href="/" className="text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link href="/departments" className="text-primary">
              Phòng ban
            </Link>
          </li>
          <li>
            <a className="text-primary">Tạo phòng ban</a>
          </li>
        </ul>
      </div>

      <header className="bg-base-200 shadow-md rounded-sm">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-primary">
              Tạo phòng ban mới
            </h1>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
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
              <span className="label-text">Email trưởng phòng</span>
            </label>
            <label className="input validator flex items-center gap-2">
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
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </g>
              </svg>
              <input
                type="email"
                placeholder="mail@site.com"
                value={managerEmail}
                onChange={(e) => {
                  setManagerEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                disabled={isLoading}
              />
            </label>
            {emailError && (
              <div className="validator-hint text-error">{emailError}</div>
            )}
            {managerName && !emailError && (
              <p className="text-sm text-success mt-1">
                Trưởng phòng: {managerName}
              </p>
            )}
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
