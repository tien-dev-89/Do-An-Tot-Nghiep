/*
  Warnings:

  - Added the required column `status` to the `AttendanceRecords` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AttendanceRecords" ADD COLUMN     "status" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SalaryConfig" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT,
    "base_salary" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "overtime_rate" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "late_penalty_rate" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalaryConfig_employee_id_key" ON "SalaryConfig"("employee_id");

-- AddForeignKey
ALTER TABLE "AttendanceRecords" ADD CONSTRAINT "AttendanceRecords_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shifts"("shift_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryConfig" ADD CONSTRAINT "SalaryConfig_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;
