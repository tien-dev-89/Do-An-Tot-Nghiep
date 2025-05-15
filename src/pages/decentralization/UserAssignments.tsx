import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Role,
  Employee,
  UserRole,
  AssignRoleModal,
  RemoveAssignmentModal,
} from "@/components/modals/DecentralizationModals";

interface UserAssignmentsProps {
  roles: Role[];
  employees: Employee[];
  userRoles: UserRole[];
  setUserRoles: React.Dispatch<React.SetStateAction<UserRole[]>>;
}

const UserAssignments: React.FC<UserAssignmentsProps> = ({
  roles,
  employees,
  userRoles,
  setUserRoles,
}) => {
  const [searchUserTerm, setSearchUserTerm] = useState<string>("");
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] =
    useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isRemoveAssignmentModalOpen, setIsRemoveAssignmentModalOpen] =
    useState<boolean>(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<UserRole | null>(
    null
  );

  // Lọc nhân viên và vai trò phân bổ dựa trên từ khóa tìm kiếm
  const userRolesWithNames = userRoles.map((ur) => {
    const employee = employees.find((e) => e.employee_id === ur.employee_id);
    const role = roles.find((r) => r.role_id === ur.role_id);
    return {
      ...ur,
      employee_name: employee?.full_name || "Không xác định",
      role_name: role?.name || "Không xác định",
    };
  });

  const filteredUserRoles = userRolesWithNames.filter(
    (ur) =>
      ur.employee_name.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      ur.role_name.toLowerCase().includes(searchUserTerm.toLowerCase())
  );

  // Hàm xử lý
  const handleAssignRole = (): void => {
    setSelectedEmployee(null);
    setSelectedRole("");
    setIsAssignRoleModalOpen(true);
    setTimeout(() => {
      const modal = document.getElementById("assign_role") as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  };

  const handleSaveAssignment = (): void => {
    if (!selectedEmployee || !selectedRole) return;
    const existingAssignment = userRoles.find(
      (ur) =>
        ur.employee_id === selectedEmployee.employee_id &&
        ur.role_id === selectedRole
    );
    if (existingAssignment) {
      alert("Nhân viên này đã được giao vai trò này!");
      return;
    }
    const newAssignment: UserRole = {
      user_role_id: (
        Math.max(...userRoles.map((ur) => parseInt(ur.user_role_id))) + 1
      ).toString(),
      employee_id: selectedEmployee.employee_id,
      role_id: selectedRole,
    };
    setUserRoles([...userRoles, newAssignment]);
    setIsAssignRoleModalOpen(false);
  };

  const handleRemoveAssignmentConfirmation = (assignment: UserRole): void => {
    setAssignmentToRemove(assignment);
    setIsRemoveAssignmentModalOpen(true);
    setTimeout(() => {
      const modal = document.getElementById(
        "confirm_cancel"
      ) as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  };

  const handleRemoveAssignment = (): void => {
    if (!assignmentToRemove) return;
    setUserRoles(
      userRoles.filter(
        (ur) => ur.user_role_id !== assignmentToRemove.user_role_id
      )
    );
    setIsRemoveAssignmentModalOpen(false);
    setAssignmentToRemove(null);
  };

  return (
    <div>
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
              placeholder="Tìm kiếm nhân viên hoặc vai trò..."
              value={searchUserTerm}
              onChange={(e) => setSearchUserTerm(e.target.value)}
            />
          </label>
        </div>
        <button
          onClick={handleAssignRole}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Gán vai trò
        </button>
      </div>
      {/* Bảng phân quyền */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="w-16">STT</th>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Vai trò</th>
              <th className="w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUserRoles.length > 0 ? (
              filteredUserRoles.map((assignment, index) => {
                const employee = employees.find(
                  (e) => e.employee_id === assignment.employee_id
                );
                return (
                  <tr key={assignment.user_role_id} className="hover">
                    <td>{index + 1}</td>
                    <td>
                      <div>
                        <div className="font-medium">
                          {assignment.employee_name}
                        </div>
                        <div className="text-sm opacity-70">
                          {employee?.email || ""}
                        </div>
                      </div>
                    </td>
                    <td>{employee?.department_name || ""}</td>
                    <td>{employee?.position_name || ""}</td>
                    <td>
                      <div className="badge badge-primary">
                        {assignment.role_name}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() =>
                          handleRemoveAssignmentConfirmation(assignment)
                        }
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không tìm thấy phân quyền nào
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
      {/* Modals */}
      <AssignRoleModal
        isOpen={isAssignRoleModalOpen}
        employees={employees}
        roles={roles}
        selectedEmployee={selectedEmployee}
        selectedRole={selectedRole}
        setSelectedEmployee={setSelectedEmployee}
        setSelectedRole={setSelectedRole}
        onClose={() => setIsAssignRoleModalOpen(false)}
        onSave={handleSaveAssignment}
      />
      <RemoveAssignmentModal
        isOpen={isRemoveAssignmentModalOpen}
        assignmentToRemove={assignmentToRemove}
        onClose={() => setIsRemoveAssignmentModalOpen(false)}
        onRemove={handleRemoveAssignment}
      />
    </div>
  );
};

export default UserAssignments;
