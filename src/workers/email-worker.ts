import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

console.log('Email worker started at:', new Date().toISOString());

async function processEmailQueue() {
  try {
    console.log('Processing email queue at:', new Date().toISOString());
    const pendingEmails = await prisma.emailQueue.findMany({
      where: { status: 'PENDING' },
      take: 10,
    });
    console.log(`Found ${pendingEmails.length} pending emails`, pendingEmails);

    for (const email of pendingEmails) {
      let attempts = 0;
      const maxAttempts = 3;
      console.log(`Processing email ${email.email_id} to ${email.to_email}`);
      while (attempts < maxAttempts) {
        try {
          await transporter.sendMail({
            from: `"Hệ thống HRM" <${process.env.GMAIL_USER}>`,
            to: email.to_email,
            subject: email.subject,
            text: email.body,
          });

          await prisma.emailQueue.update({
            where: { email_id: email.email_id },
            data: { status: 'SENT', send_at: new Date() },
          });
          console.log(`Email sent to ${email.to_email} on attempt ${attempts + 1}`);
          break;
        } catch (error) {
          attempts++;
          console.error(`Lỗi gửi email ${email.email_id} (attempt ${attempts}):`, error);
          if (attempts === maxAttempts) {
            await prisma.emailQueue.update({
              where: { email_id: email.email_id },
              data: { status: 'FAILED', send_at: new Date() },
            });
            console.error(`Email ${email.email_id} failed after ${maxAttempts} attempts`);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  } catch (error) {
    console.error('Lỗi xử lý EmailQueue:', error);
  }
}

setInterval(processEmailQueue, 30 * 1000);
processEmailQueue().finally(() => prisma.$disconnect());