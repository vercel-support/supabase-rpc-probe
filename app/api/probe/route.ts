import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
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

  try {
    const supabase = await createClient()

    // Test basic connectivity with proper auth headers
    const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/`, {
      method: "HEAD",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
    })

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      supabaseHost: SUPABASE_HOST,
      message: response.ok ? "Supabase connectivity successful" : "Supabase connectivity failed",
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
