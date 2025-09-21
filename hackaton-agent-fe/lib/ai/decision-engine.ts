import { generateObject, generateText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

// Schema for AI decision output
const supplyDecisionSchema = z.object({
  allocations: z.array(
    z.object({
      demandOrderId: z.string(),
      productionLine: z.string(),
      allocatedQuantity: z.number(),
      priorityScore: z.number().min(0).max(100),
      reasoning: z.string(),
    }),
  ),
  productionAdjustments: z.array(
    z.object({
      productionLine: z.string(),
      recommendedRate: z.number(),
      reasoning: z.string(),
    }),
  ),
  riskFactors: z.array(
    z.object({
      factor: z.string(),
      impact: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    }),
  ),
  confidence: z.number().min(0).max(100),
  nextReviewTime: z.string(),
})

// External data tools for AI
const weatherTool = tool({
  description: "Get current weather conditions that might affect supply chain",
  inputSchema: z.object({
    location: z.string().optional(),
  }),
  execute: async ({ location = "global" }) => {
    // Simulate weather API call
    const conditions = ["clear", "cloudy", "rainy", "stormy", "snowy"]
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    const temperature = Math.floor(Math.random() * 40) + 10 // 10-50°C
    const windSpeed = Math.floor(Math.random() * 30) // 0-30 mph

    return {
      location,
      condition,
      temperature,
      windSpeed,
      riskLevel: condition === "stormy" ? "high" : condition === "rainy" ? "medium" : "low",
      impact: condition === "stormy" ? "Potential shipping delays" : "Normal operations expected",
    }
  },
})

const marketTool = tool({
  description: "Get current market conditions and trading prices",
  inputSchema: z.object({
    commodity: z.string().optional(),
  }),
  execute: async ({ commodity = "raw_materials" }) => {
    // Simulate market API call
    const basePrice = 100
    const volatility = (Math.random() - 0.5) * 20 // -10% to +10%
    const currentPrice = basePrice + volatility
    const trend = volatility > 5 ? "rising" : volatility < -5 ? "falling" : "stable"

    return {
      commodity,
      currentPrice: Math.round(currentPrice * 100) / 100,
      trend,
      volatility: Math.abs(volatility),
      recommendation:
        trend === "falling"
          ? "Consider increasing inventory"
          : trend === "rising"
            ? "Monitor costs closely"
            : "Maintain current strategy",
    }
  },
})

const newsTool = tool({
  description: "Get relevant news sentiment affecting supply chain",
  inputSchema: z.object({
    topic: z.string().optional(),
  }),
  execute: async ({ topic = "supply_chain" }) => {
    // Simulate news sentiment analysis
    const sentiments = ["positive", "neutral", "negative"]
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
    const confidence = Math.floor(Math.random() * 40) + 60 // 60-100%

    const headlines = {
      positive: ["Supply chain efficiency improves globally", "New trade agreements boost logistics"],
      neutral: ["Market conditions remain stable", "Industry reports steady growth"],
      negative: ["Supply chain disruptions reported", "Rising costs affect manufacturing"],
    }

    return {
      topic,
      sentiment,
      confidence,
      headline: headlines[sentiment][Math.floor(Math.random() * headlines[sentiment].length)],
      impact:
        sentiment === "negative"
          ? "Potential challenges ahead"
          : sentiment === "positive"
            ? "Favorable conditions"
            : "No significant impact",
    }
  },
})

export class AIDecisionEngine {
  private supabase

  constructor() {
    this.supabase = null // Will be initialized in methods that need it
  }

  async makeSupplyDecision(context: {
    demandOrders: any[]
    productionMetrics: any[]
    currentAllocations: any[]
  }) {
    try {
      // Get external data
      const weatherData = await weatherTool.execute({ location: "global" })
      const marketData = await marketTool.execute({ commodity: "raw_materials" })
      const newsData = await newsTool.execute({ topic: "supply_chain" })

      // Create comprehensive prompt for AI decision making
      const prompt = `
        You are an AI supply chain optimization engine. Analyze the current situation and make optimal allocation decisions.

        CURRENT SITUATION:
        Demand Orders: ${JSON.stringify(context.demandOrders, null, 2)}
        Production Metrics: ${JSON.stringify(context.productionMetrics, null, 2)}
        Current Allocations: ${JSON.stringify(context.currentAllocations, null, 2)}

        EXTERNAL FACTORS:
        Weather: ${JSON.stringify(weatherData, null, 2)}
        Market: ${JSON.stringify(marketData, null, 2)}
        News Sentiment: ${JSON.stringify(newsData, null, 2)}

        OPTIMIZATION GOALS:
        1. Maximize customer satisfaction (prioritize urgent orders)
        2. Optimize production efficiency
        3. Minimize costs and risks
        4. Account for external factors (weather, market, news)

        Provide specific allocation recommendations, production adjustments, and risk assessments.
      `

      const { object: decision } = await generateObject({
        model: openai("gpt-4"),
        schema: supplyDecisionSchema,
        prompt,
        temperature: 0.3, // Lower temperature for more consistent decisions
      })

      // Store the decision in database
      await this.storeDecision(decision, {
        weather: weatherData,
        market: marketData,
        news: newsData,
      })

      return {
        ...decision,
        externalFactors: {
          weather: weatherData,
          market: marketData,
          news: newsData,
        },
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("AI Decision Engine Error:", error)
      throw new Error("Failed to generate AI decision")
    }
  }

  async generateInsights(data: any) {
    try {
      const prompt = `
        Analyze the following supply chain data and provide actionable insights:
        ${JSON.stringify(data, null, 2)}

        Focus on:
        1. Efficiency opportunities
        2. Risk mitigation
        3. Cost optimization
        4. Performance improvements

        Provide specific, actionable recommendations.
      `

      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt,
        maxOutputTokens: 1000,
        temperature: 0.4,
      })

      return {
        insights: text,
        timestamp: new Date().toISOString(),
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      }
    } catch (error) {
      console.error("AI Insights Error:", error)
      throw new Error("Failed to generate insights")
    }
  }

  async optimizeProduction(productionData: any[], demandData: any[]) {
    try {
      const prompt = `
        Given the current production capacity and demand requirements, optimize production allocation:

        Production Lines: ${JSON.stringify(productionData, null, 2)}
        Demand Requirements: ${JSON.stringify(demandData, null, 2)}

        Provide specific recommendations for:
        1. Production line adjustments
        2. Capacity reallocation
        3. Efficiency improvements
        4. Timeline optimization
      `

      const { text } = await generateText({
        model: openai("gpt-4"),
        prompt,
        maxOutputTokens: 800,
        temperature: 0.2,
      })

      return {
        recommendations: text,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Production Optimization Error:", error)
      throw new Error("Failed to optimize production")
    }
  }

  private async storeDecision(decision: any, externalData: any) {
    try {
      const supabase = await createClient()

      await supabase.from("ai_decisions").insert({
        decision_type: "allocation",
        input_data: externalData,
        output_data: decision,
        confidence_score: decision.confidence / 100,
        reasoning: `AI-generated supply chain optimization based on current demand, production capacity, and external factors including weather (${externalData.weather.condition}), market trends (${externalData.market.trend}), and news sentiment (${externalData.news.sentiment}).`,
      })
    } catch (error) {
      console.error("Failed to store AI decision:", error)
      // Don't throw here to avoid breaking the main decision flow
    }
  }
}

export const aiEngine = new AIDecisionEngine()
