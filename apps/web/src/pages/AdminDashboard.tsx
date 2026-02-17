import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAllUsers } from '@/hooks/useAdminData'
import { ProfileEditModal } from '@/components/ProfileEditModal'
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User as FirebaseUser } from '@repo/shared'

export function AdminDashboard() {
  const { user: authUser, logOut } = useAuth()
  const [user, setUser] = useState<(FirebaseUser & { profileComplete?: boolean }) | null>(null)
  const { data: allUsersData, isLoading } = useAllUsers()
  const users = allUsersData?.users || []
  const stats = allUsersData?.stats || { total: 0, trainers: 0, trainees: 0, admins: 0 }
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'settings'>(
    'overview'
  )
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<(FirebaseUser & { uid: string }) | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({ displayName: '', role: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [addFormData, setAddFormData] = useState({ email: '', displayName: '', role: 'trainee' })
  const [addingUser, setAddingUser] = useState(false)

  // Load user profile
  useEffect(() => {
    if (!authUser?.uid) return
    const loadProfile = async () => {
      const docSnap = await getDoc(doc(db, 'users', authUser.uid))
      if (docSnap.exists()) {
        setUser(docSnap.data() as FirebaseUser & { profileComplete?: boolean })
      }
    }
    loadProfile()
  }, [authUser?.uid])

  const handleLogout = async () => {
    await logOut()
  }

  const handleProfileSave = async () => {
    if (!authUser?.uid) return
    const docSnap = await getDoc(doc(db, 'users', authUser.uid))
    if (docSnap.exists()) {
      setUser(docSnap.data() as FirebaseUser & { profileComplete?: boolean })
    }
  }

  const handleEditUser = (user: FirebaseUser & { uid: string }) => {
    setEditingUser(user)
    setEditFormData({
      displayName: user.displayName || '',
      role: user.role || 'trainee',
      email: user.email || '',
    })
    setShowEditModal(true)
  }

  const handleSaveUser = async () => {
    if (!editingUser?.uid) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        displayName: editFormData.displayName,
        role: editFormData.role,
      })
      setShowEditModal(false)
      // The hook will automatically refetch
    } catch (err) {
      console.error('Error updating user:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = async () => {
    if (!deletingUserId) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'users', deletingUserId))
      setShowDeleteModal(false)
      setDeletingUserId(null)
      // The hook will automatically refetch
    } catch (err) {
      console.error('Error deleting user:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleAddUser = async () => {
    if (!addFormData.email || !addFormData.displayName) {
      alert('Please fill in all fields')
      return
    }

    setAddingUser(true)
    try {
      // Create a new user document
      const newUserId = addFormData.email.replace(/[^a-zA-Z0-9]/g, '_')
      await setDoc(doc(db, 'users', newUserId), {
        email: addFormData.email,
        displayName: addFormData.displayName,
        role: addFormData.role,
        profileComplete: true,
        createdAt: new Date(),
      })
      setShowAddUserModal(false)
      setAddFormData({ email: '', displayName: '', role: 'trainee' })
      // The hook will automatically refetch with real-time listener
    } catch (err) {
      console.error('Error adding user:', err)
      alert('Failed to add user. Error: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setAddingUser(false)
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col lg:flex-row overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💪</span>
          <h1 className="text-white font-bold">GymGenius</h1>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white text-2xl">
          ☰
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`fixed lg:relative lg:w-64 w-64 h-screen lg:h-auto bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col p-6 z-40 lg:z-auto transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-24 lg:pt-6`}
      >
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <div className="text-3xl">💪</div>
          <div>
            <h1 className="text-xl font-bold text-white">GymGenius</h1>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: '📊 Dashboard', icon: '📊' },
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'analytics', label: '📈 Analytics', icon: '📈' },
            { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any)
                setSidebarOpen(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 border border-red-500/50 hover:bg-red-900/30 rounded-lg text-red-300 hover:text-red-200 transition"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full lg:w-auto pt-20 lg:pt-0 p-4 lg:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-0 mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h2>
            <p className="text-slate-400 mt-1 text-sm lg:text-base">Welcome back, admin</p>
          </div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition text-sm lg:text-base"
            >
              👤 Edit Profile
            </button>
            <div className="text-right">
              <p className="text-sm text-slate-400">Logged in:</p>
              <p className="text-white font-semibold">{user?.displayName || user?.email}</p>
            </div>
          </div>
        </div>

        <ProfileEditModal
          user={user}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onSave={handleProfileSave}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Users',
                  value: stats.total.toString(),
                  icon: '👥',
                  color: 'from-blue-500 to-blue-600',
                },
                {
                  label: 'Active Trainers',
                  value: stats.trainers.toString(),
                  icon: '👨‍🏫',
                  color: 'from-purple-500 to-purple-600',
                },
                {
                  label: 'Total Trainees',
                  value: stats.trainees.toString(),
                  icon: '🏋️',
                  color: 'from-green-500 to-green-600',
                },
                {
                  label: 'Admins',
                  value: stats.admins.toString(),
                  icon: '✅',
                  color: 'from-emerald-500 to-emerald-600',
                },
              ].map(stat => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-90 mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <span className="text-3xl">{stat.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {users.slice(0, 4).map((user: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition"
                  >
                    <div>
                      <p className="text-white font-medium">User registered: {user.role}</p>
                      <p className="text-sm text-slate-400">{user.displayName || user.email}</p>
                    </div>
                    <span className="text-slate-400 text-sm">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Manage Users</h3>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-lg transition"
              >
                + Add User
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700/50">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-slate-600/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600/30">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-slate-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.slice(0, 10).map((user: any, i: number) => (
                      <tr key={user.uid || i} className="hover:bg-slate-700/30 transition">
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{user.displayName || 'Unknown'}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-200 capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-amber-400 hover:text-amber-300 transition font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.uid || '')}
                              className="text-red-400 hover:text-red-300 transition font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">System Analytics</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-x-auto">
              {/* User Growth */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h4 className="text-lg font-bold text-white mb-4">User Growth</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Trainers', value: 156, total: 200 },
                    { label: 'Trainees', value: 1078, total: 1200 },
                    { label: 'Admins', value: 5, total: 10 },
                  ].map(metric => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">{metric.label}</span>
                        <span className="text-amber-400 font-semibold">
                          {metric.value} / {metric.total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(metric.value / metric.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Metrics */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50">
                <h4 className="text-lg font-bold text-white mb-4">System Metrics</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Server Uptime', value: '99.9%', status: 'optimal' },
                    { label: 'Database Status', value: 'Healthy', status: 'optimal' },
                    { label: 'API Response Time', value: '45ms', status: 'optimal' },
                  ].map(metric => (
                    <div
                      key={metric.label}
                      className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg"
                    >
                      <span className="text-slate-300">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{metric.value}</span>
                        <span className="text-green-400">✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">System Settings</h3>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 space-y-6">
              {[
                { label: 'Maintenance Mode', description: 'Enable maintenance mode for updates' },
                { label: 'User Registration', description: 'Allow new user registrations' },
                {
                  label: 'Trainer Verification',
                  description: 'Require verification for new trainers',
                },
                {
                  label: 'Email Notifications',
                  description: 'Send system notifications via email',
                },
              ].map(setting => (
                <div
                  key={setting.label}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{setting.label}</p>
                    <p className="text-sm text-slate-400">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                      aria-label={`Toggle ${setting.label}`}
                      title={`Enable or disable ${setting.label}`}
                    />
                    <div
                      className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"
                      role="presentation"
                    ></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-slate-400 hover:text-white text-2xl transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-display-name"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Display Name
                  </label>
                  <input
                    id="edit-display-name"
                    type="text"
                    value={editFormData.displayName}
                    onChange={e =>
                      setEditFormData({ ...editFormData, displayName: e.target.value })
                    }
                    placeholder="Enter user's display name"
                    title="Update the user's display name"
                    aria-label="User display name"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-email"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    value={editFormData.email}
                    disabled
                    title="Email address (read-only)"
                    aria-label="User email address"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-role"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Role
                  </label>
                  <select
                    id="edit-role"
                    value={editFormData.role}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                    title="Select the user's role: Admin, Trainer, or Trainee"
                    aria-label="User role"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="trainer">Trainer</option>
                    <option value="trainee">Trainee</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                >
                  {saving ? '⏳ Saving...' : '✅ Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-red-600/50 p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Delete User</h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                >
                  {deleting ? '⏳ Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Add New User</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-slate-400 hover:text-white text-2xl transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="add-email"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="add-email"
                    type="email"
                    value={addFormData.email}
                    onChange={e => setAddFormData({ ...addFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    title="Enter user's email"
                    aria-label="User email address"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="add-display-name"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Display Name
                  </label>
                  <input
                    id="add-display-name"
                    type="text"
                    value={addFormData.displayName}
                    onChange={e => setAddFormData({ ...addFormData, displayName: e.target.value })}
                    placeholder="Full Name"
                    title="Enter user's display name"
                    aria-label="User display name"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="add-role"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Role
                  </label>
                  <select
                    id="add-role"
                    value={addFormData.role}
                    onChange={e => setAddFormData({ ...addFormData, role: e.target.value })}
                    title="Select the user's role"
                    aria-label="User role"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="trainee">Trainee</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 rounded-lg text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={addingUser}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white rounded-lg font-semibold transition"
                >
                  {addingUser ? '⏳ Adding...' : '✅ Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
