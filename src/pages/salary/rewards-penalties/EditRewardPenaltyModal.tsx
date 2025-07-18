import React, { useState, useEffect, useRef } from "react";
import {
  Employee,
  RewardPenalty,
  RewardPenaltyType,
} from "@/types/rewards-penalties";
import { Search } from "lucide-react";

interface EditRewardPenaltyModalProps {
  show: boolean;
  onClose: () => void;
  employees: Employee[];
  currentRewardPenalty: RewardPenalty | null;
  newRewardPenalty: {
    employee_id: string;
    type: RewardPenaltyType;
    amount: number;
    reason: string;
    month: string;
  };
  setNewRewardPenalty: React.Dispatch<
    React.SetStateAction<{
      employee_id: string;
      type: RewardPenaltyType;
      amount: number;
      reason: string;
      month: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

interface EmployeeApiResponse {
  employee_id: string;
  full_name: string;
  department_name: string | null;
  position_name: string | null;
  email: string;
}

export default function EditRewardPenaltyModal({
  show,
  onClose,
  employees,
  currentRewardPenalty,
  newRewardPenalty,
  setNewRewardPenalty,
  onSubmit,
}: EditRewardPenaltyModalProps) {
  const [emailQuery, setEmailQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Initialize emailQuery with the current employee's email
  useEffect(() => {
    if (currentRewardPenalty) {
      const employee = employees.find(
        (emp) => emp.id === currentRewardPenalty.employee_id
      );
      setEmailQuery(
        employee?.email || currentRewardPenalty.employee_name || ""
      );
    }
  }, [currentRewardPenalty, employees]);

  // Fetch employees based on email query
  useEffect(() => {
    const fetchEmployees = async () => {
      if (emailQuery.length < 2) {
        setFilteredEmployees([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const response = await fetch(`/api/employees?email=${emailQuery}`, {
          headers: { Authorization: "x your-token" },
        });
        if (!response.ok) throw new Error("Lỗi khi lấy danh sách nhân viên");
        const data = await response.json();
        setFilteredEmployees(
          data.employees.map((emp: EmployeeApiResponse) => ({
            id: emp.employee_id,
            name: emp.full_name,
            department: emp.department_name,
            position: emp.position_name,
            email: emp.email,
          }))
        );
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
        setFilteredEmployees([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(debounce);
  }, [emailQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emailInputRef.current &&
        !emailInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!show || !currentRewardPenalty) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box overflow-auto max-h-[80vh]">
        <h3 className="font-bold text-lg mb-4 text-primary">
          Chỉnh sửa Thưởng/Phạt
        </h3>
        <form onSubmit={onSubmit}>
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Email nhân viên</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Nhập email nhân viên..."
                value={emailQuery}
                onChange={(e) => {
                  setEmailQuery(e.target.value);
                  setNewRewardPenalty({ ...newRewardPenalty, employee_id: "" });
                }}
                ref={emailInputRef}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {showSuggestions && filteredEmployees.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg rounded-box max-h-60 overflow-auto">
                {filteredEmployees.map((emp) => (
                  <li
                    key={emp.id}
                    className="p-2 hover:bg-base-200 cursor-pointer"
                    onClick={() => {
                      setNewRewardPenalty({
                        ...newRewardPenalty,
                        employee_id: emp.id,
                      });
                      setEmailQuery(emp.email || emp.name);
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-xs text-gray-500">
                      {emp.email} | {emp.department || "-"} |{" "}
                      {emp.position || "-"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showSuggestions &&
              filteredEmployees.length === 0 &&
              emailQuery && (
                <div className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg rounded-box p-2 text-gray-500">
                  Không tìm thấy nhân viên
                </div>
              )}
          </div>

          <div
            className="form-control mb-3"
            style={{ paddingTop: showSuggestions ? "12rem" : "0" }}
          >
            <label className="label">
              <span className="label-text">Loại</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={newRewardPenalty.type}
              onChange={(e) =>
                setNewRewardPenalty({
                  ...newRewardPenalty,
                  type: e.target.value as RewardPenaltyType,
                })
              }
              required
            >
              <option value="Thưởng">Thưởng</option>
              <option value="Phạt">Phạt</option>
            </select>
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Số tiền (VNĐ)</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              placeholder="Nhập số tiền"
              value={newRewardPenalty.amount}
              onChange={(e) =>
                setNewRewardPenalty({
                  ...newRewardPenalty,
                  amount: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              required
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Lý do</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Nhập lý do thưởng/phạt"
              value={newRewardPenalty.reason}
              onChange={(e) =>
                setNewRewardPenalty({
                  ...newRewardPenalty,
                  reason: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Tháng áp dụng</span>
            </label>
            <input
              type="month"
              className="input input-bordered w-full"
              value={newRewardPenalty.month}
              onChange={(e) =>
                setNewRewardPenalty({
                  ...newRewardPenalty,
                  month: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!newRewardPenalty.employee_id}
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}
