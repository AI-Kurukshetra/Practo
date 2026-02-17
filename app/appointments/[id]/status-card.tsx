"use client";

import { useMemo, useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const STATUS_OPTIONS = ["Confirmed", "Pending", "Rescheduled"] as const;

export default function AppointmentStatusCard({
  appointmentId,
  status,
  disabled = false,
  helperText,
}: {
  appointmentId: string;
  status: string;
  disabled?: boolean;
  helperText?: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(status);

  async function handleStatusChange(nextStatus: string) {
    const previousStatus = currentStatus;
    if (previousStatus === nextStatus) {
      return;
    }
    setCurrentStatus(nextStatus);
    setUpdatingId(appointmentId);
    startTransition(async () => {
      const { error } = await supabase
        .from("appointments")
        .update({ status: nextStatus })
        .eq("id", appointmentId);

      if (error) {
        console.error(error);
        setCurrentStatus(previousStatus);
      } else {
        const { error: eventError } = await supabase
          .from("appointment_events")
          .insert({
            appointment_id: appointmentId,
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

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Status</h2>
      <div className="mt-4">
        <select
          value={currentStatus}
          onChange={(event) => handleStatusChange(event.target.value)}
          disabled={disabled || (isPending && updatingId === appointmentId)}
          className={`rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400 ${
            disabled || (isPending && updatingId === appointmentId)
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
        {helperText ? (
          <p className="mt-2 text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
