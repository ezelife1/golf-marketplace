"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import {
  Search,
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  Check,
  Circle,
  Star,
  Package,
  DollarSign,
  Users,
  Filter,
  MoreHorizontal,
  Paperclip,
  Image as ImageIcon,
  File,
  Crown,
  Zap,
  Eye,
  EyeOff
} from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  productId?: string
  messageType: "general" | "offer" | "question" | "system"
  offerAmount?: number
  offerStatus?: "pending" | "accepted" | "rejected" | "counter"
  read: boolean
  deliveredAt?: string
  readAt?: string
  attachments?: Array<{
    id: string
    type: 'image' | 'file'
    name: string
    url: string
    size: number
  }>
  createdAt: string
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    image?: string
    verified: boolean
    subscription: string
    isOnline?: boolean
    lastSeen?: string
  }[]
  lastMessage: Message
  unreadCount: number
  isTyping?: boolean
  typingUser?: string
  productInfo?: {
    id: string
    title: string
    price: number
    image: string
  }
}

interface MessageThread {
  conversation: Conversation
  messages: Message[]
}

// Mock data with enhanced features
const mockConversations: Conversation[] = [
  {
    id: "1",
    participants: [
      {
        id: "1",
        name: "John Doe",
        verified: true,
        subscription: "pro",
        isOnline: true
      },
      {
        id: "2",
        name: "Current User",
        verified: false,
        subscription: "business"
      }
    ],
    lastMessage: {
      id: "msg1",
      content: "Is this driver still available? I'm very interested.",
      senderId: "1",
      receiverId: "2",
      messageType: "question",
      read: false,
      deliveredAt: "2025-01-13T10:30:00Z",
      createdAt: "2025-01-13T10:30:00Z"
    },
    unreadCount: 2,
    isTyping: false,
    productInfo: {
      id: "prod1",
      title: "TaylorMade SIM2 Driver",
      price: 240,
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=200&h=150&fit=crop"
    }
  },
  {
    id: "2",
    participants: [
      {
        id: "3",
        name: "Sarah Wilson",
        verified: true,
        subscription: "pga-pro",
        isOnline: false,
        lastSeen: "2025-01-13T09:45:00Z"
      },
      {
        id: "2",
        name: "Current User",
        verified: false,
        subscription: "business"
      }
    ],
    lastMessage: {
      id: "msg2",
      content: "Would you accept £450 for the iron set?",
      senderId: "2",
      receiverId: "3",
      messageType: "offer",
      offerAmount: 450,
      offerStatus: "pending",
      read: true,
      deliveredAt: "2025-01-12T15:45:00Z",
      readAt: "2025-01-12T15:50:00Z",
      createdAt: "2025-01-12T15:45:00Z"
    },
    unreadCount: 0,
    isTyping: true,
    typingUser: "Sarah Wilson",
    productInfo: {
      id: "prod2",
      title: "Callaway Apex Iron Set",
      price: 480,
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=200&h=150&fit=crop"
    }
  }
]

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isOfferMode, setIsOfferMode] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check if user has advanced messaging features
  const hasAdvancedFeatures = session?.user?.subscription &&
    ['pro', 'business', 'pga-pro'].includes(session.user.subscription)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/messages")
      return
    }

    // Simulate loading
    setTimeout(() => {
      setLoading(false)
      if (conversations.length > 0) {
        setSelectedConversation(conversations[0])
        loadMessages(conversations[0].id)
      }
    }, 1000)
  }, [session, router])

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate real-time typing detection
  useEffect(() => {
    if (!hasAdvancedFeatures) return

    let typingTimer: NodeJS.Timeout

    if (newMessage.length > 0) {
      setIsTyping(true)

      // Clear existing timer
      if (typingTimer) clearTimeout(typingTimer)

      // Set timer to stop typing indicator
      typingTimer = setTimeout(() => {
        setIsTyping(false)
      }, 1000)
    } else {
      setIsTyping(false)
    }

    return () => {
      if (typingTimer) clearTimeout(typingTimer)
    }
  }, [newMessage, hasAdvancedFeatures])

  const loadMessages = async (conversationId: string) => {
    // Mock messages for the conversation with enhanced features
    const mockMessages: Message[] = [
      {
        id: "msg1",
        content: "Hi! I'm interested in your TaylorMade driver. Is it still available?",
        senderId: "1",
        receiverId: "2",
        productId: "prod1",
        messageType: "question",
        read: true,
        deliveredAt: "2025-01-13T10:30:00Z",
        readAt: "2025-01-13T10:32:00Z",
        createdAt: "2025-01-13T10:30:00Z"
      },
      {
        id: "msg2",
        content: "Yes, it's still available! It's in excellent condition with minimal use.",
        senderId: "2",
        receiverId: "1",
        messageType: "general",
        read: true,
        deliveredAt: "2025-01-13T10:35:00Z",
        readAt: "2025-01-13T10:36:00Z",
        createdAt: "2025-01-13T10:35:00Z"
      },
      {
        id: "msg3",
        content: "Could you send more photos? Particularly the face and shaft?",
        senderId: "1",
        receiverId: "2",
        messageType: "question",
        read: false,
        deliveredAt: "2025-01-13T11:15:00Z",
        createdAt: "2025-01-13T11:15:00Z"
      },
      {
        id: "msg4",
        content: "Here are some detailed photos of the driver",
        senderId: "2",
        receiverId: "1",
        messageType: "general",
        read: true,
        deliveredAt: "2025-01-13T11:20:00Z",
        readAt: "2025-01-13T11:22:00Z",
        attachments: [
          {
            id: "att1",
            type: "image",
            name: "driver_face.jpg",
            url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop",
            size: 245000
          },
          {
            id: "att2",
            type: "image",
            name: "driver_shaft.jpg",
            url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&h=300&fit=crop",
            size: 198000
          }
        ],
        createdAt: "2025-01-13T11:20:00Z"
      }
    ]
    setMessages(mockMessages)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !isOfferMode) return
    if (!selectedConversation) return

    const message: Message = {
      id: `msg_${Date.now()}`,
      content: isOfferMode ? `I'd like to offer £${offerAmount} for this item.` : newMessage,
      senderId: session?.user?.id || "current_user",
      receiverId: selectedConversation.participants.find(p => p.id !== session?.user?.id)?.id || "",
      productId: selectedConversation.productInfo?.id,
      messageType: isOfferMode ? "offer" : "general",
      offerAmount: isOfferMode ? parseFloat(offerAmount) : undefined,
      offerStatus: isOfferMode ? "pending" : undefined,
      read: false,
      deliveredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")
    setOfferAmount("")
    setIsOfferMode(false)
    setIsTyping(false)

    // Update conversation's last message
    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: message }
        : conv
    ))

    // Simulate message delivery and read receipts for advanced users
    if (hasAdvancedFeatures) {
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === message.id
            ? { ...msg, deliveredAt: new Date().toISOString() }
            : msg
        ))
      }, 1000)

      // Simulate read receipt after 3 seconds
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === message.id
            ? { ...msg, read: true, readAt: new Date().toISOString() }
            : msg
        ))
      }, 3000)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!hasAdvancedFeatures) {
      alert("File sharing is available for Pro+ subscribers. Upgrade to unlock this feature!")
      return
    }

    const file = files[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setIsUploading(false)

          // Add file message
          const fileMessage: Message = {
            id: `msg_${Date.now()}`,
            content: `Shared file: ${file.name}`,
            senderId: session?.user?.id || "current_user",
            receiverId: selectedConversation?.participants.find(p => p.id !== session?.user?.id)?.id || "",
            messageType: "general",
            read: false,
            deliveredAt: new Date().toISOString(),
            attachments: [{
              id: `att_${Date.now()}`,
              type: file.type.startsWith('image/') ? 'image' : 'file',
              name: file.name,
              url: URL.createObjectURL(file),
              size: file.size
            }],
            createdAt: new Date().toISOString()
          }

          setMessages(prev => [...prev, fileMessage])
          return 0
        }
        return prev + 10
      })
    }, 100)
  }

  const handleOfferResponse = async (messageId: string, response: "accepted" | "rejected") => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId
        ? { ...msg, offerStatus: response }
        : msg
    ))
  }

  const getMessageStatus = (message: Message) => {
    if (message.senderId !== session?.user?.id) return null

    if (hasAdvancedFeatures) {
      if (message.readAt) {
        return <div className="flex items-center text-blue-500"><CheckCircle className="w-3 h-3" /></div>
      } else if (message.deliveredAt) {
        return <div className="flex items-center text-gray-500"><Check className="w-3 h-3" /></div>
      }
    }

    return message.read ? (
      <CheckCircle className="w-3 h-3 text-blue-500" />
    ) : (
      <Circle className="w-3 h-3 text-gray-400" />
    )
  }

  const getOnlineStatus = (participant: any) => {
    if (!hasAdvancedFeatures) return null

    if (participant.isOnline) {
      return <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    } else if (participant.lastSeen) {
      const lastSeen = new Date(participant.lastSeen)
      const now = new Date()
      const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))

      if (diffMinutes < 60) {
        return <span className="text-xs text-gray-500">{diffMinutes}m ago</span>
      } else if (diffMinutes < 1440) {
        return <span className="text-xs text-gray-500">{Math.floor(diffMinutes / 60)}h ago</span>
      }
    }
    return <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredConversations = conversations.filter(conv =>
    searchQuery === "" ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    conv.productInfo?.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!session) {
    return null // Redirecting
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Messages</h1>
              <p className="text-gray-600">Communicate with buyers and sellers</p>
            </div>
            {!hasAdvancedFeatures && (
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Crown className="w-3 h-3 mr-1" />
                  Upgrade for advanced features
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href="/subscription">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
                <Button size="sm" variant="outline">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Start a conversation by contacting a seller on their product page
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/products">Browse Products</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredConversations.map((conversation) => {
                    const otherParticipant = conversation.participants.find(p => p.id !== session?.user?.id)
                    const isSelected = selectedConversation?.id === conversation.id

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation)
                          loadMessages(conversation.id)
                        }}
                        className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={otherParticipant?.image} />
                              <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {hasAdvancedFeatures && (
                              <div className="absolute -bottom-1 -right-1">
                                {getOnlineStatus(otherParticipant)}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{otherParticipant?.name}</span>
                              {otherParticipant?.verified && (
                                <Badge variant="outline" className="text-xs">Verified</Badge>
                              )}
                              {otherParticipant?.subscription && otherParticipant.subscription !== 'free' && (
                                <Badge className="text-xs bg-yellow-400 text-black">
                                  <Crown className="w-3 h-3 mr-1" />
                                  {otherParticipant.subscription}
                                </Badge>
                              )}
                              {conversation.unreadCount > 0 && (
                                <Badge className="text-xs bg-red-500">{conversation.unreadCount}</Badge>
                              )}
                            </div>

                            {conversation.productInfo && (
                              <div className="flex items-center gap-2 mb-2">
                                <img
                                  src={conversation.productInfo.image}
                                  alt={conversation.productInfo.title}
                                  className="w-6 h-6 object-cover rounded"
                                />
                                <span className="text-xs text-gray-600 truncate">
                                  {conversation.productInfo.title}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate flex-1">
                                {conversation.lastMessage.messageType === "offer" && "💰 "}
                                {conversation.isTyping && hasAdvancedFeatures ? (
                                  <span className="text-blue-600 italic">
                                    {conversation.typingUser} is typing...
                                  </span>
                                ) : (
                                  conversation.lastMessage.content
                                )}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                              </span>
                              {hasAdvancedFeatures && getMessageStatus(conversation.lastMessage)}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConversation.participants.find(p => p.id !== session?.user?.id)?.image} />
                          <AvatarFallback>
                            {selectedConversation.participants.find(p => p.id !== session?.user?.id)?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {hasAdvancedFeatures && (
                          <div className="absolute -bottom-1 -right-1">
                            {getOnlineStatus(selectedConversation.participants.find(p => p.id !== session?.user?.id))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {selectedConversation.participants.find(p => p.id !== session?.user?.id)?.name}
                          {hasAdvancedFeatures && selectedConversation.isTyping && (
                            <span className="text-blue-600 text-sm italic">typing...</span>
                          )}
                        </h3>
                        {selectedConversation.productInfo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="w-3 h-3" />
                            <span>{selectedConversation.productInfo.title}</span>
                            <span>•</span>
                            <span>£{selectedConversation.productInfo.price}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAdvancedFeatures && (
                        <Badge className="bg-green-100 text-green-800">
                          <Zap className="w-3 h-3 mr-1" />
                          Advanced
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedConversation.productInfo && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedConversation.productInfo.image}
                          alt={selectedConversation.productInfo.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{selectedConversation.productInfo.title}</h4>
                          <p className="text-lg font-bold text-primary">£{selectedConversation.productInfo.price}</p>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/products/${selectedConversation.productInfo.id}`}>
                            View Item
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isFromCurrentUser = message.senderId === session?.user?.id
                      const isOffer = message.messageType === "offer"

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isFromCurrentUser ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isFromCurrentUser
                                  ? 'bg-primary text-white'
                                  : isOffer
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-gray-100'
                              }`}
                            >
                              {isOffer && (
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-medium">Offer: £{message.offerAmount}</span>
                                  {message.offerStatus && (
                                    <Badge
                                      variant={
                                        message.offerStatus === "accepted" ? "default" :
                                        message.offerStatus === "rejected" ? "destructive" :
                                        "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {message.offerStatus}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>

                              {/* File Attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <div key={attachment.id}>
                                      {attachment.type === 'image' ? (
                                        <div className="rounded-lg overflow-hidden">
                                          <img
                                            src={attachment.url}
                                            alt={attachment.name}
                                            className="max-w-full h-auto max-h-48 object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg">
                                          <File className="w-4 h-4" />
                                          <div className="flex-1">
                                            <div className="font-medium text-xs">{attachment.name}</div>
                                            <div className="text-xs opacity-75">{formatFileSize(attachment.size)}</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Offer Actions */}
                            {isOffer && !isFromCurrentUser && message.offerStatus === "pending" && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleOfferResponse(message.id, "accepted")}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Accept £{message.offerAmount}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOfferResponse(message.id, "rejected")}
                                >
                                  Decline
                                </Button>
                              </div>
                            )}

                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                              isFromCurrentUser ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
                              {isFromCurrentUser && hasAdvancedFeatures && (
                                <div className="flex items-center gap-1 ml-2">
                                  {getMessageStatus(message)}
                                  {message.readAt && (
                                    <span className="text-xs text-blue-500">Read</span>
                                  )}
                                  {message.deliveredAt && !message.readAt && (
                                    <span className="text-xs text-gray-500">Delivered</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-4 border-t">
                  {/* File Upload Progress */}
                  {isUploading && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Uploading file...</span>
                        <span className="text-sm font-medium">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  {isOfferMode ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-medium text-green-900 mb-2">Make an Offer</h4>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <span className="text-lg font-bold mr-1">£</span>
                            <Input
                              type="number"
                              value={offerAmount}
                              onChange={(e) => setOfferAmount(e.target.value)}
                              placeholder="Enter amount"
                              className="w-32"
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            (Listed at £{selectedConversation.productInfo?.price})
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={sendMessage} disabled={!offerAmount} className="bg-green-600 hover:bg-green-700">
                          Send Offer
                        </Button>
                        <Button variant="outline" onClick={() => setIsOfferMode(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={hasAdvancedFeatures ? "Type your message..." : "Type your message... (Upgrade for advanced features)"}
                          className="flex-1 min-h-[40px] max-h-[120px] resize-none pr-12"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                        />
                        {hasAdvancedFeatures && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                          <Send className="w-4 h-4" />
                        </Button>
                        {selectedConversation.productInfo && (
                          <Button
                            variant="outline"
                            onClick={() => setIsOfferMode(true)}
                            className="bg-green-50 hover:bg-green-100 text-green-700"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {hasAdvancedFeatures && isTyping && (
                    <div className="text-xs text-gray-500 mt-2">
                      You are typing...
                    </div>
                  )}
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
