-- CreateTable
CREATE TABLE "_ContractsToNotifications" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContractsToNotifications_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ContractsToNotifications_B_index" ON "_ContractsToNotifications"("B");

-- AddForeignKey
ALTER TABLE "_ContractsToNotifications" ADD CONSTRAINT "_ContractsToNotifications_A_fkey" FOREIGN KEY ("A") REFERENCES "Contracts"("contract_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContractsToNotifications" ADD CONSTRAINT "_ContractsToNotifications_B_fkey" FOREIGN KEY ("B") REFERENCES "Notifications"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;
