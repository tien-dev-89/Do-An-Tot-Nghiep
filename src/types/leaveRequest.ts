export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL';
export type LeaveRequestStatus = 'Chờ duyệt' | 'Đã duyệt' | 'Bị từ chối';

export interface LeaveRequest {
  leave_request_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LeaveRequestStatus;
  approver_id: string | null;
  approver_name: string | null;
  created_at: string;
  updated_at: string;
}
