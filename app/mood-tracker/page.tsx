"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Smile,
  Meh,
  Frown,
  Activity,
  Heart,
  Calendar,
  BarChart,
  Moon,
  BookOpen,
  Users,
  Lightbulb,
  AlertTriangle,
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

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [moodIntensity, setMoodIntensity] = useState<number>(5)
  const [note, setNote] = useState<string>("")
  const [sleepHours, setSleepHours] = useState<number>(7)
  const [studyHours, setStudyHours] = useState<number>(3)
  const [socialInteraction, setSocialInteraction] = useState<number>(3)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [showAdvancedTracking, setShowAdvancedTracking] = useState<boolean>(false)
  const [moods, setMoods] = useState<Mood[]>([])
  const [recommendedActivities, setRecommendedActivities] = useState<string[]>([])
  const [aiInsights, setAiInsights] = useState<string>("")
  const [alertMessage, setAlertMessage] = useState<string>("")
  const { user, isLoading, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      // Load moods from localStorage
      const storedMoods = localStorage.getItem(`moods_${user.id}`)
      if (storedMoods) {
        setMoods(JSON.parse(storedMoods))
      }
    }
  }, [user, isLoading, router])

  // Generate AI insights based on mood data
  useEffect(() => {
    if (moods.length > 5) {
      generateAiInsights(moods)
      checkForNegativeMoodPatterns(moods)
      generateRecommendedActivities(moods)
    }
  }, [moods])

  const generateAiInsights = (moodData: Mood[]) => {
    // This would be a real AI analysis in production
    // For demo, we'll use some predefined insights based on simple patterns

    // Check for day of week patterns
    const dayOfWeekMoods: Record<string, { count: number; sum: number }> = {}

    moodData.forEach((mood) => {
      const date = new Date(mood.timestamp)
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" })

      if (!dayOfWeekMoods[dayOfWeek]) {
        dayOfWeekMoods[dayOfWeek] = { count: 0, sum: 0 }
      }

      const moodValue =
        mood.value === "happy"
          ? 5
          : mood.value === "calm"
            ? 4
            : mood.value === "neutral"
              ? 3
              : mood.value === "sad"
                ? 2
                : 1 // stressed

      dayOfWeekMoods[dayOfWeek].count++
      dayOfWeekMoods[dayOfWeek].sum += moodValue
    })

    // Find the day with lowest average mood
    let lowestMoodDay = ""
    let lowestMoodAvg = 5

    Object.entries(dayOfWeekMoods).forEach(([day, data]) => {
      const avg = data.sum / data.count
      if (avg < lowestMoodAvg && data.count > 1) {
        lowestMoodAvg = avg
        lowestMoodDay = day
      }
    })

    // Check for sleep correlation
    let sleepInsight = ""
    if (moodData.some((m) => m.sleepHours !== undefined)) {
      const goodMoods = moodData.filter((m) => m.value === "happy" || m.value === "calm")
      const badMoods = moodData.filter((m) => m.value === "sad" || m.value === "stressed")

      const avgSleepGood = goodMoods.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / (goodMoods.length || 1)
      const avgSleepBad = badMoods.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / (badMoods.length || 1)

      if (avgSleepGood > avgSleepBad + 1) {
        sleepInsight = `You tend to feel better when you sleep more (${avgSleepGood.toFixed(1)} hours vs ${avgSleepBad.toFixed(1)} hours).`
      }
    }

    // Generate insights
    const insights = []

    if (lowestMoodDay) {
      insights.push(
        `You tend to feel more stressed or down on ${lowestMoodDay}s. Consider planning relaxing activities for this day.`,
      )
    }

    if (sleepInsight) {
      insights.push(sleepInsight)
    }

    // Study correlation
    if (moodData.some((m) => m.studyHours !== undefined)) {
      const highStudyMoods = moodData.filter((m) => (m.studyHours || 0) > 5)
      const highStudyStress = highStudyMoods.filter((m) => m.value === "stressed").length / (highStudyMoods.length || 1)

      if (highStudyStress > 0.5 && highStudyMoods.length > 2) {
        insights.push(
          `Long study sessions (>5 hours) often correlate with higher stress levels. Try breaking up your study time with short breaks.`,
        )
      }
    }

    // Social interaction correlation
    if (moodData.some((m) => m.socialInteraction !== undefined)) {
      const lowSocialMoods = moodData.filter((m) => (m.socialInteraction || 0) < 2)
      const lowSocialSad = lowSocialMoods.filter((m) => m.value === "sad").length / (lowSocialMoods.length || 1)

      if (lowSocialSad > 0.4 && lowSocialMoods.length > 2) {
        insights.push(
          `Days with less social interaction often correlate with sadder moods. Consider reaching out to friends or joining group activities.`,
        )
      }
    }

    if (insights.length === 0) {
      insights.push(
        `Keep tracking your mood to receive personalized insights. The more data you provide, the more accurate the analysis will be.`,
      )
    }

    setAiInsights(insights.join(" "))
  }

  const checkForNegativeMoodPatterns = (moodData: Mood[]) => {
    // Check for prolonged negative mood patterns
    if (moodData.length < 5) return

    const recentMoods = [...moodData]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    const negativeCount = recentMoods.filter((m) => m.value === "sad" || m.value === "stressed").length

    if (negativeCount >= 4) {
      setAlertMessage(
        `We've noticed you've been feeling down lately. Consider trying some self-care activities or speaking with a counselor.`,
      )
    } else {
      setAlertMessage("")
    }
  }

  const generateRecommendedActivities = (moodData: Mood[]) => {
    // This would use AI in production to recommend personalized activities
    // For demo, we'll use the most recent mood to suggest activities

    if (moodData.length === 0) return

    const recentMood = [...moodData].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0]

    let activities: string[] = []

    switch (recentMood.value) {
      case "stressed":
        activities = [
          "5-minute deep breathing exercise",
          "Take a short walk outside",
          "Progressive muscle relaxation",
          "Listen to calming music",
          "Write in a journal about your stressors",
        ]
        break
      case "sad":
        activities = [
          "Call or text a friend",
          "Watch a favorite uplifting movie",
          "Gentle exercise like yoga or stretching",
          "Practice gratitude journaling",
          "Listen to upbeat music",
        ]
        break
      case "neutral":
        activities = [
          "Try a new hobby",
          "Read a book",
          "Take a nature walk",
          "Practice mindfulness meditation",
          "Cook a healthy meal",
        ]
        break
      case "happy":
      case "calm":
        activities = [
          "Share your positive mood with others",
          "Work on a creative project",
          "Practice gratitude journaling",
          "Engage in a favorite hobby",
          "Set goals for the future",
        ]
        break
    }

    setRecommendedActivities(activities)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Select how you're feeling before submitting",
        variant: "destructive",
      })
      return
    }

    if (!user) return

    // Create new mood entry
    const newMood: Mood = {
      id: crypto.randomUUID(),
      value: selectedMood,
      intensity: moodIntensity,
      note: note.trim(),
      timestamp: new Date().toISOString(),
      activities: selectedActivities,
    }

    // Add advanced tracking if enabled
    if (showAdvancedTracking) {
      newMood.sleepHours = sleepHours
      newMood.studyHours = studyHours
      newMood.socialInteraction = socialInteraction
    }

    // Add to moods array
    const updatedMoods = [...moods, newMood]
    setMoods(updatedMoods)

    // Save to localStorage
    localStorage.setItem(`moods_${user.id}`, JSON.stringify(updatedMoods))

    // Check for streak achievement
    checkMoodStreak(updatedMoods)

    // Award XP
    updateUser({ xp: user.xp + 10 })

    // Reset form
    setSelectedMood("")
    setMoodIntensity(5)
    setNote("")
    setSelectedActivities([])

    toast({
      title: "Mood logged successfully",
      description: "Your mood has been recorded. Keep tracking for better insights!",
    })

    // Generate new recommendations based on the updated mood data
    generateRecommendedActivities([...updatedMoods])
  }

  const checkMoodStreak = (moodList: Mood[]) => {
    if (!user) return

    // Check if user has a 7-day streak
    if (moodList.length >= 7) {
      const sortedMoods = [...moodList].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

      const today = new Date()
      let streakDays = 1
      let lastDate = new Date(sortedMoods[0].timestamp)

      for (let i = 1; i < sortedMoods.length; i++) {
        const currentDate = new Date(sortedMoods[i].timestamp)
        const diffDays = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
          streakDays++
          lastDate = currentDate

          if (streakDays >= 7 && !user.achievements.includes("mood_streak_7")) {
            // Award achievement
            const updatedAchievements = [...user.achievements, "mood_streak_7"]
            updateUser({
              achievements: updatedAchievements,
              xp: user.xp + 50,
            })

            toast({
              title: "Achievement Unlocked!",
              description: "Consistency: You've tracked your mood for 7 days in a row!",
            })

            break
          }
        } else if (diffDays > 1) {
          break
        }
      }
    }
  }

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return <Smile className="h-6 w-6 text-green-500" />
      case "neutral":
        return <Meh className="h-6 w-6 text-yellow-500" />
      case "sad":
        return <Frown className="h-6 w-6 text-blue-500" />
      case "stressed":
        return <Activity className="h-6 w-6 text-red-500" />
      case "calm":
        return <Heart className="h-6 w-6 text-purple-500" />
      default:
        return null
    }
  }

  const getMoodText = (mood: string) => {
    switch (mood) {
      case "happy":
        return "Happy"
      case "neutral":
        return "Neutral"
      case "sad":
        return "Sad"
      case "stressed":
        return "Stressed"
      case "calm":
        return "Calm"
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter((a) => a !== activity))
    } else {
      setSelectedActivities([...selectedActivities, activity])
    }
  }

  const activityOptions = [
    "Exercise",
    "Meditation",
    "Reading",
    "Studying",
    "Socializing",
    "Gaming",
    "Watching TV",
    "Outdoors",
    "Creative Work",
    "Resting",
    "Family Time",
  ]

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

        <h1 className="text-3xl font-bold mb-6">Mood Tracker</h1>

        <Tabs defaultValue="log" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="log">Log Mood</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="log">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>How are you feeling today?</CardTitle>
                <CardDescription>Track your mood to gain insights into your emotional patterns</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={selectedMood}
                    onValueChange={setSelectedMood}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Label
                        htmlFor="happy"
                        className={`cursor-pointer border rounded-lg p-4 w-full flex flex-col items-center ${
                          selectedMood === "happy"
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <Smile className="h-8 w-8 text-green-500 mb-2" />
                        <div className="text-center">Happy</div>
                        <RadioGroupItem value="happy" id="happy" className="sr-only" />
                      </Label>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <Label
                        htmlFor="neutral"
                        className={`cursor-pointer border rounded-lg p-4 w-full flex flex-col items-center ${
                          selectedMood === "neutral"
                            ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <Meh className="h-8 w-8 text-yellow-500 mb-2" />
                        <div className="text-center">Neutral</div>
                        <RadioGroupItem value="neutral" id="neutral" className="sr-only" />
                      </Label>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <Label
                        htmlFor="sad"
                        className={`cursor-pointer border rounded-lg p-4 w-full flex flex-col items-center ${
                          selectedMood === "sad"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <Frown className="h-8 w-8 text-blue-500 mb-2" />
                        <div className="text-center">Sad</div>
                        <RadioGroupItem value="sad" id="sad" className="sr-only" />
                      </Label>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <Label
                        htmlFor="stressed"
                        className={`cursor-pointer border rounded-lg p-4 w-full flex flex-col items-center ${
                          selectedMood === "stressed"
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <Activity className="h-8 w-8 text-red-500 mb-2" />
                        <div className="text-center">Stressed</div>
                        <RadioGroupItem value="stressed" id="stressed" className="sr-only" />
                      </Label>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <Label
                        htmlFor="calm"
                        className={`cursor-pointer border rounded-lg p-4 w-full flex flex-col items-center ${
                          selectedMood === "calm"
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <Heart className="h-8 w-8 text-purple-500 mb-2" />
                        <div className="text-center">Calm</div>
                        <RadioGroupItem value="calm" id="calm" className="sr-only" />
                      </Label>
                    </div>
                  </RadioGroup>

                  {selectedMood && (
                    <div className="space-y-2">
                      <Label htmlFor="intensity">Intensity (1-10)</Label>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">Mild</span>
                        <Slider
                          id="intensity"
                          min={1}
                          max={10}
                          step={1}
                          value={[moodIntensity]}
                          onValueChange={(value) => setMoodIntensity(value[0])}
                          className="flex-1"
                        />
                        <span className="text-sm">Intense</span>
                        <span className="w-8 text-center font-medium">{moodIntensity}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="note">Add a note (optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="What's contributing to your mood today?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="advanced-tracking">Advanced Tracking</Label>
                      <Switch
                        id="advanced-tracking"
                        checked={showAdvancedTracking}
                        onCheckedChange={setShowAdvancedTracking}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track additional factors that may influence your mood
                    </p>
                  </div>

                  {showAdvancedTracking && (
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4 text-indigo-500" />
                          <Label htmlFor="sleep">Hours of Sleep Last Night</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="sleep"
                            min={0}
                            max={12}
                            step={0.5}
                            value={[sleepHours]}
                            onValueChange={(value) => setSleepHours(value[0])}
                            className="flex-1"
                          />
                          <span className="w-12 text-center font-medium">{sleepHours}h</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-amber-500" />
                          <Label htmlFor="study">Hours Spent Studying/Working</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="study"
                            min={0}
                            max={12}
                            step={0.5}
                            value={[studyHours]}
                            onValueChange={(value) => setStudyHours(value[0])}
                            className="flex-1"
                          />
                          <span className="w-12 text-center font-medium">{studyHours}h</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <Label htmlFor="social">Social Interaction Level</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            id="social"
                            min={1}
                            max={5}
                            step={1}
                            value={[socialInteraction]}
                            onValueChange={(value) => setSocialInteraction(value[0])}
                            className="flex-1"
                          />
                          <span className="w-12 text-center font-medium">
                            {socialInteraction === 1
                              ? "Very Low"
                              : socialInteraction === 2
                                ? "Low"
                                : socialInteraction === 3
                                  ? "Medium"
                                  : socialInteraction === 4
                                    ? "High"
                                    : "Very High"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Activities Today (Select all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {activityOptions.map((activity) => (
                        <Button
                          key={activity}
                          type="button"
                          variant={selectedActivities.includes(activity) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleActivity(activity)}
                        >
                          {activity}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    Log Mood
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Your Mood History</CardTitle>
                <CardDescription>Review your past mood entries</CardDescription>
              </CardHeader>
              <CardContent>
                {moods.length > 0 ? (
                  <div className="space-y-4">
                    {[...moods].reverse().map((mood) => (
                      <div key={mood.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {getMoodIcon(mood.value)}
                            <span className="ml-2 font-medium">{getMoodText(mood.value)}</span>
                            {mood.intensity && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                (Intensity: {mood.intensity}/10)
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{formatDate(mood.timestamp)}</span>
                        </div>

                        {mood.note && <p className="text-sm mb-3">{mood.note}</p>}

                        {(mood.sleepHours !== undefined ||
                          mood.studyHours !== undefined ||
                          mood.socialInteraction !== undefined) && (
                          <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-muted-foreground">
                            {mood.sleepHours !== undefined && (
                              <div className="flex items-center">
                                <Moon className="h-3 w-3 mr-1" />
                                <span>Sleep: {mood.sleepHours}h</span>
                              </div>
                            )}
                            {mood.studyHours !== undefined && (
                              <div className="flex items-center">
                                <BookOpen className="h-3 w-3 mr-1" />
                                <span>Study: {mood.studyHours}h</span>
                              </div>
                            )}
                            {mood.socialInteraction !== undefined && (
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                <span>
                                  Social:{" "}
                                  {mood.socialInteraction === 1
                                    ? "Very Low"
                                    : mood.socialInteraction === 2
                                      ? "Low"
                                      : mood.socialInteraction === 3
                                        ? "Medium"
                                        : mood.socialInteraction === 4
                                          ? "High"
                                          : "Very High"}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {mood.activities && mood.activities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {mood.activities.map((activity, index) => (
                              <span key={index} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {activity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No mood entries yet</h3>
                    <p className="text-muted-foreground mb-4">Start tracking your mood to see your history here</p>
                    <Button asChild>
                      <Link href="#" onClick={() => document.querySelector('[data-value="log"]')?.click()}>
                        Log Your First Mood
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>Personalized analysis based on your mood patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  {alertMessage && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-4 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Mood Alert</p>
                        <p className="text-sm text-muted-foreground">{alertMessage}</p>
                      </div>
                    </div>
                  )}

                  {moods.length >= 5 ? (
                    <div className="space-y-4">
                      <p>{aiInsights || "Keep tracking your mood to receive personalized insights."}</p>

                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Pattern Detection</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Stress Triggers:</span>
                            <span className="text-muted-foreground">
                              {moods.some((m) => m.value === "stressed")
                                ? "Academic pressure, Sleep deficit"
                                : "No data yet"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Mood Boosters:</span>
                            <span className="text-muted-foreground">
                              {moods.some((m) => m.value === "happy") ? "Social activities, Exercise" : "No data yet"}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Sleep Impact:</span>
                            <span className="text-muted-foreground">
                              {moods.some((m) => m.sleepHours !== undefined) ? "Moderate correlation" : "No data yet"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Not enough data for insights</h3>
                      <p className="text-muted-foreground mb-4">
                        Log your mood at least 5 times to see patterns and insights
                      </p>
                      <div className="text-sm text-muted-foreground">
                        You've logged {moods.length} out of 5 required entries
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                  <CardDescription>Breakdown of your emotional states</CardDescription>
                </CardHeader>
                <CardContent>
                  {moods.length >= 3 ? (
                    <div className="space-y-6">
                      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
                        {/* This would be a real chart in production */}
                        <div className="w-full h-full p-4 flex items-end justify-around">
                          {["happy", "calm", "neutral", "sad", "stressed"].map((mood) => {
                            const count = moods.filter((m) => m.value === mood).length
                            const percentage = Math.round((count / moods.length) * 100)
                            const height = percentage > 0 ? `${Math.max(percentage, 10)}%` : "5%"

                            return (
                              <div key={mood} className="flex flex-col items-center">
                                <div
                                  className={`w-12 rounded-t-md ${
                                    mood === "happy"
                                      ? "bg-green-500"
                                      : mood === "calm"
                                        ? "bg-purple-500"
                                        : mood === "neutral"
                                          ? "bg-yellow-500"
                                          : mood === "sad"
                                            ? "bg-blue-500"
                                            : "bg-red-500"
                                  }`}
                                  style={{ height }}
                                ></div>
                                <div className="mt-2 flex flex-col items-center">
                                  {getMoodIcon(mood)}
                                  <span className="text-xs mt-1">{percentage}%</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Weekly Summary</h3>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const positiveCount = moods.filter((m) => m.value === "happy" || m.value === "calm").length
                            const negativeCount = moods.filter(
                              (m) => m.value === "sad" || m.value === "stressed",
                            ).length
                            const positivePercentage = Math.round((positiveCount / moods.length) * 100)

                            if (positivePercentage > 70) {
                              return "You've been feeling mostly positive this week. Great job maintaining your mental wellbeing!"
                            } else if (positivePercentage > 50) {
                              return "You've had a balanced week with more positive than negative emotions."
                            } else if (positivePercentage > 30) {
                              return "You've experienced more challenging emotions this week. Consider trying some self-care activities."
                            } else {
                              return "You've had a difficult week emotionally. Consider reaching out for support."
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Not enough data</h3>
                      <p className="text-muted-foreground mb-4">
                        Log your mood at least 3 times to see your mood distribution
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>Activities tailored to your current emotional state</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendedActivities.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedActivities.map((activity, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                              {index % 5 === 0 ? (
                                <Heart className="h-5 w-5" />
                              ) : index % 5 === 1 ? (
                                <Activity className="h-5 w-5" />
                              ) : index % 5 === 2 ? (
                                <Users className="h-5 w-5" />
                              ) : index % 5 === 3 ? (
                                <BookOpen className="h-5 w-5" />
                              ) : (
                                <Moon className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{activity}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {index % 3 === 0
                                  ? "Helps reduce stress and anxiety"
                                  : index % 3 === 1
                                    ? "Improves mood and energy levels"
                                    : "Promotes emotional balance and wellbeing"}
                              </p>
                              <Button variant="link" className="p-0 h-auto text-sm mt-2">
                                Set as Goal
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/20 rounded-lg p-4">
                      <h3 className="font-medium mb-2">Daily Mood Goal</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Setting a specific goal can help improve your mood and overall wellbeing
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Select defaultValue="boost">
                          <SelectTrigger>
                            <SelectValue placeholder="Select goal type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="boost">Boost mood</SelectItem>
                            <SelectItem value="reduce">Reduce stress</SelectItem>
                            <SelectItem value="improve">Improve energy</SelectItem>
                            <SelectItem value="balance">Balance emotions</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue="gratitude">
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gratitude">Gratitude journaling</SelectItem>
                            <SelectItem value="meditation">Meditation</SelectItem>
                            <SelectItem value="exercise">Physical exercise</SelectItem>
                            <SelectItem value="social">Social connection</SelectItem>
                            <SelectItem value="nature">Time in nature</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select defaultValue="10">
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button>Set Goal</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Log your mood to receive personalized activity recommendations
                    </p>
                    <Button asChild>
                      <Link href="#" onClick={() => document.querySelector('[data-value="log"]')?.click()}>
                        Log Your Mood
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

