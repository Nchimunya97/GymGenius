import type { User as FirebaseUser } from '@repo/shared'

interface TrainerProfileModalProps {
  trainer: (FirebaseUser & { uid: string }) | null
  isOpen: boolean
  onClose: () => void
  onMessage?: () => void
}

export function TrainerProfileModal({
  trainer,
  isOpen,
  onClose,
  onMessage,
}: TrainerProfileModalProps) {
  if (!isOpen || !trainer) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {trainer.displayName || 'Trainer'}
            </h2>
            <p className="text-lg text-purple-400">{trainer.specialization || 'Fitness Trainer'}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl transition">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <h3 className="font-semibold text-white mb-3">Contact Information</h3>
            <div className="space-y-2 text-slate-300">
              <p>
                <span className="font-semibold">Email:</span> {trainer.email}
              </p>
            </div>
          </div>

          {/* Professional Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h3 className="font-semibold text-white mb-3">Experience</h3>
              <p className="text-2xl font-bold text-blue-400">{trainer.experience || 0}+</p>
              <p className="text-sm text-slate-400">Years</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h3 className="font-semibold text-white mb-3">Hourly Rate</h3>
              <p className="text-2xl font-bold text-green-400">${trainer.hourlyRate || 'N/A'}</p>
              <p className="text-sm text-slate-400">/hour</p>
            </div>
          </div>

          {/* Certification */}
          {trainer.certification && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h3 className="font-semibold text-white mb-2">Certification</h3>
              <p className="text-slate-300">{trainer.certification}</p>
            </div>
          )}

          {/* Bio */}
          {trainer.bio && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
              <h3 className="font-semibold text-white mb-2">About</h3>
              <p className="text-slate-300 leading-relaxed">{trainer.bio}</p>
            </div>
          )}

          {/* Specializations */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50">
            <h3 className="font-semibold text-white mb-3">Specialization</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-600/30 border border-purple-500 text-purple-300 rounded-full text-sm">
                {trainer.specialization || 'General Fitness'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition font-semibold"
          >
            Close
          </button>
          <button
            onClick={onMessage}
            className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold transition"
          >
            💬 Message {trainer.displayName?.split(' ')[0] || 'Trainer'}
          </button>
        </div>
      </div>
    </div>
  )
}
