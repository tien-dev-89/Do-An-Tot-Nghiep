export type Gender = "Nam" | "Nữ" | "";
export type EmploymentStatus = "Đang làm" | "Thử việc" | "Nghỉ việc" | "Nghỉ thai sản";

// Dữ liệu thô từ API /api/employees
export interface RawEmployee {
  employee_id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  gender: "MALE" | "FEMALE" | null;
  employment_status: "ACTIVE" | "PROBATION" | "TERMINATED" | "MATERNITY_LEAVE";
  department_id: string | null;
  department_name: string;
  position_id: string;
  position_name: string;
  avatar_url: string | null;
  birth_date: string;
  address: string;
  join_date: string;
  leave_date: string | null;
  created_at: string;
  updated_at: string;
}

// Dữ liệu cho select box trưởng phòng
export interface EmployeeOption {
  employee_id: string;
  full_name: string;
}

export interface Employee {
  employee_id: string;
  avatar_url: string | null;
  full_name: string;
  email: string;
  phone: string;
  phone_number: string;
  birth_date: string;
  gender: Gender | "MALE" | "FEMALE" | "";
  address: string;
  department_id: string;
  department_name: string;
  position_id: string;
  position_name: string;
  employment_status: EmploymentStatus;
  join_date: string;
  leave_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  department_id: string;
  name: string;
  manager_id: string | null;
  manager_name?: string;
  description: string | null;
  employee_count?: number;
  employees?: Employee[];
}