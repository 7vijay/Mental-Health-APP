"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, MessageSquare, Heart, Reply, Flag, Plus, Users, Search } from "lucide-react"
import Link from "next/link"

type Post = {
  id: string
  userId: string
  username: string
  anonymous: boolean
  content: string
  likes: number
  replies: PostReply[]
  tags: string[]
  createdAt: string
}

type PostReply = {
  id: string
  userId: string
  username: string
  anonymous: boolean
  content: string
  likes: number
  createdAt: string
}

// Sample posts data
const samplePosts: Post[] = [
  {
    id: "p1",
    userId: "u1",
    username: "Anonymous Student",
    anonymous: true,
    content: "I've been feeling overwhelmed with my coursework lately. Any tips on how to manage academic stress?",
    likes: 12,
    replies: [
      {
        id: "r1",
        userId: "u2",
        username: "Supportive Peer",
        anonymous: false,
        content:
          "I find that breaking down big assignments into smaller tasks helps a lot. Also, don't forget to take breaks!",
        likes: 5,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
    ],
    tags: ["Academic Stress", "Time Management"],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "p2",
    userId: "u3",
    username: "Wellness Advocate",
    anonymous: false,
    content:
      "Just wanted to share a mindfulness technique that's been helping me with anxiety. Taking 5 minutes each morning to practice deep breathing has made a huge difference in my day.",
    likes: 24,
    replies: [],
    tags: ["Anxiety", "Mindfulness", "Self-Care"],
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
]

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [postTags, setPostTags] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isLoading, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    // Load posts from localStorage or use sample data
    const storedPosts = localStorage.getItem("community_posts")
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts))
    } else {
      setPosts(samplePosts)
      localStorage.setItem("community_posts", JSON.stringify(samplePosts))
    }
  }, [user, isLoading, router])

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (!newPostContent.trim()) {
      toast({
        title: "Empty post",
        description: "Please enter some content for your post",
        variant: "destructive",
      })
      return
    }

    // Create new post
    const newPost: Post = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: isAnonymous ? "Anonymous Student" : user.name,
      anonymous: isAnonymous,
      content: newPostContent.trim(),
      likes: 0,
      replies: [],
      tags: postTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      createdAt: new Date().toISOString(),
    }

    // Add to posts array
    const updatedPosts = [newPost, ...posts]
    setPosts(updatedPosts)

    // Save to localStorage
    localStorage.setItem("community_posts", JSON.stringify(updatedPosts))

    // Award XP
    updateUser({ xp: user.xp + 15 })

    // Reset form
    setNewPostContent("")
    setIsAnonymous(false)
    setPostTags("")

    toast({
      title: "Post created",
      description: "Your post has been shared with the community",
    })
  }

  const handleLikePost = (postId: string) => {
    if (!user) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("community_posts", JSON.stringify(updatedPosts))
  }

  const handleReply = (postId: string, replyContent: string) => {
    if (!user || !replyContent.trim()) return

    const newReply: PostReply = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.name,
      anonymous: false,
      content: replyContent.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, replies: [...post.replies, newReply] }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("community_posts", JSON.stringify(updatedPosts))

    // Award XP
    updateUser({ xp: user.xp + 5 })

    toast({
      title: "Reply posted",
      description: "Your reply has been added to the discussion",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredPosts = posts.filter((post) => {
    // Filter by tab
    if (activeTab !== "all" && !post.tags.includes(activeTab)) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        post.username.toLowerCase().includes(query)
      )
    }

    return true
  })

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
            <h1 className="text-3xl font-bold">Community Support</h1>
            <p className="text-muted-foreground">Connect with peers and share experiences</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Create a Post</CardTitle>
                <CardDescription>Share your thoughts or ask for support</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreatePost}>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={4}
                  />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Tags (comma separated)"
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Example: Anxiety, Self-Care, Academic</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={() => setIsAnonymous(!isAnonymous)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="anonymous" className="text-sm">
                        Post anonymously
                      </label>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="overflow-x-auto">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="all">All Posts</TabsTrigger>
                  <TabsTrigger value="Academic Stress">Academic</TabsTrigger>
                  <TabsTrigger value="Anxiety">Anxiety</TabsTrigger>
                  <TabsTrigger value="Depression">Depression</TabsTrigger>
                  <TabsTrigger value="Self-Care">Self-Care</TabsTrigger>
                  <TabsTrigger value="Mindfulness">Mindfulness</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="space-y-4 mt-4">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              {post.anonymous ? (
                                <AvatarFallback>A</AvatarFallback>
                              ) : (
                                <>
                                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                  <AvatarFallback>{post.username.charAt(0)}</AvatarFallback>
                                </>
                              )}
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{post.username}</CardTitle>
                              <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="whitespace-pre-line">{post.content}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-0 pb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      </CardFooter>

                      {post.replies.length > 0 && (
                        <div className="bg-muted/30 px-6 py-3 border-t">
                          <h4 className="text-sm font-medium mb-3">Replies</h4>
                          <div className="space-y-4">
                            {post.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar className="h-6 w-6 mt-1">
                                  {reply.anonymous ? (
                                    <AvatarFallback>A</AvatarFallback>
                                  ) : (
                                    <>
                                      <AvatarImage src="/placeholder.svg?height=24&width=24" />
                                      <AvatarFallback>{reply.username.charAt(0)}</AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-medium">{reply.username}</div>
                                    <div className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</div>
                                  </div>
                                  <p className="text-sm">{reply.content}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground text-xs mt-1 h-6 px-2"
                                  >
                                    <Heart className="h-3 w-3 mr-1" />
                                    {reply.likes}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/placeholder.svg?height=24&width=24" />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Input placeholder="Write a reply..." className="h-8 text-sm" id={`reply-${post.id}`} />
                              <Button
                                size="sm"
                                className="h-8"
                                onClick={() => {
                                  const input = document.getElementById(`reply-${post.id}`) as HTMLInputElement
                                  if (input && input.value) {
                                    handleReply(post.id, input.value)
                                    input.value = ""
                                  }
                                }}
                              >
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No posts found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? "No posts match your search criteria" : "Be the first to start a discussion"}
                    </p>
                    {searchQuery && <Button onClick={() => setSearchQuery("")}>Clear Search</Button>}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Be Respectful</h4>
                  <p className="text-sm text-muted-foreground">
                    Treat others with kindness and respect. No harassment or bullying.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Protect Privacy</h4>
                  <p className="text-sm text-muted-foreground">
                    Don't share personal information about yourself or others.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Support, Don't Diagnose</h4>
                  <p className="text-sm text-muted-foreground">
                    Offer support, but avoid giving medical advice or diagnoses.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Crisis Resources</h4>
                  <p className="text-sm text-muted-foreground">
                    If someone is in crisis, direct them to professional help.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => setActiveTab("Academic Stress")}
                  >
                    Academic Stress
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => setActiveTab("Anxiety")}
                  >
                    Anxiety
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => setActiveTab("Depression")}
                  >
                    Depression
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => setActiveTab("Self-Care")}
                  >
                    Self-Care
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => setActiveTab("Mindfulness")}
                  >
                    Mindfulness
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/5"
                    onClick={() => setActiveTab("Time Management")}
                  >
                    Time Management
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium">Campus Counseling</h4>
                  <p className="text-sm text-muted-foreground">Free confidential counseling for students</p>
                  <Button variant="link" className="p-0 h-auto text-sm" asChild>
                    <Link href="/counseling">Book a Session</Link>
                  </Button>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium">Crisis Text Line</h4>
                  <p className="text-sm text-muted-foreground">Text HOME to 741741 for 24/7 support</p>
                </div>

                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium">National Suicide Prevention Lifeline</h4>
                  <p className="text-sm text-muted-foreground">1-800-273-8255</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

