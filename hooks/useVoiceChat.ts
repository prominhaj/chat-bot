"use client"

import { useState, useRef, useCallback } from "react"

export function useVoiceChat() {
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.start()
            setIsRecording(true)
        } catch (error) {
            console.error("Error starting recording:", error)
        }
    }, [])

    const stopRecording = useCallback((): Promise<Blob> => {
        return new Promise((resolve) => {
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
                    resolve(audioBlob)
                    setIsRecording(false)
                }
                mediaRecorderRef.current.stop()
                mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
            }
        })
    }, [isRecording])

    const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string> => {
        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append("audio", audioBlob, "recording.wav")

            const response = await fetch("/api/speech-to-text", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()
            return data.transcript || ""
        } catch (error) {
            console.error("Error transcribing audio:", error)
            return ""
        } finally {
            setIsProcessing(false)
        }
    }, [])

    const speakText = useCallback(async (text: string) => {
        setIsProcessing(true)
        try {
            const response = await fetch("/api/text-to-speech", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            })

            const data = await response.json()

            if (data.audioUrl) {
                const audio = new Audio(data.audioUrl)
                audioRef.current = audio

                audio.onplay = () => setIsPlaying(true)
                audio.onended = () => setIsPlaying(false)
                audio.onerror = () => setIsPlaying(false)

                await audio.play()
            }
        } catch (error) {
            console.error("Error playing speech:", error)
        } finally {
            setIsProcessing(false)
        }
    }, [])

    const stopSpeaking = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            setIsPlaying(false)
        }
    }, [])

    return {
        isRecording,
        isProcessing,
        isPlaying,
        startRecording,
        stopRecording,
        transcribeAudio,
        speakText,
        stopSpeaking,
    }
}
