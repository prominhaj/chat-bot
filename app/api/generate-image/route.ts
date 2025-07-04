import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        // You'll need to add your Stability AI API key as an environment variable
        const apiKey = process.env.STABILITY_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: "Stability AI API key not configured" }, { status: 500 })
        }

        const response = await fetch("https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                samples: 1,
                width: 1024,
                height: 1024,
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("Stability AI API error:", errorData)
            return NextResponse.json({ error: "Failed to generate image" }, { status: response.status })
        }

        const data = await response.json()

        // The API returns base64 encoded images
        const imageBase64 = data.artifacts[0].base64
        const imageUrl = `data:image/png;base64,${imageBase64}`

        return NextResponse.json({ imageUrl })
    } catch (error) {
        console.error("Error generating image:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
