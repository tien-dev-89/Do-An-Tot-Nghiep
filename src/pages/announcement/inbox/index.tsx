import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Inbox as InboxIcon,
  Bell,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Eye,
  Star,
  Clock,
} from "lucide-react";

type Notification = {
  notification_id: string;
  title: string;
  message: string;
  type: "Cá nhân" | "Nội bộ" | "Hệ thống";
  is_read: boolean;
  created_at: string;
  sender?: string;
};

export default function Inbox() {
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

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          notification_id: "1",
          title: "Thông báo họp phòng Nhân sự",
          message:
            "Kính gửi toàn thể nhân viên phòng Nhân sự, Cuộc họp định kỳ tháng 5 sẽ được tổ chức vào lúc 9:00 ngày 15/05/2025 tại phòng họp lớn. Nội dung cuộc họp: Đánh giá kết quả tháng 4, kế hoạch tháng 5 và phân công nhiệm vụ mới. Vui lòng chuẩn bị báo cáo công việc và tham dự đúng giờ.",
          type: "Nội bộ",
          is_read: false,
          created_at: "2025-05-08T08:30:00Z",
          sender: "Trần Thị Mai - Trưởng phòng Nhân sự",
        },
        {
          notification_id: "2",
          title: "Thông báo nghỉ lễ 30/4 và 1/5",
          message:
            "Kính gửi toàn thể cán bộ, nhân viên công ty, Nhân dịp kỷ niệm ngày Giải phóng miền Nam (30/4) và Quốc tế Lao động (1/5), công ty thông báo lịch nghỉ lễ như sau: Thời gian nghỉ: Từ ngày 30/4/2025 đến hết ngày 3/5/2025. Thời gian làm việc trở lại: Ngày 4/5/2025. Kính chúc toàn thể cán bộ, nhân viên có kỳ nghỉ lễ vui vẻ và an toàn.",
          type: "Hệ thống",
          is_read: true,
          created_at: "2025-04-20T10:15:00Z",
          sender: "Ban Giám đốc",
        },
        {
          notification_id: "3",
          title: "Đánh giá hiệu suất công việc tháng 4",
          message:
            "Anh/Chị thân mến, Báo cáo đánh giá hiệu suất công việc tháng 4/2025 của Anh/Chị đã được hoàn thành. Kết quả: Xuất sắc. Những điểm nổi bật: Hoàn thành vượt KPI 20%, chủ động đề xuất 2 sáng kiến cải tiến quy trình, hỗ trợ đồng nghiệp mới. Những điểm cần cải thiện: Cần cải thiện kỹ năng quản lý thời gian. Mọi thắc mắc vui lòng liên hệ trực tiếp quản lý trực tiếp của Anh/Chị.",
          type: "Cá nhân",
          is_read: false,
          created_at: "2025-05-05T14:20:00Z",
          sender: "Nguyễn Văn Hùng - Quản lý trực tiếp",
        },
        {
          notification_id: "4",
          title: "Cập nhật chính sách bảo mật thông tin",
          message:
            "Kính gửi toàn thể cán bộ, nhân viên, Công ty vừa cập nhật Chính sách Bảo mật Thông tin mới, có hiệu lực từ ngày 01/05/2025. Những thay đổi chính bao gồm: - Tăng cường bảo mật thông tin cá nhân nhân viên - Quy định mới về sử dụng thiết bị công nghệ thông tin - Hướng dẫn xử lý sự cố rò rỉ thông tin. Vui lòng đọc kỹ chính sách mới tại Portal nội bộ và xác nhận đã đọc trước ngày 15/05/2025.",
          type: "Hệ thống",
          is_read: true,
          created_at: "2025-04-28T09:45:00Z",
          sender: "Phòng Công nghệ thông tin",
        },
        {
          notification_id: "5",
          title: "Thông báo đóng bảo hiểm xã hội tháng 5",
          message:
            "Kính gửi Anh/Chị, Phòng Nhân sự xin thông báo đã hoàn tất thủ tục đóng bảo hiểm xã hội, bảo hiểm y tế và bảo hiểm thất nghiệp tháng 5/2025 cho Anh/Chị. Chi tiết đóng BHXH: - Lương đóng BHXH: 15,000,000 VND - Tỷ lệ đóng: Công ty: 17.5%, Nhân viên: 8% - Số tiền đã đóng: 3,825,000 VND. Mọi thắc mắc vui lòng liên hệ phòng Nhân sự.",
          type: "Cá nhân",
          is_read: false,
          created_at: "2025-05-10T11:30:00Z",
          sender: "Phòng Nhân sự",
        },
      ];

      setNotifications(mockNotifications);
      setFilteredNotifications(mockNotifications);
      setLoading(false);
    }, 800);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...notifications];

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    // Apply status filter
    if (filterStatus === "read") {
      filtered = filtered.filter((notif) => notif.is_read);
    } else if (filterStatus === "unread") {
      filtered = filtered.filter((notif) => !notif.is_read);
    }

    // Apply search
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

  const markAsRead = (ids: string[]) => {
    const updatedNotifications = notifications.map((notif) =>
      ids.includes(notif.notification_id) ? { ...notif, is_read: true } : notif
    );
    setNotifications(updatedNotifications);
    setSelectedNotifications([]);
  };

  const deleteNotifications = (ids: string[]) => {
    const updatedNotifications = notifications.filter(
      (notif) => !ids.includes(notif.notification_id)
    );
    setNotifications(updatedNotifications);
    setSelectedNotifications([]);
    if (
      activeNotification &&
      ids.includes(activeNotification.notification_id)
    ) {
      setActiveNotification(null);
    }
  };

  const refreshInbox = () => {
    setLoading(true);
    // In a real application, this would fetch fresh data from the API
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const viewNotification = (notification: Notification) => {
    // Mark as read when viewed
    if (!notification.is_read) {
      markAsRead([notification.notification_id]);
    }
    setActiveNotification(notification);
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
    <div className="flex flex-col min-h-screen bg-base-200">
      {/* Breadcrumbs */}
      <div className="bg-base-100 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href={"/"}>Trang chủ</Link>
              </li>
              <li>
                <Link href={"/announcement/inbox"}>Hộp thư đến</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Header */}
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

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left panel - Notification list */}
            <div className="bg-base-100 rounded-box shadow-md lg:w-2/5">
              {/* Toolbar */}
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
                            className={filterType === "Cá nhân" ? "active" : ""}
                            onClick={() => setFilterType("Cá nhân")}
                          >
                            Cá nhân
                          </a>
                        </li>
                        <li>
                          <a
                            className={filterType === "Nội bộ" ? "active" : ""}
                            onClick={() => setFilterType("Nội bộ")}
                          >
                            Nội bộ
                          </a>
                        </li>
                        <li>
                          <a
                            className={
                              filterType === "Hệ thống" ? "active" : ""
                            }
                            onClick={() => setFilterType("Hệ thống")}
                          >
                            Hệ thống
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

                {/* Search */}
                <div className="join">
                  <div className="join-item btn btn-sm">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm thông báo..."
                    className="input input-sm join-item input-bordered w-full max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Notification list */}
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
                              {notification.type === "Hệ thống" && (
                                <Bell
                                  size={16}
                                  className="text-info flex-shrink-0"
                                />
                              )}
                              {notification.type === "Nội bộ" && (
                                <Star
                                  size={16}
                                  className="text-warning flex-shrink-0"
                                />
                              )}
                              {notification.type === "Cá nhân" && (
                                <User
                                  size={16}
                                  className="text-success flex-shrink-0"
                                />
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

            {/* Right panel - Notification detail */}
            <div className="bg-base-100 rounded-box shadow-md p-6 lg:w-3/5">
              {activeNotification ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      {activeNotification.type === "Hệ thống" && (
                        <div className="badge badge-info gap-2">
                          <Bell size={14} />
                          Hệ thống
                        </div>
                      )}
                      {activeNotification.type === "Nội bộ" && (
                        <div className="badge badge-warning gap-2">
                          <Star size={14} />
                          Nội bộ
                        </div>
                      )}
                      {activeNotification.type === "Cá nhân" && (
                        <div className="badge badge-success gap-2">
                          <User size={14} />
                          Cá nhân
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

function User(props: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
