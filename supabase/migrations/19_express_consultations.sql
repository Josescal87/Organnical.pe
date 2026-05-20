-- Consultas Express S/30 — tabla para el flujo de consulta rápida por WhatsApp
-- Permite pacientes sin autenticación previa (patient_id puede ser NULL para guests)

create table if not exists medical.express_consultations (
  id                     uuid          primary key default gen_random_uuid(),
  patient_id             uuid          references auth.users(id),          -- NULL si guest
  doctor_id              uuid          references medical.profiles(id),
  patient_phone          text          not null,
  patient_name           text          not null,
  patient_document_type  text          not null default 'DNI',
  patient_document_number text         not null default '',
  birth_date             date,
  motivo                 text,
  preferred_time         text          not null check (preferred_time in ('asap','today','tomorrow')),
  consents_accepted_at   timestamptz   not null,
  consents_snapshot      jsonb         not null,
  mp_payment_id          text,
  amount_paid            numeric(10,2) not null default 30,
  status                 text          not null default 'paid'
                           check (status in ('paid','contacted','completed','refunded','cancelled')),
  contacted_at           timestamptz,
  completed_at           timestamptz,
  notes_doctor           text,
  created_at             timestamptz   default now(),
  updated_at             timestamptz   default now()
);

create index if not exists idx_express_status_created
  on medical.express_consultations (status, created_at desc);

create index if not exists idx_express_doctor_status
  on medical.express_consultations (doctor_id, status);

-- RLS
alter table medical.express_consultations enable row level security;

-- Paciente autenticado: solo ve las suyas
create policy "express_select_own"
  on medical.express_consultations for select
  using (patient_id = auth.uid());

-- La escritura y lectura para doctor/admin se hace con el service-role client (bypasses RLS)
