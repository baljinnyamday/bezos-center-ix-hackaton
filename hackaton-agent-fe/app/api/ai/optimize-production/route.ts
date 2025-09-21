import { type NextRequest, NextResponse } from "next/server"
import { aiEngine } from "@/lib/ai/decision-engine"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Fetch production and demand data
    const [productionMetrics, demandOrders] = await Promise.all([
      supabase.from("production_metrics").select("*").order("recorded_at", { ascending: false }).limit(10),
      supabase.from("demand_orders").select("*").eq("status", "pending"),
    ])

    if (productionMetrics.error || demandOrders.error) {
      throw new Error("Failed to fetch data from database")
    }

    const optimization = await aiEngine.optimizeProduction(productionMetrics.data || [], demandOrders.data || [])

    return NextResponse.json(optimization)
  } catch (error) {
    console.error("Production Optimization API Error:", error)
    return NextResponse.json({ error: "Failed to optimize production" }, { status: 500 })
  }
}
