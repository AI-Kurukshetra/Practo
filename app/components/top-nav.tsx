import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/appointments", label: "Appointments" },
  { href: "/doctors", label: "Doctors" },
];

export default function TopNav() {
  return (
    <nav className="mx-auto w-full max-w-6xl px-6 pb-6">
      <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 hover:border-slate-300"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
