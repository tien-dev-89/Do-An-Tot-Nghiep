import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const schema = z.object({
  email: z
    .string()
    .email("Nhập địa chỉ email hợp lệ")
    .nonempty("Email là bắt buộc"),
  // password: z
  //   .string()
  //   .nonempty("Mật khẩu là bắt buộc")
  //   .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  password: z
    .string()
    .nonempty("Mật khẩu là bắt buộc")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất một chữ thường")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất một chữ hoa")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất một số"),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false); // Trạng thái cho việc tải trang
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true); // Bắt đầu loading
    setIsPageLoading(true); // Bắt đầu tải trang
    setErrorMessage(""); // Xóa thông báo lỗi

    try {
      // Gọi API đăng nhập
      const response = await fetch("/api/auths/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        setErrorMessage(result.message || "Đăng nhập thất bại");
        setLoading(false); // Dừng loading
      } else {
        // Lưu JWT và thông tin người dùng vào localStorage
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));

        // Chuyển hướng đến dashboard
        router.push("/");
      }
    } catch (error) {
      console.error("Error login:", error);
      setErrorMessage("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      // Dừng loading và tải trang
      setLoading(false); // Dừng loading
      setIsPageLoading(false);
    }
  };

  // Nếu trang đang tải, hiển thị "Loading"
  if (isPageLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex gap-5 h-full pl-15 pr-15 items-center justify-items-center bg-white">
      <div className="flex-3 justify-items-center pt-40 pb-21">
        <Image src="/login.png" alt="Login" width={700} height={700} />
      </div>
      <div className="flex-1">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div
              className="justify-items-center overflow-hidden"
              style={{ height: 120 }}
            >
              <Image
                src="/logo-staffly.svg"
                alt="Avatar Login"
                width={150}
                height={80}
              />
            </div>
            <div className="text-sm text-center pb-10">
              Đồng hành cùng doanh nghiệp trong công tác nhân sự
            </div>
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

          {/* Input password */}
          <div className="mb-6">
            <label className="block text-gray-700">Password</label>
            <label className="input validator w-full">
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
                  <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path>
                  <circle
                    cx="16.5"
                    cy="7.5"
                    r=".5"
                    fill="currentColor"
                  ></circle>
                </g>
              </svg>
              <input
                {...register("password")}
                type="password"
                name="password"
                required
                placeholder="Please enter Password"
                title="Phải có nhiều hơn 8 ký tự, bao gồm số, chữ thường, chữ hoa"
              />
            </label>
            <p className="validator-hint hidden">
              Phải có hơn 8 ký tự, bao gồm cả
              <br />
              Ít nhất một số <br />
              Ít nhất một chữ cái viết thường <br />
              Ít nhất một chữ hoa
            </p>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
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
            {loading ? "Logging in..." : "Login"}
          </button>
          <div>
            <p className="text-sm mt-4">
              <Link
                href="/auths/forgot-password"
                className="text-blue-700 hover:text-blue-500 hover:underline"
              >
                Quên mât khẩu?
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
