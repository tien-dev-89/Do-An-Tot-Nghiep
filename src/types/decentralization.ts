export interface Role {
  role_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  department_id: string | null;
  department_name: string | null;
  position_id: string | null;
  position_name: string | null;
}

export interface UserRole {
  data: UserRole;
  user_role_id: string;
  employee_id: string;
  role_id: string;
  employee_name: string;
  role_name: string;
}

export interface RolePermission {
  permission_id: string;
  role_id: string;
  resource: string;
  action: string;
}