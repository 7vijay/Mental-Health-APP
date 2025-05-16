import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { SmileIcon as MoodHappy, Brain, MessageSquare, Users, BookOpen, BarChart, Award, Heart } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">MindfulStudent</h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Your Mental Wellbeing Matters</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-muted-foreground">
            AI-powered support to help you assess, track, and improve your mental health
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={<MoodHappy className="h-8 w-8 text-blue-500" />}
            title="Mood Tracking"
            description="Track your daily moods and emotions to identify patterns and triggers."
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8 text-purple-500" />}
            title="Mental Health Assessments"
            description="Take scientifically validated assessments to understand your mental wellbeing."
          />
          <FeatureCard
            icon={<MessageSquare className="h-8 w-8 text-green-500" />}
            title="24/7 AI Support"
            description="Chat with our AI assistant anytime for instant mental health guidance and support."
          />
          <FeatureCard
            icon={<BarChart className="h-8 w-8 text-yellow-500" />}
            title="Data Visualization"
            description="View interactive charts and insights about your mental health journey."
          />
          <FeatureCard
            icon={<Award className="h-8 w-8 text-red-500" />}
            title="Gamified Experience"
            description="Earn XP, unlock achievements, and complete challenges to stay motivated."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-indigo-500" />}
            title="Community Support"
            description="Connect with peers in anonymous forums and support groups."
          />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-muted-foreground">Create your secure account to begin your mental wellness journey.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Assess</h3>
              <p className="text-muted-foreground">
                Log your moods and complete assessments to understand your mental health.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Insights</h3>
              <p className="text-muted-foreground">Receive personalized recommendations and visualize your progress.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Improve & Connect</h3>
              <p className="text-muted-foreground">
                Complete challenges, earn rewards, and connect with supportive peers.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <Heart className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-4">Virtual Therapy Pet</h3>
            <p className="text-muted-foreground mb-6">
              Meet your virtual companion that grows and evolves as you engage with the platform. Take care of your pet
              by completing wellness activities and maintaining your mental health.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <div className="bg-primary/10 rounded-full p-1 mr-2">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Personalized pet that responds to your mood</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 rounded-full p-1 mr-2">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Earn items and accessories through achievements</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 rounded-full p-1 mr-2">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Interact with your pet for mindfulness exercises</span>
              </li>
            </ul>
            <Button asChild>
              <Link href="/auth/signup">Meet Your Pet</Link>
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <BookOpen className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-2xl font-bold mb-4">AI-Powered Insights</h3>
            <p className="text-muted-foreground mb-6">
              Our advanced AI analyzes your mood patterns, assessment results, and activity data to provide personalized
              recommendations and insights to improve your mental wellbeing.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <div className="bg-primary/10 rounded-full p-1 mr-2">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Personalized self-care recommendations</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 rounded-full p-1 mr-2">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Identify triggers and patterns in your mood</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary/10 rounded-full p-1 mr-2">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Adaptive challenges based on your progress</span>
              </li>
            </ul>
            <Button asChild>
              <Link href="/auth/signup">Explore AI Features</Link>
            </Button>
          </div>
        </section>

        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to prioritize your mental health?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-muted-foreground">
            Join thousands of students who are taking control of their wellbeing.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/signup">Get Started for Free</Link>
          </Button>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">MindfulStudent</h3>
              <p className="text-muted-foreground">
                Supporting student mental health with AI-powered tools and resources.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/mood-tracker" className="text-muted-foreground hover:text-primary">
                    Mood Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/assessment" className="text-muted-foreground hover:text-primary">
                    Assessments
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-muted-foreground hover:text-primary">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="/counseling" className="text-muted-foreground hover:text-primary">
                    Counseling
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-primary">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Get Help</h3>
              <p className="text-muted-foreground mb-4">If you're in crisis, please contact:</p>
              <p className="font-semibold">National Suicide Prevention Lifeline</p>
              <p className="text-muted-foreground">1-800-273-8255</p>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} MindfulStudent. All rights reserved.</p>
            <p className="mt-2 text-sm">
              <strong>Disclaimer:</strong> This application is not a substitute for professional mental health
              treatment. If you're experiencing a mental health emergency, please contact a healthcare provider or
              emergency services.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

