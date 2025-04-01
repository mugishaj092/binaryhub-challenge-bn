import { sendEmail } from '../email.util';

export const signupEmail = async (email: string) => {
  const subject = 'Account Creation Success';
  const text = `You have successfully created a new account`;
  const html = `You have successfully created a new account on this email address ${email}`;
  await sendEmail(email, subject, text, html);
};
