import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";

const schema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu cũ")
      .min(8, "Mật khẩu cũ phải có ít nhất 8 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu cũ phải chứa ít nhất một chữ hoa, một chữ thường và một số"
      ),
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu mới phải chứa ít nhất một chữ hoa, một chữ thường và một số"
      ),
    confirmNewPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Vui lòng đăng nhập lại để thay đổi mật khẩu");
        toast.error("Vui lòng đăng nhập lại để thay đổi mật khẩu");
        return;
      }

      const response = await axios.post("/api/utility/change-password", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message);
      reset();
    } catch (error: unknown) {
      let message = "Thay đổi mật khẩu thất bại. Vui lòng thử lại.";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || message;
      }
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm">
          <ul className="flex space-x-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Trang chủ
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/utility/change-password"
                className="text-blue-600 hover:underline"
              >
                Thay đổi mật khẩu
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Nội dung chính */}
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Thay đổi mật khẩu</h1>
        </header>

        <main className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Mật khẩu cũ */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu cũ
              </label>
              <input
                {...register("oldPassword")}
                type="password"
                className={`w-full p-2 border rounded-md ${
                  errors.oldPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mật khẩu cũ"
              />
              {errors.oldPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* Mật khẩu mới */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu mới
              </label>
              <input
                {...register("newPassword")}
                type="password"
                className={`w-full p-2 border rounded-md ${
                  errors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mật khẩu mới"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Xác nhận mật khẩu mới
              </label>
              <input
                {...register("confirmNewPassword")}
                type="password"
                className={`w-full p-2 border rounded-md ${
                  errors.confirmNewPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Xác nhận mật khẩu mới"
              />
              {errors.confirmNewPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            {/* Thông báo lỗi */}
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}

            {/* Nút điều khiển */}
            <div className="flex justify-between mt-6">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Thoát
              </Link>
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Thay đổi"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
