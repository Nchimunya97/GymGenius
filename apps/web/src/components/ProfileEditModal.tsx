import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import type { User as FirebaseUser } from '@repo/shared'

interface ProfileEditModalProps {
  user: (FirebaseUser & { profileComplete?: boolean }) | null
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export function ProfileEditModal({ user, isOpen, onClose, onSave }: ProfileEditModalProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '')
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { user: authUser } = useAuth()

  const handleSave = async () => {
    if (!authUser?.uid) return

    setSaving(true)
    setError('')

    try {
      const userRef = doc(db, 'users', authUser.uid)
      const updateData: Record<string, any> = { displayName }

      if (user?.role === 'trainee') {
        Object.assign(updateData, {
          bio,
          phoneNumber,
          fitnessGoal,
        })
      } else if (user?.role === 'trainer') {
        Object.assign(updateData, { bio })
      }

      await updateDoc(userRef, updateData)
      onSave?.()
      onClose()
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Edit Profile</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl transition">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Display Name */}
          <div>
            <label
              htmlFor="profile-display-name"
              className="block text-sm font-semibold text-slate-300 mb-2"
            >
              Display Name
            </label>
            <input
              id="profile-display-name"
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              title="Update your display name"
              aria-label="Your display name"
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

          {/* Bio - All roles */}
          <div>
            <label
              htmlFor="profile-bio"
              className="block text-sm font-semibold text-slate-300 mb-2"
            >
              Bio {user?.role === 'trainer' ? '(Professional bio)' : ''}
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={e => setBio(e.target.value.substring(0, 500))}
              maxLength={500}
              title={
                user?.role === 'trainer' ? 'Your professional biography' : 'Tell about yourself'
              }
              aria-label={
                user?.role === 'trainer' ? 'Professional biography' : 'Personal biography'
              }
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              rows={4}
              placeholder={
                user?.role === 'trainer'
                  ? 'Tell clients about your experience...'
                  : 'Tell about yourself...'
              }
            />
            <p className="text-xs text-slate-400 mt-1">{bio.length}/500</p>
          </div>

          {/* Trainee-specific fields */}
          {user?.role === 'trainee' && (
            <>
              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  title="Enter your phone number"
                  aria-label="Phone number"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-fitness-goal"
                  className="block text-sm font-semibold text-slate-300 mb-2"
                >
                  Fitness Goal
                </label>
                <textarea
                  id="profile-fitness-goal"
                  value={fitnessGoal}
                  onChange={e => setFitnessGoal(e.target.value)}
                  title="Describe your fitness goals"
                  aria-label="Fitness goal"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="What do you want to achieve?"
                />
              </div>
            </>
          )}

          {/* Read-only fields */}
          <div className="pt-2 border-t border-slate-700">
            <div className="space-y-2 text-sm">
              <p className="text-slate-400">
                <span className="font-semibold">Email:</span> {user?.email}
              </p>
              <p className="text-slate-400">
                <span className="font-semibold">Role:</span> {user?.role?.charAt(0).toUpperCase()}
                {user?.role?.slice(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-semibold transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
