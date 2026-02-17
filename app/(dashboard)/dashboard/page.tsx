import { createSupabaseServerClient } from "@/lib/supabase/server";

type DoctorRow = {
  id: string;
  full_name: string;
  specialty: string;
  status: string;
};

type AppointmentRow = {
  id: string;
  patient_name: string;
  appointment_time: string;
  status: string;
  doctors?: {
    full_name: string;
  } | null;
};

const fallbackDoctors = [
  {
    id: "fallback-1",
    full_name: "Dr. Aisha Khan",
    specialty: "Cardiology",
    status: "Available",
  },
  {
    id: "fallback-2",
    full_name: "Dr. Rahul Mehta",
    specialty: "Orthopedics",
    status: "In Surgery",
  },
  {
    id: "fallback-3",
    full_name: "Dr. Neha Singh",
    specialty: "Dermatology",
    status: "On Leave",
  },
];

const fallbackAppointments = [
  {
    id: "fallback-a1",
    patient_name: "Sameer Gupta",
    appointment_time: "2026-02-17T10:30:00+05:30",
    status: "Confirmed",
    doctors: { full_name: "Dr. Aisha Khan" },
  },
  {
    id: "fallback-a2",
    patient_name: "Anita Rao",
    appointment_time: "2026-02-17T11:15:00+05:30",
    status: "Pending",
    doctors: { full_name: "Dr. Rahul Mehta" },
  },
  {
    id: "fallback-a3",
    patient_name: "Pranav Iyer",
    appointment_time: "2026-02-17T12:10:00+05:30",
    status: "Rescheduled",
    doctors: { full_name: "Dr. Neha Singh" },
  },
];

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [{ data: doctors, error: doctorsError }, { data: appointments, error: appointmentsError }] =
    await Promise.all([
      supabase
        .from("doctors")
        .select("id, full_name, specialty, status")
        .order("created_at", { ascending: true }),
      supabase
        .from("appointments")
        .select("id, patient_name, appointment_time, status, doctors(full_name)")
        .order("appointment_time", { ascending: true }),
    ]);

  const safeDoctors = doctorsError || !doctors?.length ? fallbackDoctors : doctors;
  const safeAppointments =
    appointmentsError || !appointments?.length ? fallbackAppointments : appointments;

  const showFallbackNotice = doctorsError || appointmentsError;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Practo control center
          </h1>
          {showFallbackNotice ? (
            <p className="mt-2 text-sm text-slate-500">
              Connect Supabase to see live data. Showing demo fallback.
            </p>
          ) : null}
        </div>
        <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Live demo data
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 pb-16 lg:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Today&apos;s appointments
            </h2>
            <span className="text-sm text-slate-500">3 records</span>
          </div>
          <div className="mt-4 space-y-3">
            {safeAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {appointment.patient_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {appointment.doctors?.full_name ?? "Unassigned"}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  {formatTime(appointment.appointment_time)}
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {appointment.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Available doctors
          </h2>
          <div className="mt-4 space-y-3">
            {safeDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              >
                <p className="text-sm font-semibold text-slate-900">
                  {doctor.full_name}
                </p>
                <p className="text-xs text-slate-500">{doctor.specialty}</p>
                <p className="mt-2 text-xs font-semibold text-slate-700">
                  {doctor.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
