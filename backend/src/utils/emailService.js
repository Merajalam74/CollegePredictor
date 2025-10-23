import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const createTransport = () => {
  // Add production config later
  // if (process.env.NODE_ENV === 'production') { ... }
  // else
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS, },
  });
};

export const sendVerificationEmail = async (to, otp) => {
  const transporter = createTransport();
  const mailOptions = {
    from: '"College Predictor" <noreply@collegepredictor.com>', to: to, subject: 'Verify Your Email Address',
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h2>Verify Email</h2><p>OTP: <strong style="font-size: 24px;">${otp}</strong></p><p>Expires in 10 minutes.</p></div>`,
  };
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId); console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) { console.error('Error sending email:', error); }
};