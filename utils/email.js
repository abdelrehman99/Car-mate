const nodemailer = require('nodemailer');
const CatchAsync = require('./catchasync');

exports.main = CatchAsync(async (data) => {
  // Async function enables allows handling of promises with await
  // First, define send settings by creating a new transporter:
  let transporter = nodemailer.createTransport({
    host: EMAIL_HOST, // SMTP server address (usually mail.your-domain.com)
    port: EMAIL_PORT, // Port for SMTP (usually 465)
    secure: true, // Usually true if connecting to port 465
    auth: {
      user: process.env.EMAIL_USERNAME, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Password (for gmail, your app password)
      // ⚠️ For better security, use environment variables set on the server for these values when deploying
    },
  });

  // Define and send message inside transporter.sendEmail() and await info about send from promise:
  let info = await transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: data.email,
    subject: data.subject,
    text: data.message,
  });

  console.log(info.messageId); // Random ID generated after successful send (optional)
});
