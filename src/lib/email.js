

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",           // Brevo SMTP Relay host
  port: 587,                              // Brevo recommended port for TLS
  secure: false,                         // false for TLS port 587
  auth: {
    user: process.env.SMTP_USER.replace(/"/g, ""),   // Remove quotes if any
    pass: process.env.SMTP_PASS.replace(/"/g, ""),   // Remove quotes if any
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error setting up SMTP transporter:", error);
  } else {
    console.log("SMTP transporter is ready");
  }
});

export async function sendEmail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: process.env.SENDER_EMAIL.replace(/"/g, ""),  // Remove quotes if any
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
