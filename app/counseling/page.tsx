"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Calendar, Clock, User } from "lucide-react"
import Link from "next/link"

type Counselor = {
  id: string
  name: string
  title: string
  specialties: string[]
  availability: string[]
  image: string
}

const counselors: Counselor[] = [
  {
    id: "c1",
    name: "Dr. Sarah Johnson",
    title: "Licensed Psychologist",
    specialties: ["Anxiety", "Depression", "Academic Stress"],
    availability: ["Monday", "Wednesday", "Friday"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "c2",
    name: "Dr. Michael Chen",
    title: "Clinical Counselor",
    specialties: ["Stress Management", "Sleep Issues", "Mindfulness"],
    availability: ["Tuesday", "Thursday"],
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: "c3",
    name: "Dr. Emily Rodriguez",
    title: "Mental Health Therapist",
    specialties: ["Trauma", "Relationship Issues", "Self-Esteem"],
    availability: ["Monday", "Tuesday", "Thursday"],
    image: "/placeholder.svg?height=200&width=200",
  },
]

export default function Counseling() {
  const [selectedCounselor, setSelectedCounselor] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [appointmentType, setAppointmentType] = useState<string>("video")
  const [reason, setReason] = useState<string>("")
  const [step, setStep] = useState<number>(1)
  const { user, isLoading, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    // Create appointment
    const appointment = {
      id: crypto.randomUUID(),
      counselorId: selectedCounselor,
      counselorName: counselors.find((c) => c.id === selectedCounselor)?.name,
      date: selectedDay,
      time: selectedTime,
      title: `Appointment with ${counselors.find((c) => c.id === selectedCounselor)?.name}`, // Add a title for better display
      type: appointmentType,
      reason,
      userId: user.id,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    const appointments = JSON.parse(localStorage.getItem(`appointments_${user.id}`) || "[]")
    appointments.push(appointment)
    localStorage.setItem(`appointments_${user.id}`, JSON.stringify(appointments))

    // Award XP
    updateUser({ xp: user.xp + 25 })

    toast({
      title: "Appointment Scheduled",
      description: `Your appointment with ${counselors.find((c) => c.id === selectedCounselor)?.name} has been scheduled.`,
    })

    router.push("/dashboard")
  }

  const getAvailableTimes = () => {
    const times = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"]
    return times
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
          <div className="h-3 w-36 bg-primary/20 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-8 px-4">
        <Link href="/dashboard" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-6">Book a Counseling Session</h1>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Schedule an Appointment</CardTitle>
            <CardDescription>Connect with a mental health professional for personalized support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Step {step} of 3</span>
                <span className="text-sm text-muted-foreground">{Math.round((step / 3) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Select a Counselor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {counselors.map((counselor) => (
                    <div
                      key={counselor.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedCounselor === counselor.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedCounselor(counselor.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={counselor.image || "/placeholder.svg"}
                            alt={counselor.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{counselor.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{counselor.title}</p>
                          <div className="flex flex-wrap gap-1">
                            {counselor.specialties.map((specialty, index) => (
                              <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={!selectedCounselor}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Select Date and Time</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">Available Days</Label>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger id="day">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        {counselors
                          .find((c) => c.id === selectedCounselor)
                          ?.availability.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Available Times</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDay}>
                      <SelectTrigger id="time">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTimes().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Appointment Type</Label>
                    <RadioGroup value={appointmentType} onValueChange={setAppointmentType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video" />
                        <Label htmlFor="video">Video Call</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" />
                        <Label htmlFor="phone">Phone Call</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in-person" id="in-person" />
                        <Label htmlFor="in-person">In-Person</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!selectedDay || !selectedTime}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg font-medium">Additional Information</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Briefly describe what you'd like to discuss"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      This information will help your counselor prepare for your session. All information is kept
                      confidential.
                    </p>
                  </div>
                </div>

                <div className="bg-muted/20 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Appointment Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{counselors.find((c) => c.id === selectedCounselor)?.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedDay}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedTime}</span>
                    </div>
                    <div className="flex items-center capitalize">
                      <span>{appointmentType} Appointment</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit">Schedule Appointment</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

