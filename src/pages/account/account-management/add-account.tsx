import Link from "next/link";
import React, { useState } from "react";
import { Eye, EyeOff, Save, XCircle } from "lucide-react";

interface FormData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  departmentId: string;
  positionId: string;
  roles: string[];
}

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function AddAccount() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    departmentId: "",
    positionId: "",
    roles: [],
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Mẫu dữ liệu (trong thực tế sẽ lấy từ API)
  const departments: Department[] = [
    { id: "1", name: "Kỹ thuật" },
    { id: "2", name: "Nhân sự" },
    { id: "3", name: "Marketing" },
    { id: "4", name: "Kế toán" },
  ];

  const positions: Position[] = [
    { id: "1", name: "Trưởng phòng" },
    { id: "2", name: "Nhân viên" },
    { id: "3", name: "Kế toán trưởng" },
  ];

  const roles: Role[] = [
    { id: "1", name: "Admin", description: "Quản trị viên hệ thống" },
    { id: "2", name: "Manager", description: "Quản lý" },
    { id: "3", name: "HR", description: "Nhân sự" },
    { id: "4", name: "Employee", description: "Nhân viên" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[name as keyof FormData]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const handleRoleChange = (roleId: string) => {
    const updatedRoles = formData.roles.includes(roleId)
      ? formData.roles.filter((id) => id !== roleId)
      : [...formData.roles, roleId];

    setFormData({ ...formData, roles: updatedRoles });
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!formData.departmentId) {
      newErrors.departmentId = "Vui lòng chọn phòng ban";
    }

    if (!formData.positionId) {
      newErrors.positionId = "Vui lòng chọn chức vụ";
    }

    if (formData.roles.length === 0) {
      //   newErrors.roles = "Vui lòng chọn ít nhất một vai trò";
      newErrors.roles = ["Vui lòng chọn ít nhất một vai trò"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Xử lý gửi dữ liệu
      console.log("Form data submitted:", formData);
      // Gọi API để tạo tài khoản mới
      alert("Tạo tài khoản thành công!");
      // Redirect hoặc reset form sau khi thành công
    }
  };

  const handleCancel = () => {
    // Quay lại trang trước đó
    window.history.back();
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Breadcrumb */}
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

      {/* Header */}
      <div className="bg-base-100 px-6 py-4 border-b">
        <h1 className="text-2xl font-bold text-primary">Quản lý Tài Khoản</h1>
      </div>

      {/* Form Content */}
      <div className="px-6 py-6 flex-grow">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-3xl font-semibold mb-6">Thêm tài khoản mới</h2>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Thông tin tài khoản</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Tên đăng nhập <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Nhập tên đăng nhập"
                    className={`input input-bordered w-full ${
                      errors.username ? "input-error" : ""
                    }`}
                  />
                  {errors.username && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.username}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Họ và tên <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    className={`input input-bordered w-full ${
                      errors.fullName ? "input-error" : ""
                    }`}
                  />
                  {errors.fullName && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.fullName}
                      </span>
                    </label>
                  )}
                </div>

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
                    onChange={handleChange}
                    placeholder="example@company.com"
                    className={`input input-bordered w-full ${
                      errors.email ? "input-error" : ""
                    }`}
                  />
                  {errors.email && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.email}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Mật khẩu <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`input input-bordered w-full pr-10 ${
                        errors.password ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.password}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Xác nhận mật khẩu <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`input input-bordered w-full pr-10 ${
                        errors.confirmPassword ? "input-error" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.confirmPassword}
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Phòng ban và chức vụ */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Thông tin công việc</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Phòng ban <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className={`select select-bordered w-full ${
                      errors.departmentId ? "select-error" : ""
                    }`}
                  >
                    <option value="">Chọn phòng ban</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.departmentId}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Chức vụ <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleChange}
                    className={`select select-bordered w-full ${
                      errors.positionId ? "select-error" : ""
                    }`}
                  >
                    <option value="">Chọn chức vụ</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </select>
                  {errors.positionId && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.positionId}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Vai trò <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="bg-base-200 rounded-lg p-3 space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="form-control">
                        <label className="cursor-pointer flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={formData.roles.includes(role.id)}
                            onChange={() => handleRoleChange(role.id)}
                          />
                          <div>
                            <span className="font-medium">{role.name}</span>
                            <p className="text-sm text-gray-500">
                              {role.description}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.roles && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        {errors.roles}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
              >
                <XCircle className="w-5 h-5 mr-1" /> Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                <Save className="w-5 h-5 mr-1" /> Lưu tài khoản
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
