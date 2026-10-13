import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <ResetPasswordForm
      role="customer"
      loginHref="/login"
      backHref="/forgot-password"
      backLabel="Start over"
    />
  );
}
