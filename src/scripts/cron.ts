import cron from "node-cron";
import checkContracts from "./checkContracts";

// Chạy mỗi ngày lúc 00:00
cron.schedule("0 0 * * *", () => {
  console.log("Chạy kiểm tra hợp đồng...");
  checkContracts();
});