"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

// Assessment questions
const questions = [
  {
    id: 1,
    question: "Over the past 2 weeks, how often have you felt little interest or pleasure in doing things?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "depression",
  },
  {
    id: 2,
    question: "Over the past 2 weeks, how often have you felt down, depressed, or hopeless?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "depression",
  },
  {
    id: 3,
    question: "Over the past 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "sleep",
  },
  {
    id: 4,
    question: "Over the past 2 weeks, how often have you felt tired or had little energy?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "energy",
  },
  {
    id: 5,
    question: "Over the past 2 weeks, how often have you felt nervous, anxious, or on edge?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "anxiety",
  },
  {
    id: 6,
    question: "Over the past 2 weeks, how often have you been unable to stop or control worrying?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "anxiety",
  },
  {
    id: 7,
    question: "How would you rate your current stress level related to academic work?",
    options: [
      { value: "0", label: "No stress" },
      { value: "1", label: "Mild stress" },
      { value: "2", label: "Moderate stress" },
      { value: "3", label: "Severe stress" },
    ],
    category: "stress",
  },
  {
    id: 8,
    question: "How often do you practice self-care activities (exercise, hobbies, relaxation)?",
    options: [
      { value: "3", label: "Daily" },
      { value: "2", label: "Several times a week" },
      { value: "1", label: "Rarely" },
      { value: "0", label: "Never" },
    ],
    category: "self-care",
  },
]

export default function Assessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [completed, setCompleted] = useState(false)
  const [userData, setUserData] = useState<{ name: string; email: string; dob: string } | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const userJson = localStorage.getItem("user")
    if (!userJson) {
      toast({
        title: "Login Required",
        description: "Please login to take the assessment",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userJson)
      setUserData(user)
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("user")
      router.push("/login")
    }
  }, [router, toast])

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value,
    })
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setCompleted(true)
      // Save assessment results
      if (userData) {
        const results = {
          user: userData,
          answers,
          date: new Date().toISOString(),
          scores: calculateCategoryScores(),
        }
        localStorage.setItem("assessmentResults", JSON.stringify(results))
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let total = 0
    Object.values(answers).forEach((value) => {
      total += Number.parseInt(value)
    })
    return total
  }

  const calculateCategoryScores = () => {
    const categories: Record<string, { score: number; count: number }> = {}

    // Initialize categories
    questions.forEach((q) => {
      if (!categories[q.category]) {
        categories[q.category] = { score: 0, count: 0 }
      }
    })

    // Calculate scores for each category
    questions.forEach((q) => {
      const answer = answers[q.id]
      if (answer !== undefined) {
        categories[q.category].score += Number.parseInt(answer)
        categories[q.category].count++
      }
    })

    // Calculate percentages (0-100)
    const result: Record<string, number> = {}
    Object.entries(categories).forEach(([category, data]) => {
      if (data.count > 0) {
        // For self-care, higher is better, so we invert the percentage
        if (category === "self-care") {
          result[category] = (data.score / (data.count * 3)) * 100
        } else {
          result[category] = (data.score / (data.count * 3)) * 100
        }
      } else {
        result[category] = 0
      }
    })

    return result
  }

  const getAssessmentResult = () => {
    const score = calculateScore()
    const maxScore = questions.length * 3

    if (score <= maxScore * 0.25) {
      return {
        level: "Low",
        description:
          "Your responses suggest minimal levels of stress, anxiety, and depression. Continue practicing good self-care.",
        recommendations: [
          "Maintain your current self-care routines",
          "Practice mindfulness for 5-10 minutes daily",
          "Consider keeping a gratitude journal",
        ],
      }
    } else if (score <= maxScore * 0.5) {
      return {
        level: "Mild",
        description:
          "Your responses suggest mild levels of stress, anxiety, or depression. Some additional self-care strategies may be helpful.",
        recommendations: [
          "Incorporate regular physical activity into your routine",
          "Practice deep breathing exercises when feeling stressed",
          "Establish a consistent sleep schedule",
          "Consider talking to a friend or family member about your feelings",
        ],
      }
    } else if (score <= maxScore * 0.75) {
      return {
        level: "Moderate",
        description:
          "Your responses suggest moderate levels of stress, anxiety, or depression. Consider implementing additional coping strategies.",
        recommendations: [
          "Schedule time for regular self-care activities",
          "Try guided meditation apps to manage stress",
          "Reach out to your university's counseling services",
          "Consider joining a peer support group",
          "Establish boundaries with academic work and social commitments",
        ],
      }
    } else {
      return {
        level: "High",
        description:
          "Your responses suggest significant levels of stress, anxiety, or depression. We recommend seeking professional support.",
        recommendations: [
          "Schedule an appointment with a mental health professional",
          "Talk to your academic advisor about possible accommodations",
          "Practice daily self-care activities",
          "Connect with supportive friends or family members",
          "Consider using campus mental health resources",
        ],
      }
    }
  }

  const handleViewResults = () => {
    router.push("/results")
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load your information</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Mental Health Assessment</CardTitle>
            <CardDescription>
              {!completed
                ? `Hello ${userData.name}, this assessment helps evaluate your current mental wellbeing. Your responses are confidential.`
                : "Thank you for completing the assessment. Here are your results."}
            </CardDescription>
          </CardHeader>

          {!completed ? (
            <>
              <CardContent className="space-y-4">
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      Question {currentQuestion + 1} of {questions.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{questions[currentQuestion].question}</h3>

                  <RadioGroup value={answers[questions[currentQuestion].id] || ""} onValueChange={handleAnswer}>
                    {questions[currentQuestion].options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <RadioGroupItem value={option.value} id={`option-${option.value}`} />
                        <Label htmlFor={`option-${option.value}`} className="flex-grow cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button onClick={handleNext} disabled={!answers[questions[currentQuestion].id]}>
                  {currentQuestion < questions.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    "Complete Assessment"
                  )}
                </Button>
              </CardFooter>
            </>
          ) : (
            <>
              <CardContent className="space-y-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Assessment Result</h3>
                  <div className="flex items-center mb-4">
                    <div className="text-2xl font-bold mr-2">{getAssessmentResult().level}</div>
                    <div className="text-sm text-muted-foreground">concern level</div>
                  </div>
                  <p>{getAssessmentResult().description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Recommendations</h3>
                  <ul className="space-y-2">
                    {getAssessmentResult().recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Important Note:</p>
                  <p>
                    This assessment is not a diagnostic tool. If you're experiencing significant distress, please
                    consult with a mental health professional.
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/resources">View Resources</Link>
                </Button>
                <Button onClick={handleViewResults} className="w-full sm:w-auto">
                  View Detailed Results
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

