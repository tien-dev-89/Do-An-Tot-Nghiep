// src/types/salary.ts
export interface AttendanceRecord {
  attendance_id: string;
  employee_id: string;
  employee_name?: string | null;
  department_name?: string | null;
  date: string;
  clock_in_time?: string | null;
  clock_out_time?: string | null;
  shift_id?: string | null;
  shift_name?: string | null;
  late_minutes: number;
  early_leave_minutes: number;
  overtime_hours: number; // Phải là number
  created_at: string;
  updated_at: string;
  status: "Đúng giờ" | "Đi muộn" | "Về sớm" | "Đi muộn và về sớm" | "Vắng mặt";
}

export interface Employee {
  employee_id: string;
  full_name: string;
  department_id: string;
  department_name?: string;
  email: string;
}

export interface Shift {
  shift_id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}