import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from "@supabase/supabase-js";

type DoctorSeed = {
  full_name: string;
  specialty: string;
  status: string;
  email: string;
  phone: string;
};

type AppointmentSeed = {
  patient_name: string;
  appointment_time: string;
  status: string;
  notes: string;
  doctor_name: string;
};

const doctors: DoctorSeed[] = [
  {
    full_name: "Dr. Aisha Khan",
    specialty: "Cardiology",
    status: "Available",
    email: "aisha.khan@practo.demo",
    phone: "+91 90000 11111",
  },
  {
    full_name: "Dr. Rahul Mehta",
    specialty: "Orthopedics",
    status: "In Surgery",
    email: "rahul.mehta@practo.demo",
    phone: "+91 90000 22222",
  },
  {
    full_name: "Dr. Neha Singh",
    specialty: "Dermatology",
    status: "On Leave",
    email: "neha.singh@practo.demo",
    phone: "+91 90000 33333",
  },
];

const appointments: AppointmentSeed[] = [
  {
    patient_name: "Sameer Gupta",
    appointment_time: "2026-02-17T10:30:00+05:30",
    status: "Confirmed",
    notes: "Follow-up after angiography.",
    doctor_name: "Dr. Aisha Khan",
  },
  {
    patient_name: "Anita Rao",
    appointment_time: "2026-02-17T11:15:00+05:30",
    status: "Pending",
    notes: "Initial consultation for knee pain.",
    doctor_name: "Dr. Rahul Mehta",
  },
  {
    patient_name: "Pranav Iyer",
    appointment_time: "2026-02-17T12:10:00+05:30",
    status: "Rescheduled",
    notes: "Review allergy treatment plan.",
    doctor_name: "Dr. Neha Singh",
  },
];

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment.`);
  }
  return value;
}

export async function seed() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: existingDoctors, error: doctorsSelectError } = await supabase
    .from("doctors")
    .select("id, full_name");

  if (doctorsSelectError) {
    throw doctorsSelectError;
  }

  const existingByName = new Map(
    (existingDoctors ?? []).map((doctor) => [doctor.full_name, doctor.id])
  );

  const doctorsToInsert = doctors.filter(
    (doctor) => !existingByName.has(doctor.full_name)
  );

  if (doctorsToInsert.length > 0) {
    const { error } = await supabase.from("doctors").insert(doctorsToInsert);
    if (error) {
      throw error;
    }
  }

  const { data: doctorRows, error: doctorRowsError } = await supabase
    .from("doctors")
    .select("id, full_name");

  if (doctorRowsError) {
    throw doctorRowsError;
  }

  const doctorIdByName = new Map(
    (doctorRows ?? []).map((doctor) => [doctor.full_name, doctor.id])
  );

  const appointmentRows = appointments
    .map((appointment) => ({
      doctor_id: doctorIdByName.get(appointment.doctor_name) ?? null,
      patient_name: appointment.patient_name,
      appointment_time: appointment.appointment_time,
      status: appointment.status,
      notes: appointment.notes,
    }))
    .filter((appointment) => appointment.doctor_id);

  const { data: existingAppointments, error: appointmentsSelectError } =
    await supabase
      .from("appointments")
      .select("id, patient_name, appointment_time");

  if (appointmentsSelectError) {
    throw appointmentsSelectError;
  }

  const existingAppointmentKeys = new Set(
    (existingAppointments ?? []).map(
      (appointment) =>
        `${appointment.patient_name}-${appointment.appointment_time}`
    )
  );

  const appointmentsToInsert = appointmentRows.filter(
    (appointment) =>
      !existingAppointmentKeys.has(
        `${appointment.patient_name}-${appointment.appointment_time}`
      )
  );

  if (appointmentsToInsert.length > 0) {
    const { error } = await supabase
      .from("appointments")
      .insert(appointmentsToInsert);
    if (error) {
      throw error;
    }
  }

  console.log("Seed complete.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
