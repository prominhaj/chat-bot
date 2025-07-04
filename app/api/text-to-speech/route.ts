import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json()

        if (!text) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 })
        }

        const apiKey = process.env.DEEPGRAM_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: "Deepgram API key not configured" }, { status: 500 })
        }

        const response = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
            method: "POST",
            headers: {
                Authorization: `Token ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: text,
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("Deepgram TTS error:", errorData)
            return NextResponse.json({ error: "Failed to generate speech" }, { status: response.status })
        }

        const audioBuffer = await response.arrayBuffer()
        const base64Audio = Buffer.from(audioBuffer).toString("base64")

        return NextResponse.json({
            audioUrl: `data:audio/wav;base64,${base64Audio}`,
        })
    } catch (error) {
        console.error("Error in text-to-speech API:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
