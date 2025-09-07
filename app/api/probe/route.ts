import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.SUPABASE_URL

  // Handle missing environment variables gracefully
  if (!SUPABASE_URL) {
    return NextResponse.json(
      {
        error: "Supabase configuration missing",
        details: "SUPABASE_URL environment variable is not set",
        supabaseHost: "Not configured",
      },
      { status: 500 },
    )
  }

  const SUPABASE_HOST = new URL(SUPABASE_URL).host

  try {
    const r = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/`, {
      method: "HEAD",
    })

    return NextResponse.json({
      ok: r.ok,
      status: r.status,
      supabaseHost: SUPABASE_HOST,
    })
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
}
