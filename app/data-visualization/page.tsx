"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  BarChart,
  LineChart,
  Calendar,
  PieChart,
  Lightbulb,
  Download,
  Moon,
  Activity,
  Brain,
  Heart,
  AlertTriangle,
  Zap,
  Users,
} from "lucide-react"
import Link from "next/link"

type Mood = {
  id: string
  value: string
  intensity: number
  note: string
  sleepHours?: number
  studyHours?: number
  socialInteraction?: number
  activities?: string[]
  timestamp: string
}

export default function DataVisualization() {
  const [moods, setMoods] = useState<Mood[]>([])
  const [timeRange, setTimeRange] = useState<string>("month")
  const [stressLevel, setStressLevel] = useState<number>(0)
  const [anxietyLevel, setAnxietyLevel] = useState<number>(0)
  const [depressionLevel, setDepressionLevel] = useState<number>(0)
  const [wellbeingScore, setWellbeingScore] = useState<number>(0)
  const [chartData, setChartData] = useState<any>({})
  const chartRef = useRef<HTMLCanvasElement>(null)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      // Load moods from localStorage
      const storedMoods = localStorage.getItem(`moods_${user.id}`)
      if (storedMoods) {
        const parsedMoods = JSON.parse(storedMoods)
        setMoods(parsedMoods)

        // Calculate stress, anxiety, and depression levels
        calculateMentalHealthMetrics(parsedMoods)
      } else {
        // Generate sample data for demonstration
        const sampleMoods = generateSampleMoodData()
        setMoods(sampleMoods)
        localStorage.setItem(`moods_${user.id}`, JSON.stringify(sampleMoods))

        // Calculate metrics from sample data
        calculateMentalHealthMetrics(sampleMoods)
      }
    }
  }, [user, isLoading, router])

  // Generate sample mood data for demonstration
  const generateSampleMoodData = () => {
    const moodTypes = ["happy", "calm", "neutral", "sad", "stressed"]
    const activities = [
      "Exercise",
      "Meditation",
      "Reading",
      "Studying",
      "Socializing",
      "Gaming",
      "Watching TV",
      "Outdoors",
    ]
    const sampleMoods: Mood[] = []

    // Generate 30 days of mood data
    const now = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Create a pattern: more stressed on weekdays, happier on weekends
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
      let moodValue

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend - more likely to be happy or calm
        moodValue = moodTypes[Math.floor(Math.random() * 3)] // happy, calm, or neutral
      } else if (dayOfWeek === 1 || dayOfWeek === 4) {
        // Monday and Thursday - more likely to be stressed
        moodValue = moodTypes[Math.floor(Math.random() * 2) + 3] // sad or stressed
      } else {
        // Other weekdays - random
        moodValue = moodTypes[Math.floor(Math.random() * moodTypes.length)]
      }

      // Random intensity between 3-10
      const intensity = Math.floor(Math.random() * 8) + 3

      // Random sleep hours between 5-9
      const sleepHours = Math.floor(Math.random() * 5) + 5

      // Random study hours between 1-8
      const studyHours = Math.floor(Math.random() * 8) + 1

      // Random social interaction level between 1-5
      const socialInteraction = Math.floor(Math.random() * 5) + 1

      // Random activities (1-3)
      const numActivities = Math.floor(Math.random() * 3) + 1
      const moodActivities = []
      for (let j = 0; j < numActivities; j++) {
        const activity = activities[Math.floor(Math.random() * activities.length)]
        if (!moodActivities.includes(activity)) {
          moodActivities.push(activity)
        }
      }

      sampleMoods.push({
        id: crypto.randomUUID(),
        value: moodValue,
        intensity,
        note: "",
        sleepHours,
        studyHours,
        socialInteraction,
        activities: moodActivities,
        timestamp: date.toISOString(),
      })
    }

    return sampleMoods
  }

  const calculateMentalHealthMetrics = (moodData: Mood[]) => {
    // Calculate stress level (0-100)
    const stressedMoods = moodData.filter((m) => m.value === "stressed")
    const stressPercentage = (stressedMoods.length / moodData.length) * 100
    const avgStressIntensity = stressedMoods.reduce((sum, m) => sum + m.intensity, 0) / (stressedMoods.length || 1)
    const calculatedStressLevel = Math.min(100, (stressPercentage * avgStressIntensity) / 10)
    setStressLevel(Math.round(calculatedStressLevel))

    // Calculate anxiety level (0-100) - using sleep hours as a proxy
    const lowSleepMoods = moodData.filter((m) => (m.sleepHours || 0) < 6)
    const anxietyPercentage = (lowSleepMoods.length / moodData.length) * 100
    const calculatedAnxietyLevel = Math.min(100, anxietyPercentage * 1.5)
    setAnxietyLevel(Math.round(calculatedAnxietyLevel))

    // Calculate depression level (0-100)
    const sadMoods = moodData.filter((m) => m.value === "sad")
    const depressionPercentage = (sadMoods.length / moodData.length) * 100
    const lowSocialMoods = moodData.filter((m) => (m.socialInteraction || 0) <= 2)
    const socialIsolationFactor = (lowSocialMoods.length / moodData.length) * 100
    const calculatedDepressionLevel = Math.min(100, depressionPercentage * 0.7 + socialIsolationFactor * 0.3)
    setDepressionLevel(Math.round(calculatedDepressionLevel))

    // Calculate overall wellbeing score (0-100)
    const positiveMoods = moodData.filter((m) => m.value === "happy" || m.value === "calm")
    const positivePercentage = (positiveMoods.length / moodData.length) * 100
    const goodSleepFactor = (moodData.filter((m) => (m.sleepHours || 0) >= 7).length / moodData.length) * 100
    const goodSocialFactor = (moodData.filter((m) => (m.socialInteraction || 0) >= 3).length / moodData.length) * 100
    const calculatedWellbeingScore = Math.min(
      100,
      positivePercentage * 0.5 + goodSleepFactor * 0.25 + goodSocialFactor * 0.25,
    )
    setWellbeingScore(Math.round(calculatedWellbeingScore))

    // Prepare chart data
    prepareChartData(moodData)
  }

  const prepareChartData = (moodData: Mood[]) => {
    // Mood distribution data for pie chart
    const moodCounts = {
      happy: moodData.filter((m) => m.value === "happy").length,
      calm: moodData.filter((m) => m.value === "calm").length,
      neutral: moodData.filter((m) => m.value === "neutral").length,
      sad: moodData.filter((m) => m.value === "sad").length,
      stressed: moodData.filter((m) => m.value === "stressed").length,
    }

    // Daily mood data for line chart
    const dailyMoodData = getDailyMoodData(moodData)

    // Sleep vs mood correlation data
    const sleepCorrelationData = getCorrelationData(moodData)

    // Activity impact data
    const activityImpactData = getActivityImpactData(moodData)

    // Weekly pattern data
    const weeklyPatternData = getWeeklyMoodData(moodData)

    setChartData({
      moodDistribution: moodCounts,
      dailyMood: dailyMoodData,
      sleepCorrelation: sleepCorrelationData,
      activityImpact: activityImpactData,
      weeklyPattern: weeklyPatternData,
    })
  }

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "happy":
        return "#4ade80" // green-400
      case "calm":
        return "#a78bfa" // purple-400
      case "neutral":
        return "#facc15" // yellow-400
      case "sad":
        return "#60a5fa" // blue-400
      case "stressed":
        return "#f87171" // red-400
      default:
        return "#94a3b8" // slate-400
    }
  }

  const getMoodValue = (mood: string) => {
    switch (mood) {
      case "happy":
        return 5
      case "calm":
        return 4
      case "neutral":
        return 3
      case "sad":
        return 2
      case "stressed":
        return 1
      default:
        return 0
    }
  }

  const getFilteredMoods = () => {
    if (moods.length === 0) return []

    const now = new Date()
    let cutoffDate = new Date()

    switch (timeRange) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7)
        break
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "3months":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case "year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        cutoffDate = new Date(0) // All time
    }

    return moods.filter((mood) => new Date(mood.timestamp) >= cutoffDate)
  }

  const getMoodDistribution = () => {
    const filtered = getFilteredMoods()
    const distribution: Record<string, number> = {
      happy: 0,
      calm: 0,
      neutral: 0,
      sad: 0,
      stressed: 0,
    }

    filtered.forEach((mood) => {
      distribution[mood.value]++
    })

    return distribution
  }

  const getWeeklyMoodData = (moodData: Mood[]) => {
    const filtered = moodData
    const weeklyData: Record<string, number[]> = {}

    // Initialize with empty arrays for each day
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    days.forEach((day) => {
      weeklyData[day] = []
    })

    // Group mood values by day of week
    filtered.forEach((mood) => {
      const date = new Date(mood.timestamp)
      const dayOfWeek = days[date.getDay()]
      weeklyData[dayOfWeek].push(getMoodValue(mood.value))
    })

    // Calculate average mood for each day
    const averages = days.map((day) => {
      const values = weeklyData[day]
      const avg = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
      return { day, value: Number(avg.toFixed(1)) }
    })

    return averages
  }

  const getDailyMoodData = (moodData: Mood[]) => {
    // Sort by date
    const sortedMoods = [...moodData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Group by day and get the mood value
    const dailyData: { date: string; value: number }[] = []
    const processedDates = new Set()

    sortedMoods.forEach((mood) => {
      const date = new Date(mood.timestamp).toISOString().split("T")[0]

      if (!processedDates.has(date)) {
        processedDates.add(date)

        // Get all moods for this day
        const dayMoods = sortedMoods.filter((m) => new Date(m.timestamp).toISOString().split("T")[0] === date)

        // Calculate average mood value for the day
        const avgValue = dayMoods.reduce((sum, m) => sum + getMoodValue(m.value), 0) / dayMoods.length

        dailyData.push({
          date,
          value: Number(avgValue.toFixed(1)),
        })
      }
    })

    return dailyData
  }

  const getCorrelationData = (moodData: Mood[]) => {
    const filtered = moodData.filter((m) => m.sleepHours !== undefined)

    if (filtered.length === 0) return []

    // Group by sleep hours rounded to nearest 0.5
    const sleepGroups: Record<string, number[]> = {}

    filtered.forEach((mood) => {
      const sleepHours = mood.sleepHours || 0
      const roundedSleep = Math.round(sleepHours * 2) / 2
      const key = roundedSleep.toString()

      if (!sleepGroups[key]) {
        sleepGroups[key] = []
      }

      sleepGroups[key].push(getMoodValue(mood.value))
    })

    // Calculate average mood for each sleep amount
    return Object.entries(sleepGroups)
      .map(([sleep, values]) => ({
        sleep: Number(sleep),
        avgMood: Number((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)),
      }))
      .sort((a, b) => a.sleep - b.sleep)
  }

  const getActivityImpactData = (moodData: Mood[]) => {
    // Get moods with activities
    const moodsWithActivities = moodData.filter((m) => m.activities && m.activities.length > 0)

    if (moodsWithActivities.length === 0) return []

    // Calculate average mood for each activity
    const activityImpact: Record<string, { count: number; sum: number }> = {}

    moodsWithActivities.forEach((mood) => {
      const moodValue = getMoodValue(mood.value)

      mood.activities?.forEach((activity) => {
        if (!activityImpact[activity]) {
          activityImpact[activity] = { count: 0, sum: 0 }
        }

        activityImpact[activity].count++
        activityImpact[activity].sum += moodValue
      })
    })

    // Convert to array and sort by impact
    return Object.entries(activityImpact)
      .filter(([_, data]) => data.count >= 2) // Only include activities with at least 2 entries
      .map(([activity, data]) => ({
        activity,
        avgMood: data.sum / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avgMood - a.avgMood)
  }

  const getStressLevelCategory = (level: number) => {
    if (level <= 20) return { label: "Low", color: "bg-green-500" }
    if (level <= 40) return { label: "Mild", color: "bg-yellow-500" }
    if (level <= 60) return { label: "Moderate", color: "bg-orange-500" }
    if (level <= 80) return { label: "High", color: "bg-red-500" }
    return { label: "Severe", color: "bg-red-700" }
  }

  const getWellbeingCategory = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "bg-green-500" }
    if (score >= 60) return { label: "Good", color: "bg-green-400" }
    if (score >= 40) return { label: "Fair", color: "bg-yellow-500" }
    if (score >= 20) return { label: "Poor", color: "bg-orange-500" }
    return { label: "Very Poor", color: "bg-red-500" }
  }

  const handleDownloadData = () => {
    // Create CSV data
    const headers = [
      "Date",
      "Mood",
      "Intensity",
      "Sleep Hours",
      "Study Hours",
      "Social Interaction",
      "Activities",
      "Notes",
    ]
    const csvRows = [headers]

    getFilteredMoods().forEach((mood) => {
      const row = [
        new Date(mood.timestamp).toLocaleDateString(),
        mood.value,
        mood.intensity.toString(),
        (mood.sleepHours || "").toString(),
        (mood.studyHours || "").toString(),
        (mood.socialInteraction || "").toString(),
        (mood.activities || []).join("; "),
        mood.note,
      ]
      csvRows.push(row)
    })

    // Convert to CSV string
    const csvContent = csvRows.map((row) => row.join(",")).join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `mental_health_data_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Data Visualization</h1>
            <p className="text-muted-foreground">Visualize and understand your mental health patterns</p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="3months">Past 3 Months</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleDownloadData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Mental Health Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2 text-red-500" />
                Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{stressLevel}%</div>
              <Progress value={stressLevel} className="h-2 mb-2" />
              <Badge className={`${getStressLevelCategory(stressLevel).color} text-white`}>
                {getStressLevelCategory(stressLevel).label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-500" />
                Anxiety Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{anxietyLevel}%</div>
              <Progress value={anxietyLevel} className="h-2 mb-2" />
              <Badge className={`${getStressLevelCategory(anxietyLevel).color} text-white`}>
                {getStressLevelCategory(anxietyLevel).label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-5 w-5 mr-2 text-blue-500" />
                Depression Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{depressionLevel}%</div>
              <Progress value={depressionLevel} className="h-2 mb-2" />
              <Badge className={`${getStressLevelCategory(depressionLevel).color} text-white`}>
                {getStressLevelCategory(depressionLevel).label}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-green-500" />
                Wellbeing Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{wellbeingScore}%</div>
              <Progress value={wellbeingScore} className="h-2 mb-2" />
              <Badge className={`${getWellbeingCategory(wellbeingScore).color} text-white`}>
                {getWellbeingCategory(wellbeingScore).label}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="trends">Mood Trends</TabsTrigger>
            <TabsTrigger value="distribution">Emotion Distribution</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  Mood Trend Over Time
                </CardTitle>
                <CardDescription>Track how your mood changes over days and weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                  {chartData.dailyMood && chartData.dailyMood.length > 0 ? (
                    <div className="w-full h-full relative">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 h-full border-l border-gray-200 flex flex-col justify-between text-xs text-muted-foreground">
                        <span>Excellent</span>
                        <span>Good</span>
                        <span>Neutral</span>
                        <span>Poor</span>
                        <span>Very Poor</span>
                      </div>

                      {/* Line chart */}
                      <div className="ml-16 h-full flex items-end">
                        <svg className="w-full h-full" viewBox={`0 0 ${chartData.dailyMood.length * 40} 200`}>
                          <path
                            d={chartData.dailyMood
                              .map((point: any, i: number) => {
                                const x = i * 40 + 20
                                const y = 200 - point.value * 40
                                return `${i === 0 ? "M" : "L"} ${x} ${y}`
                              })
                              .join(" ")}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                          />

                          {chartData.dailyMood.map((point: any, i: number) => (
                            <circle
                              key={i}
                              cx={i * 40 + 20}
                              cy={200 - point.value * 40}
                              r="4"
                              fill="hsl(var(--primary))"
                            />
                          ))}
                        </svg>
                      </div>

                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-16 right-0 border-t border-gray-200 flex justify-between text-xs text-muted-foreground overflow-x-auto">
                        {chartData.dailyMood.map((point: any, i: number) => (
                          <span key={i} className="px-2">
                            {new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Not enough data to display trend</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Mood Patterns</CardTitle>
                  <CardDescription>See how your mood varies by day of the week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                    {chartData.weeklyPattern && chartData.weeklyPattern.some((d: any) => d.value > 0) ? (
                      <div className="w-full h-full flex items-end justify-around">
                        {chartData.weeklyPattern.map((day: any, index: number) => (
                          <div key={index} className="flex flex-col items-center">
                            <div
                              className="w-8 bg-primary/80 rounded-t-sm"
                              style={{
                                height: day.value > 0 ? `${day.value * 20}%` : "5%",
                                opacity: day.value > 0 ? 1 : 0.2,
                              }}
                            ></div>
                            <div className="mt-2 text-xs text-muted-foreground">{day.day.substring(0, 3)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center">
                        <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Not enough data to display patterns</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood Heatmap Calendar</CardTitle>
                  <CardDescription>View mood intensity over time with color coding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                    {moods.length > 7 ? (
                      <div className="grid grid-cols-7 gap-2 w-full max-w-3xl mx-auto">
                        {Array.from({ length: 28 }, (_, i) => {
                          // This would use real data in production
                          const date = new Date()
                          date.setDate(date.getDate() - (27 - i))

                          // Find mood for this date if it exists
                          const dayMoods = moods.filter((m) => {
                            const moodDate = new Date(m.timestamp)
                            return moodDate.toDateString() === date.toDateString()
                          })

                          let moodColor = "#e2e8f0" // slate-200
                          let moodValue = ""

                          if (dayMoods.length > 0) {
                            // Use the average mood for the day
                            const moodValues = dayMoods.map((m) => getMoodValue(m.value))
                            const avgMood = moodValues.reduce((sum, val) => sum + val, 0) / moodValues.length

                            if (avgMood >= 4.5) {
                              moodColor = "#4ade80" // green-400
                              moodValue = "Happy"
                            } else if (avgMood >= 3.5) {
                              moodColor = "#a78bfa" // purple-400
                              moodValue = "Calm"
                            } else if (avgMood >= 2.5) {
                              moodColor = "#facc15" // yellow-400
                              moodValue = "Neutral"
                            } else if (avgMood >= 1.5) {
                              moodColor = "#60a5fa" // blue-400
                              moodValue = "Sad"
                            } else {
                              moodColor = "#f87171" // red-400
                              moodValue = "Stressed"
                            }
                          }

                          return (
                            <div
                              key={i}
                              className="aspect-square rounded-md flex flex-col items-center justify-center text-xs"
                              style={{
                                backgroundColor: moodColor,
                                color: moodValue ? "#fff" : "inherit",
                              }}
                              title={
                                moodValue ? `${date.toLocaleDateString()}: ${moodValue}` : date.toLocaleDateString()
                              }
                            >
                              <span className="font-medium">{date.getDate()}</span>
                              {moodValue && <span className="text-[10px] mt-1">{moodValue.charAt(0)}</span>}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Track more moods to see your heatmap calendar</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Emotion Distribution
                </CardTitle>
                <CardDescription>Breakdown of your mood categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                  {Object.values(getMoodDistribution()).some((v) => v > 0) ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
                      <div className="relative w-64 h-64">
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {(() => {
                            const distribution = getMoodDistribution()
                            const total = Object.values(distribution).reduce((sum, val) => sum + val, 0)

                            if (total === 0) return null

                            let startAngle = 0
                            const elements = []

                            Object.entries(distribution).forEach(([mood, count], index) => {
                              if (count === 0) return

                              const percentage = count / total
                              const angle = percentage * 360
                              const endAngle = startAngle + angle

                              // Calculate the path for the pie slice
                              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
                              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
                              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
                              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

                              const largeArcFlag = angle > 180 ? 1 : 0

                              const pathData = [
                                `M 50 50`,
                                `L ${x1} ${y1}`,
                                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                `Z`,
                              ].join(" ")

                              elements.push(
                                <path
                                  key={mood}
                                  d={pathData}
                                  fill={getMoodColor(mood)}
                                  stroke="white"
                                  strokeWidth="1"
                                />,
                              )

                              // Add label
                              if (percentage > 0.05) {
                                const labelAngle = startAngle + angle / 2
                                const labelRadius = 30
                                const labelX = 50 + labelRadius * Math.cos((labelAngle * Math.PI) / 180)
                                const labelY = 50 + labelRadius * Math.sin((labelAngle * Math.PI) / 180)

                                elements.push(
                                  <text
                                    key={`${mood}-label`}
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="white"
                                    fontSize="4"
                                    fontWeight="bold"
                                  >
                                    {Math.round(percentage * 100)}%
                                  </text>,
                                )
                              }

                              startAngle = endAngle
                            })

                            return elements
                          })()}
                        </svg>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(getMoodDistribution()).map(([mood, count]) => {
                          if (count === 0) return null
                          const total = Object.values(getMoodDistribution()).reduce((sum, val) => sum + val, 0)
                          const percentage = total > 0 ? Math.round((count / total) * 100) : 0

                          return (
                            <div key={mood} className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: getMoodColor(mood) }}
                              ></div>
                              <span className="text-sm font-medium capitalize">{mood}</span>
                              <span className="text-sm text-muted-foreground">
                                {count} entries ({percentage}%)
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Not enough data to display distribution</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly & Monthly Stats</CardTitle>
                  <CardDescription>Percentage of good vs. challenging mood days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Past Week</h3>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        {(() => {
                          const filtered = getFilteredMoods().filter((m) => {
                            const date = new Date(m.timestamp)
                            const now = new Date()
                            const diffTime = Math.abs(now.getTime() - date.getTime())
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            return diffDays <= 7
                          })

                          const goodCount = filtered.filter((m) => m.value === "happy" || m.value === "calm").length
                          const neutralCount = filtered.filter((m) => m.value === "neutral").length
                          const badCount = filtered.filter((m) => m.value === "sad" || m.value === "stressed").length
                          const total = filtered.length

                          const goodPercent = total > 0 ? (goodCount / total) * 100 : 0
                          const neutralPercent = total > 0 ? (neutralCount / total) * 100 : 0
                          const badPercent = total > 0 ? (badCount / total) * 100 : 0

                          return (
                            <div className="flex h-full">
                              <div
                                className="bg-green-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${goodPercent}%` }}
                              >
                                {goodPercent > 10 ? `${Math.round(goodPercent)}%` : ""}
                              </div>
                              <div
                                className="bg-yellow-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${neutralPercent}%` }}
                              >
                                {neutralPercent > 10 ? `${Math.round(neutralPercent)}%` : ""}
                              </div>
                              <div
                                className="bg-red-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${badPercent}%` }}
                              >
                                {badPercent > 10 ? `${Math.round(badPercent)}%` : ""}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Positive</span>
                        <span>Neutral</span>
                        <span>Challenging</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Past Month</h3>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        {(() => {
                          const filtered = getFilteredMoods().filter((m) => {
                            const date = new Date(m.timestamp)
                            const now = new Date()
                            const diffTime = Math.abs(now.getTime() - date.getTime())
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            return diffDays <= 30
                          })

                          const goodCount = filtered.filter((m) => m.value === "happy" || m.value === "calm").length
                          const neutralCount = filtered.filter((m) => m.value === "neutral").length
                          const badCount = filtered.filter((m) => m.value === "sad" || m.value === "stressed").length
                          const total = filtered.length

                          const goodPercent = total > 0 ? (goodCount / total) * 100 : 0
                          const neutralPercent = total > 0 ? (neutralCount / total) * 100 : 0
                          const badPercent = total > 0 ? (badCount / total) * 100 : 0

                          return (
                            <div className="flex h-full">
                              <div
                                className="bg-green-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${goodPercent}%` }}
                              >
                                {goodPercent > 10 ? `${Math.round(goodPercent)}%` : ""}
                              </div>
                              <div
                                className="bg-yellow-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${neutralPercent}%` }}
                              >
                                {neutralPercent > 10 ? `${Math.round(neutralPercent)}%` : ""}
                              </div>
                              <div
                                className="bg-red-400 h-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ width: `${badPercent}%` }}
                              >
                                {badPercent > 10 ? `${Math.round(badPercent)}%` : ""}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Positive</span>
                        <span>Neutral</span>
                        <span>Challenging</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stress Triggers Analysis</CardTitle>
                  <CardDescription>Factors that may contribute to stress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                    {moods.length > 5 ? (
                      <div className="w-full h-full">
                        <div className="space-y-4">
                          {/* Sleep deprivation as stress trigger */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Sleep Deprivation</span>
                              <span className="text-sm text-muted-foreground">
                                {(() => {
                                  const stressedWithLowSleep = moods.filter(
                                    (m) => m.value === "stressed" && (m.sleepHours || 0) < 6,
                                  ).length
                                  const totalStressed = moods.filter((m) => m.value === "stressed").length
                                  const percentage =
                                    totalStressed > 0 ? Math.round((stressedWithLowSleep / totalStressed) * 100) : 0
                                  return `${percentage}%`
                                })()}
                              </span>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="bg-red-400 h-full"
                                style={{
                                  width: `${(() => {
                                    const stressedWithLowSleep = moods.filter(
                                      (m) => m.value === "stressed" && (m.sleepHours || 0) < 6,
                                    ).length
                                    const totalStressed = moods.filter((m) => m.value === "stressed").length
                                    return totalStressed > 0
                                      ? Math.round((stressedWithLowSleep / totalStressed) * 100)
                                      : 0
                                  })()}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Academic pressure as stress trigger */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Academic Pressure</span>
                              <span className="text-sm text-muted-foreground">
                                {(() => {
                                  const stressedWithHighStudy = moods.filter(
                                    (m) => m.value === "stressed" && (m.studyHours || 0) > 6,
                                  ).length
                                  const totalStressed = moods.filter((m) => m.value === "stressed").length
                                  const percentage =
                                    totalStressed > 0 ? Math.round((stressedWithHighStudy / totalStressed) * 100) : 0
                                  return `${percentage}%`
                                })()}
                              </span>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="bg-orange-400 h-full"
                                style={{
                                  width: `${(() => {
                                    const stressedWithHighStudy = moods.filter(
                                      (m) => m.value === "stressed" && (m.studyHours || 0) > 6,
                                    ).length
                                    const totalStressed = moods.filter((m) => m.value === "stressed").length
                                    return totalStressed > 0
                                      ? Math.round((stressedWithHighStudy / totalStressed) * 100)
                                      : 0
                                  })()}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Social isolation as stress trigger */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Social Isolation</span>
                              <span className="text-sm text-muted-foreground">
                                {(() => {
                                  const stressedWithLowSocial = moods.filter(
                                    (m) => m.value === "stressed" && (m.socialInteraction || 0) < 2,
                                  ).length
                                  const totalStressed = moods.filter((m) => m.value === "stressed").length
                                  const percentage =
                                    totalStressed > 0 ? Math.round((stressedWithLowSocial / totalStressed) * 100) : 0
                                  return `${percentage}%`
                                })()}
                              </span>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="bg-yellow-400 h-full"
                                style={{
                                  width: `${(() => {
                                    const stressedWithLowSocial = moods.filter(
                                      (m) => m.value === "stressed" && (m.socialInteraction || 0) < 2,
                                    ).length
                                    const totalStressed = moods.filter((m) => m.value === "stressed").length
                                    return totalStressed > 0
                                      ? Math.round((stressedWithLowSocial / totalStressed) * 100)
                                      : 0
                                  })()}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Not enough data to analyze stress triggers</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sleep-Mood Correlation</CardTitle>
                <CardDescription>Explore how sleep affects your mood</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                  {chartData.sleepCorrelation && chartData.sleepCorrelation.length > 0 ? (
                    <div className="w-full h-full relative">
                      <div className="absolute left-0 top-0 h-full border-l border-gray-200 flex flex-col justify-between text-xs text-muted-foreground">
                        <span>Excellent</span>
                        <span>Good</span>
                        <span>Neutral</span>
                        <span>Poor</span>
                        <span>Very Poor</span>
                      </div>

                      <div className="ml-16 h-full flex items-end">
                        <svg className="w-full h-full" viewBox={`0 0 ${chartData.sleepCorrelation.length * 50} 200`}>
                          {chartData.sleepCorrelation.map((point: any, i: number) => (
                            <circle
                              key={i}
                              cx={i * 50 + 25}
                              cy={200 - point.avgMood * 40}
                              r="6"
                              fill="hsl(var(--primary))"
                            />
                          ))}

                          <path
                            d={chartData.sleepCorrelation
                              .map((point: any, i: number) => {
                                const x = i * 50 + 25
                                const y = 200 - point.avgMood * 40
                                return `${i === 0 ? "M" : "L"} ${x} ${y}`
                              })
                              .join(" ")}
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        </svg>
                      </div>

                      <div className="absolute bottom-0 left-16 right-0 border-t border-gray-200 flex justify-between text-xs text-muted-foreground">
                        {chartData.sleepCorrelation.map((point: any, i: number) => (
                          <span key={i} className="px-2">
                            {point.sleep} hrs
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Moon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Track sleep to see correlation</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Impact</CardTitle>
                  <CardDescription>How different activities affect your mood</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                    {chartData.activityImpact && chartData.activityImpact.length > 0 ? (
                      <div className="w-full h-full flex flex-col justify-center">
                        {chartData.activityImpact.slice(0, 5).map((item: any, index: number) => (
                          <div key={index} className="flex items-center mb-3">
                            <div className="w-24 text-sm truncate mr-2">{item.activity}</div>
                            <div className="flex-1">
                              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${(item.avgMood / 5) * 100}%`,
                                    backgroundColor: (() => {
                                      if (item.avgMood >= 4) return "#4ade80" // green
                                      if (item.avgMood >= 3) return "#facc15" // yellow
                                      return "#f87171" // red
                                    })(),
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="w-12 text-right text-sm ml-2">{item.avgMood.toFixed(1)}</div>
                          </div>
                        ))}
                        <div className="text-xs text-muted-foreground text-center mt-2">
                          Activities with highest positive impact on mood
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Track activities to see their impact</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Social Interaction Effect</CardTitle>
                  <CardDescription>Impact of social interaction on your wellbeing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-800 rounded-md p-4">
                    {moods.some((m) => m.socialInteraction !== undefined) ? (
                      <div className="w-full h-full">
                        <div className="grid grid-cols-5 h-full">
                          {[1, 2, 3, 4, 5].map((level) => {
                            const moodsWithLevel = moods.filter((m) => m.socialInteraction === level)
                            const avgMood =
                              moodsWithLevel.length > 0
                                ? moodsWithLevel.reduce((sum, m) => sum + getMoodValue(m.value), 0) /
                                  moodsWithLevel.length
                                : 0

                            const height = `${avgMood * 20}%`
                            const color = avgMood >= 4 ? "#4ade80" : avgMood >= 3 ? "#facc15" : "#f87171"

                            return (
                              <div key={level} className="flex flex-col items-center justify-end">
                                <div
                                  className="w-12 rounded-t-md"
                                  style={{
                                    height: height,
                                    backgroundColor: color,
                                  }}
                                ></div>
                                <div className="mt-2 text-center">
                                  <div className="text-xs font-medium">Level {level}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {level === 1
                                      ? "Very Low"
                                      : level === 2
                                        ? "Low"
                                        : level === 3
                                          ? "Medium"
                                          : level === 4
                                            ? "High"
                                            : "Very High"}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground text-center mt-4">
                          Social interaction level vs. average mood
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Track social interaction to see its effect</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  AI-Generated Insights
                </CardTitle>
                <CardDescription>Personalized analysis of your mood patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                {moods.length > 5 ? (
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Weekly Pattern Detected</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {(() => {
                          if (chartData.weeklyPattern) {
                            const lowestDay = [...chartData.weeklyPattern].sort((a, b) => a.value - b.value)[0]
                            const highestDay = [...chartData.weeklyPattern].sort((a, b) => b.value - a.value)[0]

                            if (lowestDay.value > 0 && highestDay.value > 0) {
                              return `You tend to feel best on ${highestDay.day}s and most challenged on ${lowestDay.day}s. Consider planning relaxing activities for ${lowestDay.day}s.`
                            }
                          }
                          return "Keep tracking your mood to identify weekly patterns."
                        })()}
                      </p>
                      <div className="bg-primary/5 p-3 rounded-md">
                        <div className="flex items-center">
                          <Lightbulb className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium">Recommendation</span>
                        </div>
                        <p className="text-sm mt-1">
                          {(() => {
                            if (chartData.weeklyPattern) {
                              const lowestDay = [...chartData.weeklyPattern].sort((a, b) => a.value - b.value)[0]
                              if (lowestDay.value > 0) {
                                return `Try to schedule lighter workloads and more self-care activities on ${lowestDay.day}s to improve your wellbeing.`
                              }
                            }
                            return "Maintain a consistent schedule with balanced activities throughout the week."
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Sleep-Mood Correlation</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {(() => {
                          if (chartData.sleepCorrelation && chartData.sleepCorrelation.length >= 3) {
                            const optimalSleep = [...chartData.sleepCorrelation].sort(
                              (a, b) => b.avgMood - a.avgMood,
                            )[0]

                            if (optimalSleep.sleep > 0) {
                              return `Your data suggests you feel best when you sleep around ${optimalSleep.sleep} hours. Consistent sleep of this duration is associated with your most positive moods.`
                            }
                          }
                          return "Your sleep patterns show some correlation with your mood. More data will provide clearer insights."
                        })()}
                      </p>
                      <div className="bg-primary/5 p-3 rounded-md">
                        <div className="flex items-center">
                          <Lightbulb className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium">Recommendation</span>
                        </div>
                        <p className="text-sm mt-1">
                          {(() => {
                            if (chartData.sleepCorrelation && chartData.sleepCorrelation.length >= 3) {
                              const optimalSleep = [...chartData.sleepCorrelation].sort(
                                (a, b) => b.avgMood - a.avgMood,
                              )[0]

                              if (optimalSleep.sleep > 0) {
                                return `Aim for ${optimalSleep.sleep} hours of sleep each night. Establish a consistent sleep schedule and bedtime routine to improve sleep quality.`
                              }
                            }
                            return "Aim for 7-8 hours of quality sleep each night and maintain a consistent sleep schedule."
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Activity Recommendations</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {(() => {
                          if (chartData.activityImpact && chartData.activityImpact.length > 0) {
                            const topActivities = chartData.activityImpact.slice(0, 2).map((a: any) => a.activity)

                            if (topActivities.length > 0) {
                              return `Based on your data, ${topActivities.join(" and ")} have the most positive impact on your mood. Try to incorporate these activities more regularly.`
                            }
                          }
                          return "Continue tracking activities to receive personalized recommendations."
                        })()}
                      </p>
                      <div className="bg-primary/5 p-3 rounded-md">
                        <div className="flex items-center">
                          <Lightbulb className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium">Recommendation</span>
                        </div>
                        <p className="text-sm mt-1">
                          {(() => {
                            if (chartData.activityImpact && chartData.activityImpact.length > 0) {
                              const topActivity = chartData.activityImpact[0]

                              if (topActivity) {
                                return `Schedule ${topActivity.activity} at least ${Math.ceil(topActivity.avgMood)} times per week, especially during periods of stress or low mood.`
                              }
                            }
                            return "Regular exercise, social connection, and mindfulness practices are proven to improve mental wellbeing."
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Not enough data for insights</h3>
                    <p className="text-muted-foreground mb-4">
                      Continue tracking your mood to receive AI-generated insights about your patterns and trends.
                    </p>
                    <Button asChild>
                      <Link href="/mood-tracker">Track Your Mood</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stress Management Plan</CardTitle>
                  <CardDescription>Personalized strategies based on your data</CardDescription>
                </CardHeader>
                <CardContent>
                  {stressLevel > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-5 w-5 text-red-500 mr-2" />
                          <h3 className="font-medium">Current Stress Level</h3>
                        </div>
                        <Badge className={`${getStressLevelCategory(stressLevel).color} text-white`}>
                          {getStressLevelCategory(stressLevel).label}
                        </Badge>
                      </div>

                      <div className="border-l-4 border-primary pl-4 py-2">
                        <h4 className="font-medium">Primary Stress Triggers</h4>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                          {(() => {
                            const triggers = []

                            const stressedWithLowSleep = moods.filter(
                              (m) => m.value === "stressed" && (m.sleepHours || 0) < 6,
                            ).length

                            const stressedWithHighStudy = moods.filter(
                              (m) => m.value === "stressed" && (m.studyHours || 0) > 6,
                            ).length

                            const stressedWithLowSocial = moods.filter(
                              (m) => m.value === "stressed" && (m.socialInteraction || 0) < 2,
                            ).length

                            const totalStressed = moods.filter((m) => m.value === "stressed").length

                            if (totalStressed > 0) {
                              if (stressedWithLowSleep / totalStressed > 0.3) {
                                triggers.push("Sleep deprivation")
                              }

                              if (stressedWithHighStudy / totalStressed > 0.3) {
                                triggers.push("Academic pressure")
                              }

                              if (stressedWithLowSocial / totalStressed > 0.3) {
                                triggers.push("Social isolation")
                              }
                            }

                            return triggers.length > 0 ? (
                              triggers.map((trigger, i) => <li key={i}>{trigger}</li>)
                            ) : (
                              <li>Continue tracking to identify your stress triggers</li>
                            )
                          })()}
                        </ul>
                      </div>

                      <div className="border-l-4 border-primary pl-4 py-2">
                        <h4 className="font-medium">Recommended Strategies</h4>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                          {(() => {
                            const strategies = []

                            // Sleep-related strategies
                            if (moods.some((m) => (m.sleepHours || 0) < 6 && m.value === "stressed")) {
                              strategies.push("Improve sleep hygiene with a consistent bedtime routine")
                            }

                            // Study-related strategies
                            if (moods.some((m) => (m.studyHours || 0) > 6 && m.value === "stressed")) {
                              strategies.push("Break study sessions into 25-minute focused blocks with 5-minute breaks")
                            }

                            // Social-related strategies
                            if (moods.some((m) => (m.socialInteraction || 0) < 2 && m.value === "stressed")) {
                              strategies.push("Schedule regular social activities, even brief ones")
                            }

                            // Activity-related strategies
                            if (chartData.activityImpact && chartData.activityImpact.length > 0) {
                              const bestActivity = chartData.activityImpact[0]
                              if (bestActivity && bestActivity.avgMood > 3.5) {
                                strategies.push(`Increase time spent on ${bestActivity.activity}`)
                              }
                            }

                            // General strategies
                            strategies.push("Practice deep breathing for 5 minutes when feeling stressed")

                            return strategies.map((strategy, i) => <li key={i}>{strategy}</li>)
                          })()}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Track your stress levels to get a personalized plan</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Wellbeing Improvement Plan</CardTitle>
                  <CardDescription>Steps to enhance your overall mental health</CardDescription>
                </CardHeader>
                <CardContent>
                  {wellbeingScore > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart className="h-5 w-5 text-green-500 mr-2" />
                          <h3 className="font-medium">Current Wellbeing</h3>
                        </div>
                        <Badge className={`${getWellbeingCategory(wellbeingScore).color} text-white`}>
                          {getWellbeingCategory(wellbeingScore).label}
                        </Badge>
                      </div>

                      <div className="border-l-4 border-primary pl-4 py-2">
                        <h4 className="font-medium">Your Strengths</h4>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                          {(() => {
                            const strengths = []

                            // Sleep-related strengths
                            if (moods.filter((m) => (m.sleepHours || 0) >= 7).length / moods.length > 0.5) {
                              strengths.push("Consistent healthy sleep patterns")
                            }

                            // Social-related strengths
                            if (moods.filter((m) => (m.socialInteraction || 0) >= 3).length / moods.length > 0.5) {
                              strengths.push("Regular social engagement")
                            }

                            // Positive mood strengths
                            if (
                              moods.filter((m) => m.value === "happy" || m.value === "calm").length / moods.length >
                              0.4
                            ) {
                              strengths.push("Generally positive emotional state")
                            }

                            // Activity-related strengths
                            if (chartData.activityImpact && chartData.activityImpact.length > 0) {
                              const frequentActivity = chartData.activityImpact.find(
                                (a: any) => a.count > moods.length * 0.3,
                              )
                              if (frequentActivity) {
                                strengths.push(`Regular ${frequentActivity.activity}`)
                              }
                            }

                            return strengths.length > 0 ? (
                              strengths.map((strength, i) => <li key={i}>{strength}</li>)
                            ) : (
                              <li>Continue tracking to identify your wellbeing strengths</li>
                            )
                          })()}
                        </ul>
                      </div>

                      <div className="border-l-4 border-primary pl-4 py-2">
                        <h4 className="font-medium">Growth Opportunities</h4>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                          {(() => {
                            const opportunities = []

                            // Sleep-related opportunities
                            if (moods.filter((m) => (m.sleepHours || 0) < 7).length / moods.length > 0.3) {
                              opportunities.push("Increase sleep duration to 7-8 hours")
                            }

                            // Social-related opportunities
                            if (moods.filter((m) => (m.socialInteraction || 0) < 3).length / moods.length > 0.3) {
                              opportunities.push("Increase meaningful social interactions")
                            }

                            // Negative mood opportunities
                            if (
                              moods.filter((m) => m.value === "sad" || m.value === "stressed").length / moods.length >
                              0.3
                            ) {
                              opportunities.push("Develop additional coping strategies for difficult emotions")
                            }

                            // General opportunities
                            opportunities.push("Practice mindfulness or meditation regularly")
                            opportunities.push("Engage in physical activity at least 3 times per week")

                            return opportunities.map((opportunity, i) => <li key={i}>{opportunity}</li>)
                          })()}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Track your wellbeing to get a personalized plan</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

