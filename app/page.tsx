import Link from "next/link";

const features = [
  {
    title: "Doctor Directory",
    desc: "Structured profiles with specialties, availability, and contact details.",
  },
  {
    title: "Appointment Scheduling",
    desc: "Track visits, status, and notes without over-engineering.",
  },
  {
    title: "Secure by Design",
    desc: "Supabase Auth + RLS-ready data model for safe access control.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="text-lg font-semibold tracking-tight text-slate-900">
          Practo
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 pb-16">
        <section className="grid gap-10 pt-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Simplified Healthcare Management
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
              Manage doctors and appointments with clarity.
            </h1>
            <p className="text-lg text-slate-600">
              Practo is a lightweight, hackathon-ready healthcare management
              demo that keeps data organized and accessible for teams.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Dashboard
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-widest text-slate-300">
                  Today
                </p>
                <p className="mt-2 text-lg font-semibold">
                  18 appointments scheduled
                </p>
                <p className="text-sm text-slate-300">
                  6 doctors available · 4 pending confirmations
                </p>
              </div>
              <div className="grid gap-3">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
