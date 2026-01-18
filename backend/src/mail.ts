import { Resend } from "resend";

// Resend configuration for sending OTP emails
// More reliable than Gmail SMTP for production use

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || "Godman Capital <onboarding@resend.dev>";

// Create Resend client - only if API key is configured
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // Extract OTP from HTML for fallback logging
  const otpMatch = html.match(/(\d{6})/);
  const otpCode = otpMatch ? otpMatch[1] : null;

  // If Resend is not configured, log to console
  if (!resend) {
    console.log("\n" + "=".repeat(50));
    console.log("📧 MOCK EMAIL (Configure RESEND_API_KEY for real emails)");
    console.log("=".repeat(50));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    if (otpCode) {
      console.log(`🔐 OTP CODE: ${otpCode}`);
    }
    console.log("=".repeat(50) + "\n");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [to],
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log("✅ Email sent successfully to:", to);
    console.log("📧 Email ID:", data?.id);
    return data;
  } catch (error: any) {
    // Fallback: log OTP to console when email fails
    console.log("\n" + "=".repeat(50));
    console.log("⚠️  EMAIL FAILED - Fallback to console log");
    console.log("=".repeat(50));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    if (otpCode) {
      console.log(`🔐 OTP CODE: ${otpCode}`);
    }
    console.log(`Error: ${error.message}`);
    console.log("=".repeat(50) + "\n");
    // DON'T throw the error - allow login to proceed
    return;
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  await sendMail({
    to: email,
    subject: "Your Verification Code - Godman Capital",
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px; background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%); color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #c5a059 0%, #d4af61 100%); padding: 15px 25px; border-radius: 12px;">
            <span style="font-size: 28px; font-weight: bold; color: #1a1a2e;">G</span>
          </div>
          <h1 style="margin: 20px 0 5px; color: #ffffff; font-size: 24px;">Godman Capital</h1>
          <p style="color: #c5a059; margin: 0; font-size: 12px; letter-spacing: 3px;">PRECISION CAPITAL</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 30px; text-align: center; border: 1px solid rgba(197, 160, 89, 0.2);">
          <h2 style="color: #c5a059; margin: 0 0 10px; font-size: 18px;">Verification Code</h2>
          <p style="color: #a0a0a0; margin: 0 0 25px;">Enter this code to complete your login</p>
          
          <div style="background: linear-gradient(135deg, #c5a059 0%, #d4af61 100%); color: #1a1a2e; font-size: 36px; font-weight: bold; letter-spacing: 12px; padding: 20px 30px; border-radius: 12px; display: inline-block; font-family: monospace;">
            ${otp}
          </div>
          
          <p style="color: #666; margin: 25px 0 0; font-size: 13px;">
            This code expires in <strong style="color: #c5a059;">10 minutes</strong>
          </p>
        </div>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
          If you didn't request this code, please ignore this email.
        </p>
        
        <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px; padding-top: 20px; text-align: center;">
          <p style="color: #444; font-size: 11px; margin: 0;">
            © 2026 Godman Capital. All rights reserved.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendContactInquiryEmail(data: any) {
  const adminEmail = process.env.ADMIN_EMAIL || "info@godmancapital.in";
  await sendMail({
    to: adminEmail,
    subject: `New Contact Inquiry from ${data.name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px;">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #c5a059; padding-bottom: 10px;">New Contact Inquiry</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 10px; font-weight: bold; width: 140px;">Name:</td><td style="padding: 10px;">${data.name}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 10px; font-weight: bold;">Phone:</td><td style="padding: 10px;">${data.phone || "Not provided"}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; font-weight: bold;">Company:</td><td style="padding: 10px;">${data.company || "Not provided"}</td></tr>
          <tr><td style="padding: 10px; font-weight: bold;">Investment Range:</td><td style="padding: 10px;">${data.investmentRange || "Not specified"}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px;">
          <strong>Message:</strong>
          <p style="margin: 10px 0 0; white-space: pre-wrap;">${data.message}</p>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">Received on ${new Date().toLocaleString()}</p>
      </div>
    `,
  });
}
