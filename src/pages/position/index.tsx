import Link from "next/link";
import { useState } from "react";
import { PlusCircle, Pencil, Trash2, ChevronDown } from "lucide-react";
import {
  PositionFormModal,
  DeleteConfirmModal,
  Position,
} from "../../components/modals/PositionModals";

// Dữ liệu mẫu để mô phỏng các chức vụ từ cơ sở dữ liệu
const initialPositions: Position[] = [
  {
    position_id: "1",
    name: "Giám đốc",
    description: "Quản lý cấp cao của công ty",
    created_at: "2025-01-15T09:00:00",
    updated_at: "2025-01-15T09:00:00",
  },
  {
    position_id: "2",
    name: "Trưởng phòng IT",
    description: "Quản lý phòng công nghệ thông tin",
    created_at: "2025-01-20T10:30:00",
    updated_at: "2025-03-10T14:20:00",
  },
  {
    position_id: "3",
    name: "Nhân viên Marketing",
    description: "Xây dựng và thực hiện chiến lược marketing",
    created_at: "2025-02-05T08:15:00",
    updated_at: "2025-02-05T08:15:00",
  },
  {
    position_id: "4",
    name: "Kế toán",
    description: "Quản lý tài chính và báo cáo",
    created_at: "2025-02-10T13:45:00",
    updated_at: "2025-04-12T11:30:00",
  },
  {
    position_id: "5",
    name: "Nhân viên kinh doanh",
    description: "Phát triển kinh doanh và quan hệ khách hàng",
    created_at: "2025-03-01T09:30:00",
    updated_at: "2025-03-01T09:30:00",
  },
];

const PositionsPage: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<
    Position | { name: string; description: string }
  >({ name: "", description: "" });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(
    null
  );

  // Lọc chức vụ dựa trên từ khóa tìm kiếm
  const filteredPositions = positions.filter(
    (position) =>
      position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      position.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPosition = (): void => {
    setIsEditing(false);
    setCurrentPosition({ name: "", description: "" });
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

  const handleDeletePosition = (): void => {
    if (!positionToDelete) return;
    setPositions(
      positions.filter((p) => p.position_id !== positionToDelete.position_id)
    );
    setIsDeleteModalOpen(false);
    setPositionToDelete(null);
  };

  const handleSavePosition = (): void => {
    if ("name" in currentPosition && currentPosition.name.trim() === "") return;

    if (isEditing && "position_id" in currentPosition) {
      setPositions(
        positions.map((p) =>
          p.position_id === currentPosition.position_id
            ? {
                ...(currentPosition as Position),
                updated_at: new Date().toISOString(),
              }
            : p
        )
      );
    } else {
      const newPosition: Position = {
        ...(currentPosition as { name: string; description: string }),
        position_id: (
          Math.max(...positions.map((p) => parseInt(p.position_id))) + 1
        ).toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setPositions([...positions, newPosition]);
    }
    setIsFormModalOpen(false);
  };

  const handleChangePosition = (field: string, value: string): void => {
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

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href={"/"}>Trang chủ</Link>
          </li>
          <li>
            <Link href={"/position"}>Chức vụ</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
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

        {/* Main content */}
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-6">
          {/* Thanh tìm kiếm và lọc */}
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

            <div className="flex items-center">
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="btn btn-outline flex justify-between w-40"
                >
                  <span>Sắp xếp</span>
                  <ChevronDown className="h-5 w-5" />
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a>Tên (A-Z)</a>
                  </li>
                  <li>
                    <a>Tên (Z-A)</a>
                  </li>
                  <li>
                    <a>Ngày tạo (Mới nhất)</a>
                  </li>
                  <li>
                    <a>Ngày tạo (Cũ nhất)</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="w-16">STT</th>
                  <th>Tên chức vụ</th>
                  <th>Mô tả</th>
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
                      <td>{position.description}</td>
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
                    <td colSpan={6} className="text-center py-4">
                      Không tìm thấy chức vụ nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
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

        {/* Import các Modal components */}
        <PositionFormModal
          isOpen={isFormModalOpen}
          isEditing={isEditing}
          currentPosition={currentPosition}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSavePosition}
          onChange={handleChangePosition}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          positionToDelete={positionToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeletePosition}
        />
      </div>
    </div>
  );
};

export default PositionsPage;
