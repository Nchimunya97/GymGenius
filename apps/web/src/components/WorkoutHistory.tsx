import { useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { Workout } from '@repo/shared'

interface WorkoutHistoryProps {
  workouts: Workout[]
  userId: string | undefined
  isOwner: boolean
}

export function WorkoutHistory({ workouts, userId, isOwner }: WorkoutHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleEdit = (workout: Workout) => {
    setEditingId(workout.id)
    setEditNotes(workout.notes || '')
  }

  const handleSave = async (workoutId: string) => {
    if (!userId) return

    setSaving(true)
    setError('')

    try {
      const workoutRef = doc(db, 'workouts', workoutId)
      await updateDoc(workoutRef, {
        notes: editNotes,
      })
      setEditingId(null)
    } catch (err) {
      setError('Failed to update workout')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (workoutId: string) => {
    if (!userId || !window.confirm('Delete this workout? This cannot be undone.')) return

    try {
      const workoutRef = doc(db, 'workouts', workoutId)
      await deleteDoc(workoutRef)
    } catch (err) {
      setError('Failed to delete workout')
      console.error(err)
    }
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No past workouts yet</p>
        <p className="text-sm mt-1">Your completed workouts will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {workouts.map(workout => (
        <div
          key={workout.id}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600 transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-white">
                {workout.muscleGroups?.join(' & ') || 'Workout Session'}
              </h4>
              <p className="text-sm text-slate-400">
                {new Date(workout.timestamp).toLocaleString()}
              </p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(workout)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Workout details */}
          <div className="bg-slate-700/30 rounded p-3 mb-3 text-sm space-y-2">
            <p>
              <span className="font-semibold text-slate-300">Exercises:</span>{' '}
              <span className="text-slate-400">{workout.exercises.length}</span>
            </p>
            <div className="space-y-1">
              {workout.exercises.map((exercise, idx) => (
                <p key={idx} className="text-slate-400">
                  • {exercise.name} ({exercise.sets.length} sets)
                </p>
              ))}
            </div>
          </div>

          {/* Notes section */}
          {editingId === workout.id ? (
            <div className="space-y-2">
              <label
                htmlFor={`workout-notes-${workout.id}`}
                className="block text-sm font-semibold text-slate-300"
              >
                Workout Notes
              </label>
              <textarea
                id={`workout-notes-${workout.id}`}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                title="Edit notes for this workout"
                aria-label="Workout notes"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm resize-none"
                rows={3}
                placeholder="Add notes about this workout..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(workout.id)}
                  disabled={saving}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm rounded transition"
                >
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm">
              {workout.notes ? (
                <p className="text-slate-300">
                  <span className="font-semibold">Notes:</span> {workout.notes}
                </p>
              ) : (
                isOwner && <p className="text-slate-500 italic">No notes added</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
