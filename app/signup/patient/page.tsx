import PatientSignupForm from "@/components/PatientSignupForm";
import PublicOnly from "@/components/PublicOnly";

export default function PatientSignupPage() {
  return (
    <PublicOnly>
      <PatientSignupForm />
    </PublicOnly>
  );
}
