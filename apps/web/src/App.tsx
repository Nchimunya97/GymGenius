import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User as FirebaseUser } from '@repo/shared'
import { Auth } from './pages/Auth'
import { Landing } from './pages/Landing'
import { ProfileSetup } from './pages/ProfileSetup'
import { TrainerSelection } from './pages/TrainerSelection'
import { AdminDashboard } from './pages/AdminDashboard'
import { TrainerDashboard } from './pages/TrainerDashboard'
import { TraineeDashboard } from './pages/TraineeDashboard'
import { AnimatedPage } from './components/AnimatedPage'
import './style.css'

function AppContent() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<(FirebaseUser & { profileComplete?: boolean }) | null>(
    null
  )
  const [profileLoading, setProfileLoading] = useState(true)

  // Load user profile to get their role
  useEffect(() => {
    if (!user) {
      // Immediately clear profile when user logs out
      setProfile(null)
      setProfileLoading(false)
      return
    }

    // Immediately reset profile loading when user changes (switching accounts)
    setProfileLoading(true)
    setProfile(null)

    let retries = 0
    const maxRetries = 20
    let timeoutId: NodeJS.Timeout
    let pollInterval: NodeJS.Timeout

    const loadProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const newProfile = userSnap.data() as FirebaseUser & { profileComplete?: boolean }
          setProfile(newProfile)
          setProfileLoading(false)

          // If profile is now complete, stop retrying and polling
          if (newProfile.profileComplete && newProfile.trainerId) {
            clearInterval(pollInterval)
            return
          }
        } else if (retries < maxRetries) {
          retries++
          timeoutId = setTimeout(loadProfile, 300)
        } else {
          setProfileLoading(false)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setProfileLoading(false)
      }
    }

    loadProfile()

    // Poll for profile updates every 1 second if profile is incomplete
    pollInterval = setInterval(() => {
      loadProfile()
    }, 1000)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [user])

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full animate-spin opacity-20" />
              <div className="flex items-center justify-center w-full h-full text-2xl">💪</div>
            </div>
          </div>
          <p className="text-slate-400">Loading your fitness journey...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {!user ? (
        <>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <Landing />
              </AnimatedPage>
            }
          />
          <Route
            path="/auth"
            element={
              <AnimatedPage>
                <Auth />
              </AnimatedPage>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : !profile?.profileComplete && profile?.role === 'trainer' ? (
        <>
          <Route
            path="/profile-setup"
            element={
              <AnimatedPage>
                <ProfileSetup />
              </AnimatedPage>
            }
          />
          <Route path="*" element={<Navigate to="/profile-setup" replace />} />
        </>
      ) : profile?.role === 'trainee' && !profile?.trainerId ? (
        <>
          <Route
            path="/select-trainer"
            element={
              <AnimatedPage>
                <TrainerSelection />
              </AnimatedPage>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AnimatedPage>
                <TraineeDashboard />
              </AnimatedPage>
            }
          />
          <Route path="*" element={<Navigate to="/select-trainer" replace />} />
        </>
      ) : profile?.role === 'admin' ? (
        <>
          <Route
            path="/dashboard"
            element={
              <AnimatedPage>
                <AdminDashboard />
              </AnimatedPage>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : profile?.role === 'trainer' ? (
        <>
          <Route
            path="/dashboard"
            element={
              <AnimatedPage>
                <TrainerDashboard />
              </AnimatedPage>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : profile?.role === 'trainee' ? (
        <>
          <Route
            path="/dashboard"
            element={
              <AnimatedPage>
                <TraineeDashboard />
              </AnimatedPage>
            }
          />
          <Route
            path="/select-trainer"
            element={
              <AnimatedPage>
                <TrainerSelection />
              </AnimatedPage>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  )
}

function App() {
  return (
    <div className="min-h-screen w-full bg-slate-950 overflow-x-hidden flex flex-col">
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </div>
  )
}

export default App
