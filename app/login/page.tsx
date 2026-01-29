import LoginForm from "@/components/LoginForm";
import PublicOnly from "@/components/PublicOnly";

export default function LoginPage() {
  return (
    <PublicOnly>
      <LoginForm />
    </PublicOnly>
  );
}
