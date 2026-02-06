import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Initialize Resend only if key is present to avoid startup crashes
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const createTransport = () => {
  // Use Gmail/SMTP
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), 
    secure: true, // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendVerificationEmail = async (to, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <p style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 10px 0;">${otp}</p>
      <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
    </div>
  `;

  try {
    if (process.env.EMAIL_PROVIDER === 'resend' && resend) {
      const data = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to,
        subject: 'Verify Your Email Address',
        html,
      });
      console.log('✅ Resend Email sent:', data.id);
    } else {
      const transporter = createTransport();
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM, 
        to,
        subject: 'Verify Your Email Address',
        html,
      });
      console.log('✅ SMTP Email sent:', info.messageId);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
  }
};
export const sendOrderConfirmationEmail = async (to, name, orderId) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      
      <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h2 style="margin: 0;">Order Confirmed</h2>
      </div>

      <div style="padding: 20px; color: #333; line-height: 1.6;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for upgrading to the <strong>Premium Plan</strong>. Your transaction was successful.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Plan:</strong> Lifetime Premium Access</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹0.00 <span style="color: green; font-size: 12px;">(100% OFF)</span></p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>You now have unlimited access to:</p>
        <ul>
          <li>All IIT/NIT College Predictions</li>
          <li>"Talk to Senior" Feature</li>
          <li>AI Counseling Assistant</li>
        </ul>

        <p style="margin-top: 20px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #2563eb; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
        </p>
      </div>

      <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
        <p>&copy; ${new Date().getFullYear()} College Predictor. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    if (process.env.EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY) {
      // Using Resend
      const { Resend } = await import('resend'); // Dynamic import if not at top
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to,
        subject: `Order Confirmation #${orderId}`,
        html,
      });
    } else {
      // Using SMTP
      const transporter = createTransport();
      if (transporter) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to,
          subject: `Order Confirmation #${orderId}`,
          html,
        });
      }
    }
    console.log(`✅ Order email sent to ${to}`);
  } catch (error) {
    console.error('❌ Error sending order email:', error);
  }
};
