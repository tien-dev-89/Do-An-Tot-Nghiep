import Link from "next/link";
import { useState } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronDown,
} from "lucide-react";

// Định nghĩa kiểu dữ liệu cho Position
interface Position {
  position_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
    setIsModalOpen(true);
  };

  const handleEditPosition = (position: Position): void => {
    setIsEditing(true);
    setCurrentPosition(position);
    setIsModalOpen(true);
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
    setIsModalOpen(false);
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
            <Link href={"/duty"}>Chức vụ</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-200">
        {/* Header */}
        <header className="bg-base-100 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">
              Quản lý Chức vụ
            </h1>
            <div className="flex space-x-2">
              <button
                // onClick={handleAddPosition}
                onClick={() => {
                  handleAddPosition(); // Gọi setState ở đây
                  setTimeout(() => {
                    const modal = document.getElementById(
                      "add_position_modal"
                    ) as HTMLDialogElement;
                    if (modal) {
                      modal.showModal();
                    }
                  }, 0); // Trì hoãn để React cập nhật state xong
                }}
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm chức vụ..."
                className="pl-10 input input-bordered w-full focus:input-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                            // onClick={() => handleEditPosition(position)}
                            onClick={() => {
                              handleEditPosition(position); // Gọi setState ở đây
                              setTimeout(() => {
                                const modal = document.getElementById(
                                  "add_position_modal"
                                ) as HTMLDialogElement;
                                if (modal) {
                                  modal.showModal();
                                }
                              }, 0); // Trì hoãn để React cập nhật state xong
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="btn btn-sm btn-ghost btn-square text-error"
                            // onClick={() => handleDeleteConfirmation(position)}
                            onClick={() => {
                              // handleDeleteConfirmation(position);
                              // const modal = document.getElementById(
                              //   "my_modal_1"
                              // ) as HTMLDialogElement;
                              // if (modal) {
                              //   modal.showModal();
                              // }
                              handleDeleteConfirmation(position); // Gọi setState ở đây
                              setTimeout(() => {
                                const modal = document.getElementById(
                                  "my_modal_1"
                                ) as HTMLDialogElement;
                                if (modal) {
                                  modal.showModal();
                                }
                              }, 0); // Trì hoãn để React cập nhật state xong
                            }}
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

        {/* Modal thêm/chỉnh sửa chức vụ */}
        {isModalOpen && (
          <dialog id="add_position_modal" className="modal">
            <div className="modal-box pl-10">
              <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-primary">
                    {isEditing ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
                  </h3>
                  <button
                    className="btn btn-sm btn-ghost btn-square"
                    onClick={() => setIsModalOpen(false)}
                  ></button>
                  <X className="w-5 h-5" />
                </div>

                <div className="form-control grid">
                  <label className="label">
                    <span className="label-text">Tên chức vụ</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={
                      "name" in currentPosition ? currentPosition.name : ""
                    }
                    onChange={(e) =>
                      setCurrentPosition({
                        ...currentPosition,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-control grid pt-4">
                  <label className="label">
                    <span className="label-text">Mô tả</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    value={
                      "description" in currentPosition
                        ? currentPosition.description
                        : ""
                    }
                    onChange={(e) =>
                      setCurrentPosition({
                        ...currentPosition,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <div className="modal-action mt-6">
                  <button
                    className="btn btn-outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSavePosition}
                  >
                    {isEditing ? "Cập nhật" : "Thêm mới"}
                  </button>
                </div>
              </div>
            </div>
          </dialog>
          // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          //   <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
          //     <div className="flex justify-between items-center mb-4">
          //       <h3 className="text-lg font-bold text-primary">
          //         {isEditing ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
          //       </h3>
          //       <button
          //         className="btn btn-sm btn-ghost btn-square"
          //         onClick={() => setIsModalOpen(false)}
          //       >
          //         <X className="w-5 h-5" />
          //       </button>
          //     </div>

          //     <div className="form-control">
          //       <label className="label">
          //         <span className="label-text">Tên chức vụ</span>
          //       </label>
          //       <input
          //         type="text"
          //         className="input input-bordered"
          //         value={"name" in currentPosition ? currentPosition.name : ""}
          //         onChange={(e) =>
          //           setCurrentPosition({
          //             ...currentPosition,
          //             name: e.target.value,
          //           })
          //         }
          //       />
          //     </div>

          //     <div className="form-control mt-4">
          //       <label className="label">
          //         <span className="label-text">Mô tả</span>
          //       </label>
          //       <textarea
          //         className="textarea textarea-bordered h-24"
          //         value={
          //           "description" in currentPosition
          //             ? currentPosition.description
          //             : ""
          //         }
          //         onChange={(e) =>
          //           setCurrentPosition({
          //             ...currentPosition,
          //             description: e.target.value,
          //           })
          //         }
          //       ></textarea>
          //     </div>

          //     <div className="modal-action mt-6">
          //       <button
          //         className="btn btn-outline"
          //         onClick={() => setIsModalOpen(false)}
          //       >
          //         Hủy
          //       </button>
          //       <button
          //         className="btn btn-primary"
          //         onClick={handleSavePosition}
          //       >
          //         {isEditing ? "Cập nhật" : "Thêm mới"}
          //       </button>
          //     </div>
          //   </div>
          // </div>
        )}

        {/* Modal xác nhận xóa */}
        {isDeleteModalOpen && positionToDelete && (
          <dialog id="my_modal_1" className="modal">
            <div className="modal-box">
              <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
              <p className="py-4">
                Bạn có chắc chắn muốn xóa chức vụ &quot;
                <span className="font-semibold">{positionToDelete.name}</span>
                &quot;? Hành động này không thể hoàn tác.
              </p>

              <div className="modal-action">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-error"
                  onClick={handleDeletePosition}
                >
                  Xóa
                </button>
              </div>
            </div>
          </dialog>
          // <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
          //   <div className="bg-base-100 rounded-lg p-6 w-full max-w-sm">
          //     <h3 className="text-lg font-bold mb-2">Xác nhận xóa</h3>
          //     <p className="py-4">
          //       Bạn có chắc chắn muốn xóa chức vụ &quot;
          //       <span className="font-semibold">{positionToDelete.name}</span>
          //       &quot;? Hành động này không thể hoàn tác.
          //     </p>

          //     <div className="modal-action">
          //       <button
          //         className="btn btn-outline"
          //         onClick={() => setIsDeleteModalOpen(false)}
          //       >
          //         Hủy
          //       </button>
          //       <button
          //         className="btn btn-error"
          //         onClick={handleDeletePosition}
          //       >
          //         Xóa
          //       </button>
          //     </div>
          //   </div>
          // </div>
        )}
      </div>
    </div>
  );
};

export default PositionsPage;
