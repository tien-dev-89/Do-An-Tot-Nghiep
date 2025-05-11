import Link from "next/link";
import React, { useState, useEffect } from "react";
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

type Notification = {
  id: string;
  title: string;
  message: string;
  type: "Cá nhân" | "Nội bộ" | "Hệ thống";
  recipients: string[];
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

export default function SendNotifications() {
  const [notification, setNotification] = useState<Notification>({
    id: "",
    title: "",
    message: "",
    type: "Nội bộ",
    recipients: [],
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

  // Mock data for demonstration
  useEffect(() => {
    // Mock departments
    const mockDepartments: Department[] = [
      { department_id: "1", name: "Nhân sự" },
      { department_id: "2", name: "Kế toán" },
      { department_id: "3", name: "IT" },
      { department_id: "4", name: "Marketing" },
    ];

    // Mock employees
    const mockEmployees: Employee[] = [
      { employee_id: "1", full_name: "Nguyễn Văn A", department_id: "1" },
      { employee_id: "2", full_name: "Trần Thị B", department_id: "1" },
      { employee_id: "3", full_name: "Lê Văn C", department_id: "2" },
      { employee_id: "4", full_name: "Phạm Thị D", department_id: "2" },
      { employee_id: "5", full_name: "Hoàng Văn E", department_id: "3" },
      { employee_id: "6", full_name: "Ngô Thị F", department_id: "3" },
      { employee_id: "7", full_name: "Đỗ Văn G", department_id: "4" },
      { employee_id: "8", full_name: "Vũ Thị H", department_id: "4" },
    ];

    setDepartments(mockDepartments);
    setEmployees(mockEmployees);
    setFilteredEmployees(mockEmployees);
  }, []);

  // Filter employees based on department and search term
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
      type: e.target.value as "Cá nhân" | "Nội bộ" | "Hệ thống",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Here you would normally send this to your API
    console.log("Sending notification:", notification);

    // Show success notification
    setNotificationStatus("success");
    setShowNotification(true);

    // Reset form after successful submission
    setTimeout(() => {
      setNotification({
        id: "",
        title: "",
        message: "",
        type: "Nội bộ",
        recipients: [],
      });
      setSelectedRecipients([]);
      setShowNotification(false);
    }, 3000);
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
                <Link href={"/announcement/send-notifications"}>
                  Gửi thông báo
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-base-100 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">
            <Bell className="inline-block mr-2" size={24} />
            Gửi thông báo
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto p-6">
          {/* Success/Error notification */}
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

          <div className="bg-base-100 rounded-box shadow-md p-6">
            <form onSubmit={handleSubmit}>
              {/* Notification type */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-medium">Loại thông báo</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  value={notification.type}
                  onChange={handleTypeChange}
                >
                  <option value="Cá nhân">Cá nhân</option>
                  <option value="Nội bộ">Nội bộ</option>
                  <option value="Hệ thống">Hệ thống</option>
                </select>
              </div>

              {/* Title */}
              <div className="form-control mb-4">
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
                    setNotification({ ...notification, title: e.target.value })
                  }
                  required
                />
              </div>

              {/* Message */}
              <div className="form-control mb-6">
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

              {/* Recipients */}
              <div className="form-control mb-6">
                <label className="label">
                  <span className="label-text font-medium">Người nhận</span>
                </label>

                {/* Recipients selection */}
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

                  {/* Dropdown for selecting recipients */}
                  {showRecipientDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-base-100 border rounded-md shadow-lg">
                      <div className="p-2 border-b flex gap-2">
                        {/* Department filter */}
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

                        {/* Search */}
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

                      {/* Employee list */}
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
                                  {
                                    departments.find(
                                      (d) =>
                                        d.department_id ===
                                        employee.department_id
                                    )?.name
                                  }
                                </span>
                                {selectedRecipients.some(
                                  (r) => r.employee_id === employee.employee_id
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

              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !notification.title ||
                    !notification.message ||
                    selectedRecipients.length === 0
                  }
                >
                  <Send size={16} />
                  Gửi thông báo
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-base-100 shadow-inner p-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
          &copy; 2025 Hệ thống quản lý nhân sự
        </div>
      </footer>
    </div>
  );
}
