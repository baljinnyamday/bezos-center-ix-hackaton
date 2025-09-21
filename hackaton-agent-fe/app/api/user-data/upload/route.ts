import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read file content
    const content = await file.text()
    let parsedData: any

    try {
      if (type === "csv") {
        // Simple CSV parsing (in production, use a proper CSV parser)
        const lines = content.split("\n")
        const headers = lines[0].split(",").map((h) => h.trim())
        const data = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",").map((v) => v.trim())
            const row: any = {}
            headers.forEach((header, index) => {
              row[header] = values[index] || ""
            })
            return row
          })
          .filter((row) => Object.values(row).some((v) => v !== ""))

        parsedData = { headers, data, rowCount: data.length }
      } else if (type === "json") {
        parsedData = JSON.parse(content)
      } else {
        throw new Error("Unsupported file type")
      }
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Failed to parse file content",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        },
        { status: 400 },
      )
    }

    // Store uploaded data in database
    const supabase = await createClient()

    const { data: uploadRecord, error } = await supabase
      .from("external_data")
      .insert({
        source: "user_upload",
        data_type: type,
        raw_data: parsedData,
        metadata: {
          filename: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          recordCount: Array.isArray(parsedData.data) ? parsedData.data.length : 1,
        },
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to store uploaded data" }, { status: 500 })
    }

    // Return processed data summary
    return NextResponse.json({
      success: true,
      data: {
        id: uploadRecord.id,
        filename: file.name,
        type: type,
        recordCount: Array.isArray(parsedData.data) ? parsedData.data.length : 1,
        preview: Array.isArray(parsedData.data) ? parsedData.data.slice(0, 3) : parsedData,
      },
    })
  } catch (error) {
    console.error("Upload API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to process upload",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
