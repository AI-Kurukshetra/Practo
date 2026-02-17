import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Practo
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Back to home
        </Link>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 pb-16">{children}</main>
    </div>
  );
}
