import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<'trainer' | 'trainee' | 'admin'>('trainee')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword } = useAuth()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (isForgotPassword) {
        await resetPassword(email)
        setSuccessMessage('Password reset link sent to your email!')
        setEmail('')
        setIsForgotPassword(false)
      } else if (isSignUp) {
        await signUpWithEmail(email, password, selectedRole)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl p-8 border border-amber-500/10 backdrop-blur">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg mb-4 shadow-lg">
              <span className="text-2xl">💪</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent mb-2">
              GymGenius
            </h1>
            <p className="text-slate-400">Build Your Fitness Journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/40 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-start gap-3">
              <span className="text-lg">✅</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                title="Enter your email address to sign in or create an account"
                aria-label="Email address"
                className="w-full px-4 py-3 bg-slate-700/50 border border-amber-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-slate-700 focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50 transition"
                placeholder="you@example.com"
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-200 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  title="Enter your password (at least 6 characters)"
                  aria-label="Password"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-amber-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-slate-700 focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50 transition"
                  placeholder="••••••••"
                />
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">I am a...</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'trainer', label: '👨‍🏫 Trainer', color: 'purple' },
                    { value: 'trainee', label: '🏋️ Trainee', color: 'green' },
                    { value: 'admin', label: '✅ Admin', color: 'amber' },
                  ].map(role => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value as any)}
                      className={`py-3 rounded-lg font-semibold transition border-2 ${
                        selectedRole === role.value
                          ? `border-${role.color}-500 bg-${role.color}-600/30 text-${role.color}-300`
                          : `border-slate-600/50 bg-slate-700/30 text-slate-300 hover:bg-slate-700/50`
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl text-lg"
            >
              {loading
                ? '⏳ Loading...'
                : isForgotPassword
                  ? '📧 Send Reset Link'
                  : isSignUp
                    ? '📝 Sign Up'
                    : '🔓 Sign In'}
            </button>
          </form>

          {/* Forgot Password Link */}
          {!isSignUp && !isForgotPassword && (
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-amber-400 hover:text-amber-300 text-sm font-medium transition"
              >
                🔑 Forgot Password?
              </button>
            </div>
          )}

          {isForgotPassword && (
            <div className="mb-4 text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-amber-400 hover:text-amber-300 text-sm font-medium transition"
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-600/50" />
            <span className="text-xs text-slate-500 font-medium">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-slate-600/50" />
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/50 hover:border-slate-500 text-white font-semibold rounded-lg transition flex items-center justify-center gap-3 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Account
          </button>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              {isSignUp ? '✓ Already have an account?' : '💡 New here?'}
            </p>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setEmail('')
                setPassword('')
              }}
              className="mt-2 text-amber-400 hover:text-amber-300 font-semibold transition text-sm"
            >
              {isSignUp ? '→ Sign In Instead' : '→ Create Free Account'}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center text-xs text-slate-500">
            <p>
              By signing up, you agree to our{' '}
              <span className="text-slate-400 hover:text-slate-300 cursor-pointer transition">
                Terms
              </span>
            </p>
          </div>
        </div>

        {/* Info Cards Below */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🏋️</p>
            <p className="text-xs text-slate-300 font-medium">Track Workouts</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🤝</p>
            <p className="text-xs text-slate-300 font-medium">Connect Trainers</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">📈</p>
            <p className="text-xs text-slate-300 font-medium">Track Progress</p>
          </div>
        </div>
      </div>
    </div>
  )
}
