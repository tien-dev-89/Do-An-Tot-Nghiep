import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

const schema = z.object({
  email: z.string(),
  // .nonempty("Nhập địa chỉ email hợp lệ"),
  // .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
  // .max(30, "Tên người dùng không được vượt quá 30 ký tự"),
  // .regex(
  //   /^[A-Za-z][A-Za-z0-9-_]*$/,
  //   "Bắt đầu bằng chữ cái, chỉ chứa chữ cái, số, -, _"
  // ),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false); // Trạng thái cho việc tải trang
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    setLoading(true); // Bắt đầu loading
    setIsPageLoading(true); // Bắt đầu tải trang
    setErrorMessage(""); // Xóa thông báo lỗi
  };

  // Nếu trang đang tải, hiển thị "Loading"
  if (isPageLoading) {
    return <p>Loading...</p>;
  }
  return (
    <div className="flex justify-center">
      <Image
        src="/gradient-connection-background.png"
        alt="Forgot Password"
        layout="fill"
      />
      <div className="bg-white shadow-2xl rounded-2xl absolute w-100 h-80 top-2/7">
        <form onSubmit={handleSubmit(onSubmit)} className="p-5">
          <div className="justify-self-center text-3xl font-bold pb-4">
            Quên mật khẩu
          </div>
          <div className="text-md justify-self-center font-bold pb-5">
            Vui lòng nhập địa chỉ email của bạn dưới đây
          </div>
          {/* Input email */}
          <div className="mb-6">
            <label className="block text-gray-700">Email</label>
            <label className="input validator join-item w-full">
              <svg
                className="h-[1em] opacity-50"
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
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </g>
              </svg>
              <input
                {...register("email")}
                type="email"
                placeholder="mail@site.com"
                required
              />
            </label>
            <div className="validator-hint hidden">
              Nhập địa chỉ email hợp lệ
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Lỗi chung */}
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          {/* Button submit */}
          <button
            type="submit"
            className="bg-blue-500 text-white w-full p-2 rounded-md hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Next"}
          </button>
          <div>
            <p className="text-sm mt-4">
              <Link
                href="/auths/login"
                className="text-blue-700 hover:text-blue-500 hover:underline"
              >
                Quay lại trang đăng nhập?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
