import Link from "next/link";
import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  PositionFormModal,
  DeleteConfirmModal,
  Position,
} from "../../components/modals/PositionModals";

const PositionsPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<
    Position | { name: string; description: string; department_ids?: string[] }
  >({ name: "", description: "", department_ids: [] });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lấy danh sách chức vụ
  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/positions", {
        headers: {
          Authorization: `x ${token}`,
        },
      });
      const data = await res.json();
      console.log("API GET response:", { status: res.status, data });
      if (res.ok) {
        setPositions(data);
      } else {
        toast.error(data.error || "Lỗi khi tải danh sách chức vụ");
      }
    } catch (error) {
      console.error("Fetch positions error:", error);
      toast.error(`Lỗi: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc chức vụ
  const filteredPositions = positions.filter(
    (position) =>
      position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPosition = (): void => {
    setIsEditing(false);
    setCurrentPosition({ name: "", description: "", department_ids: [] });
    setIsFormModalOpen(true);
  };

  const handleEditPosition = (position: Position): void => {
    setIsEditing(true);
    setCurrentPosition(position);
    setIsFormModalOpen(true);
  };

  const handleDeleteConfirmation = (position: Position): void => {
    setPositionToDelete(position);
    setIsDeleteModalOpen(true);
  };

  const handleChangePosition = (
    field: string,
    value: string | string[]
  ): void => {
    setCurrentPosition({
      ...currentPosition,
      [field]: value,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/">Trang chủ</Link>
          </li>
          <li>
            <Link href="/positions">Chức vụ</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        <header className="bg-base-100 shadow-md rounded-sm">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Quản lý Chức vụ
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={handleAddPosition}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Thêm chức vụ
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:w-96">
              <label className="input">
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
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
                <input
                  type="text"
                  required
                  placeholder="Tìm kiếm chức vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="w-16">STT</th>
                  <th>Tên chức vụ</th>
                  <th>Mô tả</th>
                  <th>Số nhân viên</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật lần cuối</th>
                  <th className="w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.length > 0 ? (
                  filteredPositions.map((position, index) => (
                    <tr key={position.position_id} className="hover">
                      <td>{index + 1}</td>
                      <td className="font-medium">{position.name}</td>
                      <td>{position.description || "-"}</td>
                      <td>{position.employee_count || 0}</td>
                      <td>{formatDate(position.created_at)}</td>
                      <td>{formatDate(position.updated_at)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-ghost btn-square text-primary"
                            onClick={() => handleEditPosition(position)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost btn-square text-error"
                            onClick={() => handleDeleteConfirmation(position)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Không tìm thấy chức vụ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="join">
              <button className="join-item btn btn-sm">«</button>
              <button className="join-item btn btn-sm btn-active">1</button>
              <button className="join-item btn btn-sm">2</button>
              <button className="join-item btn btn-sm">3</button>
              <button className="join-item btn btn-sm">»</button>
            </div>
          </div>
        </main>

        <PositionFormModal
          isOpen={isFormModalOpen}
          isEditing={isEditing}
          currentPosition={currentPosition}
          onClose={() => {
            setIsFormModalOpen(false);
            fetchPositions();
          }}
          onChange={handleChangePosition}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          positionToDelete={positionToDelete}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPositionToDelete(null);
            fetchPositions();
          }}
        />
      </div>
    </div>
  );
};

export default PositionsPage;
