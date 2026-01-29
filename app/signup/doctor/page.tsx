import DoctorSignupForm from "@/components/DoctorSignupForm";
import PublicOnly from "@/components/PublicOnly";

export default function DoctorSignupPage() {
  return (
    <PublicOnly>
      <DoctorSignupForm />
    </PublicOnly>
  );
}
