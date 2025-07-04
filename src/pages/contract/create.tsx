import { useRouter } from "next/router";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import format from "date-fns/format";

interface User {
  roles: string[];
}

interface FormData {
  employee_id: string;
  start_date: string;
  end_date: string;
}

interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  birth_date: string | null;
  gender: string | null;
  avatar_url: string | null;
  department: { department_id: string; name: string } | null;
  position: { position_id: string; name: string } | null;
  user_roles: { role: { role_id: string; name: string } }[];
}

export default function ContractCreate() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    employee_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState("");
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      setError("Vui lòng đăng nhập để tiếp tục.");
      router.push("/auths/login");
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auths/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Token không hợp lệ hoặc đã hết hạn"
          );
        }

        const parsedUser = JSON.parse(userData) as User;
        console.log("Vai trò người dùng:", parsedUser.roles);
        if (!parsedUser.roles.some((role) => ["Admin", "HR"].includes(role))) {
          setError(
            `Bạn không có quyền tạo hợp đồng. Vai trò hiện tại: ${parsedUser.roles.join(
              ", "
            )}. Vui lòng liên hệ quản trị viên.`
          );
          router.push("/error/forbidden");
          return;
        }
        setUser(parsedUser);
      } catch (error: unknown) {
        console.error("Lỗi xác minh token:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Lỗi xác minh token. Vui lòng đăng nhập lại."
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auths/login");
      }
    };

    verifyToken();
  }, [router]);

  useEffect(() => {
    if (!emailInput || !user) return;

    const fetchSuggestions = async () => {
      try {
        setSuggestionError("");
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
        }

        const response = await fetch(
          `/api/employees/by-email?email=${encodeURIComponent(emailInput)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 404) {
            setSuggestionError(
              errorData.error || "Không tìm thấy nhân viên với email này."
            );
            setSuggestions([]);
            setShowSuggestions(false);
            return;
          }
          if (response.status === 403) {
            setSuggestionError(
              `Bạn không có quyền truy cập danh sách nhân viên. Vai trò hiện tại: ${user.roles.join(
                ", "
              )}.`
            );
            router.push("/error/forbidden");
            return;
          }
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/auths/login");
            throw new Error("Token không hợp lệ hoặc đã hết hạn");
          }
          throw new Error(
            errorData.error || `Lỗi tải gợi ý nhân viên: ${response.statusText}`
          );
        }

        const data = await response.json();
        if (data.success && data.data) {
          setSuggestions([data.data]);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error: unknown) {
        console.error("Lỗi tải gợi ý nhân viên:", error);
        setSuggestionError(
          error instanceof Error
            ? error.message
            : "Lỗi không xác định khi tải gợi ý nhân viên"
        );
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [emailInput, user, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (employee: Employee) => {
    setEmailInput(employee.email);
    setSelectedEmployee(employee);
    setFormData({ ...formData, employee_id: employee.employee_id });
    setShowSuggestions(false);
    setSuggestionError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      if (!formData.employee_id) {
        throw new Error("Vui lòng chọn nhân viên.");
      }

      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: formData.employee_id,
          start_date: new Date(formData.start_date).toISOString(),
          end_date: new Date(formData.end_date).toISOString(),
          status: "ACTIVE",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          throw new Error(
            `Bạn không có quyền tạo hợp đồng. Vai trò hiện tại: ${user?.roles.join(
              ", "
            )}. Vui lòng liên hệ quản trị viên.`
          );
        }
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/auths/login");
          throw new Error("Token không hợp lệ hoặc đã hết hạn");
        }
        throw new Error(
          errorData.message || `Lỗi tạo hợp đồng: ${response.statusText}`
        );
      }

      const data = await response.json();
      if (data.success && data.contract) {
        router.push(`/contract/${data.contract.contract_id}`);
      } else {
        router.push("/contract");
      }
    } catch (error: unknown) {
      console.error("Lỗi tạo hợp đồng:", error);
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value);
    setSelectedEmployee(null);
    setFormData({ ...formData, employee_id: "" });
    setSuggestionError("");
  };

  if (!user) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  return (
    <div className="bg-base min-h-screen p-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/" className="text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link href="/contract" className="text-primary">
              Hợp đồng
            </Link>
          </li>
          <li className="text-primary">Tạo hợp đồng mới</li>
        </ul>
      </div>

      <header className="bg-base-200 shadow-lg rounded-lg mb-6">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-primary">Tạo hợp đồng mới</h1>
        </div>
      </header>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card bg-base-200 shadow-md p-6">
        <div className="card-body">
          <div className="form-control relative">
            <label className="label">
              <span className="label-text">Email nhân viên</span>
            </label>
            <input
              type="text"
              placeholder="Nhập email nhân viên"
              className="input input-bordered w-full"
              value={emailInput}
              onChange={handleEmailChange}
              required
            />
            {suggestionError && (
              <div className="text-red-500 text-sm mt-1">{suggestionError}</div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 bg-base-100 border border-gray-300 rounded-md mt-1 w-full max-h-60 overflow-y-auto"
              >
                {suggestions.map((employee) => (
                  <div
                    key={employee.employee_id}
                    className="p-2 hover:bg-base-200 cursor-pointer"
                    onClick={() => handleSelectSuggestion(employee)}
                  >
                    <p className="font-semibold">{employee.full_name}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedEmployee && (
            <div className="card bg-base-200 shadow-md mt-4">
              <div className="card-body">
                <h2 className="card-title">Thông tin nhân viên</h2>
                <div className="flex items-center gap-4">
                  {selectedEmployee.avatar_url && (
                    <img
                      src={selectedEmployee.avatar_url}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <p>
                      <strong>Họ và tên:</strong> {selectedEmployee.full_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedEmployee.email}
                    </p>
                    <p>
                      <strong>Ngày sinh:</strong>{" "}
                      {selectedEmployee.birth_date
                        ? format(
                            new Date(selectedEmployee.birth_date),
                            "dd/MM/yyyy"
                          )
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Giới tính:</strong>{" "}
                      {selectedEmployee.gender === "MALE"
                        ? "Nam"
                        : selectedEmployee.gender === "FEMALE"
                        ? "Nữ"
                        : "N/A"}
                    </p>
                    <p>
                      <strong>Phòng ban:</strong>{" "}
                      {selectedEmployee.department?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Chức vụ:</strong>{" "}
                      {selectedEmployee.position?.name || "N/A"}
                    </p>
                    <p>
                      <strong>Vai trò:</strong>{" "}
                      {selectedEmployee.user_roles
                        .map((role) => role.role.name)
                        .join(", ") || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Ngày bắt đầu</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Ngày kết thúc</span>
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Đang tạo..." : "Tạo hợp đồng"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
