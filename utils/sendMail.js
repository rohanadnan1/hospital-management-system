import nodemailer from "nodemailer";

export const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Care Hospital System"`,
    to: email,
    subject: "Login Verification Code - Care Hospital",
    text: `Your login verification OTP is: ${otp}. This code is valid for 10 minutes.`,
    html: `
            <div style="max-width: 600px; margin: 20px auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Care Hospital Management</h1>
                </div>
                <div style="padding: 30px; color: #333; line-height: 1.6;">
                    <p style="font-size: 16px;">Dear Doctor,</p>
                    <p style="font-size: 16px;">We received a request to log in to your account. Please use the following One-Time Password (OTP) to complete your authentication:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f8f9fa; border: 1px dashed #007bff; color: #007bff; font-size: 32px; font-weight: bold; padding: 10px 30px; border-radius: 5px; letter-spacing: 5px;">
                            ${otp}
                        </span>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;">This verification code is <b>valid for 10 minutes only</b>. If you did not request this login, please contact the IT support or hospital administrator immediately.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">
                        This is an automated security email. Please do not reply to this message.
                    </p>
                </div>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
};
