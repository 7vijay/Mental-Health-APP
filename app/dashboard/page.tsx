"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useChatbot } from "@/components/chatbot-provider"
import {
  BarChart,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Brain,
  MessageSquare,
  Users,
  Activity,
  Smile,
  Frown,
  Meh,
  Heart,
  Star,
  CheckCircle,
  PlusCircle,
  Gamepad2,
  LineChart,
} from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { openChatbot } = useChatbot()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Don't access auth context until component is mounted
  if (!mounted) {
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

  // Calculate level progress
  const levelThreshold = user.level * 100
  const progress = ((user.xp % levelThreshold) / levelThreshold) * 100

  // Get recent moods
  const moods = JSON.parse(localStorage.getItem(`moods_${user.id}`) || "[]")
  const recentMoods = moods.slice(0, 5).reverse()

  // Get achievements
  const achievementsList = [
    {
      id: "joined_platform",
      name: "First Steps",
      description: "Joined the MindfulStudent platform",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      id: "first_assessment",
      name: "Self-Aware",
      description: "Completed your first mental health assessment",
      icon: <Brain className="h-4 w-4" />,
    },
    {
      id: "first_chat",
      name: "Conversation Starter",
      description: "Had your first chat with the AI assistant",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      id: "mood_streak_7",
      name: "Consistency",
      description: "Tracked your mood for 7 days in a row",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: "completed_challenge",
      name: "Challenge Accepted",
      description: "Completed your first wellness challenge",
      icon: <CheckCircle className="h-4 w-4" />,
    },
  ]

  const userAchievements = achievementsList.filter((a) => user.achievements.includes(a.id))
  const nextAchievements = achievementsList.filter((a) => !user.achievements.includes(a.id)).slice(0, 2)

  // Get daily challenges
  const dailyChallenges = [
    {
      id: "mindfulness",
      name: "5-Minute Mindfulness",
      description: "Practice mindfulness for 5 minutes",
      xp: 20,
      completed: false,
    },
    {
      id: "gratitude",
      name: "Gratitude Journal",
      description: "Write down 3 things you're grateful for",
      xp: 15,
      completed: false,
    },
    { id: "exercise", name: "Quick Exercise", description: "Do a quick 10-minute workout", xp: 25, completed: false },
  ]

  // Get upcoming appointments
  const appointments = JSON.parse(localStorage.getItem(`appointments_${user.id}`) || "[]")

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              MindfulStudent
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={openChatbot}>
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat
              </Button>
              <Link href="/dashboard/profile">
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage src={user.avatar || "/placeholder.svg?height=40&width=40"} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
            <p className="text-muted-foreground">Let's check in on your mental wellbeing today</p>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <Link href="/mood-tracker">
                <PlusCircle className="h-4 w-4 mr-2" />
                Log Mood
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/assessment">Take Assessment</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Level</CardTitle>
              <CardDescription>Keep engaging to level up</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-2xl">Level {user.level}</div>
                <Badge variant="outline">{user.xp} XP</Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(levelThreshold - (user.xp % levelThreshold))} XP until Level {user.level + 1}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Mood</CardTitle>
              <CardDescription>Your emotional journey</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMoods.length > 0 ? (
                <div className="flex justify-between">
                  {recentMoods.map((mood: any, index: number) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="mb-1">
                        {mood.value === "happy" && <Smile className="h-6 w-6 text-green-500" />}
                        {mood.value === "neutral" && <Meh className="h-6 w-6 text-yellow-500" />}
                        {mood.value === "sad" && <Frown className="h-6 w-6 text-blue-500" />}
                        {mood.value === "stressed" && <Activity className="h-6 w-6 text-red-500" />}
                        {mood.value === "calm" && <Heart className="h-6 w-6 text-purple-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(mood.timestamp).toLocaleDateString(undefined, { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No mood data yet</p>
                  <Button variant="link" asChild className="mt-2 p-0">
                    <Link href="/mood-tracker">Log your first mood</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Achievements</CardTitle>
              <CardDescription>Your progress so far</CardDescription>
            </CardHeader>
            <CardContent>
              {userAchievements.length > 0 ? (
                <div className="space-y-2">
                  {userAchievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-full text-primary">{achievement.icon}</div>
                      <div>
                        <p className="text-sm font-medium">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No achievements yet</p>
                  <p className="text-xs mt-1">Complete activities to earn achievements</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="link" asChild className="p-0">
                <Link href="/achievements">View all achievements</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Assessments Completed</span>
                        <span className="text-sm text-muted-foreground">2/4</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Mood Tracking Streak</span>
                        <span className="text-sm text-muted-foreground">3 days</span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Mindfulness Minutes</span>
                        <span className="text-sm text-muted-foreground">15/20</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/progress">View Detailed Progress</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment: any, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-md">
                            <Clock className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {appointment.title || `Appointment with ${appointment.counselorName}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.date} at {appointment.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-2">No upcoming appointments</p>
                      <Button asChild>
                        <Link href="/counseling">Book a Session</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  Next Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nextAchievements.map((achievement) => (
                    <div key={achievement.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2 rounded-full">{achievement.icon}</div>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                      <Progress value={0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Wellness Challenges</CardTitle>
                <CardDescription>Complete these challenges to earn XP and improve your wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-md mt-1">
                          <Star className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{challenge.name}</p>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          <Badge variant="secondary" className="mt-1">
                            +{challenge.xp} XP
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant={challenge.completed ? "ghost" : "outline"}
                        size="sm"
                        disabled={challenge.completed}
                      >
                        {challenge.completed ? "Completed" : "Complete"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Challenges
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gamepad2 className="h-5 w-5 mr-2 text-primary" />
                  Gamified Experience
                </CardTitle>
                <CardDescription>Engage with fun activities to improve your mental wellbeing</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="py-6 space-y-4">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <Gamepad2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Mental Wellness Games</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Play interactive games designed to reduce stress, improve focus, and enhance your mental wellbeing.
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/gamified-experience">Start Playing</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  Data Visualization
                </CardTitle>
                <CardDescription>Visualize your mental health data with interactive charts</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="py-6 space-y-4">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <BarChart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Mood Trends & Patterns</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Explore detailed visualizations of your mood patterns, assessment results, and wellness trends.
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/data-visualization">View Insights</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Results</CardTitle>
                <CardDescription>Your mental health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Stress Level</span>
                      <span className="text-sm text-muted-foreground">Moderate</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Anxiety</span>
                      <span className="text-sm text-muted-foreground">Low</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Depression</span>
                      <span className="text-sm text-muted-foreground">Low</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Sleep Quality</span>
                      <span className="text-sm text-muted-foreground">Good</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/results">View Full Assessment Results</Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary" />
                    Mental Health Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="text-sm">
                      <Link href="/resources" className="text-primary hover:underline">
                        Understanding Anxiety in College
                      </Link>
                    </li>
                    <li className="text-sm">
                      <Link href="/resources" className="text-primary hover:underline">
                        Stress Management Techniques
                      </Link>
                    </li>
                    <li className="text-sm">
                      <Link href="/resources" className="text-primary hover:underline">
                        Improving Sleep Quality
                      </Link>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="link" asChild className="p-0">
                    <Link href="/resources">View all resources</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    24/7 AI Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI assistant is available 24/7 to provide support and guidance for your mental wellbeing.
                  </p>
                  <Button onClick={openChatbot} className="w-full">
                    Chat Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    Community Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect with peers in anonymous forums and support groups.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/community">Join Community</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Mindfulness Exercises</CardTitle>
                <CardDescription>Quick exercises to improve your mental wellbeing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-1">5-Minute Breathing Exercise</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      A quick breathing technique to reduce stress and anxiety.
                    </p>
                    <Button size="sm" onClick={() => openChatbot()}>
                      Start Exercise
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-1">Body Scan Meditation</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      A guided meditation to release tension in your body.
                    </p>
                    <Button size="sm" onClick={() => openChatbot()}>
                      Start Exercise
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-1">Gratitude Practice</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Reflect on things you're grateful for to improve mood.
                    </p>
                    <Button size="sm" onClick={() => openChatbot()}>
                      Start Exercise
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-1">Grounding Technique</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use your senses to ground yourself in the present moment.
                    </p>
                    <Button size="sm" onClick={() => openChatbot()}>
                      Start Exercise
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

