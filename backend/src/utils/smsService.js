// A placeholder service for sending SMS OTPs.
// Replace this with a real SMS gateway provider in production.

// Example function using a fake service (prints to console)
export const sendSmsOTP = async (mobileNumber, otp) => {
  console.log("--- SIMULATING SMS SERVICE ---");
  console.log(`Sending OTP ${otp} to ${mobileNumber}`);
  console.log("---------------------------------");
  
  // --- EXAMPLE: Twilio Logic (commented out) ---
  /*
  import twilio from 'twilio';
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  
  try {
    const message = await client.messages.create({
      body: `Your College Predictor verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: mobileNumber // Ensure number is in E.164 format (e.g., +919876543210)
    });
    console.log(`SMS sent successfully to ${mobileNumber}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
  */
  
  // For now, we just pretend it was successful.
  return true;
};