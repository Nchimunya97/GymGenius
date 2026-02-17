import { useNavigate } from 'react-router-dom'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      {/* Navigation */}
      <nav className="fixed w-full z-50 backdrop-blur-md bg-slate-900/80 border-b border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="text-2xl">💪</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                GymGenius
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 text-sm font-semibold text-slate-200 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Transform Your Fitness Journey
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with expert trainers, track your workouts, and achieve your fitness goals with
            intelligent workout planning and real-time progress tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl text-lg"
            >
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-slate-600 hover:border-amber-500 text-white font-semibold rounded-lg transition text-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50 group-hover:border-amber-500/50 transition">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-white mb-3">Workout Planning</h3>
                <p className="text-slate-300 leading-relaxed">
                  Create custom workout programs tailored to your fitness level and goals with
                  intelligent recommendations.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50 group-hover:border-purple-500/50 transition">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-white mb-3">Expert Connection</h3>
                <p className="text-slate-300 leading-relaxed">
                  Connect with certified trainers, get personalized guidance, and build
                  accountability partnerships.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50 group-hover:border-green-500/50 transition">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold text-white mb-3">Progress Tracking</h3>
                <p className="text-slate-300 leading-relaxed">
                  Monitor your improvements with detailed analytics and visual progress charts to
                  stay motivated.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50 group-hover:border-blue-500/50 transition">
                <div className="text-4xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold text-white mb-3">Smart Timer</h3>
                <p className="text-slate-300 leading-relaxed">
                  Built-in workout timer with rest periods, exercise notifications, and performance
                  tracking.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50 group-hover:border-indigo-500/50 transition">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-white mb-3">Goal Setting</h3>
                <p className="text-slate-300 leading-relaxed">
                  Set SMART goals, track milestones, and celebrate achievements on your fitness
                  journey.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50 group-hover:border-rose-500/50 transition">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold text-white mb-3">Mobile Friendly</h3>
                <p className="text-slate-300 leading-relaxed">
                  Access your workouts anywhere with our fully responsive mobile-optimized design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Designed for Everyone
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Trainee */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50">
              <div className="text-5xl mb-4">🏋️</div>
              <h3 className="text-2xl font-bold text-white mb-4">For Trainees</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Follow personalized workout plans</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Track your performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Connect with certified trainers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 mt-1">✓</span>
                  <span>Get real-time feedback</span>
                </li>
              </ul>
            </div>

            {/* Trainer */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50">
              <div className="text-5xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-white mb-4">For Trainers</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Manage multiple clients</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Create custom workout plans</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Monitor client progress</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Provide detailed feedback</span>
                </li>
              </ul>
            </div>

            {/* Admin */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700/50">
              <div className="text-5xl mb-4">⚙️</div>
              <h3 className="text-2xl font-bold text-white mb-4">For Admins</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Manage all users</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>View system analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Handle moderation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Configure system settings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of fitness enthusiasts and trainers already using GymGenius to achieve
            their goals.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl text-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xl">💪</div>
                <span className="font-bold text-white">GymGenius</span>
              </div>
              <p className="text-slate-400">
                Transform your fitness journey with intelligent training.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-amber-400 cursor-pointer transition">Features</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Pricing</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-amber-400 cursor-pointer transition">About</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Blog</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-amber-400 cursor-pointer transition">Privacy</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Terms</li>
                <li className="hover:text-amber-400 cursor-pointer transition">Cookies</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 GymGenius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
