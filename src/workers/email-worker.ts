import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function processEmailQueue() {
  try {
    const pendingEmails = await prisma.emailQueue.findMany({
      where: { status: 'PENDING' },
    });

    for (const email of pendingEmails) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email.to_email,
          subject: email.subject,
          html: email.body,
        });

        await prisma.emailQueue.update({
          where: { email_id: email.email_id },
          data: { status: 'SENT' },
        });
      } catch (error) {
        console.error(`Lỗi khi gửi email ${email.email_id}:`, error);
        await prisma.emailQueue.update({
          where: { email_id: email.email_id },
          data: { status: 'FAILED' },
        });
      }
    }
  } catch (error) {
    console.error('Lỗi xử lý EmailQueue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy worker mỗi 5 phút
setInterval(processEmailQueue, 5 * 60 * 1000);

// Chạy ngay lần đầu
processEmailQueue();