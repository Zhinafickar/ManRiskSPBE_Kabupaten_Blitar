import { LoginPageClient } from "./_components/login-page-client";
import { Providers } from "./providers";

export default function LoginPage() {
  return (
    <Providers>
      <LoginPageClient />
    </Providers>
  );
}
