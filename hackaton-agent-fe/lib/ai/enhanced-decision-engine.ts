import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// Enhanced schema that includes user guidance
const enhancedSupplyDecisionSchema = z.object({
  allocations: z.array(
    z.object({
      demandOrderId: z.string(),
      productionLine: z.string(),
      allocatedQuantity: z.number(),
      priorityScore: z.number().min(0).max(100),
      reasoning: z.string(),
      userGuidanceInfluence: z.string().optional(),
    }),
  ),
  productionAdjustments: z.array(
    z.object({
      productionLine: z.string(),
      recommendedRate: z.number(),
      reasoning: z.string(),
      basedOnUserData: z.boolean().optional(),
    }),
  ),
  riskFactors: z.array(
    z.object({
      factor: z.string(),
      impact: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
      userIdentified: z.boolean().optional(),
    }),
  ),
  confidence: z.number().min(0).max(100),
  nextReviewTime: z.string(),
  userGuidanceApplied: z.array(z.string()).optional(),
})

export class EnhancedAIDecisionEngine {
  private supabase

  constructor() {
    this.supabase = null
  }

  async makeEnhancedSupplyDecision(context: {
    demandOrders: any[]
    productionMetrics: any[]
    currentAllocations: any[]
  }) {
    try {
      const supabase = await createClient()

      // Fetch user guidance and uploaded data
      const { data: userGuidance } = await supabase
        .from("external_data")
        .select("*")
        .eq("source", "user_guidance_processed")
        .order("created_at", { ascending: false })
        .limit(5)

      const { data: uploadedData } = await supabase
        .from("external_data")
        .select("*")
        .eq("source", "user_upload")
        .order("created_at", { ascending: false })
        .limit(10)

      // Get external factors (weather, market, news)
      const externalFactors = await this.getExternalFactors()

      // Create enhanced prompt that includes user guidance
      const prompt = `
        You are an advanced AI supply chain optimization engine with access to user guidance and uploaded data.

        CURRENT SITUATION:
        Demand Orders: ${JSON.stringify(context.demandOrders, null, 2)}
        Production Metrics: ${JSON.stringify(context.productionMetrics, null, 2)}
        Current Allocations: ${JSON.stringify(context.currentAllocations, null, 2)}

        USER GUIDANCE & UPLOADED DATA:
        ${
          userGuidance
            ?.map(
              (g) => `
          Guidance: ${g.raw_data.userGuidance || "No text guidance"}
          Processed Insights: ${g.raw_data.processedInsights || "None"}
          Files: ${g.raw_data.fileCount || 0} uploaded files
          Date: ${g.created_at}
        `,
            )
            .join("\n") || "No user guidance available"
        }

        UPLOADED DATA SUMMARY:
        ${
          uploadedData
            ?.map(
              (d) => `
          File: ${d.metadata?.filename || "Unknown"}
          Type: ${d.data_type}
          Records: ${d.metadata?.recordCount || 0}
          Preview: ${JSON.stringify(d.raw_data?.preview || {}, null, 2)}
        `,
            )
            .join("\n") || "No uploaded data available"
        }

        EXTERNAL FACTORS:
        Weather: ${JSON.stringify(externalFactors.weather, null, 2)}
        Market: ${JSON.stringify(externalFactors.market, null, 2)}
        News: ${JSON.stringify(externalFactors.news, null, 2)}

        OPTIMIZATION PRIORITIES (in order):
        1. FOLLOW USER GUIDANCE - User instructions take highest priority
        2. Utilize uploaded data for better decision accuracy
        3. Maximize customer satisfaction (prioritize urgent orders)
        4. Optimize production efficiency
        5. Minimize costs and risks
        6. Account for external factors

        IMPORTANT: 
        - Clearly indicate when decisions are influenced by user guidance
        - Reference specific uploaded data when making recommendations
        - Explain how user input improved the decision quality
        - Maintain high confidence when user guidance is clear and specific
      `

      const { object: decision } = await generateObject({
        model: openai("gpt-4"),
        schema: enhancedSupplyDecisionSchema,
        prompt,
        temperature: 0.2, // Lower temperature for more consistent decisions with user input
      })

      // Store the enhanced decision
      await this.storeEnhancedDecision(decision, {
        externalFactors,
        userGuidanceCount: userGuidance?.length || 0,
        uploadedDataCount: uploadedData?.length || 0,
        userGuidanceApplied: decision.userGuidanceApplied || [],
      })

      return {
        ...decision,
        externalFactors,
        userGuidanceContext: {
          guidanceCount: userGuidance?.length || 0,
          uploadedFilesCount: uploadedData?.length || 0,
          lastGuidanceDate: userGuidance?.[0]?.created_at || null,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Enhanced AI Decision Engine Error:", error)
      throw new Error("Failed to generate enhanced AI decision")
    }
  }

  private async getExternalFactors() {
    // Simulate external data fetching (same as before)
    return {
      weather: {
        condition: "clear",
        temperature: 22,
        riskLevel: "low",
        impact: "Normal operations expected",
      },
      market: {
        trend: "stable",
        volatility: 3.2,
        recommendation: "Maintain current strategy",
      },
      news: {
        sentiment: "positive",
        confidence: 85,
        impact: "Favorable conditions",
      },
    }
  }

  private async storeEnhancedDecision(decision: any, context: any) {
    try {
      const supabase = await createClient()

      await supabase.from("ai_decisions").insert({
        decision_type: "enhanced_allocation",
        input_data: context,
        output_data: decision,
        confidence_score: decision.confidence / 100,
        reasoning: `Enhanced AI decision incorporating ${context.userGuidanceCount} user guidance entries and ${context.uploadedDataCount} uploaded data files. User guidance applied: ${context.userGuidanceApplied?.join(", ") || "None"}.`,
      })
    } catch (error) {
      console.error("Failed to store enhanced AI decision:", error)
    }
  }
}

export const enhancedAIEngine = new EnhancedAIDecisionEngine()
