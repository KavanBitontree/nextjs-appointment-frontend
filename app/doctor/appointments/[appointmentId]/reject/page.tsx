import { Suspense } from "react";
import RejectAppointmentClient from "./RejectAppointmentClient";

export default function RejectAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
        </div>
      }
    >
      <RejectAppointmentClient />
    </Suspense>
  );
}
