"use client"

import { Button } from "@/components/ui/button"
import { RiMicLine, RiMicOffLine, RiVolumeUpLine, RiStopLine, RiLoader4Line } from "@remixicon/react"
import { cn } from "@/lib/utils"

interface VoiceControlsProps {
    isRecording: boolean
    isProcessing: boolean
    isPlaying: boolean
    onStartRecording: () => void
    onStopRecording: () => void
    onStopSpeaking: () => void
}

export function VoiceControls({
    isRecording,
    isProcessing,
    isPlaying,
    onStartRecording,
    onStopRecording,
    onStopSpeaking,
}: VoiceControlsProps) {
    return (
        <div className="flex items-center gap-2">
            {/* Recording Button */}
            <Button
                onClick={isRecording ? onStopRecording : onStartRecording}
                disabled={isProcessing}
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className={cn(
                    "rounded-full size-10 transition-all duration-200",
                    isRecording && "animate-pulse bg-red-500 hover:bg-red-600",
                    !isRecording && "hover:bg-blue-50 hover:border-blue-300",
                )}
            >
                {isRecording ? <RiMicOffLine className="size-5" /> : <RiMicLine className="size-5" />}
                <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
            </Button>

            {/* Processing Indicator */}
            {isProcessing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RiLoader4Line className="size-4 animate-spin" />
                    <span>Processing...</span>
                </div>
            )}

            {/* Stop Speaking Button */}
            {isPlaying && (
                <Button
                    onClick={onStopSpeaking}
                    variant="outline"
                    size="icon"
                    className="rounded-full size-10 hover:bg-red-50 hover:border-red-300 bg-transparent"
                >
                    <RiStopLine className="size-5 text-red-600" />
                    <span className="sr-only">Stop speaking</span>
                </Button>
            )}

            {/* Speaking Indicator */}
            {isPlaying && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                    <RiVolumeUpLine className="size-4 animate-pulse" />
                    <span>Speaking...</span>
                </div>
            )}
        </div>
    )
}
