import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Creates a reusable transporter using environment variables.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email using Nodemailer
 * @param options - { to, subject, html, text }
 */
export async function sendMail(options: SendMailOptions): Promise<void> {
  try {
    const { to, subject, html, text } = options;

    if (!to || !subject || !html) {
      throw new Error("Missing required email parameters (to, subject, html).");
    }

    const mailOptions = {
      from: process.env.MAIL_FROM || `"No Reply" <noreply@example.com>`,
      to,
      subject,
      text: text || "", // fallback in case HTML email clients are disabled
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Error sending email:", (error as Error).message);
    throw new Error("Failed to send email. Please try again later.");
  }
}
