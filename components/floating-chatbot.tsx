"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, User, MessageSquare, Send, X, Minimize2, Maximize2, Heart, Brain, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatbot } from "./chatbot-provider"
import { useAuth } from "./auth-provider"

export function FloatingChatbot() {
  const {
    isOpen,
    toggleChatbot,
    closeChatbot,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    suggestMindfulnessExercise,
    suggestMoodTracking,
    suggestEmergencyResources,
  } = useChatbot()

  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showEmergencyButton, setShowEmergencyButton] = useState(false)

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check for emergency keywords
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "user") {
        const content = lastMessage.content.toLowerCase()
        const emergencyKeywords = [
          "suicide",
          "kill myself",
          "want to die",
          "end my life",
          "harm myself",
          "emergency",
          "crisis",
        ]

        const hasEmergencyKeyword = emergencyKeywords.some((keyword) => content.includes(keyword))

        if (hasEmergencyKeyword) {
          setShowEmergencyButton(true)
        }
      }
    }
  }, [messages])

  // Suggested prompts for the user
  const suggestedPrompts = [
    "I'm feeling overwhelmed with my coursework",
    "How can I manage test anxiety?",
    "I'm having trouble sleeping lately",
    "What are some quick stress relief techniques?",
    "How can I improve my focus while studying?",
    "Can you suggest a mindfulness exercise?",
  ]

  if (!isOpen) {
    return (
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg z-50 hover:bg-primary/90 transition-all"
        aria-label="Open chatbot"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div
      className={cn(
        "fixed right-6 bottom-6 z-50 w-[380px] transition-all duration-300",
        isMinimized ? "h-14" : "h-[600px]",
      )}
    >
      <Card className="h-full flex flex-col shadow-xl border-primary/20">
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 border-b">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">MindfulStudent Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">{user ? `Hello, ${user.name}` : "AI-powered support"}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeChatbot}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "flex items-start gap-2 max-w-[80%]",
                      message.role === "user" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      {message.role === "user" ? (
                        <>
                          <AvatarImage src={user?.avatar || "/placeholder.svg?height=32&width=32"} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg p-3",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="flex space-x-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                        <div
                          className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showEmergencyButton && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Need immediate help?</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      If you're experiencing a mental health emergency, please reach out to these resources:
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mb-1 w-full justify-start"
                      onClick={suggestEmergencyResources}
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                      Get Emergency Resources
                    </Button>
                  </div>
                </div>
              )}

              {messages.length === 1 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Try asking about:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          handleInputChange({ target: { value: prompt } } as any)
                          setTimeout(() => {
                            const form = document.querySelector("form#chatbot-form")
                            if (form) form.dispatchEvent(new Event("submit", { cancelable: true }))
                          }, 100)
                        }}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-xs" onClick={suggestMindfulnessExercise}>
                  <Brain className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                  Mindfulness Exercise
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={suggestMoodTracking}>
                  <Heart className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                  Track My Mood
                </Button>
              </div>

              <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-4 border-t mt-auto">
              <form id="chatbot-form" onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <div className="text-xs text-center mt-2 text-muted-foreground">
                <p>This AI assistant is not a substitute for professional mental health care.</p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

