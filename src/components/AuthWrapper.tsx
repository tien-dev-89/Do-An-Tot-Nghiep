import { useRouter } from "next/router";
import { useEffect, useState, ReactNode } from "react";
import MainLayout from "@/components/layouts/MainLayout";

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const noLayout = ["/auths/login", "/auths/forgot-password"];
  const isNoLayout = noLayout.includes(router.pathname);

  // Các trang chỉ dành cho người chưa đăng nhập
  const authPages = ["/auths/login", "/auths/forgot-password"];
  const isAuthPage = authPages.includes(router.pathname);

  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    // Kiểm tra token có tồn tại không
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);

      // Nếu không có token và không phải trang auth, chuyển về login
      if (!isAuthPage) {
        router.push("/auths/login");
      }
      return;
    }

    // Nếu có token, gọi API để kiểm tra
    const verifyToken = async () => {
      try {
        const response = await fetch("/api/auths/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        // Kiểm tra token hợp lệ
        if (!result.success) {
          // Token không hợp lệ, xóa localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setIsLoading(false);

          // Chuyển về login nếu không phải trang auth
          if (!isAuthPage) {
            router.push("/auths/login");
          }
        } else {
          // Token hợp lệ
          localStorage.setItem("user", JSON.stringify(result.user));
          setIsAuthenticated(true);
          setIsLoading(false);

          // Nếu đã đăng nhập mà vào trang auth, chuyển về home
          if (isAuthPage) {
            router.push("/"); // hoặc trang dashboard chính của bạn
          }
        }
      } catch (error) {
        // Lỗi khi gọi API, xóa localStorage
        console.error("Lỗi xác minh token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setIsLoading(false);

        // Chuyển về login nếu không phải trang auth
        if (!isAuthPage) {
          router.push("/auths/login");
        }
      }
    };

    verifyToken();
    // }, [isAuthPage, router, router.pathname]); // Chỉ depend vào pathname để tránh loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]); // Chỉ depend vào pathname để tránh loop

  // Hiển thị màn hình tải khi đang kiểm tra token
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-2">Đang tải...</p>
      </div>
    );
  }

  // Nếu đang ở trang auth nhưng đã đăng nhập, hiển thị loading (sẽ redirect)
  if (isAuthenticated && isAuthPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-2">Đang chuyển hướng...</p>
      </div>
    );
  }

  // Nếu chưa đăng nhập và không phải trang auth, hiển thị loading (sẽ redirect)
  if (!isAuthenticated && !isAuthPage) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="ml-2">Đang chuyển hướng...</p>
      </div>
    );
  }

  // Hiển thị nội dung với hoặc không có MainLayout
  return isNoLayout ? <>{children}</> : <MainLayout>{children}</MainLayout>;
}
