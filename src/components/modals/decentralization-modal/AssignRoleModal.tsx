import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { Role, Employee } from "@/types/decentralization";

interface AssignRoleModalProps {
  isOpen: boolean;
  employees: Employee[];
  roles: Role[];
  selectedEmployee: Employee | null;
  selectedRole: string;
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedRole: (roleId: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({
  isOpen,
  employees,
  roles,
  selectedEmployee,
  selectedRole,
  setSelectedEmployee,
  setSelectedRole,
  onClose,
  onSave,
}) => {
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchEmail.trim()) {
      const filtered = employees.filter((emp) =>
        emp.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
      setFilteredEmployees(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredEmployees([]);
      setShowSuggestions(false);
    }
  }, [searchEmail, employees]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSearchEmail(employee.email);
    setShowSuggestions(false);
    setError("");
  };

  const handleSave = () => {
    if (!selectedEmployee) {
      setError("Vui lòng chọn nhân viên");
      return;
    }
    if (!selectedRole) {
      setError("Vui lòng chọn vai trò");
      return;
    }
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      onSave();
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <dialog id="assign_role" className="modal modal-middle">
      <div className="modal-box bg-base-100 shadow-2xl rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-primary tracking-tight">
            Gán vai trò cho nhân viên
          </h3>
          <button
            className="btn btn-sm btn-circle btn-ghost hover:bg-base-200 transition-colors"
            onClick={onClose}
            title="Đóng"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="form-control relative">
            <label className="label flex items-center gap-1">
              <span className="label-text font-medium">Email nhân viên</span>
              <span className="text-error text-xs">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              className={`input input-bordered w-full transition-all duration-200 ${
                error && !selectedEmployee
                  ? "input-error"
                  : "focus:ring-2 focus:ring-primary"
              }`}
              placeholder="Nhập email nhân viên"
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                setSelectedEmployee(null);
                setError("");
              }}
              onFocus={() => searchEmail.trim() && setShowSuggestions(true)}
            />
            {showSuggestions && filteredEmployees.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full bg-base-100 border border-base-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
              >
                {filteredEmployees.map((emp) => (
                  <div
                    key={emp.employee_id}
                    className="px-4 py-2 hover:bg-primary hover:text-primary-content cursor-pointer transition-colors"
                    onClick={() => handleSelectEmployee(emp)}
                  >
                    <div className="font-medium">{emp.full_name}</div>
                    <div className="text-sm text-gray-500">{emp.email}</div>
                    <div className="text-xs text-gray-400">
                      {emp.position_name || "Chưa có chức vụ"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {error && !selectedEmployee && (
              <div className="flex items-center gap-1 mt-1 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
          <div className="form-control">
            <label className="label flex items-center gap-1">
              <span className="label-text font-medium">Vai trò</span>
              <span className="text-error text-xs">*</span>
            </label>
            <select
              className={`select select-bordered w-full transition-all duration-200 ${
                error && !selectedRole
                  ? "select-error"
                  : "focus:ring-2 focus:ring-primary"
              }`}
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setError("");
              }}
            >
              <option value="" disabled>
                -- Chọn vai trò --
              </option>
              {roles.map((role) => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name}
                </option>
              ))}
            </select>
            {error && !selectedRole && (
              <div className="flex items-center gap-1 mt-1 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </div>
        <div className="modal-action mt-8 flex justify-end gap-3">
          <button
            className="btn btn-outline btn-sm px-6 hover:bg-base-200 transition-colors"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            className="btn btn-primary btn-sm px-6 flex items-center gap-2"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : null}
            Gán vai trò
          </button>
        </div>
      </div>
    </dialog>
  );
};
