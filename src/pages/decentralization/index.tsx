import React from "react";
import Link from "next/link";
import { useState } from "react";
import { Users, Shield } from "lucide-react";
import RolesManagement from "./RolesManagement";
import UserAssignments from "./UserAssignments";

// Định nghĩa kiểu dữ liệu
interface Role {
  role_id: string;
  name: string;
  description: string;
}

interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  department_id: string;
  department_name: string;
  position_id: string;
  position_name: string;
}

interface UserRole {
  user_role_id: string;
  employee_id: string;
  role_id: string;
  employee_name?: string;
  role_name?: string;
}

// Dữ liệu mẫu
const initialRoles: Role[] = [
  {
    role_id: "1",
    name: "Admin",
    description: "Quản trị hệ thống, có toàn quyền truy cập",
  },
  {
    role_id: "2",
    name: "HR",
    description: "Quản lý nhân sự, phụ trách tuyển dụng và đào tạo",
  },
  {
    role_id: "3",
    name: "Manager",
    description: "Quản lý phòng ban, phê duyệt và đánh giá nhân viên",
  },
  {
    role_id: "4",
    name: "Nhân viên",
    description: "Nhân viên thông thường",
  },
];

const initialEmployees: Employee[] = [
  {
    employee_id: "1",
    full_name: "Nguyễn Văn A",
    email: "nguyenvana@company.com",
    department_id: "1",
    department_name: "Ban Giám đốc",
    position_id: "1",
    position_name: "Giám đốc",
  },
  {
    employee_id: "2",
    full_name: "Trần Thị B",
    email: "tranthib@company.com",
    department_id: "2",
    department_name: "Phòng Nhân sự",
    position_id: "2",
    position_name: "Trưởng phòng HR",
  },
  {
    employee_id: "3",
    full_name: "Lê Văn C",
    email: "levanc@company.com",
    department_id: "3",
    department_name: "Phòng IT",
    position_id: "3",
    position_name: "Trưởng phòng IT",
  },
  {
    employee_id: "4",
    full_name: "Phạm Thị D",
    email: "phamthid@company.com",
    department_id: "4",
    department_name: "Phòng Marketing",
    position_id: "4",
    position_name: "Nhân viên tiếp thị",
  },
  {
    employee_id: "5",
    full_name: "Hoàng Văn E",
    email: "hoangvane@company.com",
    department_id: "5",
    department_name: "Phòng Kế toán",
    position_id: "5",
    position_name: "Kế toán trưởng",
  },
];

const initialUserRoles: UserRole[] = [
  { user_role_id: "1", employee_id: "1", role_id: "1" },
  { user_role_id: "2", employee_id: "2", role_id: "2" },
  { user_role_id: "3", employee_id: "3", role_id: "3" },
  { user_role_id: "4", employee_id: "4", role_id: "4" },
  { user_role_id: "5", employee_id: "5", role_id: "4" },
];

const RolesPermissionsPage: React.FC = () => {
  // State cho tab hiện tại
  const [activeTab, setActiveTab] = useState<"roles" | "assignments">("roles");

  // State cho phần quản lý vai trò
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [userRoles, setUserRoles] = useState<UserRole[]>(initialUserRoles);

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/decentralization"}>Phân cấp</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Tiêu đề */}
        <header className="bg-base-100 shadow-md rounded-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Quản lý Vai trò & Phân quyền
            </h1>
          </div>
        </header>
        {/* Nội dung chính */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          {/* Tab */}
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === "roles" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("roles")}
            >
              <Shield className="w-4 h-4 mr-2" /> Vai trò
            </button>
            <button
              className={`tab ${
                activeTab === "assignments" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("assignments")}
            >
              <Users className="w-4 h-4 mr-2" /> Phân quyền người dùng
            </button>
          </div>
          {/* Nội dung tab */}
          {activeTab === "roles" && (
            <RolesManagement
              roles={roles}
              setRoles={setRoles}
              userRoles={userRoles}
              setUserRoles={setUserRoles}
            />
          )}
          {activeTab === "assignments" && (
            <UserAssignments
              roles={roles}
              employees={initialEmployees}
              userRoles={userRoles}
              setUserRoles={setUserRoles}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
