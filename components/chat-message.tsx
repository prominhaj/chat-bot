import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface ChatMessageProps {
  children: ReactNode
  isUser?: boolean
  isImage?: boolean
}

export function ChatMessage({ children, isUser = false, isImage = false }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">AI</span>
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser ? "bg-blue-600 text-white ml-auto" : "bg-muted",
          isImage && "p-2",
        )}
      >
        {isImage ? (
          <div className="rounded-lg overflow-hidden">{children}</div>
        ) : (
          <div className="space-y-2 text-sm leading-relaxed">{children}</div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
          <span className="text-white text-sm font-medium">You</span>
        </div>
      )}
    </div>
  )
}
