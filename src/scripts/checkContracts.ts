import { PrismaClient, ContractStatus, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

async function checkContracts() {
  try {
    const contracts = await prisma.contracts.findMany({
      include: { employee: true },
    });

    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    for (const contract of contracts) {
      const endDate = new Date(contract.end_date);
      let status: ContractStatus;
      let notificationMessage: string | null = null;

      if (endDate < today) {
        status = "EXPIRED";
        notificationMessage = `Hợp đồng của ${contract.employee.full_name} đã hết hạn vào ${endDate.toLocaleDateString(
          "vi-VN"
        )}.`;
      } else if (endDate <= thirtyDaysFromNow) {
        status = "EXPIRING";
        notificationMessage = `Hợp đồng của ${contract.employee.full_name} sẽ hết hạn vào ${endDate.toLocaleDateString(
          "vi-VN"
        )}.`;
      } else {
        status = "ACTIVE";
      }

      // Cập nhật trạng thái hợp đồng nếu cần
      if (contract.status !== status) {
        await prisma.contracts.update({
          where: { contract_id: contract.contract_id },
          data: { status, updated_at: new Date() },
        });
      }

      // Tạo thông báo cho Admin và HR nếu có thay đổi trạng thái
      if (notificationMessage) {
        const adminsAndHRs = await prisma.employees.findMany({
          where: {
            user_roles: {
              some: {
                role: { name: { in: ["Admin", "HR"] } },
              },
            },
          },
        });

        for (const employee of adminsAndHRs) {
          // Kiểm tra xem thông báo đã tồn tại chưa
          const existingNotification = await prisma.notifications.findFirst({
            where: {
              employee_id: employee.employee_id,
              message: notificationMessage,
              is_read: false,
            },
          });

          if (!existingNotification) {
            await prisma.notifications.create({
              data: {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                notification_id: require("uuid").v4(),
                employee_id: employee.employee_id,
                title: status === "EXPIRED" ? "Hợp đồng hết hạn" : "Hợp đồng sắp hết hạn",
                message: notificationMessage,
                type: "SYSTEM" as NotificationType,
                is_read: false,
                created_at: new Date(),
              },
            });
          }
        }
      }
    }

    console.log("Kiểm tra hợp đồng hoàn tất");
  } catch (error: unknown) {
    console.error("Lỗi kiểm tra hợp đồng:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContracts().catch((error: unknown) => {
  console.error("Lỗi chạy kiểm tra hợp đồng:", error);
});

export default checkContracts;