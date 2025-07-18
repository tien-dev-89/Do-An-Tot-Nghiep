import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Inbox as InboxIcon,
  Bell,
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  Star,
  Clock,
  User,
} from "lucide-react";
import { toast } from "react-toastify";

type Notification = {
  notification_id: string;
  title: string;
  message: string;
  type: "PERSONAL" | "INTERNAL" | "SYSTEM" | "CONTRACT";
  is_read: boolean;
  created_at: string;
  sender?: string;
  contract_id?: string;
};

type User = {
  user_id: string;
  employee_id: string;
  role_id: string;
};

export default function Inbox() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeNotification, setActiveNotification] =
    useState<Notification | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userData && token) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
        if (!["role_admin", "role_hr"].includes(parsedUser.role_id)) {
          toast.error("Bạn không có quyền truy cập hộp thư đến");
          router.push("/auths/login");
        }
      } catch (error: unknown) {
        console.error("Lỗi phân tích user từ localStorage:", error);
        toast.error("Không thể tải thông tin người dùng");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/auths/login");
      }
    } else {
      router.push("/auths/login");
    }
  }, [router]);

  // Lấy danh sách thông báo
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token || !["role_admin", "role_hr"].includes(user.role_id))
      return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Phiên đăng nhập hết hạn");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            router.push("/auths/login");
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi tải thông báo");
        }
        const data = await response.json();
        if (data.success && data.notifications) {
          setNotifications(data.notifications);
          setFilteredNotifications(data.notifications);
        } else {
          setNotifications([]);
          setFilteredNotifications([]);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Lỗi tải thông báo:", message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Cập nhật mỗi 60 giây
    return () => clearInterval(interval);
  }, [user, router]);

  // Lọc thông báo
  useEffect(() => {
    let filtered = [...notifications];
    if (filterType !== "all") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }
    if (filterStatus === "read") {
      filtered = filtered.filter((notif) => notif.is_read);
    } else if (filterStatus === "unread") {
      filtered = filtered.filter((notif) => !notif.is_read);
    }
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(searchLower) ||
          notif.message.toLowerCase().includes(searchLower)
      );
    }
    setFilteredNotifications(filtered);
  }, [filterType, filterStatus, searchTerm, notifications]);

  const toggleSelectNotification = (id: string) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(
        selectedNotifications.filter((notifId) => notifId !== id)
      );
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(
        filteredNotifications.map((notif) => notif.notification_id)
      );
    }
  };

  const markAsRead = async (ids: string[]) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Phiên đăng nhập hết hạn");
      router.push("/auths/login");
      return;
    }

    try {
      for (const id of ids) {
        const response = await fetch(
          `/api/notifications?notification_id=${id}`,
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
          if (response.status === 401) {
            toast.error("Phiên đăng nhập hết hạn");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            router.push("/auths/login");
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.message || "Lỗi đánh dấu đã đọc");
        }
      }
      setNotifications((prev) =>
        prev.map((notif) =>
          ids.includes(notif.notification_id)
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setSelectedNotifications([]);
      toast.success("Đã đánh dấu thông báo đã đọc");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi đánh dấu đã đọc:", message);
      toast.error(message);
    }
  };

  const deleteNotifications = async (ids: string[]) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Phiên đăng nhập hết hạn");
      router.push("/auths/login");
      return;
    }

    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notification_ids: ids }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/auths/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi xóa thông báo");
      }
      setNotifications((prev) =>
        prev.filter((notif) => !ids.includes(notif.notification_id))
      );
      setSelectedNotifications([]);
      if (
        activeNotification &&
        ids.includes(activeNotification.notification_id)
      ) {
        setActiveNotification(null);
      }
      toast.success("Xóa thông báo thành công");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi xóa thông báo:", message);
      toast.error(message);
    }
  };

  const refreshInbox = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Phiên đăng nhập hết hạn");
      router.push("/auths/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Phiên đăng nhập hết hạn");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/auths/login");
          return;
        }
        throw new Error("Lỗi tải thông báo");
      }
      const data = await response.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        setFilteredNotifications(data.notifications);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi làm mới thông báo:", message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const viewNotification = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead([notification.notification_id]);
    }
    setActiveNotification(notification);
    if (notification.contract_id && notification.type === "CONTRACT") {
      router.push(`/contract/${notification.contract_id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200 w-[1158px]">
      <div className="bg-base-100 p-4 shadow-sm rounded-sm">
        <div className="max-w-7xl mx-auto">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href={"/"} className="text-primary">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href={"/announcement/inbox"} className="text-primary">
                  Hộp thư đến
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <header className="bg-base-100 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">
            <InboxIcon className="inline-block mr-2" size={24} />
            Hộp thư đến
          </h1>
          <div className="badge badge-primary">
            {notifications.filter((n) => !n.is_read).length} Chưa đọc
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="bg-base-100 rounded-box shadow-md lg:w-2/5">
              <div className="p-4 border-b flex flex-wrap gap-2 items-center">
                <div className="flex items-center mr-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={
                      selectedNotifications.length ===
                        filteredNotifications.length &&
                      filteredNotifications.length > 0
                    }
                    onChange={selectAllNotifications}
                  />
                  <span className="ml-2 text-sm">
                    {selectedNotifications.length > 0
                      ? `${selectedNotifications.length} đã chọn`
                      : ""}
                  </span>
                </div>

                {selectedNotifications.length > 0 ? (
                  <>
                    <button
                      className="btn btn-sm btn-ghost tooltip"
                      data-tip="Đánh dấu đã đọc"
                      onClick={() => markAsRead(selectedNotifications)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost tooltip"
                      data-tip="Xóa thông báo"
                      onClick={() => deleteNotifications(selectedNotifications)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-sm btn-ghost tooltip"
                      data-tip="Làm mới"
                      onClick={refreshInbox}
                    >
                      <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                      />
                    </button>

                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-sm btn-ghost tooltip"
                        data-tip="Lọc"
                      >
                        <Filter size={16} />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                      >
                        <li className="menu-title">Loại thông báo</li>
                        <li>
                          <a
                            className={filterType === "all" ? "active" : ""}
                            onClick={() => setFilterType("all")}
                          >
                            Tất cả
                          </a>
                        </li>
                        <li>
                          <a
                            className={
                              filterType === "PERSONAL" ? "active" : ""
                            }
                            onClick={() => setFilterType("PERSONAL")}
                          >
                            Cá nhân
                          </a>
                        </li>
                        <li>
                          <a
                            className={
                              filterType === "INTERNAL" ? "active" : ""
                            }
                            onClick={() => setFilterType("INTERNAL")}
                          >
                            Nội bộ
                          </a>
                        </li>
                        <li>
                          <a
                            className={filterType === "SYSTEM" ? "active" : ""}
                            onClick={() => setFilterType("SYSTEM")}
                          >
                            Hệ thống
                          </a>
                        </li>
                        <li>
                          <a
                            className={
                              filterType === "CONTRACT" ? "active" : ""
                            }
                            onClick={() => setFilterType("CONTRACT")}
                          >
                            Hợp đồng
                          </a>
                        </li>
                        <li className="menu-title mt-2">Trạng thái</li>
                        <li>
                          <a
                            className={filterStatus === "all" ? "active" : ""}
                            onClick={() => setFilterStatus("all")}
                          >
                            Tất cả
                          </a>
                        </li>
                        <li>
                          <a
                            className={filterStatus === "read" ? "active" : ""}
                            onClick={() => setFilterStatus("read")}
                          >
                            Đã đọc
                          </a>
                        </li>
                        <li>
                          <a
                            className={
                              filterStatus === "unread" ? "active" : ""
                            }
                            onClick={() => setFilterStatus("unread")}
                          >
                            Chưa đọc
                          </a>
                        </li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="flex-grow"></div>
                <div className="join">
                  <label className="input">
                    <svg
                      className="h-[1em] opacity-50"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        strokeWidth="2.5"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </g>
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm kiếm thông báo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-y-auto h-96 lg:h-[calc(100vh-16rem)]">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <span className="loading loading-spinner loading-md"></span>
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <ul>
                    {filteredNotifications.map((notification) => (
                      <li
                        key={notification.notification_id}
                        className={`border-b hover:bg-base-200 cursor-pointer ${
                          activeNotification?.notification_id ===
                          notification.notification_id
                            ? "bg-base-200"
                            : ""
                        } ${!notification.is_read ? "font-semibold" : ""}`}
                        onClick={() => viewNotification(notification)}
                      >
                        <div className="flex items-center p-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm mr-3"
                            checked={selectedNotifications.includes(
                              notification.notification_id
                            )}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectNotification(
                                notification.notification_id
                              );
                            }}
                          />
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                              {notification.type === "SYSTEM" && (
                                <Bell
                                  size={16}
                                  className="text-info flex-shrink-0"
                                />
                              )}
                              {notification.type === "INTERNAL" && (
                                <Star
                                  size={16}
                                  className="text-warning flex-shrink-0"
                                />
                              )}
                              {notification.type === "PERSONAL" && (
                                <User
                                  size={16}
                                  className="text-success flex-shrink-0"
                                />
                              )}
                              {notification.type === "CONTRACT" && (
                                <svg
                                  className="text-primary flex-shrink-0"
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
                              <div className="font-medium truncate">
                                {notification.title}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {notification.message}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <Clock size={12} className="mr-1" />
                              {formatDate(notification.created_at)}
                            </div>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex justify-center items-center h-full">
                    <div className="text-center p-6">
                      <InboxIcon
                        size={48}
                        className="mx-auto text-gray-400 mb-2"
                      />
                      <p className="text-gray-500">Không có thông báo nào</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-base-100 rounded-box shadow-md p-6 lg:w-3/5">
              {activeNotification ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      {activeNotification.type === "SYSTEM" && (
                        <div className="badge badge-info gap-2">
                          <Bell size={14} /> Hệ thống
                        </div>
                      )}
                      {activeNotification.type === "INTERNAL" && (
                        <div className="badge badge-warning gap-2">
                          <Star size={14} /> Nội bộ
                        </div>
                      )}
                      {activeNotification.type === "PERSONAL" && (
                        <div className="badge badge-success gap-2">
                          <User size={14} /> Cá nhân
                        </div>
                      )}
                      {activeNotification.type === "CONTRACT" && (
                        <div className="badge badge-primary gap-2">
                          <svg
                            width={14}
                            height={14}
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
                          Hợp đồng
                        </div>
                      )}
                      <div className="badge badge-ghost">
                        <Clock size={14} className="mr-1" />
                        {formatDate(activeNotification.created_at)}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-ghost tooltip"
                      data-tip="Xóa thông báo"
                      onClick={() =>
                        deleteNotifications([
                          activeNotification.notification_id,
                        ])
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h2 className="text-xl font-bold mb-2">
                    {activeNotification.title}
                  </h2>
                  {activeNotification.sender && (
                    <p className="text-sm text-gray-500 mb-4">
                      Từ:{" "}
                      <span className="font-medium">
                        {activeNotification.sender}
                      </span>
                    </p>
                  )}
                  <div className="divider"></div>
                  <div className="whitespace-pre-line">
                    {activeNotification.message}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center p-6">
                    <InboxIcon
                      size={64}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-2">
                      Không có thông báo nào được chọn
                    </h3>
                    <p className="text-gray-500">
                      Vui lòng chọn một thông báo từ danh sách bên trái để xem
                      chi tiết
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
