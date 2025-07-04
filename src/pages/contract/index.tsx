import { useRouter } from "next/router";
import { PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

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

export default function ContractList() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const itemsPerPage = 10;

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
        console.error("Lỗi phân tích user:", error);
        router.push("/auths/login");
      }
    } else {
      router.push("/auths/login");
    }
  }, [router]);

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auths/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.success;
    } catch (error: unknown) {
      console.error("Lỗi xác minh token:", error);
      return false;
    }
  };

  const fetchContracts = async () => {
    if (!user || !user.roles.some((role) => ["Admin", "HR"].includes(role))) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
      }

      // Kiểm tra token trước khi gọi API
      const isTokenValid = await verifyToken(token);
      if (!isTokenValid) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auths/login");
        throw new Error("Token không hợp lệ hoặc đã hết hạn.");
      }

      const response = await fetch(
        `/api/contracts?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(
          search
        )}&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/auths/login");
          throw new Error(
            "Unauthorized: " + (errorData.message || "Không được phép")
          );
        }
        if (response.status === 403) {
          router.push("/error/forbidden");
          throw new Error(
            "Forbidden: " + (errorData.message || "Không có quyền truy cập")
          );
        }
        throw new Error(`Lỗi API: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      if (!data.contracts || !Array.isArray(data.contracts)) {
        console.error("Dữ liệu hợp đồng không hợp lệ:", data);
        setContracts([]);
        setTotalItems(0);
        return;
      }

      setContracts(data.contracts);
      setTotalItems(data.total || 0);
    } catch (error: unknown) {
      console.error("Lỗi tải hợp đồng:", error);
      setContracts([]);
      setTotalItems(0);
      setError(
        error instanceof Error
          ? error.message.includes("Unauthorized")
            ? "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
            : error.message.includes("Forbidden")
            ? "Bạn không có quyền truy cập danh sách hợp đồng."
            : `Không thể tải danh sách hợp đồng: ${error.message}`
          : "Lỗi không xác định."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [currentPage, search, statusFilter, user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "✅ Còn hạn";
      case "EXPIRING":
        return "⚠️ Sắp hết hạn";
      case "EXPIRED":
        return "❌ Hết hạn";
      default:
        return "";
    }
  };

  if (!user) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="bg-base-100 min-h-screen p-6">
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
        </ul>
      </div>

      <header className="bg-base-200 shadow-md rounded-sm mb-6">
        <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">
            Quản lý Hợp Đồng
          </h1>
          <Link href="/contract/create">
            <button className="btn btn-primary">
              <PlusCircle className="w-5 h-5 mr-1" /> Tạo hợp đồng mới
            </button>
          </Link>
        </div>
      </header>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="input input-bordered w-full pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select select-bordered"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Còn hạn</option>
          <option value="EXPIRING">Sắp hết hạn</option>
          <option value="EXPIRED">Hết hạn</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>STT</th>
              <th>Nhân viên</th>
              <th>Liên hệ</th>
              <th>Phòng ban</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Đang tải...
                </td>
              </tr>
            ) : Array.isArray(contracts) && contracts.length > 0 ? (
              contracts.map((contract, index) => (
                <tr key={contract.contract_id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{contract.employee.full_name}</td>
                  <td>{contract.employee.email}</td>
                  <td>{contract.employee.department?.name || "N/A"}</td>
                  <td>{contract.employee.position?.name || "N/A"}</td>
                  <td>{getStatusIcon(contract.status)}</td>
                  <td>
                    <Link href={`/contract/${contract.contract_id}`}>
                      <button className="btn btn-ghost btn-sm">
                        Xem chi tiết
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  Không có hợp đồng nào để hiển thị
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
