import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'
import type { Workout } from '@repo/shared'

interface WorkoutTemplate extends Omit<Workout, 'id' | 'timestamp' | 'ownerId'> {
  id: string
  templateName: string
}

interface WorkoutTemplatesProps {
  onLoadTemplate?: (template: Workout) => void
}

export function WorkoutTemplates({ onLoadTemplate }: WorkoutTemplatesProps) {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [user?.uid])

  const loadTemplates = async () => {
    if (!user) return
    try {
      setLoading(true)
      const q = query(collection(db, 'templates'), where('ownerId', '==', user.uid))
      const snap = await getDocs(q)
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }) as WorkoutTemplate)
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExercises = async () => {
    if (!templateName.trim() || !selecting) return
    setShowForm(false)
    setTemplateName('')
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteDoc(doc(db, 'templates', templateId))
      setTemplates(templates.filter(t => t.id !== templateId))
    } catch (error) {
      console.error('Error deleting template:', error)
    }
  }

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    if (onLoadTemplate) {
      const fullWorkout: Workout = {
        ...template,
        ownerId: user?.uid || '',
        timestamp: Date.now(),
      }
      onLoadTemplate(fullWorkout)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">📋 Workout Templates</h2>

        {/* Create Template Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mb-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
        >
          + Create Template
        </button>

        {/* Create Template Form */}
        {showForm && (
          <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-purple-500/20 space-y-4">
            <div>
              <label htmlFor="template-name" className="block text-sm font-medium mb-2">
                Template Name
              </label>
              <input
                id="template-name"
                type="text"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="e.g., Push Day, Leg Day, Full Body..."
                title="Enter a name for your workout template"
                aria-label="Template name"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelecting(!selecting)
                  setShowForm(false)
                }}
                disabled={!templateName.trim()}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition"
              >
                Next: Select Exercises
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setTemplateName('')
                }}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Templates List */}
        {loading ? (
          <p className="text-slate-400">Loading templates...</p>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-lg">{template.templateName}</p>
                    <p className="text-sm text-slate-400">
                      {template.exercises.length} exercises • {template.muscleGroups.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Exercises Preview */}
                <div className="space-y-1 mb-4">
                  {template.exercises.slice(0, 3).map((ex, idx) => (
                    <p key={idx} className="text-sm text-slate-300">
                      • {ex.name} ({ex.sets.length} sets)
                    </p>
                  ))}
                  {template.exercises.length > 3 && (
                    <p className="text-sm text-slate-400">+ {template.exercises.length - 3} more</p>
                  )}
                </div>

                {/* Load Template Button */}
                <button
                  onClick={() => handleLoadTemplate(template)}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition"
                >
                  📌 Load Template
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No templates yet</p>
            <p className="text-sm text-slate-500">
              Create your first template to quickly set up recurring workouts
            </p>
          </div>
        )}
      </div>

      {/* Templates Tips */}
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
        <p className="text-sm font-semibold mb-2">💡 Tips</p>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>✓ Save your favorite workout routines as templates</li>
          <li>✓ Load templates to quickly add pre-configured exercises</li>
          <li>✓ Perfect for structured programs like Push/Pull/Legs</li>
          <li>✓ Update weights/reps each session for progressive overload</li>
        </ul>
      </div>
    </div>
  )
}
