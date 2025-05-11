import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";

const schema = z.object({
  email: z.string(),
  // .nonempty("Nhập địa chỉ email hợp lệ"),
  // .min(3, "Tên người dùng phải có ít nhất 3 ký tự")
  // .max(30, "Tên người dùng không được vượt quá 30 ký tự"),
  // .regex(
  //   /^[A-Za-z][A-Za-z0-9-_]*$/,
  //   "Bắt đầu bằng chữ cái, chỉ chứa chữ cái, số, -, _"
  // ),
  password: z
    .string()
    .nonempty("Password is required")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type FormData = z.infer<typeof schema>;
export default function Login() {
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
    <div className="flex gap-5 h-full pl-15 pr-15 items-center justify-items-center bg-white">
      <div className="flex-3 justify-items-center pt-40 pb-21">
        <Image
          src="/login.png"
          alt="Login"
          width={700}
          height={700}
          // className="w-full h-full"
        />
      </div>
      <div className="flex-1">
        <form
          onSubmit={handleSubmit(onSubmit)}
          // className="mt-10"
        >
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
                // className="w-full h-full"
              />
            </div>
            <div className="text-sm text-center pb-10">
              Đồng hành cùng doanh nghiệp trong công tác nhân sự
            </div>
          </div>

          {/* Input email */}
          <div className="mb-6">
            <label className="block text-gray-700">Email</label>
            {/* <input
              {...register("username")}
              type="text"
              name="username"
              autoComplete="username"
              placeholder="Please enter Username"
              className="border border-gray-300 rounded-md p-2 w-full"
            /> */}
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
                // minlength="8"
                // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
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
            {/* <input
              {...register("password")}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Please enter Password"
              className="border border-gray-300 rounded-md p-2 w-full"
            /> */}
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
