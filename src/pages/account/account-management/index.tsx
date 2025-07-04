import React, { useState } from "react";
import AccountList from "./AccountList";
import LoginLog from "./LoginLog";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

const AccountManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"accounts" | "logs">("accounts");

  return (
    <div className="min-h-screen bg-base-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Quản lý Tài Khoản</h1>
        <Link href="/account/account-management/add-account">
          <button className="btn btn-primary gap-2">
            <PlusCircle size={18} />
            Thêm tài khoản
          </button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a
          className={`tab ${activeTab === "accounts" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("accounts")}
        >
          Danh sách tài khoản
        </a>
        <a
          className={`tab ${activeTab === "logs" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("logs")}
        >
          Nhật ký đăng nhập
        </a>
      </div>

      {/* Content */}
      {activeTab === "accounts" ? <AccountList /> : <LoginLog />}
    </div>
  );
};

export default AccountManagement;
