import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppointmentStatusCard from "./status-card";

type AppointmentRow = {
  id: string;
  doctor_id: string | null;
  patient_name: string;
  appointment_time: string;
  status: string;
  doctors?: {
    full_name: string;
    status?: string | null;
  } | null;
};

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

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, doctor_id, patient_name, appointment_time, status, doctors(full_name, status)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          Appointment not found.
        </div>
      </div>
    );
  }

  const appointment: AppointmentRow = data;
  const doctorStatus = appointment.doctors?.status ?? null;
  const isDoctorUnavailable =
    doctorStatus === "On Leave" || doctorStatus === "In Surgery";
  const isPastAppointment =
    new Date(appointment.appointment_time).getTime() < Date.now();
  const disabledReason = isPastAppointment
    ? "Past appointment"
    : isDoctorUnavailable
      ? `Status updates are disabled while the doctor is ${doctorStatus}.`
      : undefined;

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
            Appointment details
          </h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Patient
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {appointment.patient_name}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Doctor
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {appointment.doctors?.full_name ?? "Unassigned"}
              </p>
              {doctorStatus ? (
                <p className="mt-1 text-xs text-slate-500">{doctorStatus}</p>
              ) : null}
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Time
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatTime(appointment.appointment_time)}
              </p>
            </div>
          </div>
        </div>

        <AppointmentStatusCard
          appointmentId={appointment.id}
          status={appointment.status}
          disabled={isDoctorUnavailable || isPastAppointment}
          helperText={disabledReason}
        />
      </div>
    </div>
  );
}
