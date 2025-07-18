-- CreateEnum
CREATE TYPE "RewardPenaltyType" AS ENUM ('REWARD', 'PENALTY');

-- CreateEnum
CREATE TYPE "RewardPenaltyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "RewardPenalties" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" "RewardPenaltyType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "status" "RewardPenaltyStatus" NOT NULL DEFAULT 'PENDING',
    "approver_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardPenalties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shifts" (
    "shift_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shifts_pkey" PRIMARY KEY ("shift_id")
);

-- AddForeignKey
ALTER TABLE "RewardPenalties" ADD CONSTRAINT "RewardPenalties_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employees"("employee_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardPenalties" ADD CONSTRAINT "RewardPenalties_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "Employees"("employee_id") ON DELETE SET NULL ON UPDATE CASCADE;
