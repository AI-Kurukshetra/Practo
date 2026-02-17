"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  patient_name: string;
  appointment_time: string;
  status: string;
};

const STATUS_OPTIONS = ["Confirmed", "Pending", "Rescheduled"] as const;

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

export default function AppointmentsList({
  appointments,
  doctorId,
}: {
  appointments: Appointment[];
  doctorId: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [items, setItems] = useState(appointments);
  const [patientName, setPatientName] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStatusChange(id: string, nextStatus: string) {
    const previousStatus = items.find((item) => item.id === id)?.status;
    if (!previousStatus || previousStatus === nextStatus) {
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item
      )
    );
    setUpdatingId(id);
    startTransition(async () => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) {
        console.error(error);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: previousStatus } : item
          )
        );
      } else {
        const { error: eventError } = await supabase
          .from("appointment_events")
          .insert({
            appointment_id: id,
            old_status: previousStatus,
            new_status: nextStatus,
            actor: "Admin",
            source: "Dashboard",
          });
        if (eventError) {
          console.error(eventError);
        }
      }

      setUpdatingId(null);
    });
  }

  async function refreshAppointments() {
    const { data, error } = await supabase
      .from("appointments")
      .select("id, patient_name, appointment_time, status")
      .eq("doctor_id", doctorId)
      .order("appointment_time", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setItems(data ?? []);
  }

  async function handleAddAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!patientName || !appointmentTime) {
      return;
    }
    setIsSubmitting(true);
    const isoTime = new Date(appointmentTime).toISOString();
    console.log("Insert appointment", {
      doctorId,
      patientName,
      appointmentTime: isoTime,
    });
    const { error } = await supabase.from("appointments").insert({
      doctor_id: doctorId,
      patient_name: patientName,
      appointment_time: isoTime,
      status: "Pending",
    });

    if (error) {
      console.error("Supabase insert error", error);
      console.error("Supabase insert error message", error.message);
      alert(`Unable to add appointment: ${error.message}`);
      setIsSubmitting(false);
      return;
    }

    await refreshAppointments();
    setPatientName("");
    setAppointmentTime("");
    setIsSubmitting(false);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Appointments</h2>
      <form className="mt-4 space-y-3" onSubmit={handleAddAppointment}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Patient name
            </label>
            <input
              value={patientName}
              onChange={(event) => setPatientName(event.target.value)}
              placeholder="Patient name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Appointment time
            </label>
            <input
              type="datetime-local"
              value={appointmentTime}
              onChange={(event) => setAppointmentTime(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:border-slate-300 disabled:opacity-70"
          >
            Add appointment
          </button>
        </div>
      </form>
      <div className="mt-4 space-y-3">
        {items.map((appointment) => (
          <div
            key={appointment.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {appointment.patient_name}
              </p>
              <p className="text-xs text-slate-500">
                {formatTime(appointment.appointment_time)}
              </p>
              {new Date(appointment.appointment_time).getTime() < Date.now() ? (
                <p className="mt-1 text-xs text-slate-500">Past appointment</p>
              ) : null}
            </div>
            {new Date(appointment.appointment_time).getTime() < Date.now() ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {appointment.status}
              </span>
            ) : (
              <select
                value={appointment.status}
                onChange={(event) =>
                  handleStatusChange(appointment.id, event.target.value)
                }
                disabled={isPending && updatingId === appointment.id}
                className={`rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 ${
                  isPending && updatingId === appointment.id
                    ? "opacity-70"
                    : ""
                }`}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            No appointments yet for this doctor.
          </div>
        ) : null}
      </div>
    </div>
  );
}
