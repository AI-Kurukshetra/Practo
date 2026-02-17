"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type EventRow = {
  id: string;
  old_status: string;
  new_status: string;
  created_at: string;
  actor?: string | null;
  source?: string | null;
  appointments?:
    | {
        patient_name: string;
        doctors?: {
          full_name: string;
        } | null;
      }
    | {
        patient_name: string;
        doctors?: {
          full_name: string;
        }[];
      }[]
    | null;
};

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ActivityFeed({
  initialEvents,
}: {
  initialEvents: EventRow[];
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [events, setEvents] = useState<EventRow[]>(initialEvents);

  useEffect(() => {
    const channel = supabase
      .channel("appointment_events_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "appointment_events" },
        async () => {
          const { data, error } = await supabase
            .from("appointment_events")
            .select(
              "id, old_status, new_status, created_at, appointments(patient_name, doctors(full_name))"
            )
            .order("created_at", { ascending: false })
            .limit(1);

          if (error || !data?.length) {
            return;
          }

const raw = data[0];

const inserted: EventRow = {
  id: raw.id,
  old_status: raw.old_status,
  new_status: raw.new_status,
  created_at: raw.created_at,
  appointments: raw.appointments?.[0]
    ? {
        patient_name: raw.appointments[0].patient_name,
        doctors: raw.appointments[0].doctors?.[0]
          ? { full_name: raw.appointments[0].doctors[0].full_name }
          : null,
      }
    : null,
};
          setEvents((prev) => [inserted, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Activity</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {events.map((event) => {
          const appointment = Array.isArray(event.appointments)
            ? event.appointments[0]
            : event.appointments;
          const patientName = appointment?.patient_name ?? "Unknown patient";
          const doctorName =
            Array.isArray(appointment?.doctors)
              ? appointment?.doctors[0]?.full_name
              : appointment?.doctors?.full_name ?? "Doctor unavailable";
          const action = event.new_status.toLowerCase();

          return (
            <div
              key={event.id}
              className="rounded-2xl border border-slate-200 px-4 py-3"
            >
              <p className="font-semibold text-slate-900">
                {patientName}’s appointment with {doctorName} was {action}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {event.old_status} → {event.new_status} ·{" "}
                {formatRelativeTime(event.created_at)}
              </p>
            </div>
          );
        })}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            No activity yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
