import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function AdminForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      role="admin"
      resetPath="/admin/reset-password"
      backHref="/admin/login"
      backLabel="Back to staff sign in"
      title="Staff password reset"
      lede="Enter the staff email. We will send a 6-digit code."
      showStoreLink
    />
  );
}
