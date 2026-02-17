import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useAvailableTrainers } from '@/hooks/useTraineeData'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export function TrainerSelection() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: trainers = [], isLoading } = useAvailableTrainers()
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSelectTrainer = async (trainerId: string) => {
    if (!user?.uid) return

    setSaving(true)
    setError('')

    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        trainerId: trainerId,
      })

      // Small delay to ensure Firestore update propagates
      await new Promise(resolve => setTimeout(resolve, 500))

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError('Failed to select trainer. Please try again.')
      console.error(err)
      setSaving(false)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Trainer</h1>
          <p className="text-slate-400 text-lg">
            Connect with a certified fitness trainer to start your journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-600/50 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading trainers...</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50 p-8">
            <p className="text-slate-400 text-lg mb-4">No trainers available yet</p>
            <button
              onClick={handleSkip}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition"
            >
              Continue to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {trainers.map(trainer => (
                <div
                  key={trainer.uid}
                  onClick={() => setSelectedTrainerId(trainer.uid)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition ${
                    selectedTrainerId === trainer.uid
                      ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500'
                      : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {trainer.displayName || 'Trainer'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {trainer.specialization || 'Fitness Trainer'}
                      </p>
                    </div>
                    {selectedTrainerId === trainer.uid && <span className="text-2xl">✓</span>}
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300">
                      <span className="font-semibold">Experience:</span> {trainer.experience || 0}+
                      years
                    </p>
                    {trainer.certification && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Certification:</span>{' '}
                        {trainer.certification}
                      </p>
                    )}
                    {trainer.hourlyRate && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Rate:</span> ${trainer.hourlyRate}/hour
                      </p>
                    )}
                  </div>

                  {trainer.bio && (
                    <p className="mt-3 text-slate-400 text-sm">
                      {trainer.bio.substring(0, 100)}...
                    </p>
                  )}

                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleSelectTrainer(trainer.uid)
                    }}
                    disabled={saving || selectedTrainerId !== trainer.uid}
                    className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${
                      selectedTrainerId === trainer.uid
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50`}
                  >
                    {saving && selectedTrainerId === trainer.uid
                      ? 'Selecting...'
                      : 'Select Trainer'}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-slate-400 hover:text-slate-300 transition"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
