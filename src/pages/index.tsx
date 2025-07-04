import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Department {
  id: string;
  name: string;
  employeeCount: number;
}

interface Position {
  id: string;
  name: string;
  employeeCount: number;
}

interface Contract {
  id: string;
  employee: string;
  end_date: Date;
}

interface LeaveRequest {
  date: string;
  count: number;
}

interface Role {
  id: string;
  name: string;
  userCount: number;
}

interface Stats {
  employees: number;
  expiringContracts: number;
  pendingLeaveRequests: number;
}

interface Timekeeping {
  date: string;
  present: number;
  late: number;
  absent: number;
}

interface RewardDiscipline {
  month: string;
  rewards: number;
  penalties: number;
}

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<Stats>({
    employees: 0,
    expiringContracts: 0,
    pendingLeaveRequests: 0,
  });
  const [timekeeping, setTimekeeping] = useState<Timekeeping[]>([]);
  const [rewardDiscipline, setRewardDiscipline] = useState<RewardDiscipline[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auths/login");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể tải dữ liệu từ API.");
        }

        const data = await response.json();
        setStats(data.stats);
        setDepartments(data.departments);
        setPositions(data.positions);
        setContracts(data.contracts);
        setLeaveRequests(data.leaveRequests);
        setRoles(data.roles);
        setTimekeeping(data.timekeeping);
        setRewardDiscipline(data.rewardDiscipline);
      } catch (error: unknown) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };

    fetchData();
  }, [router]);

  const departmentChartData = {
    labels: departments.map((d) => d.name),
    datasets: [
      {
        label: "Số nhân viên",
        data: departments.map((d) => d.employeeCount),
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const positionChartData = {
    labels: positions.map((p) => p.name),
    datasets: [
      {
        data: positions.map((p) => p.employeeCount),
        backgroundColor: [
          "rgba(236, 72, 153, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
        ],
        borderColor: [
          "rgba(236, 72, 153, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const leaveRequestChartData = {
    labels: leaveRequests.map((lr) => lr.date),
    datasets: [
      {
        label: "Số đơn nghỉ phép",
        data: leaveRequests.map((lr) => lr.count),
        fill: true,
        backgroundColor: "rgba(16, 185, 129, 0.3)",
        borderColor: "rgba(16, 185, 129, 1)",
        tension: 0.4,
      },
    ],
  };

  const roleChartData = {
    labels: roles.map((r) => r.name),
    datasets: [
      {
        data: roles.map((r) => r.userCount),
        backgroundColor: [
          "rgba(139, 92, 246, 0.7)",
          "rgba(253, 186, 116, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(236, 72, 153, 0.7)",
        ],
        borderColor: [
          "rgba(139, 92, 246, 1)",
          "rgba(253, 186, 116, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(236, 72, 153, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const timekeepingChartData = {
    labels: timekeeping.map((t) => t.date),
    datasets: [
      {
        label: "Đi làm",
        data: timekeeping.map((t) => t.present),
        fill: false,
        borderColor: "rgba(16, 185, 129, 1)",
        tension: 0.4,
      },
      {
        label: "Đi trễ",
        data: timekeeping.map((t) => t.late),
        fill: false,
        borderColor: "rgba(236, 72, 153, 1)",
        tension: 0.4,
      },
      {
        label: "Vắng mặt",
        data: timekeeping.map((t) => t.absent),
        fill: false,
        borderColor: "rgba(253, 186, 116, 1)",
        tension: 0.4,
      },
    ],
  };

  const rewardDisciplineChartData = {
    labels: rewardDiscipline.map((rd) => rd.month),
    datasets: [
      {
        label: "Thưởng",
        data: rewardDiscipline.map((rd) => rd.rewards),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
      {
        label: "Phạt",
        data: rewardDiscipline.map((rd) => rd.penalties),
        backgroundColor: "rgba(236, 72, 153, 0.7)",
        borderColor: "rgba(236, 72, 153, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {error && (
        <div className="mb-10 max-w-4xl mx-auto bg-red-50 border-l-4 border-red-600 p-5 rounded-xl shadow-md animate-fade-in">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-red-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-base text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Tổng số nhân viên, Hợp đồng sắp hết hạn, Đơn nghỉ phép chờ duyệt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
          <div className="flex items-center space-x-4">
            <svg
              className="w-14 h-14 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Tổng số nhân viên
              </h3>
              <p className="text-4xl font-bold text-gray-900">
                {stats.employees}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
          <div className="flex items-center space-x-4">
            <svg
              className="w-14 h-14 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Hợp đồng sắp hết hạn
              </h3>
              <p className="text-4xl font-bold text-gray-900">
                {stats.expiringContracts}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
          <div className="flex items-center space-x-4">
            <svg
              className="w-14 h-14 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 01-2 2"
              />
            </svg>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Đơn nghỉ phép chờ duyệt
              </h3>
              <p className="text-4xl font-bold text-gray-900">
                {stats.pendingLeaveRequests}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nhân viên theo chức vụ và Chấm công trong tháng + Hợp đồng sắp hết hạn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
        <Link href="/position" passHref>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:--translate-y-1 animate-fade-in">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Nhân viên theo chức vụ
            </h3>
            <Doughnut
              data={positionChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { boxWidth: 14, padding: 20, font: { size: 16 } },
                  },
                },
              }}
            />
          </div>
        </Link>
        <div className="grid gap-8">
          <Link href="/salary/timesheets" passHref>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Chấm công trong tháng
              </h3>
              <Line
                data={timekeepingChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: { boxWidth: 14, padding: 20, font: { size: 16 } },
                    },
                    title: {
                      display: true,
                      text: "Thống kê chấm công",
                      font: { size: 20, weight: "bold" },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Số lượng",
                        font: { size: 16 },
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Ngày",
                        font: { size: 16 },
                      },
                    },
                  },
                }}
              />
            </div>
          </Link>
          <Link href="/contract" passHref>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Hợp đồng sắp hết hạn
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-base border-separate border-spacing-y-2">
                  <thead>
                    <tr className="bg-gray-100 rounded-lg">
                      <th className="text-left font-semibold text-gray-800 py-4 px-6 rounded-l-lg">
                        Nhân viên
                      </th>
                      <th className="text-left font-semibold text-gray-800 py-4 px-6 rounded-r-lg">
                        Ngày hết hạn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr
                        key={contract.id}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <td className="text-gray-900 py-4 px-6 rounded-l-lg">
                          {contract.employee}
                        </td>
                        <td className="text-gray-900 py-4 px-6 rounded-r-lg">
                          {new Date(contract.end_date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                      </tr>
                    ))}
                    {contracts.length === 0 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="text-center text-gray-600 py-6"
                        >
                          Không có hợp đồng sắp hết hạn.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Đơn nghỉ phép theo thời gian và Thưởng và Phạt */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
        <Link href="/leave/manager-be-on-leave" passHref>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Đơn nghỉ phép theo thời gian
            </h3>
            <Line
              data={leaveRequestChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: "Đơn nghỉ phép",
                    font: { size: 20, weight: "bold" },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Số đơn",
                      font: { size: 16 },
                    },
                  },
                  x: {
                    title: { display: true, text: "Ngày", font: { size: 16 } },
                  },
                },
              }}
            />
          </div>
        </Link>
        <Link href="/salary/rewards-penalties" passHref>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Thưởng và Phạt
            </h3>
            <Bar
              data={rewardDisciplineChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      boxWidth: 14,
                      font: { size: 16 },
                      padding: 20,
                    },
                  },
                  title: {
                    display: true,
                    text: "Thống kê thưởng/phạt",
                    font: { size: 20, weight: "bold" },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Số lượng",
                      font: { size: 16 },
                    },
                  },
                  x: {
                    title: { display: true, text: "Tháng", font: { size: 16 } },
                  },
                },
              }}
            />
          </div>
        </Link>
      </div>

      {/* Phân quyền người dùng và Danh sách phòng ban */}
      <div className="grid grid-cols-7 lg:grid-cols-2 gap-8 mb-12 max-w-7xl mx-auto">
        <Link href="/decentralization" className="col-span-1" passHref>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Phân quyền người dùng
            </h3>
            <Pie
              data={roleChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      boxWidth: 14,
                      font: { size: 16 },
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </Link>
        <Link href="/departments" className="" passHref>
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-1 animate-fade-in">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">
              Danh Sách Phòng Ban
            </h3>
            <div className="mb-8">
              <Bar
                data={departmentChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: {
                      display: true,
                      text: "Phân bố nhân viên theo phòng ban",
                      font: { size: 20, weight: "bold" },
                      padding: { bottom: 20 },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Số nhân viên",
                        font: { size: 16 },
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Phòng ban",
                        font: { size: 16 },
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-base border-separate border-spacing-y-2">
                <thead>
                  <tr className="bg-gray-100 rounded-lg">
                    <th className="text-left font-semibold text-gray-800 py-4 px-6 rounded-l-lg">
                      Tên Phòng Ban
                    </th>
                    <th className="text-left font-semibold text-gray-800 py-4 px-6 rounded-r-lg">
                      Số Nhân Viên
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => (
                    <tr
                      key={dept.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <td className="text-gray-900 py-4 px-6 rounded-l-lg">
                        <Link href={`/departments/${dept.id}`} passHref>
                          <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium">
                            {dept.name}
                          </span>
                        </Link>
                      </td>
                      <td className="text-gray-900 py-4 px-6 rounded-r-lg">
                        {dept.employeeCount}
                      </td>
                    </tr>
                  ))}
                  {departments.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="text-center text-gray-600 py-6"
                      >
                        Không có phòng ban nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Link>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
