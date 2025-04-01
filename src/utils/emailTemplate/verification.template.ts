import { sendEmail } from '../email.util';

export const sendVerificationEmail = async (email: string, verificationLink: string) => {
  const subject = 'Verify Your Email Address';
  const text = `Please verify your email address by clicking on the following link: ${verificationLink}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p style="font-size: 16px; color: #555;">You have requested to verify your email address.</p>
      <p style="font-size: 16px; color: #555;">Please click the button below to complete the verification process:</p>
      <p style="text-align: center;">
        <a href="${verificationLink}" style="display: inline-block; padding: 12px 20px; color: #fff; background-color: #1a73e8; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 5px;">Verify Email</a>
      </p>
      <p style="font-size: 16px; color: #555;">For security reasons, this verification link will expire in 24 hours. If your link has expired, please request a new verification email.</p>
      <p style="font-size: 16px; color: #555;">Why verify your email?</p>
      <ul style="font-size: 16px; color: #555;">
        <li>Secure your account and personal information.</li>
        <li>Ensure that you receive important account notifications.</li>
        <li>Prevent unauthorized access to your account.</li>
      </ul>
      <p style="font-size: 16px; color: #555;">If you did not request this, please ignore this email or contact our support team if you have any concerns.</p>
      <p style="font-size: 14px; color: #777; text-align: center;">Thank you for using our service! <br> The Support Team</p>
    </div>
  `;
  
  await sendEmail(email, subject, text, html);
};