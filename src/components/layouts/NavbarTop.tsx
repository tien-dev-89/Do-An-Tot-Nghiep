/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  type: "PERSONAL" | "INTERNAL" | "SYSTEM" | "CONTRACT";
  is_read: boolean;
}

interface User {
  user_id: string;
  username: string;
  employee_id: string;
  email: string;
  roles: string[];
}

export default function NavbarTop() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Lấy thông tin người dùng từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
      } catch (error: unknown) {
        console.error("Lỗi phân tích user từ localStorage:", error);
        toast.error("Không thể tải thông tin người dùng");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/auths/login");
      }
    } else {
      setNotifications([]);
      router.push("/auths/login");
    }
  }, [router]);

  // Lấy thông báo cho Admin và HR
  useEffect(() => {
    const fetchNotifications = async () => {
      if (
        !user ||
        !user.roles.some((role) => ["role_admin", "role_hr"].includes(role))
      ) {
        setNotifications([]);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/auths/login");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/auths/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Lỗi tải thông báo: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.notifications)) {
          setNotifications(
            data.notifications.filter((n: Notification) => !n.is_read)
          );
        } else {
          throw new Error("Dữ liệu thông báo không hợp lệ");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể tải thông báo, vui lòng thử lại";
        console.error("Lỗi tải thông báo:", error);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
    if (
      user &&
      user.roles.some((role) => ["role_admin", "role_hr"].includes(role))
    ) {
      const interval = setInterval(fetchNotifications, 60000); // Kiểm tra mỗi 60 giây
      return () => clearInterval(interval);
    }
  }, [user, router]);

  // Đánh dấu thông báo đã đọc
  const markAsRead = async (notification_id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token");
      }

      const response = await fetch(
        `/api/notifications?notification_id=${notification_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_read: true }),
        }
      );

      if (response.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/auths/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Lỗi đánh dấu thông báo đã đọc");
      }

      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notification_id)
      );
      toast.success("Đã đánh dấu thông báo đã đọc");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể đánh dấu thông báo đã đọc";
      console.error("Lỗi đánh dấu thông báo đã đọc:", error);
      toast.error(errorMessage);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("/api/auths/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok && response.status !== 401) {
          throw new Error("Lỗi đăng xuất");
        }
      } catch (error: unknown) {
        console.error("Lỗi đăng xuất:", error);
        toast.error("Không thể đăng xuất, vui lòng thử lại");
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auths/login");
  };

  return (
    <div className="navbar navbar-end w-full bg-base-100 shadow-sm pr-15">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-24 md:w-auto"
        />

        {/* Thông báo */}
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle" disabled={isLoading}>
              <div className="indicator">
                {isLoading ? (
                  <div className="loading loading-spinner loading-sm"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                )}
                {notifications.length > 0 && (
                  <span className="badge badge-xs badge-error indicator-item">
                    {notifications.length}
                  </span>
                )}
              </div>
            </button>
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-80 p-2 shadow">
              {isLoading ? (
                <li>
                  <p>Đang tải thông báo...</p>
                </li>
              ) : notifications.length === 0 ? (
                <li>
                  <p>Không có thông báo mới</p>
                </li>
              ) : (
                notifications.map((notification) => (
                  <li key={notification.notification_id}>
                    <div
                      className="p-2 hover:bg-base-200"
                      onClick={() => markAsRead(notification.notification_id)}
                    >
                      <strong>{notification.title}</strong>
                      <p className="text-sm">{notification.message}</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Avatar */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href="/utility/change-password">Thay đổi mật khẩu</Link>
            </li>
            <li>
              <button onClick={handleLogout}>Đăng xuất</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
