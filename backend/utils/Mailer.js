const nodemailer = require("nodemailer");

// Create a function to initialize the transporter
const createMailer = () => {
  // Check if environment variables are available
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️  SMTP environment variables not set. Email functionality will be disabled.');
    // Return a dummy mailer for development
    return {
      sendEmail: async (options) => {
        console.log(`📧 Email sending disabled (SMTP not configured) - Would send to: ${options.email}`);
        console.log(`📧 Subject: ${options.subject}`);
        return { messageId: 'dummy-message-id' };
      }
    };
  }

  // Create real transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const sendEmail = async (options) => {
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
      });
      console.log(`📧 Email sent to: ${options.email}`);
    } catch (error) {
      console.error("❌ EMAIL SEND ERROR:\n", error);
      throw new Error(`Email could not be sent: ${error.message}`);
    }
  };

  return { sendEmail };
};

module.exports = createMailer();
