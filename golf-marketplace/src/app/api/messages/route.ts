import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get all conversations for the user
    const sentMessages = await db.message.findMany({
      where: { senderId: user.id },
      include: {
        receiver: {
          select: { id: true, name: true, image: true, verified: true }
        },
        product: {
          select: { id: true, title: true, price: true, primaryImage: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const receivedMessages = await db.message.findMany({
      where: { receiverId: user.id },
      include: {
        sender: {
          select: { id: true, name: true, image: true, verified: true }
        },
        product: {
          select: { id: true, title: true, price: true, primaryImage: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group messages by conversation (combination of users and product)
    const conversationMap = new Map()

    const processMessages = (messages: any[], isReceived: boolean) => {
      messages.forEach(message => {
        const otherUser = isReceived ? message.sender : message.receiver
        const userIds = [user.id, otherUser.id].sort()
        const conversationKey = `${userIds[0]}-${userIds[1]}-${message.productId || 'general'}`

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            participants: [
              { id: user.id, name: user.name, image: user.image, verified: user.verified },
              otherUser
            ],
            productInfo: message.product ? {
              id: message.product.id,
              title: message.product.title,
              price: message.product.price,
              image: message.product.primaryImage
            } : null,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          })
        }

        const conversation = conversationMap.get(conversationKey)
        conversation.messages.push(message)

        // Update last message if this is more recent
        if (!conversation.lastMessage || new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message
        }

        // Count unread messages for current user
        if (isReceived && !message.read) {
          conversation.unreadCount++
        }
      })
    }

    processMessages(sentMessages, false)
    processMessages(receivedMessages, true)

    // Convert to array and sort by last message time
    const conversations = Array.from(conversationMap.values()).sort((a, b) =>
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    )

    return NextResponse.json({ conversations })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiverId, productId, content, messageType = 'general', offerAmount } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: 'Receiver ID and content are required' },
        { status: 400 }
      )
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify receiver exists
    const receiver = await db.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    // If productId is provided, verify product exists
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content,
        senderId: user.id,
        receiverId,
        productId: productId || null,
        messageType,
        offerAmount: offerAmount ? parseFloat(offerAmount) : null,
        offerStatus: messageType === 'offer' ? 'pending' : null
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true, verified: true }
        },
        receiver: {
          select: { id: true, name: true, image: true, verified: true }
        },
        product: {
          select: { id: true, title: true, price: true, primaryImage: true }
        }
      }
    })

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
