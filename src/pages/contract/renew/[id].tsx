import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Contract {
  contract_id: string;
  employee: {
    full_name: string;
    email: string;
  };
}

interface User {
  roles: string[];
}

export default function RenewContract() {
  const router = useRouter();
  const { id } = router.query;
  const [contract, setContract] = useState<Contract | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  // Kiểm tra quyền Admin/HR
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
        if (!parsedUser.roles.some((role) => ["Admin", "HR"].includes(role))) {
          router.push("/error/forbidden"); // Sửa đường dẫn
        }
      } catch (error: unknown) {
        console.error("Lỗi phân tích user:", error);
        router.push("/auths/login");
      }
    } else {
      router.push("/auths/login");
    }
  }, [router]);

  useEffect(() => {
    if (id && user) {
      fetch(`/api/contracts/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Lỗi tải hợp đồng");
          return res.json();
        })
        .then((data) => {
          setContract(data);
          setStartDate(new Date().toISOString().split("T")[0]);
          setEndDate(
            new Date(new Date().setFullYear(new Date().getFullYear() + 1))
              .toISOString()
              .split("T")[0]
          );
        })
        .catch((error: unknown) => {
          console.error("Lỗi tải hợp đồng:", error);
          setContract(null);
          setError("Không thể tải thông tin hợp đồng");
        });
    }
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user || !user.roles.some((role) => ["Admin", "HR"].includes(role))) {
      router.push("/error/forbidden"); // Sửa đường dẫn
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/contracts/renew", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contract_id: id,
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/contract/${id}`);
      } else {
        setError(data.message || "Lỗi gia hạn hợp đồng");
      }
    } catch (error: unknown) {
      console.error("Lỗi gia hạn:", error);
      setError("Lỗi hệ thống, vui lòng thử lại");
    }
  };

  if (!user || !contract) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="bg-base min-h-screen p-6">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/" className="text-primary">
              Home
            </Link>
          </li>
          <li>
            <Link href="/contract" className="text-primary">
              Hợp đồng
            </Link>
          </li>
          <li className="text-primary">Gia hạn hợp đồng</li>
        </ul>
      </div>

      <header className="bg-base-200 shadow-md rounded-sm mb-6">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <h1 className="text-2xl font-semibold text-primary">
            Gia hạn Hợp đồng
          </h1>
        </div>
      </header>

      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Thông tin nhân viên</h2>
          <p>
            <strong>Họ tên:</strong> {contract.employee.full_name}
          </p>
          <p>
            <strong>Email:</strong> {contract.employee.email}
          </p>

          <form onSubmit={handleSubmit} className="mt-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Ngày bắt đầu hợp đồng mới</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Ngày kết thúc hợp đồng mới</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            {error && <div className="alert alert-error mt-4">{error}</div>}
            <div className="mt-6 flex gap-4">
              <button type="submit" className="btn btn-primary">
                Xác nhận gia hạn
              </button>
              <Link href={`/contract/${id}`}>
                <button className="btn btn-ghost">Hủy</button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
