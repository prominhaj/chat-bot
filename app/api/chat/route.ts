import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { message, chatHistory } = await request.json()

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        const apiKey = process.env.MISTRAL_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: "Mistral API key not configured" }, { status: 500 })
        }

        // Prepare messages with chat history context
        type ChatMessage = {
            isUser: boolean;
            content: string;
        };

        const messages = [
            {
                role: "system",
                content:
                    "You are Bart, a helpful and conversational AI assistant. You provide thoughtful, engaging responses and can help users with various topics. Keep your responses natural, informative, and friendly. You can have deep conversations while being concise when appropriate.",
            },
            // Add chat history for context (last 10 messages to avoid token limits)
            ...((chatHistory as ChatMessage[]).slice(-10).map((msg: ChatMessage) => ({
                role: msg.isUser ? "user" : "assistant",
                content: msg.content,
            }))),
            {
                role: "user",
                content: message,
            },
        ]

        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "mistral-small-latest", // Updated to correct model name
                messages: messages,
                max_tokens: 1000,
                temperature: 0.7,
                top_p: 0.9,
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error("Mistral API error:", errorData)

            // Try with alternative model if the first one fails
            if (response.status === 400) {
                console.log("Trying alternative model...")

                const fallbackResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: "open-mistral-7b", // Alternative model name
                        messages: messages,
                        max_tokens: 1000,
                        temperature: 0.7,
                        top_p: 0.9,
                    }),
                })

                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json()
                    const aiMessage = fallbackData.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."
                    return NextResponse.json({ message: aiMessage })
                }
            }

            return NextResponse.json({ error: "Failed to get AI response" }, { status: response.status })
        }

        const data = await response.json()
        const aiMessage = data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."

        return NextResponse.json({ message: aiMessage })
    } catch (error) {
        console.error("Error in chat API:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
