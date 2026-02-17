import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import type { Workout } from '@repo/shared'

interface StartWorkoutModalProps {
  workoutTemplates: Workout[]
  isOpen: boolean
  onClose: () => void
  onStart?: () => void
}

interface ExerciseInput {
  name: string
  sets: string
  reps: string
  weight: string
}

export function StartWorkoutModal({
  workoutTemplates,
  isOpen,
  onClose,
  onStart,
}: StartWorkoutModalProps) {
  const { user: authUser } = useAuth()
  const [mode, setMode] = useState<'template' | 'custom'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Custom workout fields
  const [workoutTitle, setWorkoutTitle] = useState('')
  const [workoutDescription, setWorkoutDescription] = useState('')
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: '', sets: '', reps: '', weight: '' },
  ])
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])

  const muscleGroupOptions = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Forearms',
    'Legs',
    'Glutes',
    'Core',
    'Cardio',
  ]

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }])
  }

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const handleExerciseChange = (index: number, field: keyof ExerciseInput, value: string) => {
    const updated = [...exercises]
    updated[index][field] = value
    setExercises(updated)
  }

  const toggleMuscleGroup = (group: string) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    )
  }

  const handleStartWorkout = async () => {
    if (!authUser?.uid) return

    setLoading(true)
    try {
      let workoutData: Record<string, unknown>

      if (mode === 'template' && selectedTemplate) {
        // Template mode - simple start from template
        workoutData = {
          ownerId: authUser.uid,
          templateId: selectedTemplate,
          timestamp: new Date(),
          notes,
          exercises: [],
          status: 'active',
          duration: 0,
        }
      } else if (mode === 'custom') {
        // Custom mode - create from scratch with exercises
        const validExercises = exercises.filter(e => e.name.trim())

        if (!workoutTitle.trim() || validExercises.length === 0) {
          alert('Please enter a workout title and at least one exercise')
          setLoading(false)
          return
        }

        workoutData = {
          ownerId: authUser.uid,
          timestamp: new Date(),
          title: workoutTitle,
          description: workoutDescription,
          muscleGroups: selectedMuscleGroups.length > 0 ? selectedMuscleGroups : ['Custom'],
          exercises: validExercises.map(ex => ({
            name: ex.name,
            sets: parseInt(ex.sets) || 0,
            reps: parseInt(ex.reps) || 0,
            weight: ex.weight ? parseFloat(ex.weight) : 0,
          })),
          notes,
          status: 'active',
          duration: 0,
        }
      } else {
        alert('Please select a method to start your workout')
        setLoading(false)
        return
      }

      const docRef = await addDoc(collection(db, 'workouts'), workoutData)

      // Store the active workout in localStorage for quick access
      localStorage.setItem('activeWorkoutId', docRef.id)

      onStart?.()
      onClose()

      // Navigate to workout session
      window.location.href = `/workout-session/${docRef.id}`
    } catch (err) {
      console.error('Error starting workout:', err)
      alert('Failed to start workout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-2xl w-full my-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Start Workout</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl transition">
            ✕
          </button>
        </div>

        {/* Mode Selection Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700">
          <button
            onClick={() => {
              setMode('template')
              setSelectedTemplate(null)
            }}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              mode === 'template'
                ? 'text-green-400 border-green-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            📋 From Template
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`px-4 py-2 font-semibold transition border-b-2 ${
              mode === 'custom'
                ? 'text-green-400 border-green-500'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            🏗️ Build Custom
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {mode === 'template' ? (
            <>
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Select Workout Template
                </label>
                <div className="space-y-2">
                  {workoutTemplates.length === 0 ? (
                    <p className="text-slate-400 text-sm">No workout templates available</p>
                  ) : (
                    workoutTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedTemplate === template.id
                            ? 'bg-green-600/30 border-green-500 text-green-300'
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <p className="font-semibold">
                          {template.muscleGroups?.join(' & ') || 'Untitled Workout'}
                        </p>
                        {template.exercises && template.exercises.length > 0 && (
                          <p className="text-xs text-slate-400 mt-1">
                            {template.exercises.length} exercise
                            {template.exercises.length !== 1 ? 's' : ''}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(template.timestamp).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Custom Workout Title */}
              <div>
                <label
                  htmlFor="workout-title"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Workout Title *
                </label>
                <input
                  id="workout-title"
                  type="text"
                  value={workoutTitle}
                  onChange={e => setWorkoutTitle(e.target.value)}
                  placeholder="e.g., Upper Body Strength"
                  title="Enter workout title"
                  aria-label="Workout title"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="workout-description"
                  className="block text-sm font-semibold text-white mb-2"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="workout-description"
                  value={workoutDescription}
                  onChange={e => setWorkoutDescription(e.target.value)}
                  placeholder="Add workout details..."
                  title="Workout description"
                  aria-label="Workout description"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 resize-none"
                  rows={2}
                />
              </div>

              {/* Muscle Groups */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Muscle Groups</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {muscleGroupOptions.map(group => (
                    <button
                      key={group}
                      onClick={() => toggleMuscleGroup(group)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition border ${
                        selectedMuscleGroups.includes(group)
                          ? 'bg-green-600/30 border-green-500 text-green-300'
                          : 'bg-slate-700/30 border-slate-600/50 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-white">
                    Exercises * ({exercises.filter(e => e.name.trim()).length})
                  </label>
                  <button
                    onClick={handleAddExercise}
                    className="px-3 py-1 bg-green-600/20 border border-green-500/50 text-green-400 rounded-lg text-sm hover:bg-green-600/30 transition"
                  >
                    + Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {exercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-700/20 border border-slate-600/50 rounded-lg p-3 space-y-2"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={e => handleExerciseChange(idx, 'name', e.target.value)}
                          placeholder="Exercise name"
                          title={`Exercise ${idx + 1} name`}
                          aria-label={`Exercise ${idx + 1} name`}
                          className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500"
                        />
                        {exercises.length > 1 && (
                          <button
                            onClick={() => handleRemoveExercise(idx)}
                            className="px-2 py-1 bg-red-600/20 border border-red-500/50 text-red-400 rounded text-sm hover:bg-red-600/30 transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label
                            htmlFor={`sets-${idx}`}
                            className="text-xs text-slate-400 block mb-1"
                          >
                            Sets
                          </label>
                          <input
                            id={`sets-${idx}`}
                            type="number"
                            value={exercise.sets}
                            onChange={e => handleExerciseChange(idx, 'sets', e.target.value)}
                            placeholder="0"
                            title={`Sets for exercise ${idx + 1}`}
                            aria-label={`Sets for exercise ${idx + 1}`}
                            min="0"
                            className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`reps-${idx}`}
                            className="text-xs text-slate-400 block mb-1"
                          >
                            Reps
                          </label>
                          <input
                            id={`reps-${idx}`}
                            type="number"
                            value={exercise.reps}
                            onChange={e => handleExerciseChange(idx, 'reps', e.target.value)}
                            placeholder="0"
                            title={`Reps for exercise ${idx + 1}`}
                            aria-label={`Reps for exercise ${idx + 1}`}
                            min="0"
                            className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`weight-${idx}`}
                            className="text-xs text-slate-400 block mb-1"
                          >
                            Weight (kg)
                          </label>
                          <input
                            id={`weight-${idx}`}
                            type="number"
                            step="0.5"
                            value={exercise.weight}
                            onChange={e => handleExerciseChange(idx, 'weight', e.target.value)}
                            placeholder="0"
                            title={`Weight for exercise ${idx + 1}`}
                            aria-label={`Weight for exercise ${idx + 1}`}
                            min="0"
                            className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-500 text-sm focus:outline-none focus:border-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes - shown in both modes */}
          <div>
            <label
              htmlFor="start-workout-notes"
              className="block text-sm font-semibold text-white mb-2"
            >
              Workout Notes (Optional)
            </label>
            <textarea
              id="start-workout-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add any notes about this workout session..."
              title="Add notes for this workout session"
              aria-label="Workout notes"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleStartWorkout}
            disabled={
              loading ||
              (mode === 'template' && !selectedTemplate) ||
              (mode === 'custom' &&
                (!workoutTitle.trim() || exercises.filter(e => e.name.trim()).length === 0))
            }
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
          >
            {loading ? 'Starting...' : '🎯 Start Workout'}
          </button>
        </div>
      </div>
    </div>
  )
}
