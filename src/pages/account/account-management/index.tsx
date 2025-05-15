import { CirclePlus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import AccountList from "./AccountList";
import LoginLogComponent from "./LoginLog";

// Định nghĩa kiểu dữ liệu
interface User {
  user_id: string;
  employee_id: string;
  username: string;
  password_hash: string;
  is_active: boolean;
  last_login_at: string;
  created_at: string;
  updated_at: string;
  employee: {
    employee_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url: string | null;
    department: {
      department_id: string;
      name: string;
    };
    position: {
      position_id: string;
      name: string;
    };
    employment_status: "Đang làm" | "Thử việc" | "Nghỉ việc" | "Nghỉ thai sản";
  };
  roles: {
    role_id: string;
    name: "Admin" | "HR" | "Manager" | "Employee";
  }[];
}

interface LoginLog {
  log_id: string;
  user_id: string;
  username: string;
  login_time: string;
  status: "success" | "failed";
  failure_reason?: string;
}

// Dữ liệu mẫu
const users: User[] = [
  {
    user_id: "1",
    employee_id: "EMP001",
    username: "nguyen.van.a",
    password_hash: "123456789012345",
    is_active: true,
    last_login_at: "2025-05-10T08:30:00",
    created_at: "2024-01-15T08:30:00",
    updated_at: "2025-05-10T08:30:00",
    employee: {
      employee_id: "EMP001",
      full_name: "Nguyễn Văn A",
      email: "nguyen.van.a@company.com",
      phone_number: "0901234567",
      avatar_url: null,
      department: {
        department_id: "DEP001",
        name: "Kỹ thuật",
      },
      position: {
        position_id: "POS001",
        name: "Trưởng phòng",
      },
      employment_status: "Đang làm",
    },
    roles: [
      { role_id: "R001", name: "Admin" },
      { role_id: "R003", name: "Manager" },
    ],
  },
  {
    user_id: "2",
    employee_id: "EMP002",
    username: "tran.thi.b",
    password_hash: "987654321098765",
    is_active: true,
    last_login_at: "2025-05-11T09:15:00",
    created_at: "2024-02-20T10:15:00",
    updated_at: "2025-05-11T09:15:00",
    employee: {
      employee_id: "EMP002",
      full_name: "Trần Thị B",
      email: "tran.thi.b@company.com",
      phone_number: "0912345678",
      avatar_url: null,
      department: {
        department_id: "DEP002",
        name: "Nhân sự",
      },
      position: {
        position_id: "POS002",
        name: "Nhân viên",
      },
      employment_status: "Đang làm",
    },
    roles: [{ role_id: "R002", name: "HR" }],
  },
  {
    user_id: "3",
    employee_id: "EMP003",
    username: "le.van.c",
    password_hash: "112233445566778",
    is_active: false,
    last_login_at: "2025-05-01T10:45:00",
    created_at: "2024-03-10T08:00:00",
    updated_at: "2025-05-01T10:45:00",
    employee: {
      employee_id: "EMP003",
      full_name: "Lê Văn C",
      email: "le.van.c@company.com",
      phone_number: "0923456789",
      avatar_url: null,
      department: {
        department_id: "DEP003",
        name: "Kế toán",
      },
      position: {
        position_id: "POS003",
        name: "Kế toán trưởng",
      },
      employment_status: "Nghỉ việc",
    },
    roles: [{ role_id: "R004", name: "Employee" }],
  },
  {
    user_id: "4",
    employee_id: "EMP004",
    username: "pham.thi.d",
    password_hash: "998877665544332",
    is_active: true,
    last_login_at: "2025-05-10T14:20:00",
    created_at: "2024-04-05T09:30:00",
    updated_at: "2025-05-10T14:20:00",
    employee: {
      employee_id: "EMP004",
      full_name: "Phạm Thị D",
      email: "pham.thi.d@company.com",
      phone_number: "0934567890",
      avatar_url: null,
      department: {
        department_id: "DEP004",
        name: "Marketing",
      },
      position: {
        position_id: "POS002",
        name: "Nhân viên",
      },
      employment_status: "Thử việc",
    },
    roles: [{ role_id: "R004", name: "Employee" }],
  },
];

const loginLogs: LoginLog[] = [
  {
    log_id: "l1",
    user_id: "1",
    username: "nguyen.van.a",
    login_time: "2025-05-11T08:30:00",
    status: "success",
  },
  {
    log_id: "l2",
    user_id: "2",
    username: "tran.thi.b",
    login_time: "2025-05-11T09:15:00",
    status: "success",
  },
  {
    log_id: "l3",
    user_id: "3",
    username: "le.van.c",
    login_time: "2025-05-10T10:45:00",
    status: "failed",
    failure_reason: "Mật khẩu không chính xác",
  },
  {
    log_id: "l4",
    user_id: "4",
    username: "pham.thi.d",
    login_time: "2025-05-10T14:20:00",
    status: "success",
  },
  {
    log_id: "l5",
    user_id: "1",
    username: "nguyen.van.a",
    login_time: "2025-05-10T07:30:00",
    status: "success",
  },
  {
    log_id: "l6",
    user_id: "3",
    username: "le.van.c",
    login_time: "2025-05-10T10:30:00",
    status: "failed",
    failure_reason: "Tài khoản đã bị khóa",
  },
];

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState<"account-list" | "login-log">(
    "account-list"
  );

  return (
    <div className="w-[1158px]">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"} className="text-primary">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href={"/account/account-management"} className="text-primary">
              Tài Khoản
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md rounded-md">
          <div className="max-w-7xl mx-auto py-6 px-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-primary">
                Quản lý Tài Khoản
              </h1>
              <Link href={"/account/account-management/add-account"}>
                <button className="btn btn-primary btn-md flex items-center gap-2">
                  <CirclePlus className="w-5 h-5" />
                  Thêm tài khoản
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          {/* Tabs */}
          <div className="tabs tabs-lift">
            <input
              type="radio"
              name="my_tabs_3"
              className={`tab ${
                activeTab === "account-list" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("account-list")}
              aria-label="Danh sách tài khoản"
              defaultChecked
            />

            <input
              type="radio"
              name="my_tabs_3"
              className={`tab ${activeTab === "login-log" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("login-log")}
              aria-label="Nhật ký đăng nhập"
            />
          </div>

          {/* Tab content */}
          <div className="bg-base-100 border border-base-300 rounded-lg shadow-sm">
            {activeTab === "account-list" ? (
              <AccountList users={users} />
            ) : (
              <LoginLogComponent loginLogs={loginLogs} users={users} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
