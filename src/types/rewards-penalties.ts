export type RewardPenaltyType = "Thưởng" | "Phạt";
export type RewardPenaltyStatus = "Đã duyệt" | "Chờ duyệt" | "Đã từ chối";

export interface RewardPenalty {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string | null;
  position: string | null;
  type: RewardPenaltyType;
  amount: number;
  reason: string;
  month: string;
  created_at: string;
  status: RewardPenaltyStatus;
  approver: string | null;
}

export interface Employee {
  email: string;
  id: string;
  name: string;
  department: string | null;
  position: string | null;
}

export interface EmployeeApiResponse {
  employee_id: string;
  full_name: string;
  department_name: string | null;
  position_name: string | null;
}

export interface Department {
  id: string;
  name: string;
}