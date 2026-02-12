import { useMemo } from 'react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useAuth } from '@/contexts/AuthContext'

interface ExerciseProgress {
  name: string
  attempts: number
  maxWeight: number
  avgWeight: number
  totalReps: number
  trend: 'up' | 'down' | 'stable'
}

export function ProgressTracker() {
  const { user } = useAuth()
  const { workouts } = useWorkouts(user?.uid || '')

  const exerciseStats = useMemo(() => {
    const stats: Record<string, ExerciseProgress> = {}

    workouts.forEach(w => {
      w.exercises.forEach(ex => {
        if (!stats[ex.name]) {
          stats[ex.name] = {
            name: ex.name,
            attempts: 0,
            maxWeight: 0,
            avgWeight: 0,
            totalReps: 0,
            trend: 'stable',
          }
        }

        ex.sets.forEach(set => {
          stats[ex.name].attempts += 1
          stats[ex.name].maxWeight = Math.max(stats[ex.name].maxWeight, set.weight || 0)
          stats[ex.name].totalReps += set.reps || 0
          stats[ex.name].avgWeight += set.weight || 0
        })
      })
    })

    // Calculate averages and trends
    Object.values(stats).forEach(stat => {
      if (stat.attempts > 0) {
        stat.avgWeight = stat.avgWeight / stat.attempts

        // Simple trend: compare first half to second half
        const recentWorkouts = workouts.slice(0, Math.ceil(workouts.length / 2))
        const olderWorkouts = workouts.slice(Math.ceil(workouts.length / 2))

        let recentMax = 0
        let olderMax = 0

        recentWorkouts.forEach(w => {
          w.exercises.forEach(ex => {
            if (ex.name === stat.name) {
              ex.sets.forEach(set => {
                recentMax = Math.max(recentMax, set.weight || 0)
              })
            }
          })
        })

        olderWorkouts.forEach(w => {
          w.exercises.forEach(ex => {
            if (ex.name === stat.name) {
              ex.sets.forEach(set => {
                olderMax = Math.max(olderMax, set.weight || 0)
              })
            }
          })
        })

        if (recentMax > olderMax) stat.trend = 'up'
        else if (recentMax < olderMax) stat.trend = 'down'
        else stat.trend = 'stable'
      }
    })

    return Object.values(stats).sort((a, b) => b.attempts - a.attempts)
  }, [workouts])

  const totalStats = useMemo(() => {
    return {
      totalWorkouts: workouts.length,
      totalExercises: workouts.reduce((sum, w) => sum + w.exercises.length, 0),
      totalSets: workouts.reduce(
        (sum, w) => sum + w.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0),
        0
      ),
      totalReps: workouts.reduce(
        (sum, w) =>
          sum +
          w.exercises.reduce(
            (exSum, ex) => exSum + ex.sets.reduce((setSum, set) => setSum + (set.reps || 0), 0),
            0
          ),
        0
      ),
      averageWeight:
        workouts.reduce(
          (sum, w) =>
            sum +
            w.exercises.reduce(
              (exSum, ex) => exSum + ex.sets.reduce((setSum, set) => setSum + (set.weight || 0), 0),
              0
            ),
          0
        ) /
        (workouts.reduce(
          (sum, w) => sum + w.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0),
          0
        ) || 1),
    }
  }, [workouts])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈'
      case 'down':
        return '📉'
      default:
        return '➡️'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase">Workouts</p>
          <p className="text-3xl font-bold text-blue-400">{totalStats.totalWorkouts}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase">Exercises</p>
          <p className="text-3xl font-bold text-purple-400">{exerciseStats.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase">Total Sets</p>
          <p className="text-3xl font-bold text-green-400">{totalStats.totalSets}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase">Total Reps</p>
          <p className="text-3xl font-bold text-yellow-400">{totalStats.totalReps}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-xs text-slate-400 uppercase">Avg Weight</p>
          <p className="text-3xl font-bold text-red-400">{totalStats.averageWeight.toFixed(1)}kg</p>
        </div>
      </div>

      {/* Exercise Progress */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">💪 Exercise Progress</h3>

        {exerciseStats.length > 0 ? (
          <div className="space-y-3">
            {exerciseStats.map(ex => (
              <div
                key={ex.name}
                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-lg">{ex.name}</p>
                    <p className="text-sm text-slate-400">
                      {ex.attempts} sets • {ex.totalReps} total reps
                    </p>
                  </div>
                  <span className="text-2xl">{getTrendIcon(ex.trend)}</span>
                </div>

                {/* Progress Bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Max Weight</span>
                      <span className="text-amber-400 font-bold">{ex.maxWeight}kg</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min((ex.maxWeight / 150) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Avg Weight</span>
                      <span className="text-blue-400 font-bold">{ex.avgWeight.toFixed(1)}kg</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                        style={{ width: `${Math.min((ex.avgWeight / 150) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Records */}
                {ex.trend === 'up' && (
                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-400">
                    ✨ Personal best streak! Keep pushing!
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">
            Start logging workouts to track progress
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">🏆 Milestones</h3>

        <div className="space-y-3">
          {totalStats.totalWorkouts >= 1 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>🚀 First Workout</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          )}
          {totalStats.totalWorkouts >= 5 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>💪 5 Workouts Completed</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          )}
          {totalStats.totalWorkouts >= 10 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>🔥 10 Workouts Completed</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          )}
          {totalStats.totalWorkouts >= 20 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>⚡ 20 Workouts Completed</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          )}
          {totalStats.totalReps >= 500 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
              <span>🎯 500 Total Reps</span>
              <span className="text-green-400 font-bold">✓</span>
            </div>
          )}

          {totalStats.totalWorkouts < 5 && (
            <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded opacity-50">
              <span>💪 5 Workouts Completed</span>
              <span className="text-slate-500">{totalStats.totalWorkouts}/5</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
