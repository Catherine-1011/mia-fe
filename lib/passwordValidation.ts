export const SIGNUP_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const SIGNUP_PASSWORD_MESSAGE =
  "Password must be at least 8 characters with uppercase, lowercase, and number";

export const isValidSignupPassword = (password: string) =>
  SIGNUP_PASSWORD_REGEX.test(password);
