import { useState, useEffect } from 'react'

interface WorkoutTimerProps {
  initialSeconds?: number
  onComplete?: () => void
}

export function WorkoutTimer({ initialSeconds = 60, onComplete }: WorkoutTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [customTime, setCustomTime] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, seconds, onComplete])

  const handleSetTime = (sec: number) => {
    setSeconds(sec)
    setIsRunning(false)
    setCustomTime('')
  }

  const handleCustomTime = () => {
    const sec = parseInt(customTime)
    if (sec > 0) {
      handleSetTime(sec)
    }
  }

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (1 - seconds / initialSeconds) * 100

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">⏱️ Rest Timer</h2>

      {/* Timer Display */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="90"
            fill="none"
            stroke="rgba(100, 116, 139, 0.3)"
            strokeWidth="8"
          />
          <circle
            cx="96"
            cy="96"
            r="90"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl font-bold text-orange-400 font-mono">{formatTime(seconds)}</p>
            <p className="text-sm text-slate-400 mt-2">{isRunning ? 'Running...' : 'Ready'}</p>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition"
        >
          {isRunning ? '⏸ Pause' : '▶ Start'}
        </button>
        <button
          onClick={() => {
            setSeconds(initialSeconds)
            setIsRunning(false)
          }}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
        >
          ↺ Reset
        </button>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[30, 60, 90, 120].map(sec => (
          <button
            key={sec}
            onClick={() => handleSetTime(sec)}
            className={`py-2 rounded-lg font-medium transition ${
              seconds === sec && !isRunning
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {sec}s
          </button>
        ))}
      </div>

      {/* Custom Time Input */}
      <div className="flex gap-2">
        <input
          type="number"
          value={customTime}
          onChange={e => setCustomTime(e.target.value)}
          placeholder="Custom seconds"
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
        />
        <button
          onClick={handleCustomTime}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition"
        >
          Set
        </button>
      </div>

      {/* Audio Notification */}
      <p className="text-xs text-slate-400 mt-4 text-center">🔔 Timer will notify when complete</p>
    </div>
  )
}
