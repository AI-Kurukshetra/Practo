import Link from "next/link";
import TopNav from "@/app/components/top-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  status: string;
};

export default async function DoctorsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("id, full_name, specialty, status")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          Failed to load doctors. Please try again.
        </div>
      </div>
    );
  }

  const doctors = data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <TopNav />
        <h1 className="text-3xl font-semibold text-slate-900">Doctors</h1>
        <p className="mt-2 text-slate-600">
          Browse the current medical team and their availability.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {doctors.map((doctor) => (
            <Link
              key={doctor.id}
              href={`/doctors/${doctor.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {doctor.full_name}
                  </h2>
                  <p className="text-sm text-slate-600">{doctor.specialty}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {doctor.status}
                </span>
              </div>
            </Link>
          ))}
          {doctors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No doctors available yet. Run the seed script to populate demo
              data.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
