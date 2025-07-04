import React, { useState, useEffect, useRef } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Shield,
  Key,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { AddEditRoleModal } from "@/components/modals/decentralization-modal/AddEditRoleModal";
import { DeleteRoleModal } from "@/components/modals/decentralization-modal/DeleteRoleModalProps";
import { Role, UserRole, RolePermission } from "@/types/decentralization";
import { useRouter } from "next/router";

interface AddEditPermissionModalProps {
  isOpen: boolean;
  roleName: string;
  resource: string;
  action: string;
  setResource: (value: string) => void;
  setAction: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isEditing: boolean;
}

const AddEditPermissionModal: React.FC<AddEditPermissionModalProps> = ({
  isOpen,
  roleName,
  resource,
  action,
  setResource,
  setAction,
  onClose,
  onSave,
  isEditing,
}) => {
  if (!isOpen) return null;

  return (
    <dialog id="add_edit_permission" className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-primary">
            {isEditing
              ? `Sửa quyền hạn cho ${roleName}`
              : `Thêm quyền hạn cho ${roleName}`}
          </h3>
          <button className="btn btn-sm btn-ghost btn-square" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid gap-2 form-control">
          <label className="label">
            <span className="label-text">Tài nguyên</span>
          </label>
          <input
            type="text"
            className="input input-bordered"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
          />
          <label className="label">
            <span className="label-text">Hành động</span>
          </label>
          <select
            className="select select-bordered"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="" disabled>
              Chọn hành động
            </option>
            <option value="read">Xem</option>
            <option value="write">Sửa</option>
            <option value="delete">Xóa</option>
            <option value="manage_roles">Quản lý vai trò</option>
            <option value="assign_roles">Gán vai trò</option>
          </select>
        </div>
        <div className="modal-action mt-6">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={onSave}>
            {isEditing ? "Cập nhật" : "Thêm mới"}
          </button>
        </div>
      </div>
    </dialog>
  );
};

interface DeletePermissionModalProps {
  isOpen: boolean;
  roleName: string;
  resource: string;
  action: string;
  onClose: () => void;
  onDelete: () => void;
}

const DeletePermissionModal: React.FC<DeletePermissionModalProps> = ({
  isOpen,
  roleName,
  resource,
  action,
  onClose,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <dialog id="delete_permission" className="modal">
      <div className="modal-box">
        <h3 className="text-lg font-bold text-error">Xác nhận xóa quyền hạn</h3>
        <p className="py-4">
          Bạn có chắc chắn muốn xóa quyền <strong>{action}</strong> trên tài
          nguyên <strong>{resource}</strong> khỏi vai trò{" "}
          <strong>{roleName}</strong>?
        </p>
        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button className="btn btn-error" onClick={onDelete}>
            Xóa
          </button>
        </div>
      </div>
    </dialog>
  );
};

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
  const [selectedRoleForDetails, setSelectedRoleForDetails] = useState<
    string | null
  >(null);
  const [rolePermissions, setRolePermissions] = useState<
    Record<string, RolePermission[]>
  >({});
  const [isPermissionModalOpen, setIsPermissionModalOpen] =
    useState<boolean>(false);
  const [currentResource, setCurrentResource] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<string>("");
  const [currentPermissionId, setCurrentPermissionId] = useState<string>("");
  const [isEditingPermission, setIsEditingPermission] =
    useState<boolean>(false);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");
  const [isDeletePermissionModalOpen, setIsDeletePermissionModalOpen] =
    useState<boolean>(false);
  const [permissionToDelete, setPermissionToDelete] = useState<{
    roleName: string;
    resource: string;
    action: string;
    permission_id: string;
  } | null>(null);
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
  const addEditPermissionModalRef = useRef<HTMLDialogElement>(null);
  const deletePermissionModalRef = useRef<HTMLDialogElement>(null);

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
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
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

        const permissionsPromises = rolesData.data.roles.map(
          async (role: Role) => {
            const permResponse = await fetchWithRetry(
              `/api/role-permissions?role_id=${role.role_id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const permData = await permResponse.json();
            return { roleName: role.name, permissions: permData.data || [] };
          }
        );
        const permissionsResults = await Promise.all(permissionsPromises);
        const updatedPermissions = permissionsResults.reduce(
          (acc, { roleName, permissions }) => {
            acc[roleName] = permissions;
            return acc;
          },
          {} as Record<string, RolePermission[]>
        );
        setRolePermissions(updatedPermissions);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Lỗi khi lấy dữ liệu";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRolesAndPermissions();
  }, [page, limit, token, router]);

  const handleEditRole = (role: Role): void => {
    setIsEditingRole(true);
    setCurrentRole(role);
    setIsRoleModalOpen(true);
    if (addEditRoleModalRef.current) {
      addEditRoleModalRef.current.showModal();
    }
  };

  const handleDeleteRoleConfirmation = (role: Role): void => {
    setRoleToDelete(role);
    setIsDeleteRoleModalOpen(true);
    if (deleteRoleModalRef.current) {
      deleteRoleModalRef.current.showModal();
    }
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchRoleTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchRoleTerm.toLowerCase())
  );

  const handleAddPermission = (roleName: string): void => {
    setSelectedRoleName(roleName);
    setCurrentResource("");
    setCurrentAction("");
    setCurrentPermissionId("");
    setIsEditingPermission(false);
    setIsPermissionModalOpen(true);
    if (addEditPermissionModalRef.current) {
      addEditPermissionModalRef.current.showModal();
    }
  };

  const handleEditPermission = (
    roleName: string,
    resource: string,
    action: string,
    permission_id: string
  ): void => {
    setSelectedRoleName(roleName);
    setCurrentResource(resource);
    setCurrentAction(action);
    setCurrentPermissionId(permission_id);
    setIsEditingPermission(true);
    setIsPermissionModalOpen(true);
    if (addEditPermissionModalRef.current) {
      addEditPermissionModalRef.current.showModal();
    }
  };

  const handleDeletePermissionConfirm = (
    roleName: string,
    resource: string,
    action: string,
    permission_id: string
  ): void => {
    setPermissionToDelete({ roleName, resource, action, permission_id });
    setIsDeletePermissionModalOpen(true);
    if (deletePermissionModalRef.current) {
      deletePermissionModalRef.current.showModal();
    }
  };

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
      setRolePermissions((prev) => {
        const updated = { ...prev };
        delete updated[roleToDelete.name];
        return updated;
      });
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
        // Vô hiệu hóa thêm vai trò
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

  const handleDeletePermission = async (): Promise<void> => {
    if (!permissionToDelete) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/role-permissions/${permissionToDelete.permission_id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể xóa quyền hạn");
      }
      setRolePermissions((prev) => {
        const currentPermissions = prev[permissionToDelete.roleName] || [];
        return {
          ...prev,
          [permissionToDelete.roleName]: currentPermissions.filter(
            (p) => p.permission_id !== permissionToDelete.permission_id
          ),
        };
      });
      setIsDeletePermissionModalOpen(false);
      setPermissionToDelete(null);
      toast.success("Xóa quyền hạn thành công");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi xóa quyền hạn";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePermission = async (): Promise<void> => {
    if (!currentResource.trim() || !currentAction.trim()) {
      setError("Tài nguyên và hành động là bắt buộc");
      toast.error("Tài nguyên và hành động là bắt buộc");
      return;
    }
    setIsLoading(true);
    try {
      const role = roles.find((r) => r.name === selectedRoleName);
      if (!role) throw new Error("Vai trò không tồn tại");
      if (isEditingPermission) {
        const response = await fetch(
          `/api/role-permissions/${currentPermissionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              resource: currentResource,
              action: currentAction,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Không thể cập nhật quyền hạn");
        }
        const updatedPermission: RolePermission = await response.json();
        setRolePermissions((prev) => ({
          ...prev,
          [selectedRoleName]: prev[selectedRoleName].map((p) =>
            p.permission_id === updatedPermission.permission_id
              ? updatedPermission
              : p
          ),
        }));
        toast.success("Cập nhật quyền hạn thành công");
      } else {
        const response = await fetch("/api/role-permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_id: role.role_id,
            resource: currentResource,
            action: currentAction,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Không thể thêm quyền hạn");
        }
        const newPermission: RolePermission = await response.json();
        setRolePermissions((prev) => ({
          ...prev,
          [selectedRoleName]: [
            ...(prev[selectedRoleName] || []),
            newPermission,
          ],
        }));
        toast.success("Thêm quyền hạn thành công");
      }
      setIsPermissionModalOpen(false);
      setCurrentResource("");
      setCurrentAction("");
      setCurrentPermissionId("");
      setSelectedRoleName("");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Lỗi khi lưu quyền hạn";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRoleDetails = (roleId: string): void => {
    setSelectedRoleForDetails(
      selectedRoleForDetails === roleId ? null : roleId
    );
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
                stroke="currentColor"
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
                <div className="divider my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {
                      userRoles.filter((ur) => ur.role_id === role.role_id)
                        .length
                    }{" "}
                    người dùng
                  </span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleViewRoleDetails(role.role_id)}
                    disabled={isLoading}
                  >
                    {selectedRoleForDetails === role.role_id
                      ? "Ẩn chi tiết"
                      : "Xem chi tiết"}
                  </button>
                </div>
                {selectedRoleForDetails === role.role_id && (
                  <div className="mt-4 bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium flex items-center">
                        <Key className="w-4 h-4 mr-2" /> Quyền hạn:
                      </h3>
                      <button
                        className="btn btn-primary btn-sm flex items-center gap-2"
                        onClick={() => handleAddPermission(role.name)}
                        disabled={isLoading}
                      >
                        <PlusCircle className="w-4 h-4" /> Thêm quyền
                      </button>
                    </div>
                    {isLoading ? (
                      <div className="text-center py-4">Đang tải...</div>
                    ) : rolePermissions[role.name]?.length ? (
                      <ul className="list-disc list-inside">
                        {rolePermissions[role.name].map((perm) => (
                          <li
                            key={perm.permission_id}
                            className="text-sm py-1 flex justify-between items-center"
                          >
                            <span>
                              {perm.resource}: {perm.action}
                            </span>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-square btn-ghost text-primary"
                                onClick={() =>
                                  handleEditPermission(
                                    role.name,
                                    perm.resource,
                                    perm.action,
                                    perm.permission_id
                                  )
                                }
                                disabled={isLoading}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                className="btn btn-sm btn-ghost btn-square text-error"
                                onClick={() =>
                                  handleDeletePermissionConfirm(
                                    role.name,
                                    perm.resource,
                                    perm.action,
                                    perm.permission_id
                                  )
                                }
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Chưa có quyền hạn nào
                      </p>
                    )}
                  </div>
                )}
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
      />
      <DeleteRoleModal
        isOpen={isDeleteRoleModalOpen}
        roleToDelete={roleToDelete}
        onClose={() => setIsDeleteRoleModalOpen(false)}
        onDelete={handleDeleteRole}
      />
      <AddEditPermissionModal
        isOpen={isPermissionModalOpen}
        roleName={selectedRoleName}
        resource={currentResource}
        action={currentAction}
        setResource={setCurrentResource}
        setAction={setCurrentAction}
        onClose={() => setIsPermissionModalOpen(false)}
        onSave={handleSavePermission}
        isEditing={isEditingPermission}
      />
      <DeletePermissionModal
        isOpen={isDeletePermissionModalOpen}
        roleName={permissionToDelete?.roleName || ""}
        resource={permissionToDelete?.resource || ""}
        action={permissionToDelete?.action || ""}
        onClose={() => setIsDeletePermissionModalOpen(false)}
        onDelete={handleDeletePermission}
      />
    </div>
  );
};

export default RolesManagement;
