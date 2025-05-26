// pages/dashboard.tsx
import type { NextPage } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";

const Dashboard: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Chuyển đến đúng đường dẫn login
      router.push("/auths/login");
      return;
    }
  }, [router]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  );
};

export default Dashboard;
