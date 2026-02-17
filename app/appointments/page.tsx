"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import TopNav from "@/app/components/top-nav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Appointment = {
  id: string;
  doctor_id: string | null;
  patient_name: string;
  appointment_time: string;
  status: string;
  doctors?:
    | {
        full_name: string;
      }
    | {
        full_name: string;
      }[]
    | null;
};

const STATUS_OPTIONS = ["Confirmed", "Pending", "Rescheduled"] as const;
const FILTER_OPTIONS = ["Today", "Upcoming", "Past"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

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

function isPastAppointment(value: string, nowMs: number) {
  const time = new Date(value).getTime();
  return !Number.isNaN(time) && time < nowMs;
}

export default function AppointmentsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<Appointment[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOption>("Today");
  const nowMs = Date.now();

  useEffect(() => {
    let isMounted = true;
    async function loadAppointments() {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );

      let query = supabase
        .from("appointments")
        .select(
          "id, doctor_id, patient_name, appointment_time, status, doctors(full_name)"
        )
        .order("appointment_time", { ascending: true });

      if (filter === "Today") {
        query = query
          .gte("appointment_time", startOfDay.toISOString())
          .lt("appointment_time", endOfDay.toISOString());
      } else if (filter === "Upcoming") {
        query = query.gte("appointment_time", endOfDay.toISOString());
      } else if (filter === "Past") {
        query = query.lt("appointment_time", startOfDay.toISOString());
      }

      const { data, error } = await query;

      if (!isMounted) {
        return;
      }

      if (error) {
        setLoadError(true);
        return;
      }

      setItems((data ?? []) as Appointment[]);
    }

    loadAppointments();

    const channel = supabase
      .channel("appointments_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointments" },
        () => {
          loadAppointments();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "appointments" },
        (payload) => {
          const updated = payload.new as Appointment;
          setItems((prev) =>
            prev.map((item) =>
              item.id === updated.id
                ? { ...item, ...updated, doctors: item.doctors }
                : item
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "appointments" },
        (payload) => {
          const removed = payload.old as Appointment;
          setItems((prev) => prev.filter((item) => item.id !== removed.id));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, filter]);

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
          console.warn("Activity log insert failed", eventError);
        }
      }

      setUpdatingId(null);
    });
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          Failed to load appointments. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <TopNav />
        <h1 className="text-3xl font-semibold text-slate-900">Appointments</h1>
        <p className="mt-2 text-slate-600">
          Review scheduled visits and their assigned doctors.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => {
            const isActive = filter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          {items.map((appointment) => {
            const isPast = isPastAppointment(appointment.appointment_time, nowMs);
            return (
            <div
              key={appointment.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              {(() => {
                const doctorName = Array.isArray(appointment.doctors)
                  ? appointment.doctors[0]?.full_name
                  : appointment.doctors?.full_name;
                return (
              <div>
                <Link
                  href={`/appointments/${appointment.id}`}
                  className="text-sm font-semibold text-slate-900"
                >
                  {appointment.patient_name}
                </Link>
                <p className="text-xs text-slate-500">
                  {doctorName ?? "Unassigned"}
                </p>
                {isPast ? (
                  <p className="mt-1 text-xs text-slate-500">Past appointment</p>
                ) : null}
              </div>
                );
              })()}
              <div className="text-sm text-slate-600">
                {formatTime(appointment.appointment_time)}
              </div>
              {isPast ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {appointment.status}
                </span>
              ) : (
                <select
                  value={appointment.status}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
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
            );
          })}
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              No appointments available yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
