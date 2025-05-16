"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Award,
  Flower,
  Leaf,
  Cloud,
  Droplet,
  Sun,
  Heart,
  Star,
  Zap,
  Brain,
  Gamepad2,
  Clock,
  CheckCircle,
  Smile,
} from "lucide-react"
import Link from "next/link"

type GardenItem = {
  id: string
  type: "flower" | "tree" | "decoration"
  name: string
  stage: number
  maxStage: number
  plantedAt: string
  lastWateredAt: string
  moodSource?: string
}

type QuestItem = {
  id: string
  name: string
  description: string
  type: "daily" | "weekly" | "achievement"
  progress: number
  total: number
  reward: {
    xp: number
    energy?: number
    items?: string[]
  }
  completed: boolean
  expiresAt?: string
}

export default function GamifiedExperience() {
  const [activeTab, setActiveTab] = useState<string>("garden")
  const [gardenItems, setGardenItems] = useState<any[]>([])
  const [quests, setQuests] = useState<any[]>([])
  const [energy, setEnergy] = useState<number>(50)
  const [maxEnergy, setMaxEnergy] = useState<number>(100)
  const [gameActive, setGameActive] = useState<boolean>(false)
  const [gameType, setGameType] = useState<string>("")
  const [gameScore, setGameScore] = useState<number>(0)
  const [gameTime, setGameTime] = useState<number>(0)
  const [memoryCards, setMemoryCards] = useState<any[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedCards, setMatchedCards] = useState<number[]>([])
  const [breathingPhase, setBreathingPhase] = useState<string>("inhale")
  const [breathingCount, setBreathingCount] = useState<number>(0)
  const breathingRef = useRef<any>(null)
  const gameTimerRef = useRef<any>(null)
  const { user, isLoading, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [inventory, setInventory] = useState<any>({
    seed: 1,
    fertilizer: 0,
    decoration: 0,
  })
  const [questProgress, setQuestProgress] = useState<any>({})

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      // Load garden data
      const storedGarden = localStorage.getItem(`garden_${user.id}`)
      if (storedGarden) {
        setGardenItems(JSON.parse(storedGarden))
      } else {
        // Initialize with starter plant
        const starterGarden = [
          {
            id: crypto.randomUUID(),
            type: "flower",
            name: "Starter Sunflower",
            stage: 1,
            maxStage: 3,
            plantedAt: new Date().toISOString(),
            lastWateredAt: new Date().toISOString(),
          },
        ]
        setGardenItems(starterGarden)
        localStorage.setItem(`garden_${user.id}`, JSON.stringify(starterGarden))
      }

      // Initialize memory game cards
      initializeMemoryGame()

      // Load inventory data
      const storedInventory = localStorage.getItem(`inventory_${user.id}`)
      if (storedInventory) {
        setInventory(JSON.parse(storedInventory))
      }

      // Load quest data
      const storedQuests = localStorage.getItem(`quests_${user.id}`)
      if (storedQuests) {
        setQuests(JSON.parse(storedQuests))
      } else {
        // Initialize with daily and weekly quests
        const initialQuests = [generateNewQuest("daily"), generateNewQuest("weekly")]
        setQuests(initialQuests)
        localStorage.setItem(`quests_${user.id}`, JSON.stringify(initialQuests))
      }

      // Load quest progress data
      const storedQuestProgress = localStorage.getItem(`quest_progress_${user.id}`)
      if (storedQuestProgress) {
        setQuestProgress(JSON.parse(storedQuestProgress))
      }
    }

    return () => {
      // Clean up timers
      if (breathingRef.current) clearInterval(breathingRef.current)
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
  }, [user, isLoading, router])

  const initializeMemoryGame = () => {
    const emotionPairs = [
      { id: 1, emotion: "Happy", icon: <Smile className="h-8 w-8 text-yellow-500" /> },
      { id: 2, emotion: "Calm", icon: <Heart className="h-8 w-8 text-blue-500" /> },
      { id: 3, emotion: "Focused", icon: <Brain className="h-8 w-8 text-purple-500" /> },
      { id: 4, emotion: "Energized", icon: <Zap className="h-8 w-8 text-amber-500" /> },
      { id: 5, emotion: "Grateful", icon: <Star className="h-8 w-8 text-pink-500" /> },
      { id: 6, emotion: "Mindful", icon: <Cloud className="h-8 w-8 text-indigo-500" /> },
    ]

    // Create pairs and shuffle
    const cardPairs = [...emotionPairs, ...emotionPairs].map((card, index) => ({
      ...card,
      uniqueId: index,
      isFlipped: false,
      isMatched: false,
    }))

    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]]
    }

    setMemoryCards(cardPairs)
  }

  const startGame = (type: string) => {
    setGameType(type)
    setGameActive(true)
    setGameScore(0)
    setGameTime(0)

    if (type === "memory") {
      // Reset memory game state
      setFlippedCards([])
      setMatchedCards([])
      initializeMemoryGame()
    } else if (type === "breathing") {
      // Start breathing exercise
      setBreathingPhase("inhale")
      setBreathingCount(0)

      breathingRef.current = setInterval(() => {
        setBreathingPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"))
        setBreathingCount((prev) => prev + 1)
      }, 4000) // 4 seconds per breath phase
    }

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameTime((prev) => prev + 1)
    }, 1000)
  }

  const endGame = () => {
    setGameActive(false)

    // Clear timers
    if (breathingRef.current) clearInterval(breathingRef.current)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)

    // Award XP based on game performance
    if (user) {
      let xpEarned = 0

      if (gameType === "memory") {
        xpEarned = matchedCards.length * 5
      } else if (gameType === "breathing") {
        xpEarned = breathingCount * 2
      }

      if (xpEarned > 0) {
        updateUser({ xp: user.xp + xpEarned })

        toast({
          title: "Game Completed!",
          description: `You earned ${xpEarned} XP from this activity.`,
        })
      }
    }
  }

  const handleCardClick = (cardIndex: number) => {
    // Ignore if card is already flipped or matched
    if (flippedCards.includes(cardIndex) || matchedCards.includes(cardIndex)) {
      return
    }

    // Limit to flipping only 2 cards at a time
    if (flippedCards.length === 2) {
      return
    }

    // Add card to flipped cards
    const newFlippedCards = [...flippedCards, cardIndex]
    setFlippedCards(newFlippedCards)

    // Check for match if 2 cards are flipped
    if (newFlippedCards.length === 2) {
      const [firstIndex, secondIndex] = newFlippedCards
      const firstCard = memoryCards[firstIndex]
      const secondCard = memoryCards[secondIndex]

      if (firstCard.id === secondCard.id) {
        // Match found
        setMatchedCards([...matchedCards, firstIndex, secondIndex])
        setGameScore((prev) => prev + 10)
        setFlippedCards([])

        // Check if all cards are matched
        if (matchedCards.length + 2 === memoryCards.length) {
          // Game completed
          setTimeout(() => {
            toast({
              title: "Memory Game Completed!",
              description: "Great job! You've matched all the cards.",
            })
            endGame()
          }, 1000)
        }
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handlePlantSeed = () => {
    if (!user) return

    if (inventory.seed <= 0) {
      toast({
        title: "No seeds available",
        description: "Complete quests to earn more seeds",
        variant: "destructive",
      })
      return
    }

    if (energy < 10) {
      toast({
        title: "Not enough energy",
        description: "You need at least 10 energy to plant a seed",
        variant: "destructive",
      })
      return
    }

    // Create new plant
    const plantTypes = ["Sunflower", "Rose", "Tulip", "Daisy", "Lily"]
    const randomPlant = plantTypes[Math.floor(Math.random() * plantTypes.length)]

    const newPlant = {
      id: crypto.randomUUID(),
      type: "flower",
      name: randomPlant,
      stage: 1,
      maxStage: 3,
      plantedAt: new Date().toISOString(),
      lastWateredAt: new Date().toISOString(),
    }

    // Update garden
    const updatedGarden = [...gardenItems, newPlant]
    setGardenItems(updatedGarden)
    localStorage.setItem(`garden_${user.id}`, JSON.stringify(updatedGarden))

    // Update inventory
    const updatedInventory = { ...inventory, seed: inventory.seed - 1 }
    setInventory(updatedInventory)
    localStorage.setItem(`inventory_${user.id}`, JSON.stringify(updatedInventory))

    // Update energy
    const updatedEnergy = energy - 10
    setEnergy(updatedEnergy)
    localStorage.setItem(`energy_${user.id}`, JSON.stringify(updatedEnergy))

    // Update quest progress
    updateQuestProgress("plant_seed", 1)

    toast({
      title: "Seed planted!",
      description: `You planted a ${randomPlant}. Water it regularly to help it grow.`,
    })
  }

  const handleWaterPlant = (plantId: string) => {
    if (!user) return

    if (energy < 5) {
      toast({
        title: "Not enough energy",
        description: "You need at least 5 energy to water a plant",
        variant: "destructive",
      })
      return
    }

    // Find the plant
    const plantIndex = gardenItems.findIndex((item) => item.id === plantId)
    if (plantIndex === -1) return

    const plant = gardenItems[plantIndex]

    // Check if plant is already at max stage
    if (plant.stage >= plant.maxStage) {
      toast({
        title: "Plant fully grown",
        description: "This plant has reached its full growth potential",
        variant: "default",
      })
      return
    }

    // Update plant - simplified logic to ensure it works
    const updatedPlant = {
      ...plant,
      lastWateredAt: new Date().toISOString(),
    }

    // 70% chance to grow to next stage (increased from 50% to make it more reliable)
    if (Math.random() < 0.7) {
      updatedPlant.stage = Math.min(plant.stage + 1, plant.maxStage)

      if (updatedPlant.stage === plant.maxStage) {
        toast({
          title: "Plant fully grown!",
          description: `Your ${plant.name} has reached full maturity!`,
          variant: "default",
        })

        // Award XP
        if (user) {
          updateUser({ xp: user.xp + 25 })
        }

        // Update quest progress
        updateQuestProgress("grow_plant", 1)
      } else {
        toast({
          title: "Plant growing!",
          description: `Your ${plant.name} has grown to stage ${updatedPlant.stage}!`,
          variant: "default",
        })
      }
    } else {
      toast({
        title: "Plant watered",
        description: `You watered your ${plant.name}. Keep caring for it to help it grow.`,
        variant: "default",
      })
    }

    // Update garden
    const updatedGarden = [...gardenItems]
    updatedGarden[plantIndex] = updatedPlant
    setGardenItems(updatedGarden)
    localStorage.setItem(`garden_${user.id}`, JSON.stringify(updatedGarden))

    // Update energy
    const updatedEnergy = energy - 5
    setEnergy(updatedEnergy)
    localStorage.setItem(`energy_${user.id}`, JSON.stringify(updatedEnergy))

    // Update quest progress
    updateQuestProgress("water_plant", 1)
  }

  const handleUseFertilizer = (plantId: string) => {
    if (inventory.fertilizer <= 0) {
      toast({
        title: "No fertilizer available",
        description: "Complete quests to earn fertilizer",
        variant: "destructive",
      })
      return
    }

    // Find the plant
    const plantIndex = gardenItems.findIndex((item) => item.id === plantId)
    if (plantIndex === -1) return

    const plant = gardenItems[plantIndex]

    // Check if plant is already at max stage
    if (plant.stage >= plant.maxStage) {
      toast({
        title: "Plant fully grown",
        description: "This plant has reached its full growth potential",
        variant: "default",
      })
      return
    }

    // Update plant - fertilizer guarantees growth
    const updatedPlant = {
      ...plant,
      stage: Math.min(plant.stage + 1, plant.maxStage),
      lastWateredAt: new Date().toISOString(),
    }

    if (updatedPlant.stage === plant.maxStage) {
      toast({
        title: "Plant fully grown!",
        description: `Your ${plant.name} has reached full maturity!`,
        variant: "default",
      })

      // Award XP
      if (user) {
        updateUser({ xp: user.xp + 25 })
      }

      // Update quest progress
      updateQuestProgress("grow_plant", 1)
    } else {
      toast({
        title: "Fertilizer applied!",
        description: `Your ${plant.name} has grown to stage ${updatedPlant.stage}!`,
        variant: "default",
      })
    }

    // Update garden
    const updatedGarden = [...gardenItems]
    updatedGarden[plantIndex] = updatedPlant
    setGardenItems(updatedGarden)
    localStorage.setItem(`garden_${user?.id}`, JSON.stringify(updatedGarden))

    // Update inventory
    const updatedInventory = { ...inventory, fertilizer: inventory.fertilizer - 1 }
    setInventory(updatedInventory)
    localStorage.setItem(`inventory_${user?.id}`, JSON.stringify(updatedInventory))
  }

  const handleCompleteQuest = (questId: string) => {
    // Find the quest
    const questIndex = quests.findIndex((q) => q.id === questId)
    if (questIndex === -1) return

    const quest = quests[questIndex]

    // Check if quest is already completed
    if (quest.completed) {
      toast({
        title: "Quest already completed",
        description: "You've already claimed rewards for this quest",
        variant: "default",
      })
      return
    }

    // Check if quest is complete
    if (quest.progress < quest.total) {
      toast({
        title: "Quest in progress",
        description: `Progress: ${quest.progress}/${quest.total}`,
        variant: "default",
      })
      return
    }

    // Mark quest as completed
    const updatedQuest = { ...quest, completed: true }
    const updatedQuests = [...quests]
    updatedQuests[questIndex] = updatedQuest
    setQuests(updatedQuests)
    localStorage.setItem(`quests_${user?.id}`, JSON.stringify(updatedQuests))

    // Award rewards
    if (user) {
      // Award XP
      updateUser({ xp: user.xp + quest.reward.xp })

      // Award energy
      if (quest.reward.energy) {
        const newEnergy = Math.min(energy + quest.reward.energy, maxEnergy)
        setEnergy(newEnergy)
        localStorage.setItem(`energy_${user?.id}`, JSON.stringify(newEnergy))
      }

      // Award items
      if (quest.reward.items && quest.reward.items.length > 0) {
        const updatedInventory = { ...inventory }

        quest.reward.items.forEach((item) => {
          updatedInventory[item] = (updatedInventory[item] || 0) + 1
        })

        setInventory(updatedInventory)
        localStorage.setItem(`inventory_${user?.id}`, JSON.stringify(updatedInventory))
      }
    }

    toast({
      title: "Quest completed!",
      description: `You've completed "${quest.name}" and earned rewards!`,
    })

    // If it's a daily or weekly quest, generate a new one
    if (quest.type === "daily" || quest.type === "weekly") {
      setTimeout(() => {
        const newQuest = generateNewQuest(quest.type)
        const updatedQuestsWithNew = [...updatedQuests.filter((q) => q.id !== quest.id), newQuest]
        setQuests(updatedQuestsWithNew)
        localStorage.setItem(`quests_${user?.id}`, JSON.stringify(updatedQuestsWithNew))
      }, 1000)
    }
  }

  const updateQuestProgress = (action: string, amount = 1) => {
    // Update relevant quests based on action
    const updatedQuests = quests.map((quest) => {
      if (quest.completed) return quest

      let shouldUpdate = false

      switch (action) {
        case "track_mood":
          shouldUpdate = quest.name.toLowerCase().includes("mood") || quest.name.toLowerCase().includes("track")
          break
        case "plant_seed":
          shouldUpdate = quest.name.toLowerCase().includes("plant") || quest.name.toLowerCase().includes("garden")
          break
        case "water_plant":
          shouldUpdate = quest.name.toLowerCase().includes("water") || quest.name.toLowerCase().includes("garden")
          break
        case "grow_plant":
          shouldUpdate = quest.name.toLowerCase().includes("grow") || quest.name === "Garden Master"
          break
        case "complete_daily":
          shouldUpdate = quest.name === "Weekly Wellness"
          break
        case "mindfulness":
          shouldUpdate = quest.name.toLowerCase().includes("mindful")
          break
      }

      if (shouldUpdate) {
        return {
          ...quest,
          progress: Math.min(quest.progress + amount, quest.total),
        }
      }

      return quest
    })

    setQuests(updatedQuests)
    localStorage.setItem(`quests_${user?.id}`, JSON.stringify(updatedQuests))

    // Update quest progress record
    const updatedProgress = { ...questProgress }
    updatedProgress[action] = (updatedProgress[action] || 0) + amount
    setQuestProgress(updatedProgress)
    localStorage.setItem(`quest_progress_${user?.id}`, JSON.stringify(updatedProgress))
  }

  const generateNewQuest = (type: "daily" | "weekly"): QuestItem => {
    const now = new Date()
    const expiryDate = new Date(now)

    if (type === "daily") {
      expiryDate.setDate(expiryDate.getDate() + 1)
    } else {
      expiryDate.setDate(expiryDate.getDate() + 7)
    }
    expiryDate.setHours(0, 0, 0, 0)

    const dailyQuests = [
      {
        name: "Track Your Mood",
        description: "Log your mood for the day",
        total: 1,
        reward: {
          xp: 10,
          energy: 20,
        },
      },
      {
        name: "Mindfulness Moment",
        description: "Complete a 5-minute mindfulness exercise",
        total: 1,
        reward: {
          xp: 15,
          energy: 15,
          items: ["seed"],
        },
      },
      {
        name: "Garden Caretaker",
        description: "Water 2 plants in your garden",
        total: 2,
        reward: {
          xp: 10,
          items: ["fertilizer"],
        },
      },
      {
        name: "Gratitude Practice",
        description: "Write down 3 things you are grateful for",
        total: 1,
        reward: {
          xp: 10,
          energy: 10,
        },
      },
      {
        name: "Positive Reflection",
        description: "Reflect on one positive experience from today",
        total: 1,
        reward: {
          xp: 10,
          items: ["seed"],
        },
      },
    ]

    const weeklyQuests = [
      {
        name: "Weekly Wellness",
        description: "Complete 3 daily quests this week",
        total: 3,
        reward: {
          xp: 30,
          energy: 50,
        },
      },
      {
        name: "Mood Tracker",
        description: "Track your mood for 5 days this week",
        total: 5,
        reward: {
          xp: 40,
          items: ["decoration"],
        },
      },
      {
        name: "Garden Enthusiast",
        description: "Grow a plant to the next stage",
        total: 1,
        reward: {
          xp: 25,
          items: ["fertilizer", "seed"],
        },
      },
    ]

    const questPool = type === "daily" ? dailyQuests : weeklyQuests
    const randomQuest = questPool[Math.floor(Math.random() * questPool.length)]

    return {
      id: crypto.randomUUID(),
      name: randomQuest.name,
      description: randomQuest.description,
      type,
      progress: 0,
      total: randomQuest.total,
      reward: randomQuest.reward,
      completed: false,
      expiresAt: expiryDate.toISOString(),
    }
  }

  const getPlantStageIcon = (plant: GardenItem) => {
    if (plant.stage === 1) {
      return <Leaf className="h-8 w-8 text-green-500" />
    } else if (plant.stage === 2) {
      return <Flower className="h-8 w-8 text-pink-500" />
    } else {
      return <Flower className="h-10 w-10 text-pink-500" />
    }
  }

  const getPlantStageText = (plant: GardenItem) => {
    if (plant.stage === 1) {
      return "Seedling"
    } else if (plant.stage === 2) {
      return "Growing"
    } else {
      return "Mature"
    }
  }

  const getQuestIcon = (quest: QuestItem) => {
    if (quest.name.toLowerCase().includes("mood")) {
      return <Heart className="h-5 w-5 text-red-500" />
    } else if (quest.name.toLowerCase().includes("garden") || quest.name.toLowerCase().includes("plant")) {
      return <Flower className="h-5 w-5 text-green-500" />
    } else if (quest.name.toLowerCase().includes("mindful")) {
      return <Cloud className="h-5 w-5 text-blue-500" />
    } else if (quest.name.toLowerCase().includes("gratitude")) {
      return <Star className="h-5 w-5 text-yellow-500" />
    } else {
      return <Award className="h-5 w-5 text-purple-500" />
    }
  }

  const handleMindfulnessExercise = () => {
    if (energy < 10) {
      toast({
        title: "Not enough energy",
        description: "You need at least 10 energy for this exercise",
        variant: "destructive",
      })
      return
    }

    // Simulate a mindfulness exercise
    toast({
      title: "Mindfulness Exercise",
      description: "Take 5 deep breaths, focusing on your breathing...",
    })

    // Update energy
    const updatedEnergy = energy - 10
    setEnergy(updatedEnergy)
    localStorage.setItem(`energy_${user?.id}`, JSON.stringify(updatedEnergy))

    // Update quest progress
    updateQuestProgress("mindfulness", 1)

    // After 5 seconds, complete the exercise
    setTimeout(() => {
      toast({
        title: "Exercise Completed",
        description: "You've completed the mindfulness exercise and feel more centered.",
      })

      // Award XP
      if (user) {
        updateUser({ xp: user.xp + 15 })
      }

      // Restore some energy
      const newEnergy = Math.min(updatedEnergy + 20, maxEnergy)
      setEnergy(newEnergy)
      localStorage.setItem(`energy_${user?.id}`, JSON.stringify(newEnergy))
    }, 5000)
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
            <h1 className="text-3xl font-bold">Gamified Experience</h1>
            <p className="text-muted-foreground">Improve your mental wellbeing through fun activities</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center">
              <Zap className="h-4 w-4 text-primary mr-1.5" />
              <span className="font-medium">
                {energy}/{maxEnergy} Energy
              </span>
            </div>

            <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center">
              <Award className="h-4 w-4 text-primary mr-1.5" />
              <span className="font-medium">{user.xp} XP</span>
            </div>
          </div>
        </div>

        {gameActive ? (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{gameType === "memory" ? "Emotion Memory Match" : "Mindful Breathing Exercise"}</CardTitle>
                <CardDescription>
                  {gameType === "memory"
                    ? "Match pairs of emotions to improve focus and memory"
                    : "Follow the breathing pattern to reduce stress and anxiety"}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={endGame}>
                End Game
              </Button>
            </CardHeader>
            <CardContent>
              {gameType === "memory" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center">
                      <Star className="h-4 w-4 text-primary mr-1.5" />
                      <span className="font-medium">Score: {gameScore}</span>
                    </div>
                    <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center">
                      <Clock className="h-4 w-4 text-primary mr-1.5" />
                      <span className="font-medium">Time: {formatTime(gameTime)}</span>
                    </div>
                    <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-1.5" />
                      <span className="font-medium">
                        Matches: {matchedCards.length / 2} / {memoryCards.length / 2}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {memoryCards.map((card, index) => (
                      <div
                        key={card.uniqueId}
                        className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 transform ${
                          flippedCards.includes(index) || matchedCards.includes(index)
                            ? "bg-white dark:bg-gray-800 rotate-y-180"
                            : "bg-primary/20 hover:bg-primary/30"
                        } ${matchedCards.includes(index) ? "opacity-70" : ""}`}
                        onClick={() => handleCardClick(index)}
                      >
                        {flippedCards.includes(index) || matchedCards.includes(index) ? (
                          <div className="flex flex-col items-center">
                            {card.icon}
                            <span className="mt-2 font-medium text-sm">{card.emotion}</span>
                          </div>
                        ) : (
                          <Gamepad2 className="h-8 w-8 text-primary/40" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gameType === "breathing" && (
                <div className="flex flex-col items-center justify-center py-10 space-y-8">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold mb-2">
                      {breathingPhase === "inhale" ? "Breathe In" : "Breathe Out"}
                    </h3>
                    <p className="text-muted-foreground">
                      {breathingPhase === "inhale"
                        ? "Slowly inhale through your nose..."
                        : "Slowly exhale through your mouth..."}
                    </p>
                  </div>

                  <div
                    className={`w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-4000 ease-in-out ${
                      breathingPhase === "inhale" ? "scale-100" : "scale-75"
                    }`}
                  >
                    <div
                      className={`w-36 h-36 rounded-full bg-primary/30 flex items-center justify-center transition-all duration-4000 ease-in-out ${
                        breathingPhase === "inhale" ? "scale-100" : "scale-75"
                      }`}
                    >
                      <div
                        className={`w-24 h-24 rounded-full bg-primary/40 flex items-center justify-center transition-all duration-4000 ease-in-out ${
                          breathingPhase === "inhale" ? "scale-100" : "scale-75"
                        }`}
                      >
                        <Cloud
                          className={`h-12 w-12 text-primary transition-all duration-4000 ${
                            breathingPhase === "inhale" ? "opacity-100" : "opacity-50"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-8">
                    <p className="text-lg font-medium">Breaths completed: {Math.floor(breathingCount / 2)}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Continue for at least 5 minutes for maximum benefit
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="garden">Happy Garden</TabsTrigger>
              <TabsTrigger value="games">Mental Wellness Games</TabsTrigger>
            </TabsList>

            <TabsContent value="garden" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Flower className="h-5 w-5 mr-2 text-primary" />
                    Your Happy Garden
                  </CardTitle>
                  <CardDescription>Grow plants that represent your mental wellbeing journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-b from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 relative overflow-hidden">
                    {/* Sky elements */}
                    <div className="absolute top-4 left-1/4">
                      <Cloud className="h-8 w-8 text-white/80" />
                    </div>
                    <div className="absolute top-8 right-1/4">
                      <Cloud className="h-10 w-10 text-white/80" />
                    </div>
                    <div className="absolute top-2 right-1/3">
                      <Sun className="h-12 w-12 text-yellow-400" />
                    </div>

                    {/* Garden area */}
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {gardenItems.map((plant) => (
                        <div
                          key={plant.id}
                          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex flex-col items-center"
                        >
                          <div className="mb-2">{getPlantStageIcon(plant)}</div>
                          <h3 className="font-medium text-center">{plant.name}</h3>
                          <div className="flex items-center mt-1 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {getPlantStageText(plant)}
                            </Badge>
                          </div>
                          <Progress value={(plant.stage / plant.maxStage) * 100} className="h-2 w-full mb-3" />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleWaterPlant(plant.id)}
                              disabled={plant.stage >= plant.maxStage}
                            >
                              <Droplet className="h-3.5 w-3.5 mr-1 text-blue-500" />
                              Water
                            </Button>
                            {inventory.fertilizer > 0 && plant.stage < plant.maxStage && (
                              <Button size="sm" variant="outline" onClick={() => handleUseFertilizer(plant.id)}>
                                <Leaf className="h-3.5 w-3.5 mr-1 text-green-500" />
                                Fertilize
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Plant new seed option */}
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 shadow-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 h-[180px]">
                        <Button variant="outline" className="h-auto py-6 px-6" onClick={handlePlantSeed}>
                          <div className="flex flex-col items-center">
                            <Leaf className="h-8 w-8 mb-2 text-green-500" />
                            <span>Plant New Seed ({inventory.seed})</span>
                          </div>
                        </Button>
                      </div>
                    </div>

                    {/* Ground */}
                    <div className="h-12 bg-gradient-to-b from-green-600/20 to-brown-600/20 rounded-b-lg mt-6"></div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <div className="text-sm text-muted-foreground text-center">
                    <p>
                      Your garden reflects your mental wellbeing journey. Plants grow as you engage in positive
                      activities.
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="games" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      Emotion Memory Match
                    </CardTitle>
                    <CardDescription>Match pairs of emotions to improve focus and memory</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Gamepad2 className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-6">
                      This game helps improve your focus, memory, and emotional awareness by matching pairs of emotion
                      cards.
                    </p>
                    <Button onClick={() => startGame("memory")}>Start Game</Button>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="w-full flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty: Medium</span>
                      <span className="text-muted-foreground">Time: ~5 minutes</span>
                    </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cloud className="h-5 w-5 mr-2 text-primary" />
                      Mindful Breathing Exercise
                    </CardTitle>
                    <CardDescription>Follow the breathing pattern to reduce stress and anxiety</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Cloud className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground mb-6">
                      This guided breathing exercise helps reduce stress and anxiety by focusing on slow, deep breaths.
                    </p>
                    <Button onClick={() => startGame("breathing")}>Start Exercise</Button>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="w-full flex justify-between text-sm">
                      <span className="text-muted-foreground">Difficulty: Easy</span>
                      <span className="text-muted-foreground">Time: 5-10 minutes</span>
                    </div>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Game Benefits</CardTitle>
                  <CardDescription>How these games improve your mental wellbeing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Brain className="h-5 w-5 text-purple-500 mr-2" />
                        <h3 className="font-medium">Cognitive Benefits</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        These games improve focus, memory, and cognitive flexibility, which can help with academic
                        performance.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Heart className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="font-medium">Emotional Regulation</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By engaging with emotions in a playful way, you develop better emotional awareness and
                        regulation skills.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Cloud className="h-5 w-5 text-blue-500 mr-2" />
                        <h3 className="font-medium">Stress Reduction</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mindful activities like breathing exercises activate your parasympathetic nervous system,
                        reducing stress.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

