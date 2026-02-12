import { useState, useMemo } from 'react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/contexts/AuthContext'

interface WorkoutFilters {
  muscleGroup: string
  dateStart: string
  dateEnd: string
}

export function WorkoutFilter() {
  const { user } = useAuth()
  const { workouts, loading } = useWorkouts(user?.uid || '')
  const [filters, setFilters] = useState<WorkoutFilters>({
    muscleGroup: '',
    dateStart: '',
    dateEnd: '',
  })

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

      if (filters.muscleGroup && !w.muscleGroups.includes(filters.muscleGroup)) {
        return false
      }

      if (filters.dateStart && workoutDate < new Date(filters.dateStart)) {
        return false
      }

      if (filters.dateEnd && workoutDate > new Date(filters.dateEnd)) {
        return false
      }

      return true
    })
  }, [workouts, filters])

  const stats = {
    totalWorkouts: workouts.length,
    thisWeek: workouts.filter(
      w => new Date(w.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
    totalExercises: workouts.reduce((sum, w) => sum + w.exercises.length, 0),
    totalVolume: workouts.reduce((sum, w) => {
      return (
        sum +
        w.exercises.reduce((exSum, ex) => {
          return (
            exSum + ex.sets.reduce((setSum, set) => setSum + (set.weight || 0) * (set.reps || 0), 0)
          )
        }, 0)
      )
    }, 0),
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
          {/* Muscle Group Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Muscle Group</label>
            <select
              value={filters.muscleGroup}
              onChange={e => setFilters({ ...filters, muscleGroup: e.target.value })}
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

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <input
              type="date"
              value={filters.dateStart}
              onChange={e => setFilters({ ...filters, dateStart: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <input
              type="date"
              value={filters.dateEnd}
              onChange={e => setFilters({ ...filters, dateEnd: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.muscleGroup || filters.dateStart || filters.dateEnd) && (
          <button
            onClick={() =>
              setFilters({
                muscleGroup: '',
                dateStart: '',
                dateEnd: '',
              })
            }
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

              {/* Exercises */}
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
            </div>
          ))
        ) : (
          <p className="text-slate-400">No workouts match your filters</p>
        )}
      </div>
    </div>
  )
}
