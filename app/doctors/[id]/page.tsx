import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppointmentsList from "./appointments-list";

type Doctor = {
  id: string;
  full_name: string;
  specialty: string;
  status: string;
  email: string | null;
};

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("doctors")
    .select("id, full_name, specialty, status, email")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          Doctor not found.
        </div>
      </div>
    );
  }

  const doctor: Doctor = data;
  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("id, patient_name, appointment_time, status")
    .eq("doctor_id", doctor.id)
    .order("appointment_time", { ascending: true });

  const safeAppointments =
    appointmentsError || !appointments?.length ? [] : appointments;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <a
          href="/dashboard"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to Dashboard
        </a>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">
            {doctor.full_name}
          </h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Specialty
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {doctor.specialty}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Status
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {doctor.status}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Email
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {doctor.email ?? "Not provided"}
              </p>
            </div>
          </div>
        </div>

        <AppointmentsList appointments={safeAppointments} doctorId={doctor.id} />
      </div>
    </div>
  );
}
