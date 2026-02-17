import Link from "next/link";

export default function SignupPage() {
  return (
    <section className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Get started</h1>
        <p className="text-slate-600">
          Create a Practo account to manage doctors and appointments.
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
          We will connect this form to Supabase Auth in the next step.
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              type="text"
              placeholder="Dr. Jane Patel"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
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
              placeholder="Create a secure password"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Create account
          </button>
          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-slate-900">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
