import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import format from "date-fns/format"; // date-fns@2.30.0

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
  status: "ACTIVE" | "EXPIRING" | "EXPIRED";
}

interface User {
  roles: string[];
}

export default function ContractDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [contract, setContract] = useState<Contract | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [, setError] = useState("");

  // Kiểm tra quyền Admin/HR
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
        if (!parsedUser.roles.some((role) => ["Admin", "HR"].includes(role))) {
          router.push("/error/forbidden");
        }
      } catch (error: unknown) {
        console.error("Lỗi phân tích dữ liệu người dùng:", error);
        router.push("/auths/login");
      }
    } else {
      router.push("/auths/login");
    }
  }, [router]);

  useEffect(() => {
    if (!id || typeof id !== "string" || !user) {
      setError("ID hợp đồng không hợp lệ hoặc thiếu thông tin người dùng");
      return;
    }

    fetch(`/api/contracts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi tải hợp đồng: ${res.statusText}`);
        return res.json();
      })
      .then((data) => setContract(data.contract || data))
      .catch((error: unknown) => {
        console.error("Lỗi tải chi tiết hợp đồng:", error);
        setContract(null);
        setError("Không thể tải hợp đồng. Vui lòng kiểm tra lại.");
      });
  }, [id, user]);

  if (!user || !contract) {
    return <div className="text-center p-4">Đang tải...</div>;
  }

  const isExpiring = contract.status === "EXPIRING";

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
          <li className="text-primary">Chi tiết hợp đồng</li>
        </ul>
      </div>

      <header className="bg-base-200 shadow-lg rounded-lg mb-6">
        <div className="max-w-7xl mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-primary">Chi tiết hợp đồng</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Thông tin nhân viên</h2>
            <p>
              <strong>Họ và tên:</strong> {contract.employee.full_name}
            </p>
            <p>
              <strong>Email:</strong> {contract.employee.email}
            </p>
            <p>
              <strong>Điện thoại:</strong>{" "}
              {contract.employee.phone_number || "N/A"}
            </p>
            <p>
              <strong>Phòng ban:</strong>{" "}
              {contract.employee.department?.name || "N/A"}
            </p>
            <p>
              <strong>Vị trí:</strong>{" "}
              {contract.employee.position?.name || "N/A"}
            </p>
          </div>
        </div>
        <div className="card bg-base-200 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Thông tin hợp đồng</h2>
            <p>
              <strong>Ngày bắt đầu:</strong>{" "}
              {format(new Date(contract.start_date), "dd/MM/yyyy")}
            </p>
            <p>
              <strong>Ngày kết thúc:</strong>{" "}
              {format(new Date(contract.end_date), "dd/MM/yyyy")}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {contract.status === "ACTIVE"
                ? "✅ Còn hạn"
                : contract.status === "EXPIRING"
                ? "⚠️ Sắp hết hạn"
                : "❌ Hết hạn"}
            </p>
          </div>
        </div>
      </div>

      {isExpiring && (
        <div className="alert alert-warning mt-6">
          <span>Cảnh báo: Hợp đồng sẽ hết hạn trong vòng 30 ngày!</span>
        </div>
      )}

      <div className="mt-6">
        <Link href={`/contract/renew/${contract.contract_id}`}>
          <button className="btn btn-primary">Gia hạn hợp đồng</button>
        </Link>
      </div>
    </div>
  );
}
