import { UserService } from "../services/user.service";
import { sendVerificationEmail } from "./emailTemplate/verification.template";
import { generateToken } from "./tokenGenerator.utils";

export const resendVerificationEmail = async (email:string) => {
  const user = await UserService.getUserByEmail(email);

  if (!user) {
    throw new Error('User not found');
  }
  if (user.verified) {
    return {
      status: 'success',
      message: 'User is already verified',
      data: {
        user,
      },
    };
  }
  const token = await generateToken(user, '1h');
  const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify?token=${token}`;
  await sendVerificationEmail(user.email, verificationLink);

  return {
    status: 'success',
    message: 'Verification email has been resent. Please check your inbox.',
    data: {
      user,
    },
  };
};
