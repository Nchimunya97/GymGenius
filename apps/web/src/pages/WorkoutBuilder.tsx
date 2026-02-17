import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkouts } from '@/hooks/useWorkouts'
import type { Exercise } from '@repo/shared'

const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Core',
  'Legs',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
]

export function WorkoutBuilder() {
  const { user } = useAuth()
  const { createWorkout, workouts, loading: workoutsLoading } = useWorkouts(user?.uid)
  const [showForm, setShowForm] = useState(false)
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [notes, setNotes] = useState('')
  const [currentExercise, setCurrentExercise] = useState('')
  const [currentSets, setCurrentSets] = useState<
    Array<{ reps: number; weight: number; restDuration: number }>
  >([{ reps: 0, weight: 0, restDuration: 60 }])
  const [saving, setSaving] = useState(false)

  const handleToggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    )
  }

  const handleAddExercise = () => {
    if (!currentExercise || currentSets.some(s => s.reps === 0 || s.weight === 0)) {
      alert('Please fill in exercise name and all set details')
      return
    }

    const newExercise: Exercise = {
      name: currentExercise,
      sets: currentSets,
    }

    setExercises(prev => [...prev, newExercise])
    setCurrentExercise('')
    setCurrentSets([{ reps: 0, weight: 0, restDuration: 60 }])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveWorkout = async () => {
    if (!selectedMuscleGroups.length || !exercises.length) {
      alert('Please select muscle groups and add exercises')
      return
    }

    setSaving(true)
    try {
      await createWorkout({
        muscleGroups: selectedMuscleGroups,
        exercises,
        notes,
      })

      // Reset form
      setSelectedMuscleGroups([])
      setExercises([])
      setNotes('')
      setCurrentExercise('')
      setCurrentSets([{ reps: 0, weight: 0, restDuration: 60 }])
      setShowForm(false)

      alert('Workout saved successfully!')
    } catch (error) {
      console.error('Error saving workout:', error)
      alert('Failed to save workout')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {!showForm ? (
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + New Workout
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Create New Workout</h2>

          {/* Muscle Groups */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Select Muscle Groups</h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {MUSCLE_GROUPS.map(group => (
                <label
                  key={group}
                  htmlFor={`muscle-group-${group}`}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-slate-700"
                >
                  <input
                    id={`muscle-group-${group}`}
                    type="checkbox"
                    checked={selectedMuscleGroups.includes(group)}
                    onChange={() => handleToggleMuscleGroup(group)}
                    title={`Select ${group} for this workout`}
                    aria-label={`${group} muscle group`}
                    className="w-4 h-4"
                  />
                  <span>{group}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Exercises</h3>

            {/* Current Exercise Form */}
            <div className="bg-slate-700/50 p-4 rounded-lg mb-4 space-y-4">
              <div>
                <label htmlFor="exercise-name" className="block text-sm font-medium mb-1">
                  Exercise Name
                </label>
                <input
                  id="exercise-name"
                  type="text"
                  value={currentExercise}
                  onChange={e => setCurrentExercise(e.target.value)}
                  placeholder="e.g., Bench Press"
                  title="Enter the name of the exercise"
                  aria-label="Exercise name"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Sets</label>
                  <button
                    onClick={() =>
                      setCurrentSets(prev => [...prev, { reps: 0, weight: 0, restDuration: 60 }])
                    }
                    className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
                  >
                    + Add Set
                  </button>
                </div>

                {currentSets.map((set, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor={`set-${idx}-reps`} className="text-xs text-slate-300">
                        Reps
                      </label>
                      <input
                        id={`set-${idx}-reps`}
                        type="number"
                        value={set.reps}
                        onChange={e => {
                          const newSets = [...currentSets]
                          newSets[idx].reps = parseInt(e.target.value) || 0
                          setCurrentSets(newSets)
                        }}
                        placeholder="Reps"
                        title="Number of repetitions for this set"
                        aria-label={`Repetitions for set ${idx + 1}`}
                        className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`set-${idx}-weight`} className="text-xs text-slate-300">
                        Weight
                      </label>
                      <input
                        id={`set-${idx}-weight`}
                        type="number"
                        value={set.weight}
                        onChange={e => {
                          const newSets = [...currentSets]
                          newSets[idx].weight = parseInt(e.target.value) || 0
                          setCurrentSets(newSets)
                        }}
                        placeholder="Weight (lbs)"
                        title="Weight in pounds for this set"
                        aria-label={`Weight in pounds for set ${idx + 1}`}
                        className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`set-${idx}-rest`} className="text-xs text-slate-300">
                        Rest
                      </label>
                      <input
                        id={`set-${idx}-rest`}
                        type="number"
                        value={set.restDuration}
                        onChange={e => {
                          const newSets = [...currentSets]
                          newSets[idx].restDuration = parseInt(e.target.value) || 60
                          setCurrentSets(newSets)
                        }}
                        placeholder="Rest (sec)"
                        title="Rest duration in seconds between sets"
                        aria-label={`Rest duration in seconds for set ${idx + 1}`}
                        className="w-full px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => setCurrentSets(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddExercise}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition"
              >
                Add Exercise
              </button>
            </div>

            {/* Exercises List */}
            {exercises.length > 0 && (
              <div className="space-y-2">
                {exercises.map((exercise, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-700/50 rounded flex items-start justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-xs text-slate-400">
                        {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''} - Total
                        weight: {exercise.sets.reduce((sum, s) => sum + s.weight, 0)} lbs
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveExercise(idx)}
                      className="text-red-400 hover:text-red-300 text-sm ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="workout-notes" className="block text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              id="workout-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="How did you feel? Any observations?"
              title="Add notes about this workout session"
              aria-label="Workout notes and observations"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveWorkout}
              disabled={saving}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-medium transition"
            >
              {saving ? 'Saving...' : 'Save Workout'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Recent Workouts</h2>
        {workoutsLoading ? (
          <p className="text-slate-400">Loading workouts...</p>
        ) : workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map(workout => (
              <div key={workout.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-lg">{workout.muscleGroups.join(', ')}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(workout.timestamp).toLocaleDateString()} at{' '}
                      {new Date(workout.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="text-sm text-slate-300 mb-2">
                    {workout.exercises.map((ex, idx) => (
                      <p key={idx}>
                        • {ex.name} ({ex.sets.length}x)
                      </p>
                    ))}
                  </div>
                )}
                {workout.notes && (
                  <p className="text-sm text-slate-400 italic">"{workout.notes}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No workouts yet. Create your first one!</p>
        )}
      </div>
    </div>
  )
}
