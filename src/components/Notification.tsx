import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Bell, Star, User, Trash2 } from "lucide-react";

interface Notification {
  notification_id: string;
  employee_id: string;
  title: string;
  message: string;
  type: "PERSONAL" | "INTERNAL" | "SYSTEM" | "CONTRACT";
  is_read: boolean;
  created_at: Date;
  contract_id?: string;
  sender?: string;
}

interface Props {
  user: { role_id: string };
  token: string;
}

const typeMap: { [key: string]: string } = {
  PERSONAL: "Cá nhân",
  INTERNAL: "Nội bộ",
  SYSTEM: "Hệ thống",
  CONTRACT: "Hợp đồng",
};

const Notification: React.FC<Props> = ({ user, token }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const ALLOWED_ROLES = ["role_admin", "role_hr"];
    if (!user || !ALLOWED_ROLES.includes(user.role_id)) {
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch("/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/auths/login");
            throw new Error("Token không hợp lệ hoặc đã hết hạn");
          }
          throw new Error(errorData.message || "Lỗi tải thông báo");
        }

        const data = await response.json();
        if (data.success && data.notifications) {
          setNotifications(
            data.notifications.map((n: Notification) => ({
              ...n,
              type: n.type as "PERSONAL" | "INTERNAL" | "SYSTEM" | "CONTRACT",
              created_at: new Date(n.created_at),
            }))
          );
        } else {
          setNotifications([]);
        }
      } catch (error: unknown) {
        console.error("Lỗi tải thông báo:", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        setError(error instanceof Error ? error.message : "Lỗi không xác định");
        toast.error(
          error instanceof Error ? error.message : "Lỗi không xác định"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, token, router]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        const response = await fetch(
          `/api/notifications?notification_id=${notification.notification_id}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ is_read: true }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi cập nhật thông báo");
        }

        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notification.notification_id
              ? { ...n, is_read: true }
              : n
          )
        );
      }

      if (notification.contract_id && notification.type === "CONTRACT") {
        const contractExists = await fetch(
          `/api/contracts/${notification.contract_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (contractExists.ok) {
          router.push(`/contract/${notification.contract_id}`);
        } else {
          setError("Hợp đồng không tồn tại");
          toast.error("Hợp đồng không tồn tại");
        }
      } else {
        router.push(
          `/announcement/inbox?notification_id=${notification.notification_id}`
        );
      }
    } catch (error: unknown) {
      console.error("Lỗi cập nhật thông báo:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
      toast.error(
        error instanceof Error ? error.message : "Lỗi không xác định"
      );
    }
  };

  const deleteNotification = async (
    notification_id: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notification_ids: [notification_id] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi xóa thông báo");
      }

      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notification_id)
      );
      toast.success("Xóa thông báo thành công");
    } catch (error: unknown) {
      console.error("Lỗi xóa thông báo:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setError(error instanceof Error ? error.message : "Lỗi không xác định");
      toast.error(
        error instanceof Error ? error.message : "Lỗi không xác định"
      );
    }
  };

  const ALLOWED_ROLES = ["role_admin", "role_hr"];
  if (!user || !ALLOWED_ROLES.includes(user.role_id)) {
    return null;
  }

  return (
    <div className="mb-6">
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      {isLoading ? (
        <div className="text-center">Đang tải thông báo...</div>
      ) : notifications.length > 0 ? (
        <div className="card bg-base-200 shadow-md p-4">
          <h2 className="text-lg font-semibold mb-2">Thông báo</h2>
          {notifications.map((notification) => (
            <div
              key={notification.notification_id}
              className={`p-3 mb-2 rounded-md cursor-pointer flex items-center gap-2 ${
                notification.is_read ? "bg-gray-100" : "bg-blue-100"
              }`}
            >
              <div
                className="flex-grow"
                onClick={() => handleNotificationClick(notification)}
              >
                {typeMap[notification.type] === "Hệ thống" && (
                  <Bell size={16} className="text-info" />
                )}
                {typeMap[notification.type] === "Nội bộ" && (
                  <Star size={16} className="text-warning" />
                )}
                {typeMap[notification.type] === "Cá nhân" && (
                  <User size={16} className="text-success" />
                )}
                {typeMap[notification.type] === "Hợp đồng" && (
                  <svg
                    className="text-primary"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                )}
                <div className="flex-grow">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm">{notification.message}</p>
                  {notification.sender && (
                    <p className="text-xs text-gray-500">
                      Từ: {notification.sender}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(notification.created_at).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm tooltip"
                data-tip="Xóa thông báo"
                onClick={(e) =>
                  deleteNotification(notification.notification_id, e)
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">Không có thông báo mới</div>
      )}
    </div>
  );
};

export default Notification;
