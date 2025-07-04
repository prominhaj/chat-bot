import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const audioFile = formData.get("audio") as File

        if (!audioFile) {
            return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
        }

        const apiKey = process.env.DEEPGRAM_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 500 })
        }

        // Convert File to Buffer
        const arrayBuffer = await audioFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const response = await fetch("https://api.deepgram.com/v1/listen", {
            method: "POST",
            headers: {
                Authorization: `Token ${apiKey}`,
                "Content-Type": "audio/wav",
            },
            body: buffer,
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("Deepgram STT error:", errorData)
            return NextResponse.json({ error: "Failed to transcribe audio" }, { status: response.status })
        }

        const data = await response.json()
        const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ""

        return NextResponse.json({ transcript })
    } catch (error) {
        console.error("Error in speech-to-text API:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
