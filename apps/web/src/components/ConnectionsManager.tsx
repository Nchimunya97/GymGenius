import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore'
import type { User as FirebaseUser } from '@repo/shared'

interface Connection {
  id: string
  trainerId: string
  traineeId: string
  status: 'pending' | 'active' | 'rejected'
  createdAt: number
  trainerName?: string
  traineeName?: string
}

interface Trainer {
  uid: string
  email: string
  displayName?: string
  role: string
  createdAt: number
  clientCount?: number
}

export function ConnectionsManager() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mainTab, setMainTab] = useState<'manage' | 'discover'>('manage')
  const [activeTab, setActiveTab] = useState<'pending' | 'active'>('active')

  // Load connections on mount
  useEffect(() => {
    if (!user?.uid) return
    setLoading(true)

    // Real-time listener for connections
    const q1 = query(collection(db, 'connections'), where('traineeId', '==', user.uid))
    const q2 = query(collection(db, 'connections'), where('trainerId', '==', user.uid))

    const unsub1 = onSnapshot(q1, snap => {
      const traineeConns = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Connection)
      const trainerConns = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Connection)
      setConnections(prev => [
        ...traineeConns,
        ...trainerConns.filter(t => !prev.find(p => p.id === t.id)),
      ])
    })

    const unsub2 = onSnapshot(q2, snap => {
      const trainerConns = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Connection)
      setConnections(prev => [
        ...prev.filter(c => !trainerConns.find(t => t.id === c.id)),
        ...trainerConns,
      ])
      setLoading(false)
    })

    // Load all trainers for discovery
    loadTrainers()

    return () => {
      unsub1()
      unsub2()
    }
  }, [user?.uid])

  const loadTrainers = async () => {
    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', 'trainer'))
      const snap = await getDocs(q)

      const trainersList: Trainer[] = snap.docs.map(
        d =>
          ({
            uid: d.id,
            ...(d.data() as Omit<FirebaseUser, 'uid'>),
          }) as Trainer
      )

      // Count clients for each trainer
      const trainersWithCounts = await Promise.all(
        trainersList.map(async t => {
          const connQ = query(
            collection(db, 'connections'),
            where('trainerId', '==', t.uid),
            where('status', '==', 'active')
          )
          const connSnap = await getDocs(connQ)
          return { ...t, clientCount: connSnap.size }
        })
      )

      setTrainers(trainersWithCounts)
    } catch (error) {
      console.error('Error loading trainers:', error)
    }
  }

  const loadConnections = async () => {
    if (!user) return
    try {
      const q1 = query(collection(db, 'connections'), where('traineeId', '==', user.uid))
      const snap1 = await getDocs(q1)

      const q2 = query(collection(db, 'connections'), where('trainerId', '==', user.uid))
      const snap2 = await getDocs(q2)

      const allConnections: Connection[] = [
        ...snap1.docs.map(d => ({ id: d.id, ...d.data() }) as Connection),
        ...snap2.docs.map(d => ({ id: d.id, ...d.data() }) as Connection),
      ]

      setConnections(allConnections)
    } catch (error) {
      console.error('Error loading connections:', error)
    }
  }

  const handleRequestTrainer = async () => {
    if (!user || !searchEmail.trim()) return

    setSubmitting(true)
    try {
      // Find trainer user
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', searchEmail.toLowerCase()))
      const snap = await getDocs(q)

      if (snap.empty) {
        alert('❌ Trainer not found')
        return
      }

      const trainer = snap.docs[0]
      const trainerId = trainer.id

      // Check if already connected
      const existingQ = query(
        collection(db, 'connections'),
        where('trainerId', '==', trainerId),
        where('traineeId', '==', user.uid)
      )
      const existingSnap = await getDocs(existingQ)

      if (!existingSnap.empty) {
        alert('⚠️ You already have a request or connection with this trainer')
        return
      }

      // Create connection
      const connectionRef = collection(db, 'connections')
      await addDoc(connectionRef, {
        trainerId,
        traineeId: user.uid,
        status: 'pending',
        createdAt: Date.now(),
      })

      setSearchEmail('')
      alert('✅ Request sent to trainer!')
      loadConnections()
    } catch (error) {
      console.error('Error requesting trainer:', error)
      alert('❌ Failed to request trainer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateConnection = async (
    connectionId: string,
    newStatus: string,
    traineeId?: string
  ) => {
    try {
      const connRef = doc(db, 'connections', connectionId)
      await updateDoc(connRef, { status: newStatus })

      // If accepted, update trainee's trainerId
      if (newStatus === 'active' && traineeId && user?.uid) {
        const traineeRef = doc(db, 'users', traineeId)
        await updateDoc(traineeRef, { trainerId: user.uid })
      }

      loadConnections()
    } catch (error) {
      console.error('Error updating connection:', error)
      alert('Failed to update connection')
    }
  }

  const handleDisconnect = async (connectionId: string, traineeId?: string) => {
    if (!confirm('Are you sure you want to disconnect?')) return

    try {
      const connRef = doc(db, 'connections', connectionId)
      await updateDoc(connRef, { status: 'rejected' })

      // Remove trainerId from trainee's user doc
      if (traineeId) {
        const traineeRef = doc(db, 'users', traineeId)
        await updateDoc(traineeRef, { trainerId: null })
      }

      loadConnections()
      alert('✅ Disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert('Failed to disconnect')
    }
  }

  const handleQuickRequest = async (trainerId: string) => {
    if (!user) return

    setSubmitting(true)
    try {
      const existingQ = query(
        collection(db, 'connections'),
        where('trainerId', '==', trainerId),
        where('traineeId', '==', user.uid)
      )
      const existingSnap = await getDocs(existingQ)

      if (!existingSnap.empty) {
        alert('⚠️ You already have a pending request to this trainer')
        return
      }

      await addDoc(collection(db, 'connections'), {
        trainerId,
        traineeId: user.uid,
        status: 'pending',
        createdAt: Date.now(),
      })

      alert('✅ Request sent!')
      loadConnections()
      loadTrainers()
    } catch (error) {
      console.error('Error sending request:', error)
      alert('Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        <button
          onClick={() => setMainTab('manage')}
          className={`py-3 px-6 font-semibold border-b-2 transition ${
            mainTab === 'manage'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🤝 My Connections ({connections.filter(c => c.status === 'active').length})
        </button>
        <button
          onClick={() => setMainTab('discover')}
          className={`py-3 px-6 font-semibold border-b-2 transition ${
            mainTab === 'discover'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🔍 Discover Trainers ({trainers.length})
        </button>
      </div>

      {/* Manage Connections Tab */}
      {mainTab === 'manage' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Manage Connections</h2>

            {/* Request Trainer Search */}
            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-slate-700/50">
              <label className="block text-sm font-semibold mb-2">Request a Trainer by Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  placeholder="trainer@example.com"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-amber-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleRequestTrainer}
                  disabled={submitting || !searchEmail.trim()}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
                >
                  {submitting ? '⏳' : '📧'} Send Request
                </button>
              </div>
            </div>

            {/* Connection Tabs */}
            <div className="flex gap-4 mb-4 border-b border-slate-700">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-4 font-medium border-b-2 transition ${
                  activeTab === 'active'
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                ✓ Active ({connections.filter(c => c.status === 'active').length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-4 font-medium border-b-2 transition ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                ⏳ Pending ({connections.filter(c => c.status === 'pending').length})
              </button>
            </div>

            {/* Connections List */}
            {loading ? (
              <p className="text-slate-400 text-center py-8">Loading connections...</p>
            ) : activeTab === 'active' ? (
              connections.filter(c => c.status === 'active').length > 0 ? (
                <div className="space-y-3">
                  {connections
                    .filter(c => c.status === 'active')
                    .map(conn => (
                      <div
                        key={conn.id}
                        className="p-4 bg-slate-800/50 rounded-lg border border-green-500/30 hover:border-green-500/50 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-lg mb-1">
                              {conn.trainerId === user?.uid
                                ? '👨‍🏫 Trainee Client'
                                : '👟 Connected Trainer'}
                            </p>
                            <p className="text-sm text-slate-400">
                              Connected since {new Date(conn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {conn.trainerId !== user?.uid && (
                            <button
                              onClick={() => handleDisconnect(conn.id, conn.trainerId)}
                              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition border border-red-500/30"
                            >
                              Disconnect
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  {user &&
                  connections.some(c => c.trainerId === user.uid || c.traineeId === user.uid)
                    ? 'No active connections'
                    : 'Browse trainers to get started!'}
                </p>
              )
            ) : connections.filter(c => c.status === 'pending').length > 0 ? (
              <div className="space-y-3">
                {connections
                  .filter(c => c.status === 'pending')
                  .map(conn => (
                    <div
                      key={conn.id}
                      className="p-4 bg-slate-800/50 rounded-lg border border-yellow-500/30 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold mb-1">
                          {conn.trainerId === user?.uid
                            ? '⏳ Trainee Request'
                            : '⏳ Awaiting Response'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {new Date(conn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {conn.trainerId === user?.uid && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleUpdateConnection(conn.id, 'active', conn.traineeId)
                            }
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleUpdateConnection(conn.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                          >
                            ✕ Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No pending requests</p>
            )}
          </div>
        </div>
      )}

      {/* Discover Trainers Tab */}
      {mainTab === 'discover' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">🔍 Discover Trainers</h2>

            {loading ? (
              <p className="text-slate-400 text-center py-12">Loading trainers...</p>
            ) : trainers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trainers.map(trainer => {
                  const hasPendingRequest = connections.some(
                    c =>
                      c.trainerId === trainer.uid &&
                      c.traineeId === user?.uid &&
                      c.status === 'pending'
                  )
                  const isConnected = connections.some(
                    c =>
                      c.trainerId === trainer.uid &&
                      c.traineeId === user?.uid &&
                      c.status === 'active'
                  )

                  return (
                    <div
                      key={trainer.uid}
                      className="p-5 bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 rounded-lg transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {trainer.displayName || 'Trainer'}
                          </p>
                          <p className="text-sm text-slate-400">{trainer.email}</p>
                        </div>
                        <span className="text-2xl">🏋️</span>
                      </div>

                      <div className="flex items-center gap-2 mb-4 text-sm text-slate-300">
                        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                          👥 {trainer.clientCount || 0} clients
                        </span>
                        <span className="text-slate-500">
                          Since{' '}
                          {new Date(trainer.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      <button
                        onClick={() => handleQuickRequest(trainer.uid)}
                        disabled={isConnected || hasPendingRequest || submitting}
                        className={`w-full py-2 rounded-lg font-medium transition ${
                          isConnected
                            ? 'bg-green-600/20 text-green-400 cursor-default'
                            : hasPendingRequest
                              ? 'bg-yellow-600/20 text-yellow-400 cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isConnected
                          ? '✓ Connected'
                          : hasPendingRequest
                            ? '⏳ Request Pending'
                            : 'Request Trainer'}
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">No trainers available yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
