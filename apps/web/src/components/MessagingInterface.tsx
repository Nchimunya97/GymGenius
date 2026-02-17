import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  where,
} from 'firebase/firestore'
import type { User as FirebaseUser } from '@repo/shared'

interface MessagingInterfaceProps {
  otherUser: (FirebaseUser & { uid: string }) | null
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: number
}

export function MessagingInterface({ otherUser, isOpen, onClose }: MessagingInterfaceProps) {
  const { user: authUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Set up real-time listener for messages
  useEffect(() => {
    if (!isOpen || !authUser?.uid || !otherUser?.uid) {
      setMessages([])
      return
    }

    setLoading(true)

    // Create two queries: messages sent to me, and messages I sent
    const messagesRef = collection(db, 'messages')
    const receivedQuery = query(
      messagesRef,
      where('recipientId', '==', authUser.uid),
      where('senderId', '==', otherUser.uid),
      orderBy('timestamp', 'asc')
    )

    const sentQuery = query(
      messagesRef,
      where('senderId', '==', authUser.uid),
      where('recipientId', '==', otherUser.uid),
      orderBy('timestamp', 'asc')
    )

    // Listen to received messages
    const unsubscribeReceived = onSnapshot(
      receivedQuery,
      snapshot => {
        const receivedMsgs = snapshot.docs.map(
          doc =>
            ({
              id: doc.id,
              ...(doc.data() as any),
            }) as Message
        )

        // Listen to sent messages
        const unsubscribeSent = onSnapshot(
          sentQuery,
          sentSnapshot => {
            const sentMsgs = sentSnapshot.docs.map(
              doc =>
                ({
                  id: doc.id,
                  ...(doc.data() as any),
                }) as Message
            )

            // Combine and sort
            const allMsgs = [...receivedMsgs, ...sentMsgs].sort((a, b) => a.timestamp - b.timestamp)
            setMessages(allMsgs)
            setLoading(false)
          },
          error => {
            console.error('Error listening to sent messages:', error)
            setLoading(false)
          }
        )

        return () => unsubscribeSent()
      },
      error => {
        console.error('Error listening to messages:', error)
        setLoading(false)
      }
    )

    return () => unsubscribeReceived()
  }, [isOpen, authUser?.uid, otherUser?.uid])

  const handleSendMessage = async () => {
    if (!authUser?.uid || !otherUser?.uid || !newMessage.trim()) return

    setSending(true)
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: authUser.uid,
        senderName: authUser?.displayName || authUser?.email || 'Unknown',
        recipientId: otherUser.uid,
        text: newMessage,
        timestamp: Date.now(),
        read: false,
      })

      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  if (!isOpen || !otherUser) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700/50 border-b border-slate-600/50 p-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-white">{otherUser.displayName || 'User'}</h3>
            <p className="text-xs text-slate-400">{otherUser.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl transition">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-slate-400">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-slate-400 text-sm">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === authUser?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.senderId === authUser?.uid
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {msg.senderId !== authUser?.uid && (
                    <p className="text-xs font-semibold mb-1 opacity-75">{msg.senderName}</p>
                  )}
                  <p className="text-sm break-words">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-600/50 p-4 bg-slate-700/30">
          <div className="flex gap-2">
            <input
              id="messaging-input"
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              title="Enter your message"
              aria-label="Message input"
              className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-semibold transition text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
