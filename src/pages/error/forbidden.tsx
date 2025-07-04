import Link from "next/link";
import React from "react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-6">
      <div className="card bg-base-200 shadow-md max-w-md w-full">
        <div className="card-body text-center">
          <h1 className="text-3xl font-bold text-error mb-4">
            403 - Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị
            viên nếu bạn nghĩ đây là lỗi.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <button className="btn btn-primary">Về trang chủ</button>
            </Link>
            <Link href="/auths/login">
              <button className="btn btn-ghost">Đăng nhập lại</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
