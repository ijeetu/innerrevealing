import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
    confirmationResult: ConfirmationResult;
  }
} 