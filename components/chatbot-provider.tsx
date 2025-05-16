"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useChat } from "ai/react"
import { useAuth } from "./auth-provider"
import { FloatingChatbot } from "./floating-chatbot"
import { useToast } from "@/components/ui/use-toast"

interface ChatbotContextType {
  isOpen: boolean
  toggleChatbot: () => void
  openChatbot: () => void
  closeChatbot: () => void
  messages: any[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  suggestMindfulnessExercise: () => void
  suggestMoodTracking: () => void
  suggestEmergencyResources: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const initialMessage = user
    ? `Hello ${user.name}! I'm your MindfulStudent AI assistant. How can I support your mental wellbeing today?`
    : "Hello! I'm your MindfulStudent AI assistant. How can I support your mental wellbeing today?"

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, error, setMessages } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: initialMessage,
      },
    ],
    onError: (error) => {
      console.error("Chat error:", error)

      // Extract and log more detailed error information if available
      let errorMessage = "Sorry, there was an error connecting to the AI assistant. Please try again later."
      try {
        if (typeof error === "object" && error !== null) {
          const errorObj = error as any
          if (errorObj.message && typeof errorObj.message === "string") {
            errorMessage = errorObj.message
          }

          // Try to parse response error if it exists
          if (errorObj.response && typeof errorObj.response === "string") {
            try {
              const responseError = JSON.parse(errorObj.response)
              if (responseError.error) {
                errorMessage = responseError.error
              }
            } catch (e) {
              // Parsing failed, use the original error message
            }
          }
        }
      } catch (e) {
        // Error parsing failed, use the default message
      }

      toast({
        title: "Chat Error",
        description: errorMessage,
        variant: "destructive",
      })

      // Add a fallback message if there's an error
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please check that the OpenAI API key is properly configured or try again in a moment.",
        },
      ])
    },
    onFinish: (message) => {
      console.log("Chat message completed:", message)
    },
  })

  const toggleChatbot = () => setIsOpen((prev) => !prev)
  const openChatbot = () => setIsOpen(true)
  const closeChatbot = () => setIsOpen(false)

  // Check for negative mood patterns in messages
  useEffect(() => {
    if (messages.length > 3) {
      const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase())
      const lastThreeMessages = userMessages.slice(-3)

      // Check for negative keywords in recent messages
      const negativeKeywords = [
        "sad",
        "depressed",
        "anxious",
        "stressed",
        "overwhelmed",
        "worried",
        "hopeless",
        "tired",
        "exhausted",
      ]
      const hasNegativePattern = lastThreeMessages.some((msg) =>
        negativeKeywords.some((keyword) => msg.includes(keyword)),
      )

      if (hasNegativePattern) {
        // Suggest mindfulness exercise after a short delay
        setTimeout(() => {
          suggestMindfulnessExercise()
        }, 1000)
      }
    }
  }, [messages])

  const suggestMindfulnessExercise = () => {
    openChatbot()
    setInput("Can you guide me through a quick mindfulness exercise?")
    setTimeout(() => {
      const form = document.querySelector("form#chatbot-form")
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true }))
    }, 100)
  }

  const suggestMoodTracking = () => {
    openChatbot()
    setInput("I'd like to track my mood today")
    setTimeout(() => {
      const form = document.querySelector("form#chatbot-form")
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true }))
    }, 100)
  }

  const suggestEmergencyResources = () => {
    openChatbot()
    setInput("I need emergency mental health resources")
    setTimeout(() => {
      const form = document.querySelector("form#chatbot-form")
      if (form) form.dispatchEvent(new Event("submit", { cancelable: true }))
    }, 100)
  }

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        toggleChatbot,
        openChatbot,
        closeChatbot,
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isLoading,
        suggestMindfulnessExercise,
        suggestMoodTracking,
        suggestEmergencyResources,
      }}
    >
      {children}
      <FloatingChatbot />
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider")
  }
  return context
}

