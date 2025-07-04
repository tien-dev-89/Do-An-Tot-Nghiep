import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'stafflycty@gmail.com',
    pass: 'gefczbwfjrocclmt',
  },
});

async function testSMTP() {
  try {
    await transporter.verify();
    console.log('SMTP connection successful');
    await transporter.sendMail({
      from: '"Hệ thống HRM" <stafflycty@gmail.com>',
      to: 'tien89892323@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email from HRM system.',
    });
    console.log('Test email sent successfully');
  } catch (error) {
    console.error('SMTP error:', error);
  }
}

testSMTP();