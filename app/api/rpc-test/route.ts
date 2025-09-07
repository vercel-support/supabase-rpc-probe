import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()
  const SUPABASE_URL = process.env.SUPABASE_URL
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Handle missing environment variables gracefully
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error: "Supabase configuration missing",
        details: `Missing environment variables: ${!SUPABASE_URL ? "SUPABASE_URL " : ""}${!SERVICE_ROLE_KEY ? "SUPABASE_SERVICE_ROLE_KEY" : ""}`,
        supabaseHost: SUPABASE_URL ? new URL(SUPABASE_URL).host : "Not configured",
      },
      { status: 500 },
    )
  }

  const SUPABASE_HOST = new URL(SUPABASE_URL).host

  // First, run the connectivity probe
  try {
    const probe = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/`, {
      method: "HEAD",
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
    // Import Supabase client dynamically to handle missing dependency gracefully
    let createClient
    try {
      const supabaseModule = await import("@supabase/supabase-js")
      createClient = supabaseModule.createClient
    } catch (importError) {
      throw new Error("Supabase client library not available. Install @supabase/supabase-js to test RPC calls.")
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data, error } = await supabase.rpc("calibrate_session_v1", {
      p_session_id: sessionId,
    })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      result: data,
      supabaseHost: SUPABASE_HOST,
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
