import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BookOpen, Video, FileText, Users, Calendar } from "lucide-react"
import Link from "next/link"

export default function Resources() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="flex items-center text-primary mb-6 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-6">Mental Health Resources</h1>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Articles</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="guides" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guides</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-4">
            <ResourceCard
              title="Understanding Academic Stress"
              description="Learn about the causes of academic stress and evidence-based strategies to manage it effectively."
              type="Article"
              author="Dr. Sarah Johnson, Clinical Psychologist"
              time="10 min read"
            />
            <ResourceCard
              title="The Science of Sleep and Mental Health"
              description="Explore the crucial relationship between sleep quality and mental wellbeing for students."
              type="Article"
              author="Dr. Michael Chen, Sleep Researcher"
              time="8 min read"
            />
            <ResourceCard
              title="Mindfulness for Students: A Beginner's Guide"
              description="Discover how mindfulness practices can help you manage stress and improve focus during your studies."
              type="Article"
              author="Emma Williams, Mindfulness Instructor"
              time="12 min read"
            />
            <ResourceCard
              title="Navigating Social Anxiety in College"
              description="Practical strategies for managing social anxiety in university settings and building meaningful connections."
              type="Article"
              author="Dr. James Peterson, University Counselor"
              time="15 min read"
            />
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <ResourceCard
              title="5-Minute Stress Relief Techniques"
              description="Quick and effective techniques you can use between classes or study sessions to reduce stress."
              type="Video"
              author="MindfulStudent Team"
              time="5:32"
            />
            <ResourceCard
              title="Understanding Anxiety: A Student's Perspective"
              description="A student shares their journey with anxiety and the strategies that helped them succeed academically."
              type="Video"
              author="Alex Chen, Student Ambassador"
              time="12:45"
            />
            <ResourceCard
              title="Guided Meditation for Focus and Clarity"
              description="A guided meditation specifically designed to enhance concentration and mental clarity before studying."
              type="Video"
              author="Dr. Lisa Thompson, Meditation Specialist"
              time="15:20"
            />
            <ResourceCard
              title="The Neuroscience of Stress and Learning"
              description="How stress affects your brain and learning capacity, and what you can do to optimize your cognitive function."
              type="Video"
              author="Prof. Robert Davis, Neuroscientist"
              time="22:10"
            />
          </TabsContent>

          <TabsContent value="guides" className="space-y-4">
            <ResourceCard
              title="Exam Preparation Mental Health Guide"
              description="A comprehensive guide to maintaining mental wellbeing during exam periods, including scheduling, self-care, and stress management."
              type="Guide"
              author="MindfulStudent Team"
              time="25 pages"
            />
            <ResourceCard
              title="Building Resilience: A Student Workbook"
              description="Interactive exercises and reflections to help you develop resilience skills for academic and personal challenges."
              type="Guide"
              author="Dr. Emily Rodriguez, Resilience Researcher"
              time="32 pages"
            />
            <ResourceCard
              title="Healthy Habits for Student Life"
              description="Practical guide to establishing routines that support mental health while balancing academic demands."
              type="Guide"
              author="Health & Wellness Department"
              time="18 pages"
            />
            <ResourceCard
              title="Navigating University Mental Health Services"
              description="How to access and make the most of mental health resources available at your institution."
              type="Guide"
              author="National Student Mental Health Association"
              time="15 pages"
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <ResourceCard
              title="Virtual Mindfulness Workshop"
              description="Learn practical mindfulness techniques specifically designed for students in this interactive online workshop."
              type="Event"
              author="Dr. Sarah Johnson"
              time="May 15, 2023 | 3:00 PM EST"
            />
            <ResourceCard
              title="Stress Management During Finals Week"
              description="Join this webinar to learn effective strategies for managing stress during high-pressure academic periods."
              type="Event"
              author="University Counseling Center"
              time="April 28, 2023 | 5:00 PM EST"
            />
            <ResourceCard
              title="Peer Support Group: Balancing Academics and Mental Health"
              description="Connect with fellow students in this facilitated discussion about maintaining wellbeing while pursuing academic goals."
              type="Event"
              author="Student Wellness Initiative"
              time="Weekly on Tuesdays | 7:00 PM EST"
            />
            <ResourceCard
              title="Sleep Hygiene Workshop"
              description="Learn evidence-based techniques to improve your sleep quality and how it impacts your mental health and academic performance."
              type="Event"
              author="Sleep Research Center"
              time="June 2, 2023 | 4:00 PM EST"
            />
          </TabsContent>
        </Tabs>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Community Support Resources
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4 py-2">
              <h3 className="font-semibold">Campus Counseling Services</h3>
              <p className="text-muted-foreground">Free confidential counseling for all enrolled students.</p>
              <p className="text-sm mt-1">Contact: (555) 123-4567 | counseling@university.edu</p>
            </div>

            <div className="border-l-4 border-primary pl-4 py-2">
              <h3 className="font-semibold">National Crisis Text Line</h3>
              <p className="text-muted-foreground">24/7 support for anyone in crisis.</p>
              <p className="text-sm mt-1">Text HOME to 741741</p>
            </div>

            <div className="border-l-4 border-primary pl-4 py-2">
              <h3 className="font-semibold">Student Peer Support Network</h3>
              <p className="text-muted-foreground">Connect with trained student volunteers for peer support.</p>
              <p className="text-sm mt-1">Available Mon-Fri, 6PM-10PM | student.support@university.edu</p>
            </div>

            <div className="border-l-4 border-primary pl-4 py-2">
              <h3 className="font-semibold">National Suicide Prevention Lifeline</h3>
              <p className="text-muted-foreground">24/7 support for anyone in suicidal crisis or emotional distress.</p>
              <p className="text-sm mt-1">1-800-273-8255</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResourceCard({
  title,
  description,
  type,
  author,
  time,
}: {
  title: string
  description: string
  type: string
  author: string
  time: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{type}</span>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{author}</span>
          <span>{time}</span>
        </div>
      </CardContent>
    </Card>
  )
}

