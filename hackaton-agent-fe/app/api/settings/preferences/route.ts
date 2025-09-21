import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: settings, error } = await supabase.from("ai_settings").select("*").single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
    }

    // Return default settings if none exist
    const defaultSettings = {
      preferences: [
        { id: "weather", enabled: true },
        { id: "market", enabled: true },
        { id: "news", enabled: false },
        { id: "location", enabled: true },
      ],
      aiSettings: {
        useWeatherData: true,
        useMarketData: true,
        useNewsData: false,
        useTradingData: true,
        customInstructions: "",
        riskTolerance: "medium",
        decisionFrequency: 30,
      },
    }

    return NextResponse.json(settings || defaultSettings)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { preferences, aiSettings } = body

    const supabase = createServerClient()

    const { data: setting, error } = await supabase
      .from("ai_settings")
      .upsert([
        {
          id: 1, // Single settings record
          preferences,
          ai_settings: aiSettings,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
    }

    return NextResponse.json(setting)
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
