import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-slate-600">
          Log in to manage doctors, appointments, and updates.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          Supabase Auth will power this flow. No hardcoded keys — credentials
          stay in environment variables.
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              placeholder="you@clinic.com"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Log in
          </button>
          <p className="text-center text-sm text-slate-600">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-slate-900">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
