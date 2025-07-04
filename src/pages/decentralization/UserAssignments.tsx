"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Role, Employee, UserRole } from "@/types/decentralization";

interface UserAssignmentsProps {
  token: string;
  roles: Role[];
  employees: Employee[];
  userRoles: UserRole[];
  setUserRoles: React.Dispatch<React.SetStateAction<UserRole[]>>;
}

const UserAssignments: React.FC<UserAssignmentsProps> = ({
  token,
  roles,
  employees,
  userRoles,
  setUserRoles,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [emailInput, setEmailInput] = useState<string>("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries = 2
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await fetchWithRetry("/api/user-roles", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setUserRoles(data.data.userRoles);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi tải phân quyền";
      setError(message);
      toast.error(message);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Vui lòng đăng nhập lại");
      toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      return;
    }
    fetchUserRoles();
  }, [token]);

  // Lọc nhân viên dựa trên email nhập
  useEffect(() => {
    if (emailInput.trim()) {
      const filtered = employees.filter((employee) =>
        employee.email?.toLowerCase().includes(emailInput.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setIsDropdownOpen(true);
    } else {
      setFilteredEmployees([]);
      setIsDropdownOpen(false);
    }
  }, [emailInput, employees]);

  // Đóng dropdown khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Chọn nhân viên từ gợi ý, điền email đầy đủ vào input
  const handleSelectEmployee = (employee: Employee) => {
    console.log("Selected employee:", employee); // Debug log
    setSelectedEmployeeId(employee.employee_id); // Lưu ID nhân viên
    setEmailInput(employee.email || ""); // Thay thế input bằng email đầy đủ
    setIsDropdownOpen(false); // Đóng dropdown
  };

  const handleAssignRole = async () => {
    if (!selectedEmployeeId || !selectedRole) {
      toast.error("Vui lòng chọn nhân viên và vai trò");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchWithRetry("/api/user-roles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: selectedEmployeeId,
          role_id: selectedRole,
        }),
      });

      const data = await response.json();
      toast.success("Gán vai trò thành công");
      setUserRoles([...userRoles, data.data]);
      setSelectedEmployeeId(null); // Reset nhân viên
      setEmailInput(""); // Reset input email
      setSelectedRole(null); // Reset vai trò
      setIsDropdownOpen(false); // Đóng dropdown
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi gán vai trò";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (userRoleId: string) => {
    setIsLoading(true);
    try {
      const response = await fetchWithRetry(`/api/user-roles/${userRoleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể xóa phân quyền");
      }

      toast.success("Xóa phân quyền thành công");
      setUserRoles(userRoles.filter((ur) => ur.user_role_id !== userRoleId));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Lỗi khi xóa phân quyền";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !error) {
    return <div className="text-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Phân quyền người dùng</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative" ref={dropdownRef}>
          <label className="block mb-2 font-semibold">
            Nhập email nhân viên:
          </label>
          <input
            type="email"
            className="input input-bordered w-full"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Nhập email nhân viên"
            disabled={isLoading}
            autoComplete="off"
          />
          {isDropdownOpen && (
            <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredEmployees.length > 0
                ? filteredEmployees.map((employee) => (
                    <li
                      key={employee.employee_id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectEmployee(employee)}
                    >
                      {employee.full_name} ({employee.email || "Không có email"}
                      )
                    </li>
                  ))
                : emailInput.trim() && (
                    <li className="px-4 py-2 text-gray-500">
                      Không tìm thấy nhân viên
                    </li>
                  )}
            </ul>
          )}
        </div>
        <div>
          <label className="block mb-2 font-semibold">Chọn vai trò:</label>
          <select
            className="select select-bordered w-full"
            value={selectedRole || ""}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={isLoading}
          >
            <option value="" disabled>
              Chọn vai trò
            </option>
            {roles.map((role) => (
              <option key={role.role_id} value={role.role_id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        className="btn btn-primary mt-4"
        onClick={handleAssignRole}
        disabled={isLoading || !selectedEmployeeId || !selectedRole}
      >
        Gán vai trò
      </button>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Danh sách phân quyền</h3>
        {userRoles.length === 0 ? (
          <p className="text-center">Chưa có phân quyền nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Vai trò</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {userRoles.map((userRole) => (
                  <tr key={userRole.user_role_id}>
                    <td>{userRole.employee_name}</td>
                    <td>{userRole.role_name}</td>
                    <td>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleRemoveRole(userRole.user_role_id)}
                        disabled={isLoading}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAssignments;
