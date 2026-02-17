import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export function ProfileSetup() {
  const { user, logOut } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [specialization, setSpecialization] = useState('')
  const [experience, setExperience] = useState('')
  const [certification, setCertification] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!user) throw new Error('User not found')

      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        displayName: displayName || user.email?.split('@')[0],
        specialization,
        experience: parseInt(experience) || 0,
        certification,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        bio,
        profileComplete: true,
      })

      // Small delay to ensure Firestore update propagates
      await new Promise(resolve => setTimeout(resolve, 500))

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl p-8 border border-purple-500/10 backdrop-blur">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mb-4 shadow-lg">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Complete Your Trainer Profile</h1>
            <p className="text-slate-400">Help trainees find and trust you</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label
                htmlFor="display-name"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Full Name *
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                disabled={loading}
                title="Enter your full name"
                aria-label="Your full name"
                className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label
                htmlFor="specialization-select"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Specialization *
              </label>
              <select
                id="specialization-select"
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                required
                disabled={loading}
                title="Select your fitness specialization"
                aria-label="Choose your training specialization"
                className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500 transition"
              >
                <option value="">Select specialization...</option>
                <option value="strength">💪 Strength Training</option>
                <option value="cardio">🏃 Cardio & Endurance</option>
                <option value="crossfit">🔥 CrossFit</option>
                <option value="yoga">🧘 Yoga & Flexibility</option>
                <option value="pilates">🤸 Pilates</option>
                <option value="nutrition">🥗 Nutrition Coaching</option>
                <option value="rehab">🏥 Rehabilitation</option>
                <option value="general">🏋️ General Fitness</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="experience"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Years of Experience *
              </label>
              <input
                id="experience"
                type="number"
                min="0"
                max="60"
                value={experience}
                onChange={e => setExperience(e.target.value)}
                required
                disabled={loading}
                title="Enter your years of experience (0-60)"
                aria-label="Years of training experience"
                className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition"
                placeholder="5"
              />
            </div>

            <div>
              <label
                htmlFor="certification"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Certification (Optional)
              </label>
              <input
                id="certification"
                type="text"
                value={certification}
                onChange={e => setCertification(e.target.value)}
                disabled={loading}
                title="Enter your professional certifications"
                aria-label="Professional certification credentials"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
                placeholder="e.g., NASM, ACE, ISSA"
              />
            </div>

            <div>
              <label
                htmlFor="hourly-rate"
                className="block text-sm font-semibold text-slate-200 mb-2"
              >
                Hourly Rate ($) (Optional)
              </label>
              <input
                id="hourly-rate"
                type="number"
                min="0"
                step="5"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                disabled={loading}
                title="Enter your hourly training rate"
                aria-label="Training session hourly rate in dollars"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
                placeholder="50"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-slate-200 mb-2">
                Bio / About You
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                disabled={loading}
                rows={3}
                maxLength={500}
                title="Tell trainees about your training philosophy and experience"
                aria-label="Professional biography describing your training approach and credentials"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-slate-400 transition resize-none"
                placeholder="Tell trainees about your approach, achievements, and why they should train with you..."
              />
              <p className="text-xs text-slate-500 mt-1">{bio.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition shadow-lg"
            >
              {loading ? '⏳ Saving...' : '✅ Complete Profile'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => logOut()}
              className="text-slate-400 hover:text-slate-300 text-sm transition"
            >
              🚪 Sign Out Instead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
