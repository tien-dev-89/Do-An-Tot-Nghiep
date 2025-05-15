import React from "react";
// import { Plus } from "lucide-react";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  roles: string[];
  isActive: boolean;
  lastLogin: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

interface UserModalsProps {
  selectedUser: User | null;
  roles: Role[];
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isAddRoleModalOpen: boolean;
  setIsAddRoleModalOpen: (open: boolean) => void;
  isViewRoleUsersModalOpen: boolean; // Thêm state cho modal xem người dùng trong vai trò
  setIsViewRoleUsersModalOpen: (open: boolean) => void; // Hàm set state cho modal xem người dùng trong vai trò
  isEditRoleModalOpen: boolean; // Thêm state cho modal chỉnh sửa vai trò
  setIsEditRoleModalOpen: (open: boolean) => void; // Hàm set state cho modal chỉnh sửa vai trò
  selectedRole: Role | null; // Thêm state cho vai trò được chọn
  usersInRole: User[]; // Danh sách người dùng trong vai trò được chọn
  handleEditUser: (user: User) => void;
}

const UserModals: React.FC<UserModalsProps> = ({
  selectedUser,
  roles,
  isDetailModalOpen,
  setIsDetailModalOpen,
  isEditModalOpen,
  setIsEditModalOpen,
  isAddRoleModalOpen,
  setIsAddRoleModalOpen,
  isViewRoleUsersModalOpen,
  setIsViewRoleUsersModalOpen,
  isEditRoleModalOpen,
  setIsEditRoleModalOpen,
  selectedRole,
  usersInRole,
  handleEditUser,
}) => {
  return (
    <>
      {/* User Detail Modal */}
      {selectedUser && (
        <dialog className={`modal ${isDetailModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg">Chi tiết người dùng</h3>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Thông tin cá nhân</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Họ tên:</div>
                    <div className="col-span-2">{selectedUser.fullName}</div>

                    <div className="font-medium">Email:</div>
                    <div className="col-span-2">{selectedUser.email}</div>

                    <div className="font-medium">Phòng ban:</div>
                    <div className="col-span-2">{selectedUser.department}</div>

                    <div className="font-medium">Chức vụ:</div>
                    <div className="col-span-2">{selectedUser.position}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Thông tin tài khoản</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="font-medium">Tên đăng nhập:</div>
                    <div className="col-span-2">{selectedUser.username}</div>

                    <div className="font-medium">Trạng thái:</div>
                    <div className="col-span-2">
                      <span
                        className={`badge ${
                          selectedUser.isActive
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {selectedUser.isActive
                          ? "Đang hoạt động"
                          : "Không hoạt động"}
                      </span>
                    </div>

                    <div className="font-medium">Đăng nhập gần nhất:</div>
                    <div className="col-span-2">{selectedUser.lastLogin}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Phân quyền</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.roles.map((role, index) => (
                    <div key={index} className="badge badge-lg gap-2">
                      {role}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => handleEditUser(selectedUser)}
              >
                Chỉnh sửa
              </button>
              <button
                className="btn"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <button>đóng</button>
          </form>
        </dialog>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <dialog className={`modal ${isEditModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg">Chỉnh sửa người dùng</h3>
            <div className="py-4">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Họ tên</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    defaultValue={selectedUser.fullName}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    className="input input-bordered"
                    defaultValue={selectedUser.email}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tên đăng nhập</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    defaultValue={selectedUser.username}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mật khẩu</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    placeholder="Nhập để thay đổi mật khẩu"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Phòng ban</span>
                  </label>
                  <select
                    className="select select-bordered"
                    defaultValue={selectedUser.department}
                  >
                    <option>Nhân sự</option>
                    <option>Kế toán</option>
                    <option>IT</option>
                    <option>Kinh doanh</option>
                    <option>Marketing</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Chức vụ</span>
                  </label>
                  <select
                    className="select select-bordered"
                    defaultValue={selectedUser.position}
                  >
                    <option>Nhân viên</option>
                    <option>Trưởng nhóm</option>
                    <option>Trưởng phòng</option>
                    <option>Giám đốc</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Trạng thái</span>
                  </label>
                  <label className="cursor-pointer label justify-start gap-2">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      defaultChecked={selectedUser.isActive}
                    />
                    <span className="label-text">Tài khoản hoạt động</span>
                  </label>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="label">
                    <span className="label-text">Phân quyền</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="label cursor-pointer inline-flex items-center gap-2 border rounded-lg px-3 py-1"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          defaultChecked={selectedUser.roles.includes(
                            role.name
                          )}
                        />
                        <span className="label-text">{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-action">
              <button className="btn btn-primary">Lưu thay đổi</button>
              <button className="btn" onClick={() => setIsEditModalOpen(false)}>
                Hủy
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setIsEditModalOpen(false)}
          >
            <button>đóng</button>
          </form>
        </dialog>
      )}

      {/* Add Role Modal */}
      <dialog className={`modal ${isAddRoleModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Thêm vai trò mới</h3>
          <div className="py-4">
            <div className="grid gap-2 form-control">
              <label className="label">
                <span className="label-text">Tên vai trò</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên vai trò"
                className="input input-bordered"
              />
            </div>
            <div className="grid gap-2 form-control mt-2">
              <label className="label">
                <span className="label-text">Mô tả</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Mô tả chi tiết về vai trò và quyền hạn"
                rows={3}
              ></textarea>
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">
                  Phân quyền chức năng
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Quản lý nhân viên</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Quản lý phòng ban</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Quản lý lương</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Quản lý chấm công</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Phê duyệt đơn nghỉ phép</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Quản lý người dùng</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Phân quyền</span>
                </label>
                <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                  <input type="checkbox" className="checkbox checkbox-sm" />
                  <span className="label-text">Xuất báo cáo</span>
                </label>
              </div>
            </div>
          </div>
          <div className="modal-action">
            <button className="btn btn-primary">Tạo vai trò</button>
            <button
              className="btn"
              onClick={() => setIsAddRoleModalOpen(false)}
            >
              Hủy
            </button>
          </div>
        </div>
        <form
          method="dialog"
          className="modal-backdrop"
          onClick={() => setIsAddRoleModalOpen(false)}
        >
          <button>đóng</button>
        </form>
      </dialog>

      {/* Xem người dùng trong vai trò Modal */}
      {selectedRole && (
        <dialog
          className={`modal ${isViewRoleUsersModalOpen ? "modal-open" : ""}`}
        >
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg">
              Người dùng với vai trò: {selectedRole.name}
            </h3>
            <div className="py-4">
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Tên đăng nhập</th>
                      <th>Phòng ban</th>
                      <th>Chức vụ</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersInRole.map((user) => (
                      <tr key={user.id}>
                        <td>{user.fullName}</td>
                        <td>{user.username}</td>
                        <td>{user.department}</td>
                        <td>{user.position}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.isActive ? "badge-success" : "badge-error"
                            }`}
                          >
                            {user.isActive ? "Hoạt động" : "Khóa"}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => {
                                setIsViewRoleUsersModalOpen(false);
                                handleEditUser(user);
                              }}
                            >
                              <span>Chỉnh sửa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {usersInRole.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  Không có người dùng nào với vai trò này
                </div>
              )}
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setIsViewRoleUsersModalOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setIsViewRoleUsersModalOpen(false)}
          >
            <button>đóng</button>
          </form>
        </dialog>
      )}

      {/* Chỉnh sửa vai trò Modal */}
      {selectedRole && (
        <dialog className={`modal ${isEditRoleModalOpen ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Chỉnh sửa vai trò</h3>
            <div className="py-4">
              <div className="grid gap-2 form-control">
                <label className="label">
                  <span className="label-text">Tên vai trò</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  defaultValue={selectedRole.name}
                />
              </div>
              <div className="grid gap-2 form-control mt-2">
                <label className="label">
                  <span className="label-text">Mô tả</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  defaultValue={selectedRole.description}
                  rows={3}
                ></textarea>
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Phân quyền chức năng
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      defaultChecked
                    />
                    <span className="label-text">Quản lý nhân viên</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      defaultChecked
                    />
                    <span className="label-text">Quản lý phòng ban</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                    <span className="label-text">Quản lý lương</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                    <span className="label-text">Quản lý chấm công</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                    <span className="label-text">Phê duyệt đơn nghỉ phép</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      defaultChecked
                    />
                    <span className="label-text">Quản lý người dùng</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      defaultChecked
                    />
                    <span className="label-text">Phân quyền</span>
                  </label>
                  <label className="label cursor-pointer justify-start gap-2 border rounded-md p-2">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                    <span className="label-text">Xuất báo cáo</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-primary">Lưu thay đổi</button>
              <button
                className="btn"
                onClick={() => setIsEditRoleModalOpen(false)}
              >
                Hủy
              </button>
            </div>
          </div>
          <form
            method="dialog"
            className="modal-backdrop"
            onClick={() => setIsEditRoleModalOpen(false)}
          >
            <button>đóng</button>
          </form>
        </dialog>
      )}
    </>
  );
};

export default UserModals;
