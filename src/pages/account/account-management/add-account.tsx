import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { Save, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { debounce } from "lodash";

interface Employee {
  employee_id: string;
  full_name: string;
  email: string;
  birth_date: string | null;
  gender: "MALE" | "FEMALE" | null;
  department: { department_id: string; name: string } | null;
  position: { position_id: string; name: string } | null;
  avatar_url: string | null;
  user_roles: { role: { role_id: string; name: string } }[];
}

interface FormData {
  email: string;
}

export default function AddAccount() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployee, setFetchingEmployee] = useState(false);
  const [errors, setErrors] = useState<
    Partial<FormData> & { general?: string }
  >({});
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);

  useEffect(() => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      router.push("/auths/login");
    }
  }, [router]);

  const fetchEmployeeByEmail = async (email: string) => {
    if (email.length <= 2) {
      setEmployee(null);
      setEmailSuggestions([]);
      setFetchingEmployee(false);
      return;
    }

    setFetchingEmployee(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(
        `/api/employees/by-email?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log("Employee API response:", data);
      if (response.ok && !data.error) {
        setEmployee(data.data || data);
        setEmailSuggestions([data.data?.email || data.email]);
      } else {
        setEmployee(null);
        setEmailSuggestions([]);
        setErrors({
          ...errors,
          email:
            data.error || "Email không khớp với nhân viên chưa có tài khoản",
        });
        toast.error(data.error || "Không tìm thấy nhân viên");
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tìm nhân viên:", error);
      setEmployee(null);
      setEmailSuggestions([]);
      setErrors({ ...errors, email: "Lỗi khi tìm nhân viên" });
      toast.error("Lỗi khi tìm nhân viên");
    } finally {
      setFetchingEmployee(false);
    }
  };

  const debouncedFetchEmployee = debounce(fetchEmployeeByEmail, 300);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    setErrors({ ...errors, email: undefined });
    debouncedFetchEmployee(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    if (!employee) newErrors.email = "Email không khớp với nhân viên nào";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generatePassword = (
    fullName: string,
    birthDate: string | null
  ): string => {
    // Remove diacritics and spaces from full name
    const cleanFullName = fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");

    // Handle birth date or default to 01011990
    if (!birthDate) return cleanFullName + "01011990";
    const date = new Date(birthDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return cleanFullName + day + month + year;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !employee) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const password = generatePassword(
        employee.full_name,
        employee.birth_date
      );
      const response = await fetch("/api/account/account-management/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: employee.employee_id,
          password,
        }),
      });
      const result = await response.json();
      console.log("Create user API response:", result);

      if (result.success) {
        const emailResponse = await fetch("/api/email/queue", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            to_email: employee.email,
            subject: "Chào mừng bạn đến với Hệ thống HRM!",
            body: `
              Xin chào ${employee.full_name || employee.email.split("@")[0]}

              Tài khoản của bạn đã được tạo thành công. Dưới đây là thông tin đăng nhập.

              Tài khoản: ${employee.email.split("@")[0]}
              Mật khẩu tạm: ${password}
                
              Đăng nhập ngay: http://localhost:3000/auths/login
              
              Vui lòng đăng nhập và đổi mật khẩu ngay lần đầu sử dụng để đảm bảo an toàn.
                
              Nếu bạn gặp khó khăn, vui lòng liên hệ bộ phận IT.
            `,
            is_html: true,
          }),
        });
        const emailResult = await emailResponse.json();
        console.log("Email queue API response:", emailResult);
        console.log("Email queue API status:", emailResponse.status);
        console.log("Email data sent:", {
          to_email: employee.email,
          subject: "Chào mừng bạn đến với Hệ thống HRM!",
          body: "HTML email content",
        });

        if (!emailResponse.ok || !emailResult.success) {
          toast.warn(
            `Tạo tài khoản thành công nhưng lỗi gửi email: ${
              emailResult.error || "Lỗi không xác định"
            }`
          );
        } else {
          toast.success("Tạo tài khoản thành công và email đã được xếp hàng!");
        }
        window.history.back();
      } else {
        setErrors({
          ...errors,
          general: result.error || "Lỗi khi tạo tài khoản",
        });
        toast.error(result.error || "Lỗi khi tạo tài khoản");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Lỗi không xác định";
      setErrors({
        ...errors,
        general: "Lỗi khi tạo tài khoản: " + errorMessage,
      });
      toast.error("Lỗi khi tạo tài khoản: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const calculateAge = (birthDate: string | null): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <div className="bg-base-100 px-6 py-2">
        <div className="text-sm breadcrumbs">
          <ul>
            <li>
              <Link href="/" className="text-primary">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/account/account-management" className="text-primary">
                Tài Khoản
              </Link>
            </li>
            <li>
              <Link
                href="/account/account-management/add-account"
                className="text-primary"
              >
                Thêm tài khoản
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-base-100 px-6 py-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Thêm tài khoản mới</h1>
      </div>

      <div className="px-6 py-6 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6">
          {loading ? (
            <div className="text-center p-4">
              <span className="loading loading-spinner loading-md"></span> Đang
              xử lý...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Thông tin tài khoản</h3>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Email <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      placeholder="Nhập email nhân viên"
                      className={`input input-bordered w-full ${
                        errors.email ? "input-error" : ""
                      }`}
                      list="email-suggestions"
                      disabled={fetchingEmployee}
                    />
                    <datalist id="email-suggestions">
                      {emailSuggestions.map((email, index) => (
                        <option key={`${email}-${index}`} value={email} />
                      ))}
                    </datalist>
                    {fetchingEmployee && (
                      <span className="loading loading-spinner loading-sm mt-2"></span>
                    )}
                    {errors.email && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          {errors.email}
                        </span>
                      </label>
                    )}
                  </div>

                  {employee ? (
                    <>
                      <div className="form-control grid gap-1">
                        <label className="label">
                          <span className="label-text font-medium">
                            Tên đăng nhập
                          </span>
                        </label>
                        <div className="input input-bordered bg-gray-50">
                          {employee.email
                            ? employee.email.split("@")[0]
                            : "N/A"}
                        </div>
                      </div>

                      <div className="form-control grid gap-1">
                        <label className="label">
                          <span className="label-text font-medium">
                            Họ và tên
                          </span>
                        </label>
                        <div className="input input-bordered bg-gray-50">
                          {employee.full_name || "N/A"}
                        </div>
                      </div>

                      <div className="form-control grid gap-1">
                        <label className="label">
                          <span className="label-text font-medium">Tuổi</span>
                        </label>
                        <div className="input input-bordered bg-gray-50">
                          {calculateAge(employee.birth_date)}
                        </div>
                      </div>

                      <div className="form-control grid gap-1">
                        <label className="label">
                          <span className="label-text font-medium">
                            Giới tính
                          </span>
                        </label>
                        <div className="input input-bordered bg-gray-50">
                          {employee.gender === "MALE"
                            ? "Nam"
                            : employee.gender === "FEMALE"
                            ? "Nữ"
                            : "Không xác định"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Nhập email để xem thông tin nhân viên
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Thông tin bổ sung</h3>

                  {employee ? (
                    <>
                      <div className="form-control grid gap-2 justify-center">
                        <label className="label">
                          <span className="label-text font-medium">
                            Ảnh đại diện
                          </span>
                        </label>
                        <div className="avatar">
                          <div className="w-24 rounded-full">
                            {employee.avatar_url ? (
                              <Image
                                src={employee.avatar_url}
                                alt={employee.full_name || "Avatar"}
                                width={96}
                                height={96}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center">
                                <span className="text-3xl">
                                  {employee.full_name?.charAt(0) || "N/A"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-control grid gap-1">
                        <label className="label">
                          <span className="label-text font-medium">
                            Phòng ban
                          </span>
                        </label>
                        <div className="input input-bordered bg-gray-50">
                          {employee.department?.name || "Không có"}
                        </div>
                      </div>

                      <div className="form-control grid gap-1">
                        <label className="label">
                          <span className="label-text font-medium">
                            Chức vụ
                          </span>
                        </label>
                        <div className="input input-bordered bg-gray-50">
                          {employee.position?.name || "Không có"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Không có thông tin bổ sung
                    </p>
                  )}
                </div>
              </div>

              {errors.general && (
                <div className="alert alert-error mt-4">
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-outline"
                >
                  <XCircle className="w-5 h-5 mr-1" /> Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || fetchingEmployee}
                >
                  <Save className="w-5 h-5 mr-1" /> Lưu tài khoản
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
