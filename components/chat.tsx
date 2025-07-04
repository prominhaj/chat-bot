"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  RiShining2Line,
  RiSendPlaneLine,
} from "@remixicon/react"
import { ChatMessage } from "@/components/chat-message"
import { useRef, useEffect, useState } from "react"
import Image from "next/image"
import { VoiceControls } from "@/components/voice-controls"
import { useVoiceChat } from "@/hooks/useVoiceChat"
import { Image as ImageIcon } from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  isImage?: boolean
  imageUrl?: string
  timestamp: Date
}

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Welcome to Bart! How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const {
    isRecording,
    isProcessing,
    isPlaying,
    startRecording,
    stopRecording,
    transcribeAudio,
    speakText,
    stopSpeaking,
  } = useVoiceChat()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue
    if (!textToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.message,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiResponse])

        // Auto-speak the AI response
        if (data.message) {
          await speakText(data.message)
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I couldn't process your message. Please try again.",
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleVoiceRecording = async () => {
    if (isRecording) {
      const audioBlob = await stopRecording()
      const transcript = await transcribeAudio(audioBlob)

      if (transcript) {
        await handleSendMessage(transcript)
      }
    } else {
      await startRecording()
    }
  }

  const handleGenerateImage = async () => {
    if (!inputValue.trim()) return

    setIsGenerating(true)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Generate image: ${inputValue}`,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const prompt = inputValue
    setInputValue("")

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (response.ok) {
        const imageMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Generated image for: "${prompt}"`,
          isUser: false,
          isImage: true,
          imageUrl: data.imageUrl,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, imageMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Sorry, I couldn't generate the image. Error: ${data.error}`,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error generating the image. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <ScrollArea className="flex-1 [&>div>div]:h-full w-full shadow-md md:rounded-s-[inherit] min-[1024px]:rounded-e-3xl bg-background">
      <div className="h-full flex flex-col px-4 md:px-6 lg:px-8">


        {/* Chat */}
        <div className="relative grow">
          <div className="max-w-3xl mx-auto mt-6 space-y-6">
            <div className="text-center my-8">
              <div className="inline-flex items-center bg-white rounded-full border border-black/[0.08] shadow-xs text-xs font-medium py-1 px-3 text-foreground/80">
                <RiShining2Line className="me-1.5 text-muted-foreground/70 -ms-1" size={14} aria-hidden="true" />
                Today
              </div>
            </div>

            {messages.map((message) => (
              <ChatMessage key={message.id} isUser={message.isUser} isImage={message.isImage}>
                {message.isImage && message.imageUrl ? (
                  <>
                    <Image
                      src={message.imageUrl || "/placeholder.svg"}
                      alt={message.content}
                      width={512}
                      height={512}
                      className="rounded-lg max-w-full h-auto"
                    />
                    <p className="text-sm text-muted-foreground mt-2 px-2">{message.content}</p>
                  </>
                ) : (
                  message.content.split("\n").map((line, index) => <p key={index}>{line}</p>)
                )}
              </ChatMessage>
            ))}

            {(isGenerating || isProcessing) && (
              <ChatMessage>
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p>{isGenerating ? "Generating your image..." : "Processing your voice..."}</p>
                </div>
              </ChatMessage>
            )}

            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 pt-4 md:pt-8 z-50">
          <div className="max-w-3xl mx-auto bg-background rounded-[20px] pb-4 md:pb-8">
            <div className="relative rounded-[20px] border border-transparent bg-muted transition-colors focus-within:bg-muted/50 focus-within:border-input has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 [&:has(input:is(:disabled))_*]:pointer-events-none">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex sm:min-h-[84px] w-full bg-transparent px-4 py-3 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none [resize:none]"
                placeholder="Type a message, use voice, or describe an image to generate..."
                aria-label="Enter your prompt"
                disabled={isGenerating || isProcessing}
              />
              {/* Textarea buttons */}
              <div className="flex items-center justify-between gap-2 p-3">
                {/* Left buttons */}
                <div className="flex items-center gap-2">
                  <div className="bg-muted/50 rounded-full p-3 border">
                    <VoiceControls
                      isRecording={isRecording}
                      isProcessing={isProcessing}
                      isPlaying={isPlaying}
                      onStartRecording={handleVoiceRecording}
                      onStopRecording={handleVoiceRecording}
                      onStopSpeaking={stopSpeaking}
                    />
                  </div>
                </div>
                {/* Right buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleGenerateImage}
                    disabled={!inputValue.trim() || isGenerating || isProcessing}
                    variant="outline"
                    size="icon"
                    className="rounded-full size-8 border-none hover:bg-background hover:shadow-md transition-[box-shadow] bg-transparent"
                  >
                    <ImageIcon className="size-4" />
                    <span className="sr-only">Generate</span>
                  </Button>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isGenerating || isProcessing}
                    className="rounded-full h-8"
                  >
                    <RiSendPlaneLine className="size-4 mr-1" />
                    Ask Bart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
