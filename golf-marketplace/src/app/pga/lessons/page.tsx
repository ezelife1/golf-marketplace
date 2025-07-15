"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Navigation } from "@/components/navigation"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
  PoundSterling,
  Video,
  Home,
  Car,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageCircle,
  Star,
  ArrowLeft,
  TrendingUp,
  BookOpen,
  Crown
} from "lucide-react"
import Link from "next/link"

interface LessonBooking {
  id: string
  title: string
  description?: string
  lessonType: string
  duration: number
  price: number
  scheduledAt: string
  endTime: string
  timeZone: string
  locationType: string
  location?: string
  maxStudents: number
  status: string
  totalAmount: number
  paymentStatus: string
  proNotes?: string
  studentFeedback?: string
  rating?: number
  studentCount: number
  students: Array<{
    id: string
    paidAmount: number
    discountApplied?: number
    attended: boolean
    joinedAt: string
    student: {
      id: string
      name: string
      email: string
      image?: string
      studentVerification?: {
        verificationStatus: string
        institution: string
      }
    }
  }>
  createdAt: string
  updatedAt: string
}

interface LessonForm {
  title: string
  description: string
  lessonType: string
  duration: string
  price: string
  scheduledDate: string
  scheduledTime: string
  locationType: string
  location: string
  maxStudents: string
}

const LESSON_TYPES = [
  "Individual Lesson",
  "Group Lesson",
  "Golf Clinic",
  "Playing Lesson",
  "Short Game Clinic",
  "Putting Lesson",
  "Club Fitting",
  "Video Analysis"
]

const LOCATION_TYPES = [
  { value: "driving_range", label: "Driving Range", icon: <Car className="w-4 h-4" /> },
  { value: "golf_course", label: "Golf Course", icon: <Home className="w-4 h-4" /> },
  { value: "indoor", label: "Indoor Studio", icon: <Home className="w-4 h-4" /> },
  { value: "online", label: "Online/Virtual", icon: <Video className="w-4 h-4" /> }
]

export default function LessonsManagementPage() {
  const { data: session, status } = useSession()
  const [lessons, setLessons] = useState<LessonBooking[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState<LessonBooking | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<LessonBooking | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState<LessonForm>({
    title: "",
    description: "",
    lessonType: "Individual Lesson",
    duration: "60",
    price: "",
    scheduledDate: "",
    scheduledTime: "",
    locationType: "driving_range",
    location: "",
    maxStudents: "1"
  })

  const fetchLessons = useCallback(async (tab = "upcoming") => {
    try {
      let status = ""
      const now = new Date()
      const params = new URLSearchParams()

      switch (tab) {
        case "upcoming":
          status = "scheduled,confirmed"
          params.append("dateFrom", now.toISOString())
          break
        case "past":
          status = "completed"
          break
        case "cancelled":
          status = "cancelled"
          break
        default:
          break
      }

      if (status) params.append("status", status)

      const response = await fetch(`/api/pga/lessons?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLessons(data.lessons)
        setStats(data.stats)
      } else {
        setError(data.error || "Failed to fetch lessons")
      }
    } catch (error) {
      setError("Failed to fetch lessons")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchLessons(activeTab)
    }
  }, [session, activeTab, fetchLessons])

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      const response = await fetch("/api/pga/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          lessonType: formData.lessonType,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
          scheduledAt: scheduledAt.toISOString(),
          locationType: formData.locationType,
          location: formData.location,
          maxStudents: parseInt(formData.maxStudents)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Lesson created successfully!")
        setShowCreateForm(false)
        resetForm()
        fetchLessons(activeTab)
      } else {
        setError(data.error || "Failed to create lesson")
      }
    } catch (error) {
      setError("Failed to create lesson")
    }
  }

  const handleUpdateLesson = async (lessonId: string, updates: any) => {
    try {
      const response = await fetch(`/api/pga/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Lesson updated successfully!")
        fetchLessons(activeTab)
      } else {
        setError(data.error || "Failed to update lesson")
      }
    } catch (error) {
      setError("Failed to update lesson")
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Are you sure you want to cancel/delete this lesson?")) {
      return
    }

    try {
      const response = await fetch(`/api/pga/lessons/${lessonId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        fetchLessons(activeTab)
      } else {
        setError(data.error || "Failed to delete lesson")
      }
    } catch (error) {
      setError("Failed to delete lesson")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      lessonType: "Individual Lesson",
      duration: "60",
      price: "",
      scheduledDate: "",
      scheduledTime: "",
      locationType: "driving_range",
      location: "",
      maxStudents: "1"
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek: date.toLocaleDateString([], { weekday: 'long' })
    }
  }

  const getStatusBadge = (lesson: LessonBooking) => {
    const now = new Date()
    const lessonTime = new Date(lesson.scheduledAt)

    if (lesson.status === "cancelled") {
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
    }
    if (lesson.status === "completed") {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    }
    if (lessonTime < now) {
      return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>
    }
    if (lesson.studentCount >= lesson.maxStudents) {
      return <Badge className="bg-blue-100 text-blue-800">Fully Booked</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Available</Badge>
  }

  const getLocationIcon = (locationType: string) => {
    const locationConfig = LOCATION_TYPES.find(l => l.value === locationType)
    return locationConfig?.icon || <MapPin className="w-4 h-4" />
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">PGA Pro Access Required</h2>
              <p className="text-gray-600 mb-4">
                Please sign in with your PGA Professional account to manage lessons.
              </p>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/pga/dashboard" className="inline-flex items-center text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to PGA Dashboard
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  Lesson Management
                </h1>
                <p className="text-xl text-gray-600">
                  Schedule and manage your golf lessons
                </p>
              </div>

              <Button
                onClick={() => setShowCreateForm(true)}
                className="px-6"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Lesson
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.upcoming || 0}</div>
                <div className="text-sm text-gray-600">Upcoming Lessons</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.thisWeek || 0}</div>
                <div className="text-sm text-gray-600">This Week</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalStudents || 0}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  £{lessons.reduce((sum, lesson) => sum + lesson.totalAmount, 0).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming Lessons</TabsTrigger>
              <TabsTrigger value="past">Past Lessons</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : lessons.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No {activeTab} lessons found</h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === "upcoming"
                        ? "Schedule your first golf lesson to start teaching students."
                        : `You don't have any ${activeTab} lessons yet.`
                      }
                    </p>
                    {activeTab === "upcoming" && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Your First Lesson
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons.map((lesson) => {
                    const datetime = formatDateTime(lesson.scheduledAt)

                    return (
                      <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              {getStatusBadge(lesson)}
                              <h3 className="font-semibold text-lg mt-2">{lesson.title}</h3>
                              <p className="text-sm text-gray-600">{lesson.lessonType}</p>
                            </div>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedLesson(lesson)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Date & Time */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{datetime.dayOfWeek}, {datetime.date}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{datetime.time} ({lesson.duration} min)</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              {getLocationIcon(lesson.locationType)}
                              <span>{LOCATION_TYPES.find(l => l.value === lesson.locationType)?.label}</span>
                            </div>
                          </div>

                          {/* Students & Price */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                {lesson.studentCount} / {lesson.maxStudents} students
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PoundSterling className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-600">£{lesson.price}</span>
                            </div>
                          </div>

                          {/* Students List */}
                          {lesson.students.length > 0 && (
                            <div className="mb-4">
                              <div className="text-xs text-gray-500 mb-2">Students</div>
                              <div className="space-y-1">
                                {lesson.students.slice(0, 2).map((student) => (
                                  <div key={student.id} className="flex items-center gap-2 text-sm">
                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-xs">{student.student.name[0]}</span>
                                    </div>
                                    <span>{student.student.name}</span>
                                    {student.student.studentVerification?.verificationStatus === "verified" && (
                                      <Badge variant="outline" className="text-xs">Student</Badge>
                                    )}
                                  </div>
                                ))}
                                {lesson.students.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{lesson.students.length - 2} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Pre-fill form for editing
                                const lessonDate = new Date(lesson.scheduledAt)
                                setFormData({
                                  title: lesson.title,
                                  description: lesson.description || "",
                                  lessonType: lesson.lessonType,
                                  duration: lesson.duration.toString(),
                                  price: lesson.price.toString(),
                                  scheduledDate: lessonDate.toISOString().split('T')[0],
                                  scheduledTime: lessonDate.toTimeString().split(' ')[0].substring(0, 5),
                                  locationType: lesson.locationType,
                                  location: lesson.location || "",
                                  maxStudents: lesson.maxStudents.toString()
                                })
                                setEditingLesson(lesson)
                              }}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Rating */}
                          {lesson.rating && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{lesson.rating.toFixed(1)}</span>
                                <span className="text-xs text-gray-500">rating</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Create/Edit Lesson Dialog */}
          <Dialog open={showCreateForm || !!editingLesson} onOpenChange={(open) => {
            if (!open) {
              setShowCreateForm(false)
              setEditingLesson(null)
              resetForm()
              setError("")
            }
          }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingLesson ? "Edit Lesson" : "Create New Lesson"}
                </DialogTitle>
                <DialogDescription>
                  {editingLesson
                    ? "Update your existing lesson details."
                    : "Schedule a new golf lesson for students to book."
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Golf Fundamentals Lesson"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Learn the fundamental skills of golf including grip, stance, and swing basics..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lessonType">Lesson Type *</Label>
                    <Select value={formData.lessonType} onValueChange={(value) => setFormData(prev => ({ ...prev, lessonType: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LESSON_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (£) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="50"
                      min="0"
                      step="0.01"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxStudents">Max Students *</Label>
                    <Select value={formData.maxStudents} onValueChange={(value) => setFormData(prev => ({ ...prev, maxStudents: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,8,10,12,15,20].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'student' : 'students'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDate">Date *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledTime">Time *</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="locationType">Location Type *</Label>
                  <Select value={formData.locationType} onValueChange={(value) => setFormData(prev => ({ ...prev, locationType: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_TYPES.map(location => (
                        <SelectItem key={location.value} value={location.value}>
                          <div className="flex items-center gap-2">
                            {location.icon}
                            {location.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location Details</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={
                      formData.locationType === "online"
                        ? "Zoom meeting link will be provided"
                        : "Golf club name or address"
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    {editingLesson ? "Update Lesson" : "Create Lesson"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingLesson(null)
                      resetForm()
                      setError("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Lesson Details Dialog */}
          <Dialog open={!!selectedLesson} onOpenChange={(open) => {
            if (!open) setSelectedLesson(null)
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedLesson && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {selectedLesson.title}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedLesson)}
                      <Badge variant="outline">{selectedLesson.lessonType}</Badge>
                    </div>
                  </DialogHeader>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Lesson Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Lesson Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDateTime(selectedLesson.scheduledAt).dayOfWeek}, {formatDateTime(selectedLesson.scheduledAt).date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{formatDateTime(selectedLesson.scheduledAt).time} ({selectedLesson.duration} minutes)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getLocationIcon(selectedLesson.locationType)}
                            <span>{LOCATION_TYPES.find(l => l.value === selectedLesson.locationType)?.label}</span>
                          </div>
                          {selectedLesson.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{selectedLesson.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <PoundSterling className="w-4 h-4 text-green-600" />
                            <span className="font-medium">£{selectedLesson.price} per student</span>
                          </div>
                        </div>
                      </div>

                      {selectedLesson.description && (
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-gray-600">{selectedLesson.description}</p>
                        </div>
                      )}

                      {selectedLesson.proNotes && (
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-sm text-gray-600">{selectedLesson.proNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Students */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">
                          Students ({selectedLesson.studentCount}/{selectedLesson.maxStudents})
                        </h4>
                        {selectedLesson.students.length > 0 ? (
                          <div className="space-y-3">
                            {selectedLesson.students.map((student) => (
                              <div key={student.id} className="border rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium">{student.student.name[0]}</span>
                                    </div>
                                    <div>
                                      <div className="font-medium">{student.student.name}</div>
                                      <div className="text-xs text-gray-500">{student.student.email}</div>
                                    </div>
                                  </div>
                                  {student.student.studentVerification?.verificationStatus === "verified" && (
                                    <Badge variant="outline" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified Student
                                    </Badge>
                                  )}
                                </div>

                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Paid:</span>
                                    <span className="font-medium">£{student.paidAmount.toFixed(2)}</span>
                                  </div>
                                  {student.discountApplied && student.discountApplied > 0 && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Discount:</span>
                                      <span className="text-green-600">-£{student.discountApplied.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Joined:</span>
                                    <span>{new Date(student.joinedAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No students booked yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
