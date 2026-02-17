import React from 'react'
import type { User as FirebaseUser } from '@repo/shared'

interface DashboardHeaderProps {
  profile: FirebaseUser
  onLogOut: () => void
}

/**
 * DashboardHeader Component
 * Displays welcome message with user name and Amber-500 color theme
 */
export function DashboardHeader({ profile, onLogOut }: DashboardHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-8">
      <h2 className="text-3xl font-bold mb-2 text-amber-500">
        Welcome back, {profile.displayName || 'Athlete'}! 🎯
      </h2>
      <p className="text-slate-300 mb-6">
        {profile.role === 'trainer'
          ? 'Manage your clients and build their training programs'
          : 'Track your workouts and progress your fitness journey'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          aria-label="Start workout"
        >
          Start Workout
        </button>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          aria-label="View history"
        >
          View History
        </button>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          aria-label="Check progress"
        >
          Check Progress
        </button>
      </div>
    </div>
  )
}
