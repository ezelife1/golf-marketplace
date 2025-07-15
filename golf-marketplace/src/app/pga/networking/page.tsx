"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import {
  ArrowLeft,
  Users,
  MessageCircle,
  UserPlus,
  Search,
  MapPin,
  Crown,
  Star,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Globe,
  Award,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Share,
  Eye,
  Filter,
  Network,
  Handshake,
  MessageSquare,
  Send
} from "lucide-react"
import Link from "next/link"

interface PGAProfessional {
  id: string
  name: string
  businessName?: string
  location: string
  specializations: string[]
  rating: number
  totalStudents: number
  totalLessons: number
  yearsExperience: number
  pgaVerified: boolean
  logoUrl?: string
  bio?: string
  website?: string
  phone?: string
  email?: string
  availability: string
  isConnected: boolean
  canMessage: boolean
  connectionDate?: string
  referrals: {
    sent: number
    received: number
    successful: number
  }
}

interface NetworkingStats {
  totalPros: number
  connectedPros: number
  totalReferrals: number
  successfulReferrals: number
}

const SPECIALIZATIONS = [
  "Beginner Instruction",
  "Advanced Coaching",
  "Short Game",
  "Putting",
  "Golf Fitness",
  "Club Fitting",
  "Mental Game",
  "Junior Coaching",
  "Ladies Golf",
  "Corporate Golf",
  "Golf Psychology",
  "Swing Analysis"
]

const REGIONS = [
  "London & South East",
  "South West",
  "Midlands",
  "North West",
  "North East",
  "Scotland",
  "Wales",
  "Northern Ireland"
]

export default function PGANetworkingPage() {
  const { data: session, status } = useSession()
  const [professionals, setProfessionals] = useState<PGAProfessional[]>([])
  const [stats, setStats] = useState<NetworkingStats>({
    totalPros: 0,
    connectedPros: 0,
    totalReferrals: 0,
    successfulReferrals: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [connectionsOnly, setConnectionsOnly] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("directory")

  const fetchProfessionals = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedRegion !== "all" && { region: selectedRegion }),
        ...(selectedSpecialization !== "all" && { specialization: selectedSpecialization }),
        ...(connectionsOnly && { connectionsOnly: "true" })
      })

      const response = await fetch(`/api/pga/networking?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProfessionals(data.professionals)
        setStats(data.stats)
      } else {
        setError(data.error || "Failed to fetch professionals")
      }
    } catch (error) {
      setError("Failed to fetch professionals")
    } finally {
      setLoading(false)
    }
  }, [selectedRegion, selectedSpecialization, connectionsOnly])

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfessionals()
    }
  }, [session, fetchProfessionals])

  const handleConnect = async (professionalId: string) => {
    try {
      const response = await fetch("/api/pga/networking/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId })
      })

      if (response.ok) {
        fetchProfessionals()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to connect")
      }
    } catch (error) {
      setError("Failed to connect")
    }
  }

  const handleMessage = async (professionalId: string) => {
    // Open messaging interface - would integrate with existing messaging system
    window.location.href = `/messages?professional=${professionalId}`
  }

  const filteredProfessionals = professionals.filter(pro =>
    pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-6xl mx-auto">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
                Please sign in with your PGA Professional account to access the networking directory.
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
                  <Network className="w-8 h-8 text-primary" />
                  Professional Networking
                </h1>
                <p className="text-xl text-gray-600">
                  Connect with fellow PGA Professionals across the UK
                </p>
              </div>

              <div className="text-right">
                <Badge className="bg-green-100 text-green-800 mb-2">
                  <Users className="w-4 h-4 mr-1" />
                  {stats.connectedPros} Connections
                </Badge>
                <p className="text-sm text-gray-600">
                  Professional golf network
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalPros}</div>
                <div className="text-sm text-gray-600">Total Pros</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <UserPlus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.connectedPros}</div>
                <div className="text-sm text-gray-600">Connections</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Handshake className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                <div className="text-sm text-gray-600">Total Referrals</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.successfulReferrals}</div>
                <div className="text-sm text-gray-600">Successful</div>
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

          <Tabs defaultValue="directory" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="directory">Professional Directory</TabsTrigger>
              <TabsTrigger value="referrals">Referral System</TabsTrigger>
              <TabsTrigger value="forums">Industry Forums</TabsTrigger>
            </TabsList>

            {/* Professional Directory Tab */}
            <TabsContent value="directory" className="space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-6 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Search professionals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Region Filter */}
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {REGIONS.map(region => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Specialization Filter */}
                    <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Specializations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Specializations</SelectItem>
                        {SPECIALIZATIONS.map(spec => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Connections Filter */}
                    <Button
                      variant={connectionsOnly ? "default" : "outline"}
                      onClick={() => setConnectionsOnly(!connectionsOnly)}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Connections
                    </Button>

                    {/* Clear Filters */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedRegion("all")
                        setSelectedSpecialization("all")
                        setConnectionsOnly(false)
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Cards */}
              {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-20 bg-gray-200 rounded mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProfessionals.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No professionals found</h3>
                    <p className="text-gray-600 mb-6">
                      No professionals match your current search and filter criteria.
                    </p>
                    <Button onClick={() => {
                      setSearchQuery("")
                      setSelectedRegion("all")
                      setSelectedSpecialization("all")
                      setConnectionsOnly(false)
                    }}>
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProfessionals.map((pro) => (
                    <Card key={pro.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                              {pro.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                {pro.name}
                                {pro.pgaVerified && (
                                  <Crown className="w-4 h-4 text-yellow-600" />
                                )}
                              </h3>
                              {pro.businessName && (
                                <p className="text-sm text-gray-600">{pro.businessName}</p>
                              )}
                            </div>
                          </div>
                          {pro.isConnected && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>

                        {/* Location & Rating */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span>{pro.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm">{pro.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Bio */}
                        {pro.bio && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {pro.bio}
                          </p>
                        )}

                        {/* Specializations */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {pro.specializations.slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {pro.specializations.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pro.specializations.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                          <div>
                            <div className="text-lg font-bold">{pro.yearsExperience}</div>
                            <div className="text-xs text-gray-600">Years</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{pro.totalStudents}</div>
                            <div className="text-xs text-gray-600">Students</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold">{pro.totalLessons}</div>
                            <div className="text-xs text-gray-600">Lessons</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {pro.isConnected ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleMessage(pro.id)}
                                className="flex-1"
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Message
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleConnect(pro.id)}
                                className="flex-1"
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                Connect
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Connection Date */}
                        {pro.isConnected && pro.connectionDate && (
                          <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                            Connected {new Date(pro.connectionDate).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Referral System Tab */}
            <TabsContent value="referrals" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share className="w-5 h-5" />
                      Send Referral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Professional</label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a professional to refer" />
                        </SelectTrigger>
                        <SelectContent>
                          {professionals.filter(p => p.isConnected).map(pro => (
                            <SelectItem key={pro.id} value={pro.id}>
                              {pro.name} - {pro.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Client Details</label>
                      <Input className="mt-1" placeholder="Client name and contact" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Referral Message</label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md"
                        rows={3}
                        placeholder="Add a message about this referral..."
                      />
                    </div>
                    <Button className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Referral
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Referral Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Referrals Sent</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Referrals Received</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Successful Referrals</span>
                      <span className="font-medium text-green-600">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-medium">75%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Handshake className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Referral to John Smith</p>
                            <p className="text-sm text-gray-600">Client: Sarah Johnson</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Industry Forums Tab */}
            <TabsContent value="forums" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {[
                  { title: "Teaching Techniques", posts: 156, members: 89 },
                  { title: "Equipment Reviews", posts: 234, members: 124 },
                  { title: "Business Development", posts: 98, members: 67 },
                  { title: "Junior Golf", posts: 167, members: 95 },
                  { title: "Golf Fitness", posts: 123, members: 78 },
                  { title: "Course Management", posts: 145, members: 82 }
                ].map((forum, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{forum.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{forum.posts} posts</span>
                        <span>{forum.members} members</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Discussions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Best practices for junior golf instruction",
                      "New equipment trends for 2024",
                      "Building a sustainable golf business",
                      "Mental game coaching techniques"
                    ].map((topic, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span>{topic}</span>
                        </div>
                        <span className="text-sm text-gray-500">2h ago</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
