import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json(
      {
        error: "Supabase configuration missing",
        details: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required",
        supabaseHost: "Not configured",
      },
      { status: 500 },
    )
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_HOST = new URL(SUPABASE_URL).host

  // First, run the connectivity probe
  try {
    const probe = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })
    if (!probe.ok) throw new Error(`Probe HTTP status: ${probe.status}`)
  } catch (e) {
    return NextResponse.json(
      {
        error: "Base connectivity probe to Supabase failed",
        details: String(e?.message || e),
        supabaseHost: SUPABASE_HOST,
      },
      { status: 500 },
    )
  }

  // Then attempt the RPC call
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("calibrate_session_v1", {
      p_session_id: sessionId,
    })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      result: data,
      supabaseHost: SUPABASE_HOST,
      message: "RPC call successful",
    })
  } catch (e) {
    return NextResponse.json(
      {
        error: "Supabase RPC call failed after successful probe",
        details: String(e?.message || e),
        supabaseHost: SUPABASE_HOST,
      },
      { status: 500 },
    )
  }
}
