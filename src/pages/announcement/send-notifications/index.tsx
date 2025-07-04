import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Bell,
  Send,
  User,
  Building,
  Search,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "PERSONAL" | "INTERNAL" | "SYSTEM" | "CONTRACT";
  recipients: string[];
  contract_id?: string;
};

type Department = {
  department_id: string;
  name: string;
};

type Employee = {
  employee_id: string;
  full_name: string;
  department_id: string;
};

type User = {
  user_id: string;
  employee_id: string;
  role_id: string;
};

export default function SendNotifications() {
  const router = useRouter();
  const [notification, setNotification] = useState<Notification>({
    id: "",
    title: "",
    message: "",
    type: "INTERNAL",
    recipients: [],
    contract_id: undefined,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showRecipientDropdown, setShowRecipientDropdown] =
    useState<boolean>(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Employee[]>([]);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState<
    "success" | "error" | null
  >(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
          toast.error("Bạn không có quyền gửi thông báo");
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
      toast.error("Vui lòng đăng nhập để tiếp tục");
      router.push("/auths/login");
    }
  }, [router]);

  // Lấy danh sách phòng ban và nhân viên
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token || !["role_admin", "role_hr"].includes(user.role_id))
      return;

    const fetchDepartments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/departments", {
          headers: { Authorization: `x ${token}` }, // Sử dụng định dạng "x <token>"
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
          throw new Error(errorData.error || "Lỗi tải danh sách phòng ban");
        }
        const data = await response.json();
        if (data.departments) {
          setDepartments(data.departments);
        } else {
          setDepartments([]);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Lỗi tải phòng ban:", message);
        toast.error(message);
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees", {
          headers: { Authorization: `x ${token}` }, // Sử dụng định dạng "x <token>"
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
          throw new Error(errorData.error || "Lỗi tải danh sách nhân viên");
        }
        const data = await response.json();
        if (data.employees) {
          setEmployees(data.employees);
          setFilteredEmployees(data.employees);
        } else {
          setEmployees([]);
          setFilteredEmployees([]);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Lỗi không xác định";
        console.error("Lỗi tải nhân viên:", message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
    fetchEmployees();
  }, [user, router]);

  // Lọc nhân viên theo phòng ban và tìm kiếm
  useEffect(() => {
    let filtered = [...employees];
    if (selectedDepartment) {
      filtered = filtered.filter(
        (emp) => emp.department_id === selectedDepartment
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((emp) =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredEmployees(filtered);
  }, [selectedDepartment, searchTerm, employees]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNotification({
      ...notification,
      type: e.target.value as "PERSONAL" | "INTERNAL" | "SYSTEM" | "CONTRACT",
    });
  };

  const handleDepartmentFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const addRecipient = (employee: Employee) => {
    if (
      !selectedRecipients.some(
        (emp) => emp.employee_id === employee.employee_id
      )
    ) {
      setSelectedRecipients([...selectedRecipients, employee]);
      setNotification({
        ...notification,
        recipients: [...notification.recipients, employee.employee_id],
      });
    }
  };

  const removeRecipient = (employeeId: string) => {
    setSelectedRecipients(
      selectedRecipients.filter((emp) => emp.employee_id !== employeeId)
    );
    setNotification({
      ...notification,
      recipients: notification.recipients.filter((id) => id !== employeeId),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !user) {
      toast.error("Phiên đăng nhập hết hạn");
      router.push("/auths/login");
      return;
    }

    try {
      setIsLoading(true);
      for (const employee_id of notification.recipients) {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // API notifications yêu cầu "Bearer"
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            contract_id: notification.contract_id,
          }),
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
          throw new Error(errorData.message || "Lỗi gửi thông báo");
        }
      }

      setNotificationStatus("success");
      setShowNotification(true);
      setNotification({
        id: "",
        title: "",
        message: "",
        type: "INTERNAL",
        recipients: [],
        contract_id: undefined,
      });
      setSelectedRecipients([]);
      setTimeout(() => setShowNotification(false), 3000);
      toast.success("Đã gửi thông báo thành công!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      console.error("Lỗi gửi thông báo:", message);
      setNotificationStatus("error");
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <div className="bg-base-100 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href={"/"}>Trang chủ</Link>
              </li>
              <li>
                <Link href={"/announcement/send-notifications"}>
                  Gửi thông báo
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <header className="bg-base-100 shadow-md rounded-sm">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">
            <Bell className="inline-block mr-2" size={24} />
            Gửi thông báo
          </h1>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto p-6">
          {showNotification && (
            <div
              className={`alert ${
                notificationStatus === "success"
                  ? "alert-success"
                  : "alert-error"
              } mb-6`}
            >
              {notificationStatus === "success" ? (
                <>
                  <CheckCircle />
                  <span>Đã gửi thông báo thành công!</span>
                </>
              ) : (
                <>
                  <AlertCircle />
                  <span>Có lỗi xảy ra. Vui lòng thử lại!</span>
                </>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          )}

          {!isLoading && (
            <div className="bg-base-100 rounded-box shadow-md p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-2 form-control pb-4">
                  <label className="label">
                    <span className="label-text font-medium">
                      Loại thông báo
                    </span>
                  </label>
                  <select
                    className="select select-bordered w-full max-w-xs"
                    value={notification.type}
                    onChange={handleTypeChange}
                  >
                    <option value="PERSONAL">Cá nhân</option>
                    <option value="INTERNAL">Nội bộ</option>
                    <option value="SYSTEM">Hệ thống</option>
                    <option value="CONTRACT">Hợp đồng</option>
                  </select>
                </div>

                <div className="gap-2 form-control pb-4">
                  <label className="label">
                    <span className="label-text font-medium">
                      Tiêu đề thông báo
                    </span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Nhập tiêu đề thông báo"
                    value={notification.title}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="gap-2 form-control pb-4">
                  <label className="label">
                    <span className="label-text font-medium">
                      Nội dung thông báo
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-32 w-full"
                    placeholder="Nhập nội dung thông báo"
                    value={notification.message}
                    onChange={(e) =>
                      setNotification({
                        ...notification,
                        message: e.target.value,
                      })
                    }
                    required
                  ></textarea>
                </div>

                <div className="gap-2 form-control pb-4">
                  <label className="label">
                    <span className="label-text font-medium">Người nhận</span>
                  </label>
                  <div className="relative">
                    <div
                      className="input input-bordered flex items-center gap-2 flex-wrap min-h-12 cursor-pointer"
                      onClick={() =>
                        setShowRecipientDropdown(!showRecipientDropdown)
                      }
                    >
                      {selectedRecipients.length > 0 ? (
                        selectedRecipients.map((recipient) => (
                          <div
                            key={recipient.employee_id}
                            className="badge badge-primary gap-2"
                          >
                            <User size={14} />
                            {recipient.full_name}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecipient(recipient.employee_id);
                              }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">Chọn người nhận</span>
                      )}
                      <ChevronDown className="ml-auto" size={16} />
                    </div>

                    {showRecipientDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-base-100 border rounded-md shadow-lg">
                        <div className="p-2 border-b flex gap-2">
                          <div className="join">
                            <span className="join-item btn btn-sm">
                              <Building size={16} />
                            </span>
                            <select
                              className="select select-sm join-item select-bordered"
                              value={selectedDepartment}
                              onChange={handleDepartmentFilter}
                            >
                              <option value="">Tất cả phòng ban</option>
                              {departments.map((dept) => (
                                <option
                                  key={dept.department_id}
                                  value={dept.department_id}
                                >
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="join flex-1">
                            <div className="join-item btn btn-sm">
                              <Search size={16} />
                            </div>
                            <input
                              type="text"
                              placeholder="Tìm kiếm nhân viên..."
                              className="input input-sm join-item input-bordered flex-1"
                              value={searchTerm}
                              onChange={handleSearchChange}
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredEmployees.length > 0 ? (
                            <ul>
                              {filteredEmployees.map((employee) => (
                                <li
                                  key={employee.employee_id}
                                  className="p-2 hover:bg-base-200 cursor-pointer flex items-center gap-2"
                                  onClick={() => addRecipient(employee)}
                                >
                                  <User size={16} />
                                  <span>
                                    {employee.full_name} -{" "}
                                    {departments.find(
                                      (d) =>
                                        d.department_id ===
                                        employee.department_id
                                    )?.name || "Không có phòng ban"}
                                  </span>
                                  {selectedRecipients.some(
                                    (r) =>
                                      r.employee_id === employee.employee_id
                                  ) && (
                                    <CheckCircle
                                      size={16}
                                      className="ml-auto text-success"
                                    />
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="p-4 text-center text-gray-500">
                              Không tìm thấy nhân viên nào
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      !notification.title ||
                      !notification.message ||
                      selectedRecipients.length === 0 ||
                      isLoading
                    }
                  >
                    <Send size={16} />
                    Gửi thông báo
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
