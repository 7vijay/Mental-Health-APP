"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import html2canvas from "html2canvas"

type AssessmentResult = {
  user: {
    name: string
    email: string
    dob: string
  }
  answers: Record<number, string>
  date: string
  scores: Record<string, number>
}

const categoryLabels: Record<string, string> = {
  depression: "Depression",
  anxiety: "Anxiety",
  stress: "Stress",
  sleep: "Sleep Issues",
  energy: "Energy Levels",
  "self-care": "Self-Care",
}

const categoryColors: Record<string, string> = {
  depression: "#f87171", // red
  anxiety: "#fbbf24", // amber
  stress: "#60a5fa", // blue
  sleep: "#818cf8", // indigo
  energy: "#34d399", // emerald
  "self-care": "#a78bfa", // purple
}

export default function Results() {
  const [results, setResults] = useState<AssessmentResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in and has assessment results
    const userJson = localStorage.getItem("user")
    const resultsJson = localStorage.getItem("assessmentResults")

    if (!userJson) {
      toast({
        title: "Login Required",
        description: "Please login to view results",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!resultsJson) {
      toast({
        title: "No Results Found",
        description: "Please complete an assessment first",
        variant: "destructive",
      })
      router.push("/assessment")
      return
    }

    try {
      const parsedResults = JSON.parse(resultsJson)
      setResults(parsedResults)
    } catch (error) {
      console.error("Error parsing results:", error)
      toast({
        title: "Error",
        description: "Could not load your results. Please try again.",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }, [router, toast])

  const handleDownload = async () => {
    if (!resultsRef.current) return

    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: null,
        scale: 2,
      })

      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `mindful-student-results-${new Date().toISOString().split("T")[0]}.png`
      link.click()

      toast({
        title: "Success",
        description: "Your results have been downloaded",
      })
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error",
        description: "Could not download results. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getConcernLevel = (score: number) => {
    if (score <= 25) return "Low"
    if (score <= 50) return "Mild"
    if (score <= 75) return "Moderate"
    return "High"
  }

  const getConcernColor = (score: number) => {
    if (score <= 25) return "bg-green-500"
    if (score <= 50) return "bg-yellow-500"
    if (score <= 75) return "bg-orange-500"
    return "bg-red-500"
  }

  // For self-care, higher is better
  const getSelfCareColor = (score: number) => {
    if (score >= 75) return "bg-green-500"
    if (score >= 50) return "bg-yellow-500"
    if (score >= 25) return "bg-orange-500"
    return "bg-red-500"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading Results...</CardTitle>
            <CardDescription>Please wait while we load your assessment results</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>Please complete an assessment to view your results</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/assessment">Take Assessment</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Assessment Results</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div ref={resultsRef}>
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Assessment completed on {formatDate(results.date)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg">{results.user.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg">{results.user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Mental Health Indicators</CardTitle>
              <CardDescription>Your assessment results across different mental health categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(results.scores).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{categoryLabels[category] || category}</h3>
                      <span className="text-sm font-medium">
                        {category === "self-care"
                          ? score >= 75
                            ? "Excellent"
                            : score >= 50
                              ? "Good"
                              : score >= 25
                                ? "Fair"
                                : "Poor"
                          : getConcernLevel(score)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          category === "self-care" ? getSelfCareColor(score) : getConcernColor(score)
                        }`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {category === "self-care"
                        ? "Higher scores indicate better self-care practices"
                        : "Lower scores indicate fewer symptoms"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Visual Summary</CardTitle>
              <CardDescription>A graphical representation of your mental health indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full max-w-md mx-auto relative">
                {/* Circular chart visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {Object.entries(results.scores).map(([category, score], index, array) => {
                      const segmentAngle = (2 * Math.PI) / array.length
                      const startAngle = index * segmentAngle - Math.PI / 2
                      const endAngle = startAngle + segmentAngle

                      const innerRadius = 50
                      const outerRadius = innerRadius + score * 0.5

                      const startX = 100 + innerRadius * Math.cos(startAngle)
                      const startY = 100 + innerRadius * Math.sin(startAngle)

                      const outerStartX = 100 + outerRadius * Math.cos(startAngle)
                      const outerStartY = 100 + outerRadius * Math.sin(startAngle)

                      const outerEndX = 100 + outerRadius * Math.cos(endAngle)
                      const outerEndY = 100 + outerRadius * Math.sin(endAngle)

                      const endX = 100 + innerRadius * Math.cos(endAngle)
                      const endY = 100 + innerRadius * Math.sin(endAngle)

                      const largeArcFlag = segmentAngle > Math.PI ? 1 : 0

                      const pathData = [
                        `M ${startX} ${startY}`,
                        `L ${outerStartX} ${outerStartY}`,
                        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
                        `L ${endX} ${endY}`,
                        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX} ${startY}`,
                        "Z",
                      ].join(" ")

                      const labelX = 100 + (outerRadius + 15) * Math.cos(startAngle + segmentAngle / 2)
                      const labelY = 100 + (outerRadius + 15) * Math.sin(startAngle + segmentAngle / 2)

                      return (
                        <g key={category}>
                          <path d={pathData} fill={categoryColors[category]} stroke="white" strokeWidth="1" />
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="10"
                            fill="currentColor"
                          >
                            {categoryLabels[category]}
                          </text>
                        </g>
                      )
                    })}
                    <circle cx="100" cy="100" r="45" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                    <text x="100" y="95" textAnchor="middle" fontSize="12" fill="currentColor">
                      Overall
                    </text>
                    <text x="100" y="110" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
                      {getConcernLevel(
                        Object.values(results.scores).reduce((sum, score) => sum + score, 0) /
                          Object.values(results.scores).length,
                      )}
                    </text>
                  </div>
                </div>

                <svg viewBox="0 0 200 200" width="100%" height="100%">
                  {Object.entries(results.scores).map(([category, score], index, array) => {
                    const segmentAngle = (2 * Math.PI) / array.length
                    const startAngle = index * segmentAngle - Math.PI / 2
                    const endAngle = startAngle + segmentAngle

                    const innerRadius = 50
                    const outerRadius = innerRadius + score * 0.5

                    const startX = 100 + innerRadius * Math.cos(startAngle)
                    const startY = 100 + innerRadius * Math.sin(startAngle)

                    const outerStartX = 100 + outerRadius * Math.cos(startAngle)
                    const outerStartY = 100 + outerRadius * Math.sin(startAngle)

                    const outerEndX = 100 + outerRadius * Math.cos(endAngle)
                    const outerEndY = 100 + outerRadius * Math.sin(endAngle)

                    const endX = 100 + innerRadius * Math.cos(endAngle)
                    const endY = 100 + innerRadius * Math.sin(endAngle)

                    const largeArcFlag = segmentAngle > Math.PI ? 1 : 0

                    const pathData = [
                      `M ${startX} ${startY}`,
                      `L ${outerStartX} ${outerStartY}`,
                      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
                      `L ${endX} ${endY}`,
                      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startX} ${startY}`,
                      "Z",
                    ].join(" ")

                    const labelX = 100 + (outerRadius + 15) * Math.cos(startAngle + segmentAngle / 2)
                    const labelY = 100 + (outerRadius + 15) * Math.sin(startAngle + segmentAngle / 2)

                    return (
                      <g key={category}>
                        <path d={pathData} fill={categoryColors[category]} stroke="white" strokeWidth="1" />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fill="currentColor"
                        >
                          {categoryLabels[category]}
                        </text>
                      </g>
                    )
                  })}
                  <circle cx="100" cy="100" r="45" fill="white" stroke="#e5e7eb" strokeWidth="1" />
                  <text x="100" y="95" textAnchor="middle" fontSize="12" fill="currentColor">
                    Overall
                  </text>
                  <text x="100" y="110" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">
                    {getConcernLevel(
                      Object.values(results.scores).reduce((sum, score) => sum + score, 0) /
                        Object.values(results.scores).length,
                    )}
                  </text>
                </svg>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(categoryColors).map(([category, color]) => (
                  <div key={category} className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                    <span>{categoryLabels[category]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-sm w-full">
                <p className="font-semibold mb-1">Important Note:</p>
                <p>
                  This assessment is not a diagnostic tool. If you're experiencing significant distress, please consult
                  with a mental health professional.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/assessment">Retake Assessment</Link>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/chat">Talk to AI Assistant</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

