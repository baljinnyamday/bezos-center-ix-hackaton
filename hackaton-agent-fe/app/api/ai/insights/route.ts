import { type NextRequest, NextResponse } from "next/server"
import { aiEngine } from "@/lib/ai/decision-engine"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Fetch comprehensive data for insights
    const [demandOrders, productionMetrics, allocations, externalData] = await Promise.all([
      supabase.from("demand_orders").select("*"),
      supabase.from("production_metrics").select("*").order("recorded_at", { ascending: false }).limit(20),
      supabase.from("supply_allocations").select("*"),
      supabase.from("external_data_cache").select("*").order("created_at", { ascending: false }).limit(10),
    ])

    const data = {
      demandOrders: demandOrders.data || [],
      productionMetrics: productionMetrics.data || [],
      allocations: allocations.data || [],
      externalData: externalData.data || [],
    }

    const insights = await aiEngine.generateInsights(data)

    return NextResponse.json(insights)
  } catch (error) {
    console.error("AI Insights API Error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
