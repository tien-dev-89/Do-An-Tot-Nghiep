import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Building,
  Briefcase,
  Tag,
  Activity,
  UserCheck,
  Calendar,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Image from "next/image";

interface AccountData {
  name: string;
  username: string;
  email: string;
  department: string;
  departmentId: string;
  position: string;
  positionId: string;
  roles: { role_id: string; name: string }[];
  status: string;
  createdAt: string;
  lastLogin: string;
  avatar: string | null;
}

interface Department {
  department_id: string;
  name: string;
}

interface Position {
  position_id: string;
  name: string;
}

interface Role {
  role_id: string;
  name: string;
  description?: string;
}

interface LoginLog {
  log_id: string;
  login_time: string;
  action: string;
  details: string;
  user_agent: string | null;
  raw_login_time: string;
}

export default function DetailAccount() {
  const router = useRouter();
  const { id } = router.query;
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [, setDepartments] = useState<Department[]>([]);
  const [, setPositions] = useState<Position[]>([]);
  const [, setRoles] = useState<Role[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [userRes, deptRes, posRes, roleRes, logRes] = await Promise.all(
            [
              fetch(`/api/account/account-management/users?id=${id}`),
              fetch("/api/departments/index"),
              fetch("/api/positions/index"),
              fetch("/api/roles/index"),
              fetch(`/api/account/account-management/login-logs?user_id=${id}`),
            ]
          );

          const userData = await userRes.json();
          const deptData = await deptRes.json();
          const posData = await posRes.json();
          const roleData = await roleRes.json();
          const logData = await logRes.json();

          // Debug dữ liệu API
          console.log("API /users?id:", JSON.stringify(userData, null, 2));
          console.log("API /roles:", JSON.stringify(roleData, null, 2));
          console.log("API /departments:", JSON.stringify(deptData, null, 2));
          console.log("API /positions:", JSON.stringify(posData, null, 2));
          console.log("API /login-logs:", JSON.stringify(logData, null, 2));

          // Xử lý userData
          if (
            userData.success &&
            Array.isArray(userData.data) &&
            userData.data.length > 0
          ) {
            const user = userData.data[0];
            const account: AccountData = {
              name: user.employee?.full_name || "Không có tên",
              username: user.username || "Không có username",
              email: user.employee?.email || "Không có email",
              department:
                user.employee?.department?.name || "Không có phòng ban",
              departmentId: user.employee?.department?.department_id || "",
              position: user.employee?.position?.name || "Không có chức vụ",
              positionId: user.employee?.position?.position_id || "",
              roles: Array.isArray(user.roles)
                ? user.roles
                    .map(
                      (
                        r: unknown
                      ): { role_id: string; name: string } | null => {
                        if (
                          typeof r === "object" &&
                          r !== null &&
                          "role_id" in r &&
                          "name" in r &&
                          typeof (r as { role_id: unknown }).role_id ===
                            "string" &&
                          typeof (r as { name: unknown }).name === "string"
                        ) {
                          return {
                            role_id: (r as { role_id: string }).role_id,
                            name: (r as { name: string }).name,
                          };
                        }
                        console.warn(
                          "Dữ liệu vai trò người dùng không hợp lệ:",
                          r
                        );
                        return null;
                      }
                    )
                    .filter(
                      (
                        r: { role_id: string; name: string } | null
                      ): r is { role_id: string; name: string } => r !== null
                    )
                : [],
              status: user.is_active ? "Hoạt động" : "Khóa",
              createdAt: user.created_at
                ? new Date(user.created_at).toLocaleDateString("vi-VN")
                : "Không có ngày tạo",
              lastLogin: user.last_login_at
                ? new Date(user.last_login_at).toLocaleString("vi-VN")
                : "Chưa đăng nhập",
              avatar: user.employee?.avatar_url || null,
            };
            console.log("accountData:", JSON.stringify(account, null, 2));
            setAccountData(account);
          } else {
            toast.error("Không tìm thấy dữ liệu người dùng");
          }

          // Xử lý deptData
          if (deptData.success && Array.isArray(deptData.data)) {
            setDepartments(deptData.data);
          } else {
            console.warn("Dữ liệu phòng ban không hợp lệ:", deptData);
          }

          // Xử lý posData
          if (posData.success && Array.isArray(posData.data)) {
            setPositions(posData.data);
          } else {
            console.warn("Dữ liệu chức vụ không hợp lệ:", posData);
          }

          // Xử lý roleData
          if (roleData.success && Array.isArray(roleData.data)) {
            const mappedRoles: Role[] = roleData.data
              .map((r: unknown): Role | null => {
                if (
                  typeof r === "object" &&
                  r !== null &&
                  "role_id" in r &&
                  "name" in r &&
                  typeof (r as { role_id: unknown }).role_id === "string" &&
                  typeof (r as { name: unknown }).name === "string"
                ) {
                  return {
                    role_id: (r as { role_id: string }).role_id,
                    name: (r as { name: string }).name,
                    description:
                      typeof (r as unknown as { description: unknown })
                        .description === "string"
                        ? (r as unknown as { description: string }).description
                        : undefined,
                  };
                }
                console.warn("Dữ liệu vai trò không hợp lệ:", r);
                return null;
              })
              .filter((r: Role | null): r is Role => r !== null);
            console.log("mappedRoles:", JSON.stringify(mappedRoles, null, 2));
            setRoles(mappedRoles);
          } else {
            console.warn(
              "API /roles trả về lỗi hoặc dữ liệu không hợp lệ:",
              roleData
            );
            // Không hiển thị warning nếu roles đã lấy được từ userData
            if (accountData?.roles.length) {
              console.log(
                "Sử dụng vai trò từ dữ liệu người dùng:",
                accountData.roles
              );
            }
            // else {
            //   toast.warn("Không thể tải danh sách vai trò");
            // }
          }

          // Xử lý logData
          if (logData.success && Array.isArray(logData.data)) {
            const mappedLogs: LoginLog[] = logData.data
              .map((log: unknown): LoginLog | null => {
                if (typeof log !== "object" || log === null) {
                  return null;
                }
                const typedLog = log as Record<string, unknown>;
                const rawLoginTime =
                  typeof typedLog.created_at === "string"
                    ? typedLog.created_at
                    : "";
                if (!rawLoginTime || isNaN(Date.parse(rawLoginTime))) {
                  return null;
                }
                return {
                  log_id:
                    typeof typedLog.log_id === "string"
                      ? typedLog.log_id
                      : "unknown",
                  login_time: new Date(rawLoginTime).toLocaleString("vi-VN"),
                  action:
                    typeof typedLog.activity === "string"
                      ? typedLog.activity
                      : "Không rõ",
                  details:
                    typeof typedLog.status === "string"
                      ? typedLog.status
                      : "Không có chi tiết",
                  user_agent:
                    typeof typedLog.user_agent === "string"
                      ? typedLog.user_agent
                      : null,
                  raw_login_time: rawLoginTime,
                };
              })
              .filter((log: LoginLog | null): log is LoginLog => log !== null)
              .sort(
                (
                  a: { raw_login_time: string | number | Date },
                  b: { raw_login_time: string | number | Date }
                ) =>
                  new Date(b.raw_login_time).getTime() -
                  new Date(a.raw_login_time).getTime()
              )
              .slice(0, 5);
            console.log("mappedLogs:", JSON.stringify(mappedLogs, null, 2));
            setLoginLogs(mappedLogs);
          } else {
            toast.error("Lỗi khi lấy nhật ký đăng nhập");
          }
        } catch (error: unknown) {
          console.error("Lỗi khi lấy dữ liệu:", error);
          toast.error("Lỗi khi lấy dữ liệu");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "Admin":
        return "badge bg-blue-100 text-blue-800 border-blue-800";
      case "Manager":
        return "badge bg-green-100 text-green-800 border-green-800";
      case "HR":
        return "badge bg-pink-100 text-pink-800 border-pink-800";
      case "Employee":
        return "badge bg-gray-100 text-gray-800 border-gray-800";
      default:
        return "badge badge-primary";
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action.toLowerCase()) {
      case "đăng nhập":
        return "badge badge-success";
      case "đăng xuất":
        return "badge badge-error";
      default:
        return "badge badge-neutral";
    }
  };

  if (loading || !accountData) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  return (
    <div className="bg-base-100 min-h-screen">
      {/* Breadcrumbs */}
      <div className="p-4 bg-base-100">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li>
              <Link href="/account/account-management">Quản lý Tài Khoản</Link>
            </li>
            <li>
              <span>Chi Tiết Tài Khoản</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Header */}
      <header className="bg-base-100 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <h1 className="text-2xl font-semibold text-primary">
            Chi Tiết Tài Khoản
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="card bg-white shadow-lg">
            <div className="card-body items-center text-center">
              <div className="avatar">
                <div className="w-24 rounded-full">
                  {accountData.avatar ? (
                    <Image
                      src={accountData.avatar}
                      alt={accountData.name}
                      width={96}
                      height={96}
                      className="rounded-full"
                      onError={(e) => {
                        console.error("Lỗi tải avatar:", accountData.avatar);
                        e.currentTarget.src = "/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center">
                      <span className="text-3xl">
                        {accountData.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <h2 className="card-title text-2xl mt-4">{accountData.name}</h2>
              <p className="text-gray-500">{accountData.username}</p>

              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {accountData.roles.length > 0 ? (
                  accountData.roles.map((role, index) => (
                    <span key={index} className={getRoleBadgeClass(role.name)}>
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="badge badge-warning">Chưa có vai trò</span>
                )}
              </div>

              <div className="mt-4 w-full">
                <div className="badge badge-success badge-lg w-full">
                  {accountData.status}
                </div>
              </div>

              <div className="divider"></div>

              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Ngày tạo: {accountData.createdAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-500">
                    Đăng nhập cuối: {accountData.lastLogin}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2">
            <div className="card bg-white shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-lg mb-4">Thông tin tài khoản</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <User size={16} />
                        Họ và tên
                      </span>
                    </label>
                    <div className="input input-bordered flex items-center bg-gray-50">
                      {accountData.name}
                    </div>
                  </div>

                  {/* Username */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <UserCheck size={16} />
                        Tên đăng nhập
                      </span>
                    </label>
                    <div className="input input-bordered flex items-center bg-gray-50">
                      {accountData.username}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </span>
                    </label>
                    <div className="input input-bordered flex items-center bg-gray-50">
                      {accountData.email}
                    </div>
                  </div>

                  {/* Department */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Building size={16} />
                        Phòng ban
                      </span>
                    </label>
                    <div className="input input-bordered flex items-center bg-gray-50">
                      {accountData.department}
                    </div>
                  </div>

                  {/* Position */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Briefcase size={16} />
                        Chức vụ
                      </span>
                    </label>
                    <div className="input input-bordered flex items-center bg-gray-50">
                      {accountData.position}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Activity size={16} />
                        Trạng thái
                      </span>
                    </label>
                    <div className="input input-bordered flex items-center bg-gray-50">
                      {accountData.status}
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text flex items-center gap-2">
                        <Tag size={16} />
                        Vai trò
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
                      {accountData.roles.length > 0 ? (
                        accountData.roles.map((role, index) => (
                          <span
                            key={index}
                            className={getRoleBadgeClass(role.name)}
                          >
                            {role.name}
                          </span>
                        ))
                      ) : (
                        <span className="badge badge-warning">
                          Chưa có vai trò
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="card bg-white shadow-lg mt-6 rounded-xl overflow-hidden">
          <div className="card-body p-6">
            <h2 className="card-title text-xl font-semibold text-primary mb-4 flex items-center gap-2">
              <Activity size={20} />
              Nhật ký đăng nhập
            </h2>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold rounded-tl-lg">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Hoạt động
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold rounded-tr-lg">
                        User Agent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginLogs.length > 0 ? (
                      loginLogs.map((log) => (
                        <tr
                          key={log.log_id}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {log.login_time}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={getActionBadgeClass(log.action)}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {log.details}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-line">
                            {log.user_agent || "Không có"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-6 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <AlertCircle size={24} className="text-gray-400" />
                            <span>
                              Chưa có nhật ký đăng nhập cho nhân viên này
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
