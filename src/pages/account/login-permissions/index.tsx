import Link from "next/link";
import React from "react";

export default function RewardsPenalties() {
  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/account/login-permissions"}>
              Phân quyền đăng nhập
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Phân quyền đăng nhập
            </h1>
          </div>
        </header>
      </div>
    </div>
  );
}
