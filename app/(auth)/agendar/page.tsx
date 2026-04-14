"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, ArrowRight, CheckCircle, Calendar,
  Clock, Video, Loader2, ChevronLeft, ChevronRight,
  User, Mail, Lock,
} from "lucide-react";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";
const NAVY = "#0B1D35";

/* ─── Constants ─────────────────────────────────────────────── */

const VERTICALS = [
  { id: "sleep",         label: "Sueño",          icon: "🌙", desc: "Insomnio, apnea y ritmo circadiano" },
  { id: "pain",          label: "Dolor Crónico",  icon: "🦴", desc: "Fibromialgia, neuropático y musculoesquelético" },
  { id: "anxiety",       label: "Ansiedad",        icon: "🧠", desc: "Estrés crónico y bienestar emocional" },
  { id: "womens_health", label: "Salud Femenina",  icon: "🌸", desc: "SPM, menopausia y equilibrio hormonal" },
];

const DOCTORS = [
  {
    id: "placeholder-dra-poma",
    name: "Dra. Estefanía Poma",
    cmp: "CMP 059636",
    specialty: "Medicina Integrativa",
    photo: "/dra-poma-300x300.png",
    verticals: ["sleep", "womens_health"],
    rating: 4.9,
    reviews: 142,
  },
  {
    id: "placeholder-dr-goodman",
    name: "Dr. Robert Goodman",
    cmp: "CMP 095719",
    specialty: "Medicina Integrativa",
    photo: "/drgodman-300x300.png",
    verticals: ["pain", "anxiety"],
    rating: 4.8,
    reviews: 118,
  },
];

// Available hours Mon-Fri (Lima time)
const AVAILABLE_HOURS = [9, 10, 11, 14, 15, 16, 17];

function generateSlots(date: Date, bookedISO: string[]): string[] {
  const day = date.getDay();
  if (day === 0 || day === 6) return []; // no weekends

  return AVAILABLE_HOURS.map((h) => {
    const slot = new Date(date);
    slot.setHours(h, 0, 0, 0);
    return slot.toISOString();
  }).filter((iso) => {
    // exclude already booked
    return !bookedISO.some((b) => {
      const booked = new Date(b);
      return booked.getHours() === new Date(iso).getHours() &&
        booked.toDateString() === new Date(iso).toDateString();
    });
  });
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

/* ─── Component ─────────────────────────────────────────────── */

type Step = "vertical" | "doctor" | "datetime" | "confirm" | "done";

interface DoctorRow { id: string; full_name: string | null }

export default function AgendarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>}>
      <AgendarWizard />
    </Suspense>
  );
}

function AgendarWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("vertical");
  const [vertical, setVertical] = useState<string>(searchParams.get("v") ?? "");
  const [doctorId, setDoctorId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ meetLink: string | null; calendarLink: string } | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [dbDoctors, setDbDoctors] = useState<DoctorRow[]>([]);

  // Inline auth state (shown at confirm step when not logged in)
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  // Load user session
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email! });
    });
    // Cargar IDs reales de doctores desde medical.profiles para resolver placeholders
    supabase
      .schema("medical")
      .from("profiles")
      .select("id, full_name")
      .eq("role", "doctor")
      .then(({ data }) => {
        if (data) setDbDoctors(data as DoctorRow[]);
      });
  }, []);

  // Load booked slots when doctor + date changes
  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setLoading(true);
    const supabase = createClient();
    const dateStr = selectedDate.toISOString().split("T")[0];
    supabase
      .schema("medical")
      .from("appointments")
      .select("slot_start")
      .eq("doctor_id", doctorId)
      .gte("slot_start", `${dateStr}T00:00:00`)
      .lte("slot_start", `${dateStr}T23:59:59`)
      .in("status", ["pending", "confirmed"])
      .then(({ data }) => {
        setBookedSlots(data?.map((d) => d.slot_start) ?? []);
        setLoading(false);
      });
  }, [doctorId, selectedDate]);

  // If vertical pre-selected, jump to doctor step
  useEffect(() => {
    if (vertical && step === "vertical") setStep("doctor");
  }, []);

  const filteredDoctors = DOCTORS.filter((d) =>
    !vertical || d.verticals.includes(vertical)
  );

  function resolveRealDoctorId(placeholderId: string): string {
    const doctor = DOCTORS.find((d) => d.id === placeholderId);
    if (!doctor) return placeholderId;
    const match = dbDoctors.find((db) =>
      db.full_name?.toLowerCase().includes(doctor.name.split(" ")[1]?.toLowerCase() ?? "")
    );
    return match?.id ?? placeholderId;
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    // If guest, sign up or log in first
    if (!user) {
      const supabase = createClient();

      if (!showLogin) {
        // Sign up
        if (!guestName.trim() || !guestEmail.trim() || !guestPassword) {
          setError("Completa todos los campos para continuar.");
          setSubmitting(false);
          return;
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email: guestEmail.trim(),
          password: guestPassword,
          options: { data: { full_name: guestName.trim(), role: "patient" } },
        });
        if (signUpError) {
          setError(
            signUpError.message.toLowerCase().includes("already registered")
              ? "Ya existe una cuenta con ese email. Usa la opción de iniciar sesión."
              : signUpError.message
          );
          setSubmitting(false);
          return;
        }
      } else {
        // Sign in
        if (!guestEmail.trim() || !guestPassword) {
          setError("Completa los campos para continuar.");
          setSubmitting(false);
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: guestEmail.trim(),
          password: guestPassword,
        });
        if (signInError) {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.");
          setSubmitting(false);
          return;
        }
      }

      setUser({ email: guestEmail.trim() });
    }

    const realDoctorId = resolveRealDoctorId(doctorId);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId:  realDoctorId,
        specialty: vertical,     // API espera specialty (era vertical)
        slotStart: selectedSlot, // API espera slotStart (era scheduledAt)
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Error al crear la cita");
      return;
    }

    setResult({ meetLink: data.meetLink, calendarLink: data.calendarLink });
    setStep("done");
  }

  const selectedDoctor = DOCTORS.find((d) => d.id === doctorId);
  const selectedVertical = VERTICALS.find((v) => v.id === vertical);
  const slots = generateSlots(selectedDate, bookedSlots);

  /* ── WEEK navigation ── */
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  /* ─── Render ─────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-color.png" alt="Organnical" width={130} height={32} />
          </Link>
          {step !== "done" && (
            <div className="flex items-center gap-1.5">
              {(["vertical", "doctor", "datetime", "confirm"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    ["vertical", "doctor", "datetime", "confirm"].indexOf(step) >= i
                      ? "w-8"
                      : "w-4 bg-zinc-200"
                  }`}
                  style={["vertical", "doctor", "datetime", "confirm"].indexOf(step) >= i ? { background: G } : {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10">

        {/* ── STEP: vertical ── */}
        {step === "vertical" && (
          <div>
            <p className="text-sm text-zinc-400 mb-1">Paso 1 de 4</p>
            <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">¿Cuál es tu motivo de consulta?</h1>
            <p className="text-zinc-500 text-sm mb-8">Selecciona el área de tu salud que quieres trabajar.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {VERTICALS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => { setVertical(v.id); setStep("doctor"); }}
                  className="text-left p-5 bg-white rounded-2xl border border-zinc-100 hover:border-violet-300 hover:shadow-md transition-all group"
                >
                  <div className="text-3xl mb-3">{v.icon}</div>
                  <p className="font-bold text-[#0B1D35] group-hover:text-[#A78BFA] transition-colors">{v.label}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: doctor ── */}
        {step === "doctor" && (
          <div>
            <button onClick={() => setStep("vertical")} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Atrás
            </button>
            <p className="text-sm text-zinc-400 mb-1">Paso 2 de 4</p>
            <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">Elige tu médico</h1>
            <p className="text-zinc-500 text-sm mb-8">Especialistas en {selectedVertical?.label}.</p>
            <div className="space-y-3">
              {filteredDoctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setDoctorId(doc.id); setStep("datetime"); }}
                  className="w-full text-left bg-white rounded-2xl border border-zinc-100 hover:border-violet-300 hover:shadow-md transition-all p-5 flex items-center gap-4 group"
                >
                  <Image
                    src={doc.photo}
                    alt={doc.name}
                    width={60}
                    height={60}
                    className="rounded-2xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0B1D35] group-hover:text-[#A78BFA] transition-colors">{doc.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{doc.specialty} · {doc.cmp}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-semibold text-amber-500">★ {doc.rating}</span>
                      <span className="text-xs text-zinc-400">{doc.reviews} reseñas</span>
                      <span className="text-xs text-emerald-500 font-medium">● Disponible</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#A78BFA] transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: datetime ── */}
        {step === "datetime" && (
          <div>
            <button onClick={() => setStep("doctor")} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Atrás
            </button>
            <p className="text-sm text-zinc-400 mb-1">Paso 3 de 4</p>
            <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">Elige fecha y hora</h1>
            <p className="text-zinc-500 text-sm mb-6">Horario de atención: lunes a viernes, 9am – 6pm (Lima).</p>

            {/* Week selector */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedDate((d) => addDays(d, -7))}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-500" />
                </button>
                <p className="text-sm font-semibold text-zinc-700">
                  {weekDays[0].toLocaleDateString("es-PE", { month: "long", year: "numeric" })}
                </p>
                <button
                  onClick={() => setSelectedDate((d) => addDays(d, 7))}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {weekDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = day < addDays(new Date(), 0);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => { if (!isPast) { setSelectedDate(day); setSelectedSlot(""); } }}
                      disabled={isPast}
                      className={`flex flex-col items-center py-2.5 rounded-xl text-sm transition-all ${
                        isPast
                          ? "opacity-30 cursor-not-allowed"
                          : isSelected
                          ? "text-white font-bold"
                          : "hover:bg-zinc-50 text-zinc-600"
                      }`}
                      style={isSelected ? { background: G } : {}}
                    >
                      <span className="text-[10px] uppercase font-medium opacity-70">
                        {day.toLocaleDateString("es-PE", { weekday: "short" })}
                      </span>
                      <span className="text-lg font-black mt-0.5">{day.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {selectedDate.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-6">
                  {selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                    ? "No atendemos fines de semana."
                    : "No hay horarios disponibles para este día."}
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => {
                    const isSelected = slot === selectedSlot;
                    const time = new Date(slot).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          isSelected ? "text-white" : "bg-zinc-50 text-zinc-700 hover:bg-violet-50 hover:text-[#A78BFA]"
                        }`}
                        style={isSelected ? { background: G } : {}}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setStep("confirm")}
              disabled={!selectedSlot}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: G }}
            >
              Continuar <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP: confirm ── */}
        {step === "confirm" && (
          <div>
            <button onClick={() => setStep("datetime")} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Atrás
            </button>
            <p className="text-sm text-zinc-400 mb-1">Paso 4 de 4</p>
            <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-2">Confirma tu cita</h1>
            <p className="text-zinc-500 text-sm mb-8">Revisa los detalles antes de confirmar.</p>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6 space-y-4">
              <div className="flex items-center gap-4">
                <Image
                  src={selectedDoctor?.photo ?? ""}
                  alt={selectedDoctor?.name ?? ""}
                  width={56}
                  height={56}
                  className="rounded-2xl object-cover"
                />
                <div>
                  <p className="font-bold text-[#0B1D35]">{selectedDoctor?.name}</p>
                  <p className="text-xs text-zinc-500">{selectedDoctor?.cmp}</p>
                </div>
              </div>

              <div className="h-px bg-zinc-50" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Especialidad</p>
                  <p className="font-semibold text-[#0B1D35]">
                    {selectedVertical?.icon} {selectedVertical?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Duración</p>
                  <p className="font-semibold text-[#0B1D35]">60 minutos</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fecha</p>
                  <p className="font-semibold text-[#0B1D35]">
                    {new Date(selectedSlot).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Hora</p>
                  <p className="font-semibold text-[#0B1D35]">
                    {new Date(selectedSlot).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })} (Lima)
                  </p>
                </div>
              </div>

              <div className="h-px bg-zinc-50" />

              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Video className="w-4 h-4 text-[#A78BFA]" />
                Recibirás el link de Google Meet por email al confirmar.
              </div>
            </div>

            {!user && (
              <div className="bg-white rounded-2xl border border-violet-100 p-6 mb-6">
                <div className="flex items-center gap-2.5 mb-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(167,139,250,0.12)" }}
                  >
                    <User className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </div>
                  <h2 className="font-bold text-[#0B1D35] text-sm">
                    {showLogin ? "Inicia sesión para confirmar" : "Crea tu cuenta para confirmar"}
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mb-5 pl-9">
                  {showLogin
                    ? "Accede a tu cuenta Organnical."
                    : "Toma 30 segundos · Recibirás tu cita y acceso a tu historial médico."}
                </p>

                <div className="space-y-3">
                  {!showLogin && (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                      <input
                        type="text"
                        placeholder="Nombre completo"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300" />
                    <input
                      type="password"
                      placeholder={showLogin ? "Contraseña" : "Crea una contraseña"}
                      value={guestPassword}
                      onChange={(e) => setGuestPassword(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
                    />
                  </div>
                </div>

                <p className="text-xs text-zinc-400 mt-3">
                  {showLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                  <button
                    type="button"
                    onClick={() => { setShowLogin(!showLogin); setError(null); }}
                    className="text-[#A78BFA] font-semibold hover:underline"
                  >
                    {showLogin ? "Crear cuenta gratis" : "Inicia sesión"}
                  </button>
                </p>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: G }}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {user ? "Creando cita..." : "Creando cuenta y cita..."}</>
              ) : (
                <>{user ? "Confirmar cita" : showLogin ? "Iniciar sesión y confirmar" : "Crear cuenta y confirmar"} <CheckCircle className="w-4 h-4" /></>
              )}
            </button>
            <p className="text-center text-xs text-zinc-400 mt-3">
              Recibirás confirmación e invitación de Google Calendar por email.
            </p>
          </div>
        )}

        {/* ── STEP: done ── */}
        {step === "done" && result && (
          <div className="text-center py-10">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(167,139,250,0.15)" }}
            >
              <CheckCircle className="w-10 h-10 text-[#A78BFA]" />
            </div>
            <h1 className="font-display text-3xl font-black text-[#0B1D35] mb-3">¡Cita confirmada!</h1>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Te enviamos una invitación de Google Calendar con los detalles y el link de la videollamada.
            </p>

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 max-w-sm mx-auto mb-8 text-left space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Resumen</p>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedVertical?.icon}</span>
                  <span className="font-semibold text-[#0B1D35]">{selectedVertical?.label}</span>
                </div>
                <p className="text-zinc-600">{selectedDoctor?.name}</p>
                <p className="text-zinc-600">
                  {new Date(selectedSlot).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                  {" · "}
                  {new Date(selectedSlot).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {result.meetLink && (
                <a
                  href={result.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
                  style={{ background: G }}
                >
                  <Video className="w-4 h-4" /> Abrir Google Meet
                </a>
              )}
              <Link
                href="/dashboard/paciente/citas"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-zinc-700 border border-zinc-200 hover:border-[#A78BFA] transition-all"
              >
                <Calendar className="w-4 h-4" /> Ver mis citas
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

