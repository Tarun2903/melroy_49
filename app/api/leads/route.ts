import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

interface LeadPayload {
  name: string;
  phone: string;
  email: string;
  source: string;
  page: string;
}

function isValidLead(body: unknown): body is LeadPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    b.name.trim().length > 0 &&
    typeof b.phone === "string" &&
    b.phone.trim().length > 0 &&
    typeof b.email === "string" &&
    /\S+@\S+\.\S+/.test(b.email)
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!isValidLead(body)) {
    return NextResponse.json({ error: "Missing or invalid name/phone/email" }, { status: 422 });
  }

  const lead = {
    name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email.trim(),
    source: typeof body.source === "string" ? body.source : "",
    page: typeof body.page === "string" ? body.page : "",
    submitted_at: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("leads").insert([lead]);
    if (error) {
      console.error("Supabase insert failed:", error.message);
      return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
    }
  } else {
    // Placeholder until Supabase is connected — at least log it server-side
    // so submissions aren't silently lost during development.
    console.log("Lead received (Supabase not connected yet):", lead);
  }

  return NextResponse.json({ ok: true });
}
