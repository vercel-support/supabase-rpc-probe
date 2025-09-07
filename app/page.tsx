"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Loader2, Zap } from "lucide-react"

interface ProbeResult {
  ok?: boolean
  status?: number
  supabaseHost?: string
  error?: string
  details?: string
  result?: any
}

export default function SupabaseProbe() {
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null)
  const [rpcResult, setRpcResult] = useState<ProbeResult | null>(null)
  const [sessionId, setSessionId] = useState("test-session-123")
  const [isProbing, setIsProbing] = useState(false)
  const [isRpcTesting, setIsRpcTesting] = useState(false)

  const runProbe = async () => {
    setIsProbing(true)
    setProbeResult(null)

    try {
      const response = await fetch("/api/probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      const result = await response.json()
      setProbeResult(result)
    } catch (error) {
      setProbeResult({
        error: "Failed to call probe endpoint",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsProbing(false)
    }
  }

  const runRpcTest = async () => {
    setIsRpcTesting(true)
    setRpcResult(null)

    try {
      const response = await fetch("/api/rpc-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      const result = await response.json()
      setRpcResult(result)
    } catch (error) {
      setRpcResult({
        error: "Failed to call RPC test endpoint",
        details: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsRpcTesting(false)
    }
  }

  const ResultCard = ({
    title,
    result,
    icon,
  }: { title: string; result: ProbeResult | null; icon: React.ReactNode }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>
          {title === "Connectivity Probe"
            ? "Tests basic HTTP connectivity to Supabase REST API"
            : "Tests probe + actual RPC function call"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {result.error ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Failed
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Success
                </Badge>
              )}
              {result.supabaseHost && <Badge variant="outline">{result.supabaseHost}</Badge>}
            </div>

            <div className="bg-muted p-3 rounded-md font-mono text-sm">
              <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">No results yet. Click the button above to test.</div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-balance">Supabase RPC Probe</h1>
          <p className="text-muted-foreground text-balance">
            Test Supabase connectivity and RPC function calls with detailed diagnostics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Test Controls
              </CardTitle>
              <CardDescription>Run connectivity tests and configure parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionId">Session ID (for RPC test)</Label>
                <Input
                  id="sessionId"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  placeholder="Enter session ID"
                />
              </div>

              <div className="space-y-3">
                <Button onClick={runProbe} disabled={isProbing} className="w-full">
                  {isProbing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connectivity...
                    </>
                  ) : (
                    "Run Connectivity Probe"
                  )}
                </Button>

                <Button
                  onClick={runRpcTest}
                  disabled={isRpcTesting}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {isRpcTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing RPC Call...
                    </>
                  ) : (
                    "Run RPC Test"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Status</CardTitle>
              <CardDescription>Current configuration and setup status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supabase Integration:</span>
                  <Badge variant="outline">Not Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment Variables:</span>
                  <Badge variant="outline">Not Set</Badge>
                </div>
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground">
                    To test with real Supabase, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables to
                    your project.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ResultCard title="Connectivity Probe" result={probeResult} icon={<Zap className="h-5 w-5" />} />

          <ResultCard title="RPC Function Test" result={rpcResult} icon={<CheckCircle className="h-5 w-5" />} />
        </div>
      </div>
    </div>
  )
}
