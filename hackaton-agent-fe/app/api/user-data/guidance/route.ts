import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { guidance, uploadedFiles } = await req.json()

    if (!guidance && (!uploadedFiles || uploadedFiles.length === 0)) {
      return NextResponse.json({ error: "No guidance or files provided" }, { status: 400 })
    }

    const supabase = await createClient()

    // Store user guidance in database
    const { data: guidanceRecord, error: guidanceError } = await supabase
      .from("ai_decisions")
      .insert({
        decision_type: "user_guidance",
        input_data: {
          guidance: guidance || "",
          uploadedFiles: uploadedFiles || [],
          timestamp: new Date().toISOString(),
        },
        reasoning: `User provided guidance: ${guidance || "File uploads only"}`,
        confidence_score: 1.0, // User input has full confidence
      })
      .select()
      .single()

    if (guidanceError) {
      console.error("Failed to store guidance:", guidanceError)
    }

    // Process the guidance with AI to extract actionable insights
    let aiProcessedGuidance = null

    if (guidance) {
      try {
        const { text } = await generateText({
          model: openai("gpt-4"),
          prompt: `
            Analyze the following user guidance for supply chain optimization and extract actionable insights:
            
            User Guidance: "${guidance}"
            
            Extract and structure:
            1. Priority adjustments (which companies/orders to prioritize)
            2. Production constraints or requirements
            3. Timeline considerations
            4. Risk factors mentioned
            5. Specific optimization goals
            
            Provide a structured analysis that can be used to adjust AI decision-making algorithms.
          `,
          maxOutputTokens: 800,
          temperature: 0.3,
        })

        aiProcessedGuidance = text
      } catch (aiError) {
        console.error("AI processing error:", aiError)
        // Continue without AI processing if it fails
      }
    }

    // Update AI decision engine context with user guidance
    const contextUpdate = {
      userGuidance: guidance || "",
      uploadedDataIds: uploadedFiles?.map((f: any) => f.data?.id).filter(Boolean) || [],
      processedInsights: aiProcessedGuidance,
      lastUpdated: new Date().toISOString(),
    }

    // Store the processed context for future AI decisions
    await supabase.from("external_data").insert({
      source: "user_guidance_processed",
      data_type: "guidance_context",
      raw_data: contextUpdate,
      metadata: {
        guidanceLength: guidance?.length || 0,
        fileCount: uploadedFiles?.length || 0,
        processedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      message: "User guidance processed successfully",
      guidanceId: guidanceRecord?.id,
      processedInsights: aiProcessedGuidance,
      context: contextUpdate,
    })
  } catch (error) {
    console.error("Guidance API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to process guidance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
