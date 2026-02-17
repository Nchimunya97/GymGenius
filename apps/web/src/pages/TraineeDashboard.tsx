import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkouts } from '@/hooks/useWorkouts'
import {
  useTraineeProgress,
  useTraineeTrainers,
  useTraineeGoals,
  useAvailableTrainers,
} from '@/hooks/useTraineeData'
import { ProfileEditModal } from '@/components/ProfileEditModal'
import { WorkoutHistory } from '@/components/WorkoutHistory'
import { TrainerProfileModal } from '@/components/TrainerProfileModal'
import { MessagingInterface } from '@/components/MessagingInterface'
import { StartWorkoutModal } from '@/components/StartWorkoutModal'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User as FirebaseUser } from '@repo/shared'

export function TraineeDashboard() {
  const { user: authUser, logOut } = useAuth()
  const [user, setUser] = useState<(FirebaseUser & { profileComplete?: boolean }) | null>(null)
  const { workouts, loading: workoutsLoading } = useWorkouts(authUser?.uid)
  const { data: progress } = useTraineeProgress(authUser?.uid, workouts)
  const { data: trainers = [] } = useTraineeTrainers(authUser?.uid)
  const { data: allTrainers = [] } = useAvailableTrainers()
  const { data: goals = [] } = useTraineeGoals(authUser?.uid)
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'progress' | 'trainers'>(
    'overview'
  )
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isTrainerProfileOpen, setIsTrainerProfileOpen] = useState(false)
  const [selectedTrainer, setSelectedTrainer] = useState<(FirebaseUser & { uid: string }) | null>(
    null
  )
  const [isMessagingOpen, setIsMessagingOpen] = useState(false)
  const [isStartWorkoutOpen, setIsStartWorkoutOpen] = useState(false)
  const [selectingTrainerId, setSelectingTrainerId] = useState<string | null>(null)
  const [selectingTrainer, setSelectingTrainer] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const handleLogout = async () => {
    await logOut()
  }

  const handleSelectTrainer = async (trainerId: string) => {
    if (!authUser?.uid) return
    setSelectingTrainerId(trainerId)
    setSelectingTrainer(true)
    try {
      const userRef = doc(db, 'users', authUser.uid)
      await updateDoc(userRef, {
        trainerId: trainerId,
      })
      // Refresh user data
      await new Promise(resolve => setTimeout(resolve, 500))
      const docSnap = await getDoc(doc(db, 'users', authUser.uid))
      if (docSnap.exists()) {
        setUser(docSnap.data() as FirebaseUser & { profileComplete?: boolean })
      }
      setActiveTab('trainers')
    } catch (err) {
      console.error('Error selecting trainer:', err)
    } finally {
      setSelectingTrainer(false)
      setSelectingTrainerId(null)
    }
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
            <p className="text-xs text-slate-400">Trainee</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: '📊 Dashboard', icon: '📊' },
            { id: 'workouts', label: '🏋️ Workouts', icon: '🏋️' },
            { id: 'progress', label: '📈 Progress', icon: '📈' },
            { id: 'trainers', label: '👨‍🏫 My Trainers', icon: '👨‍🏫' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any)
                setSidebarOpen(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold'
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
            <h2 className="text-2xl lg:text-3xl font-bold text-white">Your Fitness Journey</h2>
            <p className="text-slate-400 mt-1 text-sm lg:text-base">
              Track your progress and achieve your goals
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition text-sm lg:text-base"
            >
              👤 Edit Profile
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-400">Welcome:</p>
              <p className="text-white font-semibold text-sm lg:text-base">
                {user?.displayName || user?.email}
              </p>
            </div>
          </div>
        </div>

        <ProfileEditModal
          user={user}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSave={handleProfileSave}
        />

        <TrainerProfileModal
          trainer={selectedTrainer}
          isOpen={isTrainerProfileOpen}
          onClose={() => {
            setIsTrainerProfileOpen(false)
            setSelectedTrainer(null)
          }}
          onMessage={() => {
            setIsTrainerProfileOpen(false)
            setIsMessagingOpen(true)
          }}
        />

        <MessagingInterface
          otherUser={selectedTrainer}
          isOpen={isMessagingOpen}
          onClose={() => {
            setIsMessagingOpen(false)
            setSelectedTrainer(null)
          }}
        />

        <StartWorkoutModal
          workoutTemplates={workouts}
          isOpen={isStartWorkoutOpen}
          onClose={() => setIsStartWorkoutOpen(false)}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Workouts Completed',
                  value: workouts.length.toString(),
                  icon: '🏋️',
                  color: 'from-green-500 to-emerald-600',
                },
                {
                  label: 'Current Streak',
                  value: '12 days',
                  icon: '🔥',
                  color: 'from-orange-500 to-red-600',
                },
                {
                  label: 'Total Duration',
                  value: `${Math.round((progress?.workoutCount || 0) * 1.5)}h`,
                  icon: '⏱️',
                  color: 'from-blue-500 to-blue-600',
                },
                {
                  label: 'Personal Records',
                  value: goals.length.toString(),
                  icon: '🏆',
                  color: 'from-amber-500 to-yellow-600',
                },
              ].map(stat => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.color} rounded-xl p-4 lg:p-6 text-white shadow-lg`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs lg:text-sm opacity-90 mb-2">{stat.label}</p>
                      <p className="text-2xl lg:text-3xl font-bold">{stat.value}</p>
                    </div>
                    <span className="text-2xl lg:text-3xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Workout & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Next Workout */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Next Workout</h3>
                <div className="space-y-4">
                  {workouts.length > 0 ? (
                    <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-lg">
                      <h4 className="text-lg font-bold text-white mb-2">
                        {workouts[0]?.muscleGroups?.join(' & ') || 'Upcoming Workout'}
                      </h4>
                      <p className="text-slate-300 text-sm mb-3">
                        {new Date(workouts[0]?.timestamp || Date.now()).toLocaleDateString()}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-300">
                          <span>💪 {workouts[0]?.exercises?.length || 0} exercises</span>
                        </div>
                        {trainers.length > 0 && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span>👨‍🏫 Trainer: {trainers[0]?.displayName || 'Your Trainer'}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setIsStartWorkoutOpen(true)}
                        className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition"
                      >
                        Start Workout
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg text-center">
                      <p className="text-slate-300">No workouts scheduled yet</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Connect with a trainer to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Weekly Progress</h3>
                <div className="space-y-3">
                  {[
                    { day: 'Mon', workouts: 1, goal: 2 },
                    { day: 'Tue', workouts: 1, goal: 2 },
                    { day: 'Wed', workouts: 2, goal: 2 },
                    { day: 'Thu', workouts: 1, goal: 2 },
                    { day: 'Fri', workouts: 0, goal: 2 },
                    { day: 'Sat', workouts: 1, goal: 1 },
                    { day: 'Sun', workouts: 0, goal: 1 },
                  ].map(day => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-slate-300 w-12 font-medium">{day.day}</span>
                      <div className="flex gap-1 flex-1 mx-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-8 flex-1 rounded-lg ${
                              i < day.workouts
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : 'bg-slate-700/50'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-slate-400 text-sm w-10 text-right">
                        {day.workouts}/{day.goal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[{ activity: 'Started your fitness journey', time: 'Today', icon: '🚀' }]
                  .concat(
                    workouts.length > 0
                      ? [
                          {
                            activity: `Completed ${workouts.length} workout${workouts.length !== 1 ? 's' : ''}`,
                            time: 'Recently',
                            icon: '✓',
                          },
                        ]
                      : []
                  )
                  .concat(
                    trainers.length > 0
                      ? [
                          {
                            activity: `Connected with trainer ${trainers[0]?.displayName || 'your trainer'}`,
                            time: 'Today',
                            icon: '🤝',
                          },
                        ]
                      : []
                  )
                  .map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition"
                    >
                      <span className="text-xl mt-1">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.activity}</p>
                        <p className="text-sm text-slate-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-bold text-white">My Workouts History</h3>
              <button
                onClick={() => setIsStartWorkoutOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition text-sm lg:text-base"
              >
                + New Workout
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 lg:p-6 border border-slate-700/50 overflow-x-auto">
              {workoutsLoading ? (
                <p className="text-center text-slate-400">Loading workouts...</p>
              ) : (
                <WorkoutHistory workouts={workouts} userId={authUser?.uid} isOwner={true} />
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-white">Your Progress</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Weight Progress */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h4 className="text-lg font-bold text-white mb-4">Weight Progression</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Starting Weight</span>
                      <span className="text-green-400 font-semibold">185 lbs</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Current Weight</span>
                      <span className="text-green-400 font-semibold">175 lbs</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                        style={{ width: '73%' }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Goal Weight</span>
                      <span className="text-slate-300">170 lbs</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
                    ✓ 10 lbs lost (55% of goal)
                  </div>
                </div>
              </div>

              {/* Strength Gains */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h4 className="text-lg font-bold text-white mb-4">Strength Gains</h4>
                <div className="space-y-3">
                  {[
                    {
                      exercise: 'Bench Press',
                      start: '185 lbs',
                      current: '225 lbs',
                      gain: '+40 lbs',
                    },
                    { exercise: 'Deadlift', start: '275 lbs', current: '315 lbs', gain: '+40 lbs' },
                    { exercise: 'Squat', start: '225 lbs', current: '265 lbs', gain: '+40 lbs' },
                    {
                      exercise: 'Barbell Row',
                      start: '185 lbs',
                      current: '225 lbs',
                      gain: '+40 lbs',
                    },
                  ].map(strength => (
                    <div key={strength.exercise} className="p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium">{strength.exercise}</p>
                        <span className="text-green-400 text-sm font-semibold">
                          {strength.gain}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{strength.start}</span>
                        <div className="flex-1 h-1 bg-slate-600/50 rounded-full"></div>
                        <span>{strength.current}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
              <h4 className="text-lg font-bold text-white mb-4">Fitness Goals</h4>
              <div className="space-y-3">
                {[
                  { goal: 'Lose 15 lbs', progress: 67, deadline: 'March 31, 2026' },
                  { goal: 'Bench Press 250 lbs', progress: 90, deadline: 'February 28, 2026' },
                  { goal: 'Workout 4x per week', progress: 85, deadline: 'Ongoing' },
                ].map(goal => (
                  <div key={goal.goal} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-medium">{goal.goal}</span>
                      <span className="text-emerald-400 font-semibold">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400">{goal.deadline}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-white">My Trainers</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {trainers.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
                  <p className="text-slate-400 text-lg mb-4">You haven't selected a trainer yet</p>
                  <a
                    href="/select-trainer"
                    className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    Browse Trainers
                  </a>
                </div>
              ) : (
                trainers.map(trainer => (
                  <div
                    key={trainer.uid}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 hover:border-green-500/50 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">
                          {trainer.displayName || 'Trainer'}
                        </h4>
                        <p className="text-sm text-slate-400">
                          {trainer.specialization || 'Fitness Trainer'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-slate-300 text-sm mb-4">
                      <div>🎓 {trainer.experience || 0}+ years experience</div>
                      {trainer.certification && <div>📜 {trainer.certification}</div>}
                      {trainer.hourlyRate && <div>💰 ${trainer.hourlyRate}/hour</div>}
                    </div>
                    {trainer.bio && <p className="text-sm text-slate-400 mb-4">{trainer.bio}</p>}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedTrainer(trainer)
                          setIsMessagingOpen(true)
                        }}
                        className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-semibold transition"
                      >
                        Message
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrainer(trainer)
                          setIsTrainerProfileOpen(true)
                        }}
                        className="w-full py-2 border border-green-500/50 hover:bg-green-900/30 rounded-lg text-green-300 hover:text-green-200 transition font-medium"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
