import { LoginPageClient } from "@/app/_components/login-page-client";

export default function AdminLoginPage() {
  return (
    <LoginPageClient isAdminLogin={true} />
  );
}
