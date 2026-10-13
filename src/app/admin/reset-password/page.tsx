import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function AdminResetPasswordPage() {
  return (
    <ResetPasswordForm
      role="admin"
      loginHref="/admin/login"
      backHref="/admin/forgot-password"
      backLabel="Start over"
    />
  );
}
