import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

const schema = z.object({
  email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await axios.post("/api/auths/forgot-password", {
        email: data.email,
      });
      setSuccessMessage(response.data.message);
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
        alt="Forgot Password"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 relative z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Quên mật khẩu</h1>
            <p className="text-md font-medium text-gray-600 mt-2">
              Vui lòng nhập địa chỉ email của bạn dưới đây
            </p>
          </div>

          {/* Input email */}
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <div className="relative">
              <input
                {...register("email")}
                type="email"
                placeholder="mail@site.com"
                className="w-full p-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 opacity-50"
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
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </g>
              </svg>
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
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
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Tiếp theo"}
          </button>

          <p className="text-sm text-center mt-4">
            <Link
              href="/auths/login"
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
