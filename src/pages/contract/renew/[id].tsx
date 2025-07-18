import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Contract {
  contract_id: string;
  employee: {
    full_name: string;
    email: string;
    phone_number: string | null;
    department: { name: string } | null;
    position: { name: string } | null;
  };
  start_date: string;
  end_date: string;
  status: string;
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
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra quyền Admin/HR
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      router.push("/auths/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as User;
      setUser(parsedUser);
      if (!parsedUser.roles.some((role) => ["Admin", "HR"].includes(role))) {
        router.push("/error/forbidden");
      }
    } catch (error: unknown) {
      console.error("Lỗi phân tích user:", error);
      router.push("/auths/login");
    }
  }, [router]);

  // Tải thông tin hợp đồng
  useEffect(() => {
    if (!id || !user) return;

    const fetchContract = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/contracts/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Lỗi tải hợp đồng: ${response.statusText}`
          );
        }

        const data = await response.json();
        if (!data.success || !data.contract) {
          throw new Error("Dữ liệu hợp đồng không hợp lệ");
        }

        setContract(data.contract); // Lấy contract từ data.contract
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate(
          new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            .toISOString()
            .split("T")[0]
        );
      } catch (error: unknown) {
        console.error("Lỗi tải hợp đồng:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Không thể tải thông tin hợp đồng"
        );
        setContract(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContract();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user || !user.roles.some((role) => ["Admin", "HR"].includes(role))) {
      router.push("/error/forbidden");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

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
      setError(
        error instanceof Error
          ? error.message
          : "Lỗi hệ thống, vui lòng thử lại"
      );
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  if (!user || !contract) {
    return (
      <div className="bg-base min-h-screen p-6">
        <div className="alert alert-error">
          {error || "Không thể tải thông tin hợp đồng. Vui lòng thử lại."}
        </div>
      </div>
    );
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

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-base-200 shadow-md">
        <div className="card-body">
          <h2 className="card-title">Thông tin nhân viên</h2>
          <p>
            <strong>Họ tên:</strong> {contract.employee.full_name}
          </p>
          <p>
            <strong>Email:</strong> {contract.employee.email}
          </p>
          <p>
            <strong>Phòng ban:</strong>{" "}
            {contract.employee.department?.name || "N/A"}
          </p>
          <p>
            <strong>Chức vụ:</strong>{" "}
            {contract.employee.position?.name || "N/A"}
          </p>

          <form onSubmit={handleSubmit} className="mt-3">
            <div className="form-control grid gap-1">
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
            <div className="form-control mt-4 grid gap-1">
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
