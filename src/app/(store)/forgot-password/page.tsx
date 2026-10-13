import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      role="customer"
      resetPath="/reset-password"
      backHref="/login"
      backLabel="Back to sign in"
    />
  );
}
