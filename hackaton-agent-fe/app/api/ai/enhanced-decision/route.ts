import { type NextRequest, NextResponse } from "next/server"
import { enhancedAIEngine } from "@/lib/ai/enhanced-decision-engine"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Fetch current data from database
    const [demandOrders, productionMetrics, currentAllocations] = await Promise.all([
      supabase.from("demand_orders").select(`
        *,
        company:companies(*)
      `),
      supabase.from("production_metrics").select("*").order("recorded_at", { ascending: false }).limit(10),
      supabase.from("supply_allocations").select(`
        *,
        demand_order:demand_orders(*)
      `),
    ])

    if (demandOrders.error || productionMetrics.error || currentAllocations.error) {
      throw new Error("Failed to fetch data from database")
    }

    // Generate enhanced AI decision with user guidance
    const decision = await enhancedAIEngine.makeEnhancedSupplyDecision({
      demandOrders: demandOrders.data || [],
      productionMetrics: productionMetrics.data || [],
      currentAllocations: currentAllocations.data || [],
    })

    return NextResponse.json(decision)
  } catch (error) {
    console.error("Enhanced AI Decision API Error:", error)
    return NextResponse.json({ error: "Failed to generate enhanced AI decision" }, { status: 500 })
  }
}
