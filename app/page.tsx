import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  ShieldCheck,
  Stethoscope,
  User,
  HeartPulse,
} from "lucide-react";
import PublicOnly from "@/components/PublicOnly";

export default function Home() {
  return (
    <PublicOnly>
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <header className="rounded-3xl bg-white p-10 shadow-lg border border-slate-200">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Appointment Booking Platform
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                Book, manage, and track appointments with ease.
              </h1>
              <p className="mt-4 text-lg text-slate-700">
                Patients and doctors get a secure, single-session experience
                with automatic token refresh, device-aware login, and real-time
                form validation.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-xl bg-slate-100 border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Create an account
                </Link>
              </div>
            </div>

            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl border-4 border-blue-100">
              <Image
                src="/images/doctor-consultation-patient-medical-appointment-flat-vector-illustration-consulting-clinic-hospital-430519054.jpg"
                alt="Doctor consulting with patient in medical appointment"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: "Patient access",
              description:
                "Book visits, track records, and stay synced across devices.",
              icon: <HeartPulse className="h-6 w-6 text-blue-600" />,
              href: "/patient/dashboard",
              cta: "Open patient dashboard",
            },
            {
              title: "Doctor tools",
              description:
                "Manage appointments, slots, and availability securely.",
              icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
              href: "/doctor/dashboard",
              cta: "Open doctor dashboard",
            },
          ].map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  {card.icon}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>
              </div>
              <p className="flex-1 text-sm text-slate-700">
                {card.description}
              </p>
              <span className="text-sm font-semibold text-blue-600">
                {card.cta} →
              </span>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-lg border border-slate-200 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-1 h-6 w-6 text-blue-600" />
            <div>
              <p className="text-base font-semibold text-slate-900">
                Real-time validation
              </p>
              <p className="text-sm text-slate-700">
                Zod-powered forms keep credentials clean before hitting the API.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-6 w-6 text-blue-600" />
            <div>
              <p className="text-base font-semibold text-slate-900">
                Refresh with cookies
              </p>
              <p className="text-sm text-slate-700">
                HttpOnly refresh tokens auto-renew access without exposing
                secrets.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="mt-1 h-6 w-6 text-blue-600" />
            <div>
              <p className="text-base font-semibold text-slate-900">
                Role-aware dashboards
              </p>
              <p className="text-sm text-slate-700">
                Auth context guards doctor and patient routes out of the box.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
    </PublicOnly>
  );
}
