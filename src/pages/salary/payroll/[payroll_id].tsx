import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

type PayrollStatus = "Đã nhận" | "Chưa nhận";

interface Payroll {
  payroll_id: string;
  employee_id: string;
  employee_name: string;
  employee_email: string;
  employee_phone: string;
  department: string;
  position: string;
  month: string;
  base_salary: number;
  overtime_bonus: number;
  late_penalty: number;
  total_salary: number;
  status: PayrollStatus;
  created_at: string;
  updated_at: string;
}

export default function PayrollDetail() {
  const router = useRouter();
  const { payroll_id } = router.query;
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [, setNewStatus] = useState<PayrollStatus | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  // Hàm gọi API để cập nhật trạng thái
  const updatePayrollStatus = async (status: PayrollStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/payrolls`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payroll_id,
          status: status === "Đã nhận" ? "PAID" : "UNPAID",
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật trạng thái bảng lương");
      }

      const updatedPayroll = await response.json();
      setPayroll(updatedPayroll);
      setError(null);
    } catch (err) {
      setError("Lỗi khi cập nhật trạng thái bảng lương");
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!payroll_id) return;

    async function fetchPayroll() {
      setLoading(true);
      try {
        const response = await fetch(`/api/payrolls/${payroll_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Không thể lấy chi tiết bảng lương");
        }
        const data = (await response.json()) as Payroll;
        setPayroll(data);
        setNewStatus(data.status);
        setError(null);
      } catch (err) {
        setError("Lỗi khi tải chi tiết bảng lương");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayroll();
  }, [payroll_id]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm text-gray-600">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-primary transition-colors duration-200 text-primary"
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <Link
                  href="/salary/payroll"
                  className="ml-1 text-gray-600 hover:text-primary transition-colors duration-200 text-primary"
                >
                  Bảng lương
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-gray-500 text-primary">
                  Chi tiết
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="bg-white shadow-lg rounded-lg p-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">
              Chi tiết bảng lương
            </h1>
            <Link
              href="/salary/payroll"
              className="btn btn-outline btn-primary flex items-center gap-2 hover:bg-primary hover:text-white transition-colors duration-200"
            >
              <ArrowLeft size={18} />
              Quay lại
            </Link>
          </div>
        </header>

        <main>
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-lg">
              <p className="text-red-500 text-lg font-medium">{error}</p>
              <Link
                href="/salary/payroll"
                className="btn btn-outline btn-sm btn-primary mt-4 hover:bg-primary hover:text-white transition-colors duration-200"
              >
                Quay lại
              </Link>
            </div>
          ) : payroll ? (
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                Thông tin bảng lương
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong className="font-medium">Nhân viên:</strong>{" "}
                    {payroll.employee_name}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Email:</strong>{" "}
                    {payroll.employee_email}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Số điện thoại:</strong>{" "}
                    {payroll.employee_phone}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Phòng ban:</strong>{" "}
                    {payroll.department}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Chức vụ:</strong>{" "}
                    {payroll.position}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-700">
                    <strong className="font-medium">Tháng:</strong>{" "}
                    {payroll.month}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Lương cơ bản:</strong>{" "}
                    {formatCurrency(payroll.base_salary)}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Thưởng làm thêm:</strong>{" "}
                    {formatCurrency(payroll.overtime_bonus)}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Phạt:</strong>{" "}
                    {formatCurrency(payroll.late_penalty)}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Tổng thực lãnh:</strong>{" "}
                    {formatCurrency(payroll.total_salary)}
                  </p>
                  <div className="text-gray-700">
                    <strong className="font-medium">Trạng thái:</strong>
                    <div className="dropdown dropdown-end ml-2 inline-block">
                      <label
                        tabIndex={0}
                        className={`btn btn-sm flex gap-2 ${
                          payroll.status === "Đã nhận"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        <span>{payroll.status}</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </label>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                      >
                        <li>
                          <button
                            onClick={() => updatePayrollStatus("Đã nhận")}
                            disabled={
                              isUpdating || payroll.status === "Đã nhận"
                            }
                          >
                            Đã nhận
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => updatePayrollStatus("Chưa nhận")}
                            disabled={
                              isUpdating || payroll.status === "Chưa nhận"
                            }
                          >
                            Chưa nhận
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    <strong className="font-medium">Ngày tạo:</strong>{" "}
                    {new Date(payroll.created_at).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-gray-700">
                    <strong className="font-medium">Ngày cập nhật:</strong>{" "}
                    {new Date(payroll.updated_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-lg">
              <p className="text-gray-500 text-lg font-medium mb-4">
                Không tìm thấy bảng lương
              </p>
              <Link
                href="/salary/payroll"
                className="btn btn-outline btn-sm btn-primary hover:bg-primary hover:text-white transition-colors duration-200"
              >
                Quay lại
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
