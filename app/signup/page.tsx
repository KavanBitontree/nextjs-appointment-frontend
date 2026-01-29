import RoleSelection from "@/components/RoleSelection";
import PublicOnly from "@/components/PublicOnly";

export default function SignupPage() {
  return (
    <PublicOnly>
      <RoleSelection />
    </PublicOnly>
  );
}
