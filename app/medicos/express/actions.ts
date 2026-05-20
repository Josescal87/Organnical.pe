"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function adminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
}

export async function markContacted(id: string) {
  await adminClient()
    .schema("medical")
    .from("express_consultations")
    .update({ status: "contacted", contacted_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/medicos/express");
}

export async function markCompleted(id: string, notes: string) {
  await adminClient()
    .schema("medical")
    .from("express_consultations")
    .update({ status: "completed", completed_at: new Date().toISOString(), notes_doctor: notes || null })
    .eq("id", id);
  revalidatePath("/medicos/express");
}
