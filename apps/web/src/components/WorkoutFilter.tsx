import { useState, useMemo } from 'react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/contexts/AuthContext'
import type { Workout } from '@repo/shared'

interface WorkoutFilters {
  muscleGroup: string
  dateStart: string
  dateEnd: string
}

export function WorkoutFilter() {
  const { user } = useAuth()
  const { workouts, loading, updateWorkout, deleteWorkout } = useWorkouts(user?.uid || '')
  const [filters, setFilters] = useState<WorkoutFilters>({
    muscleGroup: '',
    dateStart: '',
    dateEnd: '',
  })
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const muscleGroups = [
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Forearms',
    'Core',
    'Legs',
    'Quads',
    'Hamstrings',
    'Glutes',
    'Calves',
  ]

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      const workoutDate = new Date(w.timestamp)
      if (filters.muscleGroup && !w.muscleGroups.includes(filters.muscleGroup)) return false
      if (filters.dateStart && workoutDate < new Date(filters.dateStart)) return false
      if (filters.dateEnd && workoutDate > new Date(filters.dateEnd)) return false
      return true
    })
  }, [workouts, filters])

  const stats = {
    totalWorkouts: workouts.length,
    thisWeek: workouts.filter(
      w => new Date(w.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
    totalExercises: workouts.reduce((sum, w) => sum + w.exercises.length, 0),
    totalVolume: workouts.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (exSum, ex) =>
            exSum +
            ex.sets.reduce((setSum, set) => setSum + (set.weight || 0) * (set.reps || 0), 0),
          0
        ),
      0
    ),
  }

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout)
    setEditNotes(workout.notes || '')
  }

  const handleSaveEdit = async () => {
    if (!editingWorkout) return
    setSaving(true)
    try {
      await updateWorkout(editingWorkout.id, { ...editingWorkout, notes: editNotes })
      setEditingWorkout(null)
    } catch (error) {
      console.error('Error updating workout:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkout(id)
      } catch (error) {
        console.error('Error deleting workout:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-slate-400">Total Workouts</p>
          <p className="text-2xl font-bold text-blue-400">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-sm text-slate-400">This Week</p>
          <p className="text-2xl font-bold text-green-400">{stats.thisWeek}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-sm text-slate-400">Total Exercises</p>
          <p className="text-2xl font-bold text-purple-400">{stats.totalExercises}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
          <p className="text-sm text-slate-400">Total Volume</p>
          <p className="text-2xl font-bold text-orange-400">{Math.round(stats.totalVolume)} kg</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-lg">Filter Workouts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="muscle-group-filter" className="block text-sm font-medium mb-2">
              Muscle Group
            </label>
            <select
              id="muscle-group-filter"
              value={filters.muscleGroup}
              onChange={e => setFilters({ ...filters, muscleGroup: e.target.value })}
              title="Filter workouts by muscle group"
              aria-label="Filter by muscle group"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">All Groups</option>
              {muscleGroups.map(group => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date-start" className="block text-sm font-medium mb-2">
              From
            </label>
            <input
              id="date-start"
              type="date"
              value={filters.dateStart}
              onChange={e => setFilters({ ...filters, dateStart: e.target.value })}
              title="Start date for filtering workouts"
              aria-label="Workout start date"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="date-end" className="block text-sm font-medium mb-2">
              To
            </label>
            <input
              id="date-end"
              type="date"
              value={filters.dateEnd}
              onChange={e => setFilters({ ...filters, dateEnd: e.target.value })}
              title="End date for filtering workouts"
              aria-label="Workout end date"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        {(filters.muscleGroup || filters.dateStart || filters.dateEnd) && (
          <button
            onClick={() => setFilters({ muscleGroup: '', dateStart: '', dateEnd: '' })}
            className="text-sm text-slate-400 hover:text-slate-200 transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Workouts List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Workouts ({filteredWorkouts.length})</h3>
        {loading ? (
          <p className="text-slate-400">Loading workouts...</p>
        ) : filteredWorkouts.length > 0 ? (
          filteredWorkouts.map(workout => (
            <div
              key={workout.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{workout.exercises.map(e => e.name).join(', ')}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(workout.timestamp).toLocaleDateString()} •{' '}
                    {workout.muscleGroups.join(', ')}
                  </p>
                </div>
                <span className="text-sm bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full">
                  {workout.exercises.length} exercises
                </span>
              </div>
              <div className="mt-3 space-y-2 bg-slate-900/50 rounded p-3">
                {workout.exercises.map((exercise, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-300">{exercise.name}</span>
                    <span className="text-slate-400">
                      {exercise.sets.map(s => `${s.reps}x${s.weight}kg`).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
              {workout.notes && (
                <p className="mt-3 text-sm text-slate-400 italic">Note: {workout.notes}</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(workout)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No workouts match your filters</p>
        )}
      </div>

      {/* Edit Modal */}
      {editingWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit Workout Notes</h2>
            <label
              htmlFor="edit-workout-notes"
              className="block text-sm font-semibold text-slate-300 mb-2"
            >
              Notes
            </label>
            <textarea
              id="edit-workout-notes"
              value={editNotes}
              onChange={e => setEditNotes(e.target.value)}
              placeholder="Add notes about this workout..."
              title="Edit notes for this workout"
              aria-label="Workout notes"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 mb-4 min-h-24"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditingWorkout(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
