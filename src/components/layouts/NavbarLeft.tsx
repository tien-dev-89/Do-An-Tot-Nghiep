import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  DollarSign,
  FileText,
  House,
  Settings,
  User,
} from "lucide-react";

const NavbarLeft: React.FC = () => {
  const pathname = usePathname();

  // Trạng thái cho từng collapse
  const [isPersonnelOpen, setIsPersonnelOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Tự động mở collapse khi pathname thay đổi
  useEffect(() => {
    setIsPersonnelOpen(
      pathname === "/employees" ||
        pathname === "/departments" ||
        pathname === "/departments/create-department" ||
        pathname === "/position" ||
        pathname === "/decentralization"
    );
    setIsSalaryOpen(
      pathname === "/salary/timesheets" ||
        pathname === "/salary/payroll" ||
        pathname === "/salary/rewards-penalties"
    );
    setIsLeaveOpen(
      pathname === "/leave/manager-be-on-leave" ||
        pathname === "/leave/be-on-leave"
    );
    setIsNotificationsOpen(
      pathname === "/announcement/send-notifications" ||
        pathname === "/announcement/inbox"
    );
  }, [pathname]);

  return (
    <div className="navbar w-1/5 min-h-screen shadow-sm flex justify-center items-start bg-white">
      <div className="flex flex-col w-full">
        {/* Logo */}
        <div className="flex justify-center items-center h-[70px] w-full">
          <Link href="/">
            <Image
              src="/logo-staffly.svg"
              alt="Đăng nhập"
              width={130}
              height={100}
            />
          </Link>
        </div>

        {/* Dashboard */}
        <div
          className={`p-4 flex font-medium rounded-md hover:bg-blue-300 hover:text-white transition-colors ${
            pathname === "/" ? "bg-blue-400 text-white" : ""
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-5"
            aria-current={pathname === "/" ? "page" : undefined}
          >
            <House className="w-5 h-5" />
            Bảng điều khiển
          </Link>
        </div>

        <div className="w-full min-h-full">
          {/* Nhân sự */}
          <div className="collapse collapse-arrow rounded-none">
            <input
              type="checkbox"
              checked={isPersonnelOpen}
              onChange={() => setIsPersonnelOpen(!isPersonnelOpen)}
            />
            <label className="collapse-title font-medium flex items-center gap-5 p-4 hover:bg-blue-400 hover:text-white cursor-pointer transition-colors">
              <User className="w-5 h-5" />
              Nhân sự
            </label>
            <div className="collapse-content">
              <ul className="menu menu-sm relative w-[260px]">
                <li>
                  <Link
                    href="/employees"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/employees" ? "bg-blue-200" : ""
                    }`}
                    aria-current={
                      pathname === "/employees" ? "page" : undefined
                    }
                  >
                    Danh sách nhân viên
                  </Link>
                </li>
                <li>
                  <Link
                    href="/departments"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/departments" ? "bg-blue-200" : ""
                    }`}
                    aria-current={
                      pathname === "/departments" ? "page" : undefined
                    }
                  >
                    Phòng ban
                  </Link>
                </li>
                <li>
                  <Link
                    href="/position"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/position" ? "bg-blue-200" : ""
                    }`}
                    aria-current={pathname === "/position" ? "page" : undefined}
                  >
                    Chức vụ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/decentralization"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/decentralization" ? "bg-blue-200" : ""
                    }`}
                    aria-current={
                      pathname === "/decentralization" ? "page" : undefined
                    }
                  >
                    Vai trò & phân quyền
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Lương thưởng */}
          <div className="collapse collapse-arrow rounded-md">
            <input
              type="checkbox"
              checked={isSalaryOpen}
              onChange={() => setIsSalaryOpen(!isSalaryOpen)}
            />
            <label className="collapse-title font-medium flex items-center gap-5 p-4 hover:bg-blue-300 hover:text-white cursor-pointer transition-colors">
              <DollarSign className="w-5 h-5" />
              Lương Thưởng
            </label>
            <div className="collapse-content">
              <ul className="menu menu-sm relative w-[260px]">
                <li>
                  <Link
                    href="/salary/timesheets"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/salary/timesheets" ? "bg-blue-200" : ""
                    }`}
                    aria-current={
                      pathname === "/salary/timesheets" ? "page" : undefined
                    }
                  >
                    Bảng chấm công
                  </Link>
                </li>
                <li>
                  <Link
                    href="/salary/payroll"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/salary/payroll" ? "bg-blue-200" : ""
                    }`}
                    aria-current={
                      pathname === "/salary/payroll" ? "page" : undefined
                    }
                  >
                    Bảng lương
                  </Link>
                </li>
                <li>
                  <Link
                    href="/salary/rewards-penalties"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/salary/rewards-penalties"
                        ? "bg-blue-200"
                        : ""
                    }`}
                    aria-current={
                      pathname === "/salary/rewards-penalties"
                        ? "page"
                        : undefined
                    }
                  >
                    Thưởng / Phạt
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Nghỉ Phép */}
          <div className="collapse collapse-arrow rounded-md">
            <input
              type="checkbox"
              checked={isLeaveOpen}
              onChange={() => setIsLeaveOpen(!isLeaveOpen)}
            />
            <label className="collapse-title font-medium flex items-center gap-5 p-4 hover:bg-blue-300 hover:text-white cursor-pointer transition-colors">
              <CalendarCheck className="w-5 h-5" />
              Nghỉ Phép
            </label>
            <div className="collapse-content">
              <ul className="menu menu-sm relative w-[260px]">
                <li>
                  <Link
                    href="/leave/manager-be-on-leave"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/leave/manager-be-on-leave"
                        ? "bg-blue-200"
                        : ""
                    }`}
                    aria-current={
                      pathname === "/leave/manager-be-on-leave"
                        ? "page"
                        : undefined
                    }
                  >
                    Quản lý nghỉ phép
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leave/be-on-leave"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/leave/be-on-leave" ? "bg-blue-200" : ""
                    }`}
                    aria-current={
                      pathname === "/leave/be-on-leave" ? "page" : undefined
                    }
                  >
                    Yêu cầu nghỉ phép
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Thông báo */}
          <div className="collapse collapse-arrow rounded-md">
            <input
              type="checkbox"
              checked={isNotificationsOpen}
              onChange={() => setIsNotificationsOpen(!isNotificationsOpen)}
            />
            <label className="collapse-title font-medium flex items-center gap-5 p-4 hover:bg-blue-300 hover:text-white cursor-pointer transition-colors">
              <Bell className="w-5 h-5" />
              Thông báo
            </label>
            <div className="collapse-content">
              <ul className="menu menu-sm relative w-[260px]">
                <li>
                  <Link
                    href="/announcement/send-notifications"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/announcement/send-notifications"
                        ? "bg-blue-200"
                        : ""
                    }`}
                    aria-current={
                      pathname === "/announcement/send-notifications"
                        ? "page"
                        : undefined
                    }
                  >
                    Gửi thông báo
                  </Link>
                </li>
                <li>
                  <Link
                    href="/announcement/inbox"
                    className={`p-3 text-sm flex font-medium hover:bg-blue-200 rounded-md transition-colors ${
                      pathname === "/announcement/inbox" ? "bg-blue-200" : ""
                    }`}
                    aria-current={
                      pathname === "/announcement/inbox" ? "page" : undefined
                    }
                  >
                    Hộp thư đến
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Tài khoản */}
          <div
            className={`p-4 flex font-medium rounded-md hover:bg-blue-300 hover:text-white transition-colors ${
              pathname === "/account/account-management"
                ? "bg-blue-400 text-white"
                : ""
            }`}
          >
            <Link
              href="/account/account-management"
              className="flex items-center gap-5"
              aria-current={
                pathname === "/account/account-management" ? "page" : undefined
              }
            >
              <Settings className="w-5 h-5" />
              Tài khoản
            </Link>
          </div>

          {/* Hợp đồng */}
          <div
            className={`p-4 flex font-medium rounded-md hover:bg-blue-300 hover:text-white transition-colors ${
              pathname === "/contract" ? "bg-blue-400 text-white" : ""
            }`}
          >
            <Link
              href="/contract"
              className="flex items-center gap-5"
              aria-current={pathname === "/contract" ? "page" : undefined}
            >
              <FileText className="w-5 h-5" />
              Hợp đồng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarLeft;
