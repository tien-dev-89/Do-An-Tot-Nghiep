import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/router";

const schema = z
  .object({
    newPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z
      .string()
      .min(8, "Mật khẩu xác nhận phải có ít nhất 8 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const { token } = router.query;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      setErrorMessage("Token không hợp lệ. Vui lòng thử lại.");
    }
  }, [token]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post("/api/auths/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      setSuccessMessage(response.data.message);
      setTimeout(() => router.push("/auths/login"), 2000); // Chuyển hướng sau 2 giây
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại."
        );
      } else {
        setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center">
      <Image
        src="/gradient-connection-background.png"
        alt="Reset Password"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Đặt lại mật khẩu</h1>
            <p className="text-md font-medium text-gray-600 mt-2">
              Vui lòng nhập mật khẩu mới của bạn
            </p>
          </div>

          {/* Input new password */}
          <div>
            <label className="block text-gray-700 font-medium">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                {...register("newPassword")}
                type="password"
                placeholder="Nhập mật khẩu mới"
                className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M12 19c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7zm0-12v8m-4-4h8"
                />
              </svg>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Input confirm password */}
          <div>
            <label className="block text-gray-700 font-medium">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  d="M12 19c-4 0-7-3-7-7s3-7 7-7 7 3 7 7-3 7-7 7zm0-12v8m-4-4h8"
                />
              </svg>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Thông báo lỗi */}
          {errorMessage && (
            <p className="text-red-500 text-sm text-center">{errorMessage}</p>
          )}
          {/* Thông báo thành công */}
          {successMessage && (
            <p className="text-green-500 text-sm text-center">
              {successMessage}
            </p>
          )}

          {/* Button submit */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            disabled={loading || !token}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>

          <p className="text-sm text-center mt-4">
            <Link
              href="/auth/login"
              className="text-blue-700 hover:text-blue-500 hover:underline"
            >
              Quay lại trang đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
