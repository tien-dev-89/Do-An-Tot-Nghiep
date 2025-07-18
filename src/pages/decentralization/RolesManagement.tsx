import React, { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, Shield, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { AddEditRoleModal } from "@/components/modals/decentralization-modal/AddEditRoleModal";
import { DeleteRoleModal } from "@/components/modals/decentralization-modal/DeleteRoleModalProps";
import { Role, UserRole } from "@/types/decentralization";
import { useRouter } from "next/router";

interface RolesManagementProps {
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  userRoles: UserRole[];
  setUserRoles: React.Dispatch<React.SetStateAction<UserRole[]>>;
}

const RolesManagement: React.FC<RolesManagementProps> = ({
  roles,
  setRoles,
  userRoles,
  setUserRoles,
}) => {
  const [searchRoleTerm, setSearchRoleTerm] = useState<string>("");
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<Partial<Role>>({
    name: "",
    description: "",
  });
  const [isEditingRole, setIsEditingRole] = useState<boolean>(false);
  const [isDeleteRoleModalOpen, setIsDeleteRoleModalOpen] =
    useState<boolean>(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [, setTotal] = useState<number>(0);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const router = useRouter();
  const addEditRoleModalRef = useRef<HTMLDialogElement>(null);
  const deleteRoleModalRef = useRef<HTMLDialogElement>(null);

  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries = 2
  ): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      return response;
    } catch (error: unknown) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      if (!token) {
        setError("Vui lòng đăng nhập lại");
        toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
        router.push("/auths/login");
        return;
      }

      setIsLoading(true);
      try {
        const rolesResponse = await fetchWithRetry(
          `/api/roles?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.data.roles);
        setTotal(rolesData.data.total);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Lỗi khi lấy dữ liệu";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [page, limit, token, router, setRoles]);

  const handleEditRole = (role: Role): void => {
    setIsEditingRole(true);
    setCurrentRole(role);
    setIsRoleModalOpen(true);
    addEditRoleModalRef.current?.showModal();
  };

  const handleDeleteRoleConfirmation = (role: Role): void => {
    setRoleToDelete(role);
    setIsDeleteRoleModalOpen(true);
    deleteRoleModalRef.current?.showModal();
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchRoleTerm.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchRoleTerm.toLowerCase()))
  );

  const handleDeleteRole = async (): Promise<void> => {
    if (!roleToDelete) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/roles/${roleToDelete.role_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể xóa vai trò");
      }
      setRoles(roles.filter((r) => r.role_id !== roleToDelete.role_id));
      setUserRoles(
        userRoles.filter((ur) => ur.role_id !== roleToDelete.role_id)
      );
      setIsDeleteRoleModalOpen(false);
      setRoleToDelete(null);
      toast.success("Xóa vai trò thành công");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi xóa vai trò";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRole = async (): Promise<void> => {
    if (!currentRole.name?.trim()) {
      setError("Tên vai trò là bắt buộc");
      toast.error("Tên vai trò là bắt buộc");
      return;
    }
    setIsLoading(true);
    try {
      if (isEditingRole && "role_id" in currentRole) {
        const response = await fetch(`/api/roles/${currentRole.role_id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: currentRole.name,
            description: currentRole.description,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Không thể cập nhật vai trò");
        }
        const updatedRole: Role = await response.json();
        setRoles(
          roles.map((r) =>
            r.role_id === updatedRole.role_id ? updatedRole : r
          )
        );
        toast.success("Cập nhật vai trò thành công");
      } else {
        setError("Thêm vai trò mới đã bị vô hiệu hóa");
        toast.error("Thêm vai trò mới đã bị vô hiệu hóa");
        return;
      }
      setIsRoleModalOpen(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi lưu vai trò";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-error mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-50">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}
      <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-96">
          <label className="input input-bordered flex items-center gap-2">
            <svg
              className="h-4 w-4 opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="current5Color"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21l-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm vai trò..."
              value={searchRoleTerm}
              onChange={(e) => setSearchRoleTerm(e.target.value)}
              disabled={isLoading}
            />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoles.length > 0 ? (
          filteredRoles.map((role) => (
            <div key={role.role_id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="card-title flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-primary" />
                      {role.name}
                    </h2>
                    <p className="text-sm mt-2">
                      {role.description || "Chưa có mô tả"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tạo:{" "}
                      {new Date(role.created_at).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Cập nhật:{" "}
                      {new Date(role.updated_at).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {
                        userRoles.filter((ur) => ur.role_id === role.role_id)
                          .length
                      }{" "}
                      người dùng
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost btn-square text-primary"
                      onClick={() => handleEditRole(role)}
                      disabled={isLoading}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost btn-square text-error"
                      onClick={() => handleDeleteRoleConfirmation(role)}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-8 text-center">
            <p>Không tìm thấy vai trò nào</p>
          </div>
        )}
      </div>
      <AddEditRoleModal
        isOpen={isRoleModalOpen}
        isEditing={isEditingRole}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onClose={() => setIsRoleModalOpen(false)}
        onSave={handleSaveRole}
        ref={addEditRoleModalRef}
      />
      <DeleteRoleModal
        isOpen={isDeleteRoleModalOpen}
        roleToDelete={roleToDelete}
        onClose={() => setIsDeleteRoleModalOpen(false)}
        onDelete={handleDeleteRole}
        ref={deleteRoleModalRef}
      />
    </div>
  );
};

export default RolesManagement;
