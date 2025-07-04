import React, { useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import { Users, Shield } from "lucide-react";
import RolesManagement from "./RolesManagement";
import UserAssignments from "./UserAssignments";
import { Role, Employee, UserRole } from "@/types/decentralization";

interface Props {
  initialRoles: Role[];
  initialEmployees: Employee[];
  initialUserRoles: UserRole[];
}

const prisma = new PrismaClient();

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [roles, employees, userRoles] = await Promise.all([
      prisma.roles.findMany({
        select: {
          role_id: true,
          name: true,
          description: true,
          created_at: true,
          updated_at: true,
        },
      }),
      prisma.employees.findMany({
        include: {
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      }),
      prisma.userRoles.findMany({
        include: {
          employee: { select: { full_name: true } },
          role: { select: { name: true } },
        },
      }),
    ]);

    const serializedRoles = roles.map((role) => ({
      role_id: role.role_id,
      name: role.name,
      description: role.description,
      created_at: role.created_at.toISOString(),
      updated_at: role.updated_at.toISOString(),
    }));

    const serializedEmployees = employees.map((e) => ({
      employee_id: e.employee_id,
      full_name: e.full_name,
      email: e.email,
      department_id: e.department_id || null,
      department_name: e.department?.name || null,
      position_id: e.position_id || null,
      position_name: e.position?.name || null,
    }));

    const serializedUserRoles = userRoles.map((ur) => ({
      user_role_id: ur.user_role_id,
      employee_id: ur.employee_id,
      role_id: ur.role_id,
      employee_name: ur.employee.full_name,
      role_name: ur.role.name,
    }));

    return {
      props: {
        initialRoles: serializedRoles,
        initialEmployees: serializedEmployees,
        initialUserRoles: serializedUserRoles,
      },
    };
  } catch (error: unknown) {
    console.error("Lỗi getServerSideProps:", error);
    return {
      props: {
        initialRoles: [],
        initialEmployees: [],
        initialUserRoles: [],
      },
    };
  } finally {
    await prisma.$disconnect();
  }
};

const RolesPermissionsPage: React.FC<Props> = ({
  initialRoles,
  initialEmployees,
  initialUserRoles,
}) => {
  const [activeTab, setActiveTab] = useState<"roles" | "assignments">("roles");
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [userRoles, setUserRoles] = useState<UserRole[]>(initialUserRoles);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return (
    <div>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/">Trang chủ</Link>
          </li>
          <li>
            <Link href="/decentralization">Phân quyền</Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col min-h-screen bg-base-50">
        <header className="bg-base-100 shadow-md">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-primary">
              Quản lý Vai trò & Phân quyền
            </h1>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="tabs tabs-boxed mb-6">
            <button
              className={`tab ${activeTab === "roles" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("roles")}
            >
              <Shield className="w-4 h-4 mr-2" /> Vai trò
            </button>
            <button
              className={`tab ${
                activeTab === "assignments" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("assignments")}
            >
              <Users className="w-4 h-4 mr-2" /> Phân quyền người dùng
            </button>
          </div>
          {activeTab === "roles" && (
            <RolesManagement
              roles={roles}
              setRoles={setRoles}
              userRoles={userRoles}
              setUserRoles={setUserRoles}
            />
          )}
          {activeTab === "assignments" && (
            <UserAssignments
              token={token || ""}
              roles={roles}
              employees={initialEmployees}
              userRoles={userRoles}
              setUserRoles={setUserRoles}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default RolesPermissionsPage;
