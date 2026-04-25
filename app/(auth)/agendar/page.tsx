"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import {
  ArrowLeft, ArrowRight, CheckCircle, Calendar,
  Clock, Video, Loader2, ChevronLeft, ChevronRight,
  User, Mail, Lock, CreditCard,
} from "lucide-react";
import CalendarButtons from "@/components/CalendarButtons";

const G = "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)";

/* ─── Constants ─────────────────────────────────────────────── */

const VERTICALS = [
  { id: "sleep",         label: "Sueño",          icon: "🌙", desc: "Insomnio, apnea y ritmo circadiano" },
  { id: "pain",          label: "Dolor Crónico",  icon: "🦴", desc: "Fibromialgia, neuropático y musculoesquelético" },
  { id: "anxiety",       label: "Ansiedad",        icon: "🧠", desc: "Estrés crónico y bienestar emocional" },
  { id: "womens_health", label: "Salud Femenina",  icon: "🌸", desc: "SPM, menopausia y equilibrio hormonal" },
];

const DEFAULT_HOURS = [9, 9.5, 10, 10.5, 11, 14, 14.5, 15, 15.5, 16, 16.5, 17];

type WeeklySchedule = Record<string, number[]>;

function generateSlots(date: Date, weeklySchedule: WeeklySchedule, bookedISO: string[]): string[] {
  const dayKey = String(date.getDay()); // "0"=Dom … "6"=Sáb
  const availableHours = weeklySchedule[dayKey];
  if (!availableHours || availableHours.length === 0) return [];

  return availableHours.map((h) => {
    const slot = new Date(date);
    const hour = Math.floor(h);
    const min  = h % 1 === 0.5 ? 30 : 0;
    slot.setHours(hour, min, 0, 0);
    return slot.toISOString();
  }).filter((iso) => {
    const slotDate = new Date(iso);
    return !bookedISO.some((b) => {
      const booked = new Date(b);
      return booked.getHours()   === slotDate.getHours() &&
             booked.getMinutes() === slotDate.getMinutes() &&
             booked.toDateString() === slotDate.toDateString();
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

/* ─── Types ──────────────────────────────────────────────────── */

type Step = "vertical" | "doctor" | "datetime" | "confirm" | "payment" | "done";

interface DoctorRow {
  id: string;
  full_name: string | null;
  cmp: string | null;
  photo_url: string | null;
  specialty_label: string | null;
  verticals: string[];
  rating: number;
  reviews_count: number;
  weekly_schedule: WeeklySchedule | null;
}

/* ─── Component ─────────────────────────────────────────────── */

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
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ meetLink: string | null; calendarLink: string } | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);

  // Inline auth state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [pricing, setPricing] = useState<{ precioBase: number; precioFinal: number; descuento: number; promoLabel: string }>({ precioBase: 60, precioFinal: 60, descuento: 0, promoLabel: "" });

  // Sessions + payment state
  const [sessions, setSessions] = useState(1);
  const [precioOverride, setPrecioOverride] = useState<number | null>(null);
  const mpInitialized = useRef(false);
  const [paymentResult, setPaymentResult] = useState<{ appointmentIds: string[]; meetLinks: (string | null)[] } | null>(null);
  const [combos, setCombos] = useState<{ sesiones: number; precio: number; label: string | null }[]>([
    { sesiones: 1, precio: 60,  label: null },
    { sesiones: 3, precio: 170, label: "Ahorra S/ 10" },
    { sesiones: 5, precio: 270, label: "Ahorra S/ 30" },
  ]);

  // Inline profile + consent gate state
  const [authedUserId, setAuthedUserId] = useState<string | null>(null);
  const [confirmSubStep, setConfirmSubStep] = useState<"auth" | "profile" | "consents">("auth");
  const [docId, setDocId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [pendingConsents, setPendingConsents] = useState<string[]>([]);
  const [acceptedConsents, setAcceptedConsents] = useState<Set<string>>(new Set());

  const CONSENT_LABELS: Record<string, string> = {
    general_treatment: "Consentimiento de tratamiento médico general",
    telemedicine: "Consentimiento para consulta por telemedicina",
    cannabis_use: "Consentimiento de uso de cannabis medicinal (si aplica)",
    data_processing: "Consentimiento de tratamiento de datos personales de salud",
  };

  // Initialize MP SDK once on mount
  useEffect(() => {
    if (!mpInitialized.current && process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: "es-PE" });
      mpInitialized.current = true;
    }
  }, []);

  // Load user session + doctors + pricing from DB
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email! });
    });
    supabase
      .schema("medical")
      .from("profiles")
      .select("id, full_name, cmp, photo_url, specialty_label, verticals, rating, reviews_count, weekly_schedule")
      .eq("role", "doctor")
      .then(({ data }) => {
        if (data) setDoctors(data as DoctorRow[]);
        setLoadingDoctors(false);
      });
    fetch("/api/consulta-config")
      .then((r) => r.json())
      .then((d) => setPricing(d))
      .catch(() => {});
    fetch("/api/consulta-combos")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d) && d.length) setCombos(d); })
      .catch(() => {});
    fetch("/api/precio-override")
      .then((r) => r.json())
      .then((d) => { if (d.precio_override != null) setPrecioOverride(d.precio_override); })
      .catch(() => {});
  }, []);

  const selectedCombo = combos.find((c) => c.sesiones === sessions) ?? combos[0];
  const comboPrice    = precioOverride ?? (selectedCombo?.precio ?? pricing.precioFinal * sessions);
  const pricePerSession = precioOverride ?? (sessions > 0 ? comboPrice / sessions : pricing.precioFinal);


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

  const filteredDoctors = doctors.filter((d) =>
    !vertical || d.verticals.includes(vertical)
  );

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const selectedVertical = VERTICALS.find((v) => v.id === vertical);
  const doctorSchedule: WeeklySchedule = selectedDoctor?.weekly_schedule
    ?? { "1": DEFAULT_HOURS, "2": DEFAULT_HOURS, "3": DEFAULT_HOURS, "4": DEFAULT_HOURS, "5": DEFAULT_HOURS };
  const slots = generateSlots(selectedDate, doctorSchedule, bookedSlots);

  async function checkAndAdvance(userId: string) {
    const supabase = createClient();
    const REQUIRED = ["general_treatment", "telemedicine", "cannabis_use", "data_processing"];

    const [profileRes, consentsRes] = await Promise.all([
      supabase.schema("medical").from("profiles").select("document_id, birth_date").eq("id", userId).single(),
      supabase.schema("medical").from("consent_records").select("consent_type").eq("patient_id", userId).eq("accepted", true),
    ]);

    const profile = profileRes.data;
    if (!profile?.document_id || !profile?.birth_date) {
      setAuthedUserId(userId);
      setConfirmSubStep("profile");
      setSubmitting(false);
      return;
    }

    const accepted = new Set((consentsRes.data ?? []).map((c: { consent_type: string }) => c.consent_type));
    const missing = REQUIRED.filter((t) => !accepted.has(t));
    if (missing.length > 0) {
      setAuthedUserId(userId);
      setPendingConsents(missing);
      setConfirmSubStep("consents");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setStep("payment");
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    if (!user) {
      if (!showLogin) {
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

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { setSubmitting(false); return; }
    await checkAndAdvance(authUser.id);
  }

  async function handleSaveProfile() {
    if (!docId.trim() || !birthDate) {
      setError("Completa tu DNI y fecha de nacimiento para continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.schema("medical").from("profiles")
      .upsert({ id: authedUserId, document_id: docId.trim(), birth_date: birthDate }, { onConflict: "id" });
    if (error) { setError(error.message); setSubmitting(false); return; }
    await checkAndAdvance(authedUserId!);
  }

  async function handleSaveConsents() {
    if (pendingConsents.some((c) => !acceptedConsents.has(c))) {
      setError("Debes aceptar todos los consentimientos para continuar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const records = pendingConsents.map((consent_type) => ({
      patient_id: authedUserId,
      consent_type,
      accepted: true,
      accepted_at: new Date().toISOString(),
      version: "1.0",
    }));
    const { error } = await supabase.schema("medical").from("consent_records").insert(records);
    if (error) { setError(error.message); setSubmitting(false); return; }
    setSubmitting(false);
    setStep("payment");
  }

  /* ── WEEK navigation ── */
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  /* ─── Render ─────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-color.png" alt="Organnical" width={130} height={32} />
          </Link>
          {step !== "done" && (
            <div className="flex items-center gap-1.5">
              {(["vertical", "doctor", "datetime", "confirm", "payment"] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    ["vertical", "doctor", "datetime", "confirm", "payment"].indexOf(step) >= i
                      ? "w-8"
                      : "w-4 bg-zinc-200"
                  }`}
                  style={["vertical", "doctor", "datetime", "confirm", "payment"].indexOf(step) >= i ? { background: G } : {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">

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

            {loadingDoctors ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              </div>
            ) : filteredDoctors.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-12">
                No hay médicos disponibles para esta especialidad en este momento.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredDoctors.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => { setDoctorId(doc.id); setStep("datetime"); }}
                    className="w-full text-left bg-white rounded-2xl border border-zinc-100 hover:border-violet-300 hover:shadow-md transition-all p-5 flex items-center gap-4 group"
                  >
                    {doc.photo_url ? (
                      <Image
                        src={doc.photo_url}
                        alt={doc.full_name ?? ""}
                        width={60}
                        height={60}
                        className="rounded-2xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-2xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0B1D35] group-hover:text-[#A78BFA] transition-colors">{doc.full_name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {doc.specialty_label ?? "Medicina Integrativa"}
                        {doc.cmp ? ` · ${doc.cmp}` : ""}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {doc.rating > 0 && (
                          <span className="text-xs font-semibold text-amber-500">★ {doc.rating.toFixed(1)}</span>
                        )}
                        {doc.reviews_count > 0 && (
                          <span className="text-xs text-zinc-400">{doc.reviews_count} reseñas</span>
                        )}
                        <span className="text-xs text-emerald-500 font-medium">● Disponible</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#A78BFA] transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
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
            <p className="text-zinc-500 text-sm mb-6">Horario de atención: lunes a viernes (Lima).</p>

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

              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                {weekDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isPast = day < addDays(new Date(), 0);
                  const dayKey = String(day.getDay());
                  const isUnavailableDay = !(doctorSchedule[dayKey]?.length > 0);
                  const isDisabled = isPast || isUnavailableDay;
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => { if (!isDisabled) { setSelectedDate(day); setSelectedSlot(""); } }}
                      disabled={isDisabled}
                      className={`flex flex-col items-center py-2 sm:py-2.5 rounded-xl transition-all ${
                        isDisabled
                          ? "opacity-30 cursor-not-allowed"
                          : isSelected
                          ? "text-white font-bold"
                          : "hover:bg-zinc-50 text-zinc-600"
                      }`}
                      style={isSelected ? { background: G } : {}}
                    >
                      <span className="text-[9px] sm:text-[10px] uppercase font-medium opacity-70">
                        {day.toLocaleDateString("es-PE", { weekday: "short" }).replace(".", "")}
                      </span>
                      <span className="text-base sm:text-lg font-black mt-0.5">{day.getDate()}</span>
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
                  No hay horarios disponibles para este día.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
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

            <div className="bg-white rounded-2xl border border-zinc-100 p-4 sm:p-6 mb-6 space-y-4">
              <div className="flex items-center gap-4">
                {selectedDoctor?.photo_url ? (
                  <Image
                    src={selectedDoctor.photo_url}
                    alt={selectedDoctor.full_name ?? ""}
                    width={56}
                    height={56}
                    className="rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-zinc-400" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#0B1D35]">{selectedDoctor?.full_name}</p>
                  <p className="text-xs text-zinc-500">{selectedDoctor?.cmp}</p>
                </div>
              </div>

              <div className="h-px bg-zinc-50" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Especialidad</p>
                  <p className="font-semibold text-[#0B1D35]">
                    {selectedVertical?.icon} {selectedVertical?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Duración</p>
                  <p className="font-semibold text-[#0B1D35]">25 minutos</p>
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

              <div className="h-px bg-zinc-50" />

              <div>
                <p className="text-xs text-zinc-400 mb-2">Número de sesiones</p>
                <div className="flex flex-wrap gap-2">
                  {combos.map((c) => (
                    <button
                      key={c.sesiones}
                      onClick={() => setSessions(c.sesiones)}
                      className={`flex-1 min-w-[80px] rounded-xl py-2.5 text-sm font-bold border transition-all ${
                        sessions === c.sesiones
                          ? "text-white border-transparent"
                          : "border-zinc-200 text-zinc-600 hover:border-violet-300"
                      }`}
                      style={sessions === c.sesiones ? { background: G } : {}}
                    >
                      {c.sesiones === 1 ? "1 sesión" : `${c.sesiones} sesiones`}
                    </button>
                  ))}
                </div>
                {sessions > 1 && (
                  <p className="text-xs text-zinc-400 mt-2">Las sesiones se agendan cada 7 días a partir de la fecha seleccionada.</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">Total a pagar</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-black text-[#0B1D35]">S/ {comboPrice.toFixed(2)}</p>
                    {sessions > 1 && (
                      <p className="text-xs text-zinc-400 line-through">S/ {(pricing.precioFinal * sessions).toFixed(2)}</p>
                    )}
                  </div>
                  {selectedCombo?.label && (
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">{selectedCombo.label}</p>
                  )}
                  {sessions > 1 && (
                    <p className="text-xs text-zinc-400 mt-0.5">S/ {pricePerSession.toFixed(2)} por sesión</p>
                  )}
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-600">Teleconsulta 25 min</span>
              </div>
            </div>

            {!user && (
              <div className="bg-white rounded-2xl border border-violet-100 p-4 sm:p-6 mb-6">
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

            {/* ── Inline profile gate ── */}
            {confirmSubStep === "profile" && (
              <div className="bg-white rounded-2xl border border-violet-100 p-6 mb-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}>
                    <User className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0B1D35] text-sm">Un dato más antes de pagar</h2>
                    <p className="text-xs text-zinc-400">Lo necesitamos para emitir tu receta médica.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-1 block">DNI / Documento de identidad</label>
                    <input
                      type="text"
                      placeholder="Ej. 12345678"
                      value={docId}
                      onChange={(e) => setDocId(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-1 block">Fecha de nacimiento</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Inline consent gate ── */}
            {confirmSubStep === "consents" && (
              <div className="bg-white rounded-2xl border border-violet-100 p-6 mb-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.12)" }}>
                    <CheckCircle className="w-3.5 h-3.5 text-[#A78BFA]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#0B1D35] text-sm">Consentimientos médicos</h2>
                    <p className="text-xs text-zinc-400">Requeridos por la normativa MINSA para teleconsulta.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {pendingConsents.map((key) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedConsents.has(key)}
                        onChange={(e) => {
                          const next = new Set(acceptedConsents);
                          if (e.target.checked) next.add(key); else next.delete(key);
                          setAcceptedConsents(next);
                        }}
                        className="mt-0.5 w-4 h-4 rounded accent-violet-500 flex-shrink-0"
                      />
                      <span className="text-sm text-zinc-600 group-hover:text-zinc-800 transition-colors leading-snug">
                        {CONSENT_LABELS[key] ?? key}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-4 text-sm text-rose-600">
                {error}
              </div>
            )}

            {confirmSubStep === "auth" && (
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: G }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> {user ? "Proceder al pago" : showLogin ? "Iniciar sesión y pagar" : "Crear cuenta y pagar"}</>
                )}
              </button>
            )}

            {confirmSubStep === "profile" && (
              <button
                onClick={handleSaveProfile}
                disabled={submitting}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: G }}
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><ArrowRight className="w-4 h-4" /> Continuar al pago</>}
              </button>
            )}

            {confirmSubStep === "consents" && (
              <button
                onClick={handleSaveConsents}
                disabled={submitting || pendingConsents.some((c) => !acceptedConsents.has(c))}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: G }}
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><CreditCard className="w-4 h-4" /> Confirmar y pagar</>}
              </button>
            )}

            <p className="text-center text-xs text-zinc-400 mt-3">
              Pagarás S/ {comboPrice.toFixed(2)} con Mercado Pago de forma segura.
            </p>
          </div>
        )}

        {/* ── STEP: payment ── */}
        {step === "payment" && (
          <div>
            <button onClick={() => setStep("confirm")} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-6 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Atrás
            </button>
            <h1 className="font-display text-2xl font-black text-[#0B1D35] mb-8">Finalizar compra</h1>

            <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
              {/* Resumen de la cita */}
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl border border-zinc-100 p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Calendar className="w-4 h-4 text-[#A78BFA]" />
                    <h2 className="font-bold text-sm text-[#0B1D35]">Resumen del pedido</h2>
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: sessions }).map((_, i) => {
                      const sessionDate = new Date(new Date(selectedSlot).getTime() + i * 7 * 24 * 60 * 60 * 1000);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.10)" }}>
                            <Video className="w-4 h-4 text-[#A78BFA]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0B1D35] truncate">
                              {selectedVertical?.icon} {selectedVertical?.label}{sessions > 1 ? ` — Sesión ${i + 1}` : ""}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {sessionDate.toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short" })}
                              {" · "}
                              {sessionDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                              {" · 25 min"}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-[#0B1D35] flex-shrink-0">S/ {pricePerSession.toFixed(2)}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-zinc-100 mt-5 pt-4 flex justify-between items-center">
                    <div>
                      <span className="text-sm text-zinc-500">Total</span>
                      {selectedCombo?.label && (
                        <p className="text-xs text-emerald-600 font-semibold">{selectedCombo.label}</p>
                      )}
                    </div>
                    <span className="font-black text-lg text-[#0B1D35]">S/ {comboPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Brick de pago */}
              <div className="order-1 lg:order-2">
                {process.env.NODE_ENV === "development" ? (
                  <div className="bg-white rounded-2xl border border-amber-200 p-8 flex flex-col items-center gap-4">
                    <p className="text-sm text-amber-700 font-semibold text-center">Modo testing — pago omitido</p>
                    <button
                      onClick={async () => {
                        const res = await fetch("/api/mercadopago/process-appointment", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            doctorId,
                            specialty:   vertical,
                            slotStart:   selectedSlot,
                            sessions,
                            precioFinal: pricePerSession,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) { alert(data.error ?? "Error"); return; }
                        setPaymentResult({ appointmentIds: data.appointmentIds, meetLinks: data.meetLinks });
                        setStep("done");
                      }}
                      className="w-full rounded-xl px-6 py-3 text-sm font-semibold text-white"
                      style={{ background: "linear-gradient(135deg, #F472B6 0%, #A78BFA 50%, #38BDF8 100%)" }}
                    >
                      Confirmar cita (sin pago)
                    </button>
                  </div>
                ) : (
                  <>
                    <Payment
                        initialization={{ amount: comboPrice }}
                        customization={{
                          paymentMethods: { creditCard: "all", debitCard: "all" },
                          visual: {
                            style: {
                              customVariables: {
                                baseColor: "#A78BFA",
                                baseColorFirstVariant: "#F472B6",
                                baseColorSecondVariant: "#38BDF8",
                              },
                            },
                          },
                        }}
                        onSubmit={async ({ formData }) => {
                          const res = await fetch("/api/mercadopago/process-appointment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              ...formData,
                              doctorId,
                              specialty:   vertical,
                              slotStart:   selectedSlot,
                              sessions,
                              precioFinal: pricePerSession,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error ?? "Error al procesar el pago");
                          if (data.status !== "approved") throw new Error("Pago no aprobado");
                          setPaymentResult({ appointmentIds: data.appointmentIds, meetLinks: data.meetLinks });
                          setStep("done");
                        }}
                        onError={(err) => console.error("MP Brick error:", err)}
                      />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP: done ── */}
        {step === "done" && paymentResult && (
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

            <div className="bg-white rounded-2xl border border-zinc-100 p-6 max-w-sm mx-auto mb-6 text-left space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Resumen</p>
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{selectedVertical?.icon}</span>
                  <span className="font-semibold text-[#0B1D35]">{selectedVertical?.label}</span>
                </div>
                <p className="text-zinc-600">{selectedDoctor?.full_name}</p>
                <p className="text-zinc-600">
                  {new Date(selectedSlot).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
                  {" · "}
                  {new Date(selectedSlot).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {/* Calendar buttons */}
              <div className="pt-2 border-t border-zinc-100">
                <CalendarButtons
                  event={{
                    title: `Teleconsulta Organnical — ${selectedVertical?.label ?? ""}`,
                    description: [
                      `Consulta de ${selectedVertical?.label ?? ""}`,
                      `Médico: ${selectedDoctor?.full_name ?? ""}`,
                      paymentResult.meetLinks[0] ? `\nLink: ${paymentResult.meetLinks[0]}` : "",
                      `\nSoporte: reservas@organnical.com`,
                    ].join("\n"),
                    startISO: selectedSlot,
                    endISO:   new Date(new Date(selectedSlot).getTime() + 25 * 60 * 1000).toISOString(),
                    location: paymentResult.meetLinks[0] ?? undefined,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {paymentResult.meetLinks[0] && (
                <a
                  href={paymentResult.meetLinks[0]}
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
