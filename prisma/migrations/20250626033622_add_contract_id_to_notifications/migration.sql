/*
  Warnings:

  - You are about to drop the `_ContractsToNotifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ContractsToNotifications" DROP CONSTRAINT "_ContractsToNotifications_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContractsToNotifications" DROP CONSTRAINT "_ContractsToNotifications_B_fkey";

-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "contract_id" TEXT;

-- DropTable
DROP TABLE "_ContractsToNotifications";

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "Contracts"("contract_id") ON DELETE SET NULL ON UPDATE CASCADE;
