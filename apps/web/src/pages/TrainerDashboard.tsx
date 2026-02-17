import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTrainerClients, useTrainerPrograms } from '@/hooks/useTrainerData'
import { ProfileEditModal } from '@/components/ProfileEditModal'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User as FirebaseUser } from '@repo/shared'

export function TrainerDashboard() {
  const { user: authUser, logOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<(FirebaseUser & { profileComplete?: boolean }) | null>(null)
  const { data: clients = [], isLoading: clientsLoading } = useTrainerClients(authUser?.uid)
  const { data: programs = [], isLoading: programsLoading } = useTrainerPrograms(authUser?.uid)
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'programs' | 'messages'>(
    'overview'
  )
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<(FirebaseUser & { uid: string }) | null>(
    null
  )
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<
    (FirebaseUser & { uid: string }) | null
  >(null)
  const [selectedConversation, setSelectedConversation] = useState<
    (FirebaseUser & { uid: string }) | null
  >(null)
  const [programForm, setProgramForm] = useState({
    name: '',
    duration: '8 weeks',
    difficulty: 'Intermediate',
  })
  const [availableTrainees, setAvailableTrainees] = useState<(FirebaseUser & { uid: string })[]>([])
  const [loadingTrainees, setLoadingTrainees] = useState(false)
  const [savingProgram, setSavingProgram] = useState(false)
  const [addingClient, setAddingClient] = useState(false)

  // Load user profile
  useEffect(() => {
    if (!authUser?.uid) return
    const loadProfile = async () => {
      const docSnap = await getDoc(doc(db, 'users', authUser.uid))
      if (docSnap.exists()) {
        setUser(docSnap.data() as FirebaseUser & { profileComplete?: boolean })
      }
    }
    loadProfile()
  }, [authUser?.uid])

  // Load available trainees when add client modal opens
  useEffect(() => {
    if (!showAddClientModal) return

    const loadTrainees = async () => {
      setLoadingTrainees(true)
      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('role', '==', 'trainee'))
        const snapshot = await getDocs(q)
        const trainees = snapshot.docs
          .map(doc => ({ uid: doc.id, ...(doc.data() as any) }) as FirebaseUser & { uid: string })
          .filter(trainee => !clients.some(c => c.uid === trainee.uid)) // Exclude existing clients
        setAvailableTrainees(trainees)
      } catch (err) {
        console.error('Error loading trainees:', err)
      } finally {
        setLoadingTrainees(false)
      }
    }

    loadTrainees()
  }, [showAddClientModal, clients])

  // Load messages for selected client
  useEffect(() => {
    if (!selectedClient?.uid || !authUser?.uid) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      try {
        const messagesRef = collection(db, 'messages')
        const q = query(
          messagesRef,
          where('senderId', '==', selectedClient.uid),
          where('recipientId', '==', authUser.uid)
        )
        const snapshot = await getDocs(q)
        const loadedMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
          }))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        setMessages(loadedMessages)
      } catch (err) {
        console.error('Error loading messages:', err)
      }
    }

    loadMessages()
  }, [selectedClient?.uid, authUser?.uid])

  const handleSendMessage = async () => {
    if (!selectedClient?.uid || !authUser?.uid || !messageText.trim()) return

    setSendingMessage(true)
    try {
      await addDoc(collection(db, 'messages'), {
        senderId: authUser.uid,
        recipientId: selectedClient.uid,
        text: messageText.trim(),
        timestamp: Date.now(),
      })
      setMessageText('')

      // Refresh messages - get both sent and received messages with this client
      const messagesRef = collection(db, 'messages')
      const sentQuery = query(
        messagesRef,
        where('senderId', '==', authUser.uid),
        where('recipientId', '==', selectedClient.uid)
      )
      const receivedQuery = query(
        messagesRef,
        where('senderId', '==', selectedClient.uid),
        where('recipientId', '==', authUser.uid)
      )

      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery),
      ])

      const sentMessages = sentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || Date.now(),
      }))

      const receivedMessages = receivedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp || Date.now(),
      }))

      const allMessages = [...sentMessages, ...receivedMessages].sort(
        (a, b) => a.timestamp - b.timestamp
      )
      setMessages(allMessages)
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleAddClient = async (traineeId: string) => {
    if (!authUser?.uid) return
    setAddingClient(true)
    try {
      const traineeRef = doc(db, 'users', traineeId)
      await updateDoc(traineeRef, {
        trainerId: authUser.uid,
      })
      setShowAddClientModal(false)
    } catch (err) {
      console.error('Error adding client:', err)
    } finally {
      setAddingClient(false)
    }
  }

  const handleCreateProgram = async () => {
    if (!authUser?.uid || !programForm.name.trim()) return
    setSavingProgram(true)
    try {
      await addDoc(collection(db, 'programs'), {
        trainerId: authUser.uid,
        name: programForm.name,
        duration: programForm.duration,
        difficulty: programForm.difficulty,
        clients: 0,
        createdAt: Date.now(),
      })
      setProgramForm({ name: '', duration: '8 weeks', difficulty: 'Intermediate' })
      setShowProgramModal(false)
    } catch (err) {
      console.error('Error creating program:', err)
    } finally {
      setSavingProgram(false)
    }
  }

  const handleViewClientDetails = (client: FirebaseUser & { uid: string }) => {
    setSelectedClientForDetails(client)
    setShowClientDetailsModal(true)
  }

  const handleLogout = async () => {
    await logOut()
  }

  const handleProfileSave = async () => {
    if (!authUser?.uid) return
    const docSnap = await getDoc(doc(db, 'users', authUser.uid))
    if (docSnap.exists()) {
      setUser(docSnap.data() as FirebaseUser & { profileComplete?: boolean })
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <h1 className="text-white font-bold">GymGenius</h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl">
          ☰
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`fixed lg:relative lg:w-64 w-64 h-screen lg:h-auto bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col p-6 z-40 lg:z-auto transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-24 lg:pt-6`}
      >
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <div className="text-3xl">💪</div>
          <div>
            <h1 className="text-xl font-bold text-white">GymGenius</h1>
            <p className="text-xs text-slate-400">Trainer</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: '📊 Dashboard', icon: '📊' },
            { id: 'clients', label: '👥 My Clients', icon: '👥' },
            { id: 'programs', label: '📋 Programs', icon: '📋' },
            { id: 'messages', label: '💬 Messages', icon: '💬' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any)
                setSidebarOpen(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 border border-red-500/50 hover:bg-red-900/30 rounded-lg text-red-300 hover:text-red-200 transition"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto pt-20 lg:pt-0 p-4 lg:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">Trainer Dashboard</h2>
            <p className="text-slate-400 mt-1 text-sm lg:text-base">
              Manage your clients and training programs
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
            >
              👤 Edit Profile
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-400">Trainer:</p>
              <p className="text-white font-semibold">{user?.displayName || user?.email}</p>
            </div>
          </div>
        </div>

        <ProfileEditModal
          user={user}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSave={handleProfileSave}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Active Clients',
                  value: clients.length.toString(),
                  icon: '👥',
                  color: 'from-purple-500 to-pink-600',
                },
                {
                  label: 'Programs Created',
                  value: programs.length.toString(),
                  icon: '📋',
                  color: 'from-blue-500 to-blue-600',
                },
                {
                  label: 'Workouts This Week',
                  value: (clients.length * 3).toString(),
                  icon: '💪',
                  color: 'from-green-500 to-green-600',
                },
                {
                  label: 'Client Progress Avg',
                  value: '87%',
                  icon: '📈',
                  color: 'from-amber-500 to-orange-600',
                },
              ].map(stat => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90 mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* This Week's Schedule */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">This Week's Schedule</h3>
                <div className="space-y-3">
                  {[
                    { day: 'Monday', sessions: '3 sessions', time: '08:00 - 18:00' },
                    { day: 'Tuesday', sessions: '2 sessions', time: '09:00 - 17:00' },
                    { day: 'Wednesday', sessions: '4 sessions', time: '08:00 - 20:00' },
                    { day: 'Thursday', sessions: '3 sessions', time: '10:00 - 18:00' },
                  ].map(schedule => (
                    <div
                      key={schedule.day}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
                    >
                      <div>
                        <p className="text-white font-medium">{schedule.day}</p>
                        <p className="text-sm text-slate-400">{schedule.sessions}</p>
                      </div>
                      <span className="text-slate-400 text-sm">{schedule.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Client Messages */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Recent Messages</h3>
                <div className="space-y-3">
                  {clients.length === 0 ? (
                    <div className="text-center text-slate-400 p-4">
                      <p>No connected clients yet</p>
                    </div>
                  ) : (
                    clients.slice(0, 3).map(client => (
                      <div
                        key={client.uid}
                        className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
                      >
                        <p className="text-white font-medium">{client.displayName || 'Client'}</p>
                        <p className="text-sm text-slate-300 mt-1">Connected with you</p>
                        <p className="text-xs text-slate-500 mt-2">Today</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">My Clients</h3>
              <button
                onClick={() => setShowAddClientModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
              >
                + Add Client
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {clientsLoading ? (
                <div className="col-span-2 text-center text-slate-400">Loading clients...</div>
              ) : clients.length === 0 ? (
                <div className="col-span-2 text-center text-slate-400">
                  No clients yet. Add your first client!
                </div>
              ) : (
                clients.map(client => (
                  <div
                    key={client.uid}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {client.displayName || 'Unknown'}
                        </h4>
                        <p className="text-sm text-slate-400">{client.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                        Active
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">Progress</span>
                          <span className="text-purple-400 font-semibold">65%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">Member since signup</p>
                      <button
                        onClick={() => handleViewClientDetails(client)}
                        className="w-full py-2 border border-purple-500/50 hover:bg-purple-900/30 rounded-lg text-purple-300 hover:text-purple-200 transition font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Training Programs</h3>
              <button
                onClick={() => setShowProgramModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition"
              >
                + Create Program
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programsLoading ? (
                <div className="col-span-full text-center text-slate-400">Loading programs...</div>
              ) : programs.length === 0 ? (
                <div className="col-span-full text-center text-slate-400">
                  No programs yet. Create your first program!
                </div>
              ) : (
                programs.map(program => (
                  <div
                    key={program.id}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition"
                  >
                    <h4 className="text-lg font-bold text-white mb-3">
                      {program.name || 'Untitled Program'}
                    </h4>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-sm">⏱️ {program.duration || '8 weeks'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-sm">👥 {program.clients || 0} clients</span>
                      </div>
                      <div>
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-300">
                          {program.difficulty || 'Intermediate'}
                        </span>
                      </div>
                    </div>
                    <button className="w-full py-2 border border-purple-500/50 hover:bg-purple-900/30 rounded-lg text-purple-300 hover:text-purple-200 transition font-medium">
                      Edit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-white">Messages</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Conversation List */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 overflow-hidden min-h-96">
                <div className="p-4 border-b border-slate-600/50">
                  <input
                    id="search-conversations"
                    type="text"
                    placeholder="Search conversations..."
                    title="Search through your client conversations"
                    aria-label="Search conversations"
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="divide-y divide-slate-600/50">
                  {clients.length === 0 ? (
                    <div className="p-4 text-center text-slate-400">
                      <p>No conversations yet</p>
                    </div>
                  ) : (
                    clients.map(conv => (
                      <div
                        key={conv.uid}
                        onClick={() => setSelectedClient({ ...conv, uid: conv.uid })}
                        className={`p-4 hover:bg-slate-700/50 cursor-pointer transition border-l-2 ${
                          selectedClient?.uid === conv.uid
                            ? 'border-purple-500 bg-slate-700/30'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-white font-medium">{conv.displayName || 'Client'}</p>
                        </div>
                        <p className="text-sm text-slate-400 mt-1 truncate">Connected</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 flex flex-col">
                <div className="p-4 border-b border-slate-600/50">
                  <h4 className="text-lg font-bold text-white">
                    {selectedClient
                      ? selectedClient.displayName || 'Client'
                      : clients.length > 0
                        ? 'Select a client'
                        : 'No Clients'}
                  </h4>
                  <p className="text-sm text-slate-400">
                    {selectedClient ? 'Connected' : 'Select a client to view messages'}
                  </p>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {!selectedClient ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-400">Select a client to view messages</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-400">No messages yet</p>
                    </div>
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
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-slate-600/50">
                  <div className="flex gap-2">
                    <input
                      id="message-input"
                      type="text"
                      placeholder="Type a message..."
                      title="Enter your message to send to the client"
                      aria-label="Message input"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                      disabled={!selectedClient || sendingMessage}
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!selectedClient || sendingMessage || !messageText.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition"
                    >
                      {sendingMessage ? '...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        {showAddClientModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Select Client</h3>
                <button
                  onClick={() => setShowAddClientModal(false)}
                  className="text-slate-400 hover:text-white text-2xl transition"
                >
                  ✕
                </button>
              </div>

              {loadingTrainees ? (
                <p className="text-center text-slate-400 py-8">Loading available trainees...</p>
              ) : availableTrainees.length === 0 ? (
                <p className="text-center text-slate-400 py-8">No available trainees to add</p>
              ) : (
                <div className="space-y-3">
                  {availableTrainees.map(trainee => (
                    <div
                      key={trainee.uid}
                      className="bg-slate-700/50 p-4 rounded-lg flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{trainee.displayName || 'Trainee'}</p>
                        <p className="text-sm text-slate-400">{trainee.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddClient(trainee.uid)}
                        disabled={addingClient}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded transition"
                      >
                        {addingClient ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Program Modal */}
        {showProgramModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Create Program</h3>
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="text-slate-400 hover:text-white text-2xl transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="program-name"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Program Name *
                  </label>
                  <input
                    id="program-name"
                    type="text"
                    value={programForm.name}
                    onChange={e => setProgramForm({ ...programForm, name: e.target.value })}
                    placeholder="e.g., 8-Week Strength"
                    title="Enter the name of the training program"
                    aria-label="Program name"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="program-duration"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Duration
                  </label>
                  <input
                    id="program-duration"
                    type="text"
                    value={programForm.duration}
                    onChange={e => setProgramForm({ ...programForm, duration: e.target.value })}
                    placeholder="e.g., 8 weeks"
                    title="Enter the duration of the program"
                    aria-label="Program duration"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="program-difficulty"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Difficulty
                  </label>
                  <select
                    id="program-difficulty"
                    value={programForm.difficulty}
                    onChange={e => setProgramForm({ ...programForm, difficulty: e.target.value })}
                    title="Select the difficulty level of the program"
                    aria-label="Program difficulty"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProgramModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProgram}
                  disabled={savingProgram || !programForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                >
                  {savingProgram ? '⏳ Creating...' : '✅ Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Details Modal */}
        {showClientDetailsModal && selectedClientForDetails && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Client Details</h3>
                <button
                  onClick={() => setShowClientDetailsModal(false)}
                  className="text-slate-400 hover:text-white text-2xl transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-lg text-white font-semibold">
                    {selectedClientForDetails.displayName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-lg text-white font-semibold">
                    {selectedClientForDetails.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Fitness Goal</p>
                  <p className="text-lg text-white font-semibold">
                    {selectedClientForDetails.fitnessGoal || 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Bio</p>
                  <p className="text-lg text-white font-semibold">
                    {selectedClientForDetails.bio || 'Not provided'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowClientDetailsModal(false)}
                className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
