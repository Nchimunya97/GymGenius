import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import type { User as FirebaseUser } from '@repo/shared'
import { WorkoutBuilder } from './WorkoutBuilder'
import { ConnectionsManager } from '@/components/ConnectionsManager'
import { WorkoutFilter } from '@/components/WorkoutFilter'
import { ProgressTracker } from '@/components/ProgressTracker'
import { WorkoutTimer } from '@/components/WorkoutTimer'
import { WorkoutTemplates } from '@/components/WorkoutTemplates'

type TabType =
  | 'home'
  | 'profile'
  | 'workouts'
  | 'history'
  | 'progress'
  | 'connections'
  | 'templates'

export function Dashboard() {
  const { user, logOut } = useAuth()
  const [profile, setProfile] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'trainer' | 'trainee'>('trainee')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('home')
  const [showTimer, setShowTimer] = useState(false)

  // Load user profile from Firestore with retry logic
  useEffect(() => {
    if (!user) return

    let retries = 0
    const maxRetries = 10
    let timeoutId: NodeJS.Timeout

    const loadProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          console.log('Profile loaded successfully')
          const userData = userSnap.data() as FirebaseUser
          setProfile(userData)
          setDisplayName(userData.displayName || '')
          setRole(userData.role)
          setLoading(false)
        } else if (retries < maxRetries) {
          // Profile not created yet, retry after delay
          retries++
          console.log(`Profile not found, retrying... (${retries}/${maxRetries})`)
          timeoutId = setTimeout(loadProfile, 500)
        } else {
          // Max retries reached
          console.log('Max retries reached, profile still not found')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setLoading(false)
      }
    }

    loadProfile()

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        displayName: displayName || null,
        role,
      })
      setProfile(prev => (prev ? { ...prev, displayName: displayName || undefined, role } : null))
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg animate-pulse"></div>
              <div className="absolute inset-1 bg-slate-950 rounded-lg"></div>
            </div>
          </div>
          <p className="text-white font-semibold">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    // Profile not found but loading is complete - create default profile
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white">
        <header className="border-b border-amber-500/20 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="container mx-auto flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              💪 GymGenius
            </h1>
            <button
              onClick={logOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-slate-300 mb-4">Initializing your profile...</p>
            <p className="text-sm text-slate-500">
              If this persists, try signing out and signing in again.
            </p>
          </div>
        </main>
      </div>
    )
  }

  // At this point, profile is guaranteed to be defined
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-800/75">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            💪 GymGenius
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{profile.displayName || 'Athlete'}</p>
              <p className="text-xs text-slate-400 capitalize">{profile.role}</p>
            </div>
            <button
              onClick={logOut}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700 bg-slate-800/40 sticky top-16 z-40 overflow-x-auto">
        <div className="container mx-auto">
          <div className="flex gap-1 px-4 py-2">
            {[
              { id: 'home', label: '🏠 Home', icon: true },
              { id: 'workouts', label: '🏋️ Log Workout', icon: true },
              { id: 'history', label: '📊 History', icon: true },
              { id: 'progress', label: '📈 Progress', icon: true },
              { id: 'templates', label: '📋 Templates', icon: true },
              { id: 'connections', label: '🤝 Connections', icon: true },
              { id: 'profile', label: '👤 Profile', icon: true },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-3 px-4 font-medium border-b-2 transition whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-2">
                Welcome, {profile.displayName || 'Athlete'}! 🎯
              </h2>
              <p className="text-slate-300 mb-6">
                {profile.role === 'trainer'
                  ? 'Manage your clients and build their training programs'
                  : 'Track your workouts and progress your fitness journey'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('workouts')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Start Workout
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  View History
                </button>
                <button
                  onClick={() => setActiveTab('progress')}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Check Progress
                </button>
              </div>
            </div>

            {/* Quick Timer */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">⏱️ Quick Timer</h3>
                <button
                  onClick={() => setShowTimer(!showTimer)}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium transition"
                >
                  {showTimer ? 'Hide' : 'Show'}
                </button>
              </div>
              {showTimer && (
                <div className="flex justify-center">
                  <WorkoutTimer initialSeconds={60} />
                </div>
              )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/40 border border-blue-500/20 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase">Account Status</p>
                <p className="text-2xl font-bold text-blue-400">Active ✓</p>
              </div>
              <div className="bg-slate-800/40 border border-green-500/20 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase">Member Since</p>
                <p className="text-lg font-bold text-green-400">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-slate-800/40 border border-purple-500/20 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase">Role</p>
                <p className="text-2xl font-bold text-purple-400 capitalize">{profile.role}</p>
              </div>
              <div className="bg-slate-800/40 border border-orange-500/20 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase">Email Verified</p>
                <p className="text-2xl font-bold text-orange-400">✓</p>
              </div>
            </div>
          </div>
        )}

        {/* Log Workout Tab */}
        {activeTab === 'workouts' && <WorkoutBuilder />}

        {/* History Tab */}
        {activeTab === 'history' && <WorkoutFilter />}

        {/* Progress Tab */}
        {activeTab === 'progress' && <ProgressTracker />}

        {/* Templates Tab */}
        {activeTab === 'templates' && <WorkoutTemplates />}

        {/* Connections Tab */}
        {activeTab === 'connections' && <ConnectionsManager />}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {/* Profile Card */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Your Profile</h2>
                    <p className="text-slate-400 text-sm">Manage your account settings</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    {isEditing ? 'Cancel' : '✏️ Edit'}
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                        className="w-full px-4 py-2 bg-slate-700 border border-amber-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Role</label>
                      <select
                        value={role}
                        onChange={e => setRole(e.target.value as 'trainer' | 'trainee')}
                        className="w-full px-4 py-2 bg-slate-700 border border-amber-500/30 rounded-lg text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="trainee">Trainee</option>
                        <option value="trainer">Trainer</option>
                      </select>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                    >
                      {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <span className="text-slate-400">Email</span>
                      <span className="text-white font-medium">{profile.email}</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <span className="text-slate-400">Display Name</span>
                      <span className="text-white font-medium">{profile.displayName || '—'}</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <span className="text-slate-400">Role</span>
                      <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium capitalize">
                        {profile.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                      <span className="text-slate-400">Member Since</span>
                      <span className="text-white font-medium">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {profile.trainerId && (
                      <div className="flex items-center justify-between pt-2 rounded-lg bg-slate-900/50 p-3">
                        <span className="text-slate-400">Connected Trainer</span>
                        <span className="text-white font-mono text-sm">
                          {profile.trainerId.substring(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="max-w-2xl mx-auto">
              {profile.role === 'trainer' ? (
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">👟 Trainer Mode</h3>
                  <p className="text-blue-200">
                    You can accept trainees, build their programs, and track their progress. Use the
                    Connections tab to manage client relationships.
                  </p>
                </div>
              ) : (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">🏋️ Trainee Mode</h3>
                  <p className="text-purple-200">
                    Log your workouts, track progress, and connect with trainers for guidance. Use
                    the Connections tab to request a trainer.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
