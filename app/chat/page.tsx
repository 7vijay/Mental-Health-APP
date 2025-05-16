"use client"

import type React from "react"

import { useChat } from "ai/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, Paperclip, Bot, User } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [userData, setUserData] = useState<{ name: string; email: string; dob: string } | null>(null)
  const { toast } = useToast()

  // Check if user is logged in
  useEffect(() => {
    const userJson = localStorage.getItem("user")
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        setUserData(user)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Suggested prompts for the user
  const suggestedPrompts = [
    "I'm feeling overwhelmed with my coursework",
    "How can I manage test anxiety?",
    "I'm having trouble sleeping lately",
    "What are some quick stress relief techniques?",
    "How can I improve my focus while studying?",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Fixed floating chat button (only shown when chat is minimized) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-primary text-white rounded-full p-4 shadow-lg z-50 hover:bg-primary/90 transition-all"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat interface */}
      <div
        className={cn(
          "fixed inset-0 md:inset-auto md:right-6 md:bottom-6 md:top-auto md:left-auto md:w-[400px] md:h-[600px] bg-background rounded-none md:rounded-lg shadow-lg flex flex-col z-40 transition-all duration-300 ease-in-out",
          isChatOpen ? "opacity-100" : "opacity-0 pointer-events-none md:translate-y-2",
        )}
      >
        {/* Chat header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">MindfulStudent Assistant</CardTitle>
              <p className="text-xs text-muted-foreground">
                {userData ? `Hello, ${userData.name}` : "AI-powered support"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsChatOpen(false)}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <Bot className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Welcome to MindfulStudent</h3>
              <p className="text-muted-foreground mb-6">
                {userData
                  ? `Hi ${userData.name}, how can I support your mental wellbeing today?`
                  : "How can I support your mental wellbeing today?"}
              </p>

              <div className="w-full space-y-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => {
                      handleInputChange({ target: { value: prompt } } as any)
                      setTimeout(() => {
                        const form = document.querySelector("form")
                        if (form) form.dispatchEvent(new Event("submit", { cancelable: true }))
                      }, 100)
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
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
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
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
            ))
          )}
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
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="h-8 w-8 flex-shrink-0" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="text-xs text-center mt-2 text-muted-foreground">
            <p>This AI assistant is not a substitute for professional mental health care.</p>
          </div>
        </div>
      </div>

      {/* Main content when chat is minimized on mobile */}
      <div className="container mx-auto py-12 px-4">
        <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>AI Mental Health Assistant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our AI assistant is here to provide support, resources, and guidance for your mental wellbeing. You can
              discuss:
            </p>

            <ul className="space-y-2 list-disc pl-5">
              <li>Stress management techniques</li>
              <li>Anxiety and depression coping strategies</li>
              <li>Study-life balance tips</li>
              <li>Sleep improvement methods</li>
              <li>Mindfulness and relaxation exercises</li>
            </ul>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm mt-4">
              <p className="font-semibold mb-1">Important Note:</p>
              <p>
                This AI assistant is not a substitute for professional mental health care. If you're experiencing a
                crisis or emergency, please contact emergency services or a mental health professional immediately.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsChatOpen(true)} className="w-full">
              Start Chatting
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function Minus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  )
}

