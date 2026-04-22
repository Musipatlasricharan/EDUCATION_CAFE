import { useState, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Moon, Sun, User, Lock, Save, Bell, Shield, Tag,
  Trash2, Camera, Info, ChevronRight, X, Plus, Crown
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '../lib/axios'
import toast from 'react-hot-toast'
import useRazorpay from '../hooks/useRazorpay'

const SUBJECT_SUGGESTIONS = [
  'Data Structures', 'Algorithms', 'Operating Systems', 'DBMS',
  'Computer Networks', 'Web Development', 'Machine Learning', 'Artificial Intelligence',
  'Software Engineering', 'Cloud Computing', 'Cybersecurity', 'Mathematics',
  'Physics', 'Chemistry', 'Economics', 'Business Management'
]

const DAILY_DOWNLOAD_LIMIT = 5

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Info },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'subjects', label: 'Subjects', icon: Tag },
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
]

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [subjects, setSubjects] = useState(user?.subjects || [])
  const [subjectInput, setSubjectInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [notifSettings, setNotifSettings] = useState({
    groupMessages: user?.notifications?.groupMessages ?? true,
    badgeAwards: user?.notifications?.badgeAwards ?? true,
    uploadAlerts: user?.notifications?.uploadAlerts ?? true,
  })
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: user?.privacy?.showProfile ?? true,
    showActivity: user?.privacy?.showActivity ?? true,
    allowDMs: user?.privacy?.allowDMs ?? true,
  })
  const [ghUsername, setGhUsername] = useState(user?.githubUsername || '')
  const [lcUsername, setLcUsername] = useState(user?.leetcodeUsername || '')
  const [isVerifying, setIsVerifying] = useState(false)
  const fileInputRef = useRef(null)

  const { initiatePayment, paying } = useRazorpay({
    onSuccess: async () => {
      try {
        const res = await api.get('/auth/me')
        if (res.data.success) setUser(prev => ({ ...prev, isPremium: true, ...res.data.user }))
        toast.success('🎉 Premium activated!')
      } catch {}
    }
  })

  const handleVerifyGithub = async () => {
    if (!ghUsername) return toast.error('Enter username')
    setIsVerifying(true)
    try {
      const res = await api.post('/users/verify/github', { username: ghUsername })
      if (res.data.success) {
        setUser({ ...user, githubUsername: ghUsername })
        toast.success('GitHub Verified!')
      }
    } catch (err) {
      toast.error('Verification failed')
    } finally { setIsVerifying(false) }
  }

  const handleVerifyLeetcode = async () => {
    if (!lcUsername) return toast.error('Enter username')
    setIsVerifying(true)
    try {
      const res = await api.post('/users/verify/leetcode', { username: lcUsername })
      if (res.data.success) {
        setUser({ ...user, leetcodeUsername: lcUsername })
        toast.success('LeetCode Verified!')
      }
    } catch (err) {
      toast.error('Verification failed')
    } finally { setIsVerifying(false) }
  }

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      displayName: user?.displayName || '',
      college: user?.college || '',
      course: user?.course || '',
      year: user?.year || '',
      bio: user?.bio || '',
    }
  })

  const { register: regPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, watch } = useForm()

  // ── Profile Save ──────────────────────────────────────────────────────────
  const onUpdateProfile = async (data) => {
    setIsSaving(true)
    try {
      const res = await api.put('/auth/update-details', {
        ...data,
        subjects,
        notifications: notifSettings,
        privacy: privacySettings,
      })
      if (res.data.success) {
        setUser({ ...user, ...res.data.data })
        toast.success('Profile updated!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  // ── Avatar Upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      setAvatarPreview(base64)
      try {
        const res = await api.post('/users/avatar', { avatar: base64 })
        if (res.data.success) {
          setUser({ ...user, avatar: base64 })
          toast.success('Avatar updated!')
        }
      } catch (err) {
        toast.error('Failed to upload avatar')
      }
    }
    reader.readAsDataURL(file)
  }

  // ── Subjects ──────────────────────────────────────────────────────────────
  const addSubject = (s) => {
    const val = s || subjectInput.trim()
    if (!val || subjects.includes(val) || subjects.length >= 8) return
    setSubjects([...subjects, val])
    setSubjectInput('')
  }

  const removeSubject = (s) => setSubjects(subjects.filter(x => x !== s))

  // ── Save notifications & privacy ──────────────────────────────────────────
  const saveToggles = async () => {
    setIsSaving(true)
    try {
      const res = await api.put('/auth/update-details', { notifications: notifSettings, privacy: privacySettings })
      if (res.data.success) setUser({ ...user, ...res.data.data })
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save') }
    finally { setIsSaving(false) }
  }

  // ── Save subjects ─────────────────────────────────────────────────────────
  const saveSubjects = async () => {
    setIsSaving(true)
    try {
      const res = await api.put('/auth/update-details', { subjects })
      if (res.data.success) setUser({ ...user, ...res.data.data })
      toast.success('Subjects saved!')
    } catch { toast.error('Failed to save subjects') }
    finally { setIsSaving(false) }
  }

  // ── Change Password ───────────────────────────────────────────────────────
  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    setIsSaving(true)
    try {
      await api.put('/auth/update-password', { newPassword: data.newPassword })
      toast.success('Password changed!')
      resetPwd()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setIsSaving(false) }
  }

  // ── Delete Account ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return toast.error('Please type DELETE to confirm')
    setIsDeleting(true)
    try {
      await api.delete('/users/me')
      toast.success('Account deleted')
      logout()
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account')
    } finally { setIsDeleting(false) }
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const cardStyle = { backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 }
  const toggleStyle = (on) => ({
    width: 48, height: 26, borderRadius: 13, cursor: 'pointer', transition: 'background 0.2s',
    backgroundColor: on ? 'var(--accent)' : 'var(--bg-secondary)',
    border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
    display: 'flex', alignItems: 'center', padding: '0 3px',
    flexShrink: 0
  })
  const toggleKnobStyle = (on) => ({
    width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff',
    transform: on ? 'translateX(22px)' : 'translateX(0)', transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  })

  const downloadPct = Math.min(100, ((user?.dailyDownloadsUsed || 0) / DAILY_DOWNLOAD_LIMIT) * 100)

  // ── Render helpers ────────────────────────────────────────────────────────
  const Toggle = ({ on, onChange, label, description }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{description}</p>}
      </div>
      <div style={toggleStyle(on)} onClick={() => onChange(!on)}>
        <div style={toggleKnobStyle(on)} />
      </div>
    </div>
  )

  const SectionTitle = ({ icon: Icon, label, color = 'var(--accent)' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ padding: 9, backgroundColor: `${color}18`, color, borderRadius: 12 }}>
        <Icon size={18} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>{label}</h2>
    </div>
  )

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your profile, privacy, and preferences.</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar Tabs */}
        <div style={{ ...cardStyle, padding: '12px 8px', width: 200, flexShrink: 0, height: 'fit-content', position: 'sticky', top: 88 }}>
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id
            const isDanger = id === 'danger'
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 12, textAlign: 'left', fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? (isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)') : 'transparent',
                  color: active ? (isDanger ? '#ef4444' : 'var(--accent)') : isDanger ? '#ef4444' : 'var(--text-primary)',
                  marginBottom: 2, transition: 'all 0.15s'
                }}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div>
              <SectionTitle icon={User} label="Profile Information" />
              <div style={{ ...cardStyle }}>
                {/* Avatar Upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700, border: '3px solid var(--border)' }}>
                      {avatarPreview
                        ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (user?.displayName || user?.name || '?').charAt(0).toUpperCase()
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-card)', cursor: 'pointer' }}
                    >
                      <Camera size={13} />
                    </button>
                    <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{user?.displayName || user?.name}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</p>
                    <button type="button" onClick={() => fileInputRef.current?.click()} style={{ marginTop: 8, fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Camera size={12} /> Change photo
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onUpdateProfile)}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={labelStyle}>Full Name</label>
                      <input className="input-field" {...register('name', { required: true })} placeholder="Your full name" style={{ borderRadius: 12 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Display Name <span style={{ color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(shown in chats)</span></label>
                      <input className="input-field" {...register('displayName')} placeholder="e.g. Sri" style={{ borderRadius: 12 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>College / University</label>
                      <input className="input-field" {...register('college', { required: true })} placeholder="e.g. Stanford University" style={{ borderRadius: 12 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Course</label>
                      <input className="input-field" {...register('course')} placeholder="e.g. Computer Science" style={{ borderRadius: 12 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Year of Study</label>
                      <select className="input-field" {...register('year')} style={{ borderRadius: 12 }}>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="Post Graduate">Post Graduate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Bio</label>
                    <textarea className="input-field" {...register('bio')} rows={3} placeholder="Tell us a bit about yourself..." style={{ borderRadius: 12, resize: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={isSaving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14 }}>
                      {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── ACCOUNT INFO ── */}
          {activeTab === 'account' && (
            <div>
              <SectionTitle icon={Info} label="Account Info" color="#8b5cf6" />
              <div style={{ ...cardStyle }}>
                {/* Account Type Banner */}
                <div style={{ padding: '16px 20px', borderRadius: 14, marginBottom: 24, background: user?.isPremium ? 'linear-gradient(135deg,#f59e0b22,#d97706 22)' : 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.08))', border: `1px solid ${user?.isPremium ? '#f59e0b44' : 'var(--border)'}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Crown size={28} color={user?.isPremium ? '#f59e0b' : 'var(--text-muted)'} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{user?.isPremium ? 'Premium Member' : 'Free Account'}</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.isPremium ? 'Unlimited downloads and all features unlocked.' : 'Upgrade to Premium for unlimited downloads.'}</p>
                  </div>
                  {!user?.isPremium && (
                    <button
                      className="btn-primary"
                      style={{ marginLeft: 'auto', padding: '9px 18px', borderRadius: 12, fontSize: 13, whiteSpace: 'nowrap', opacity: paying ? 0.7 : 1 }}
                      onClick={() => initiatePayment(user)}
                      disabled={paying}
                    >
                      {paying ? 'Processing...' : 'Upgrade ✨'}
                    </button>
                  )}
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                  {[
                    { label: 'Uploads', value: user?.totalUploads || 0 },
                    { label: 'Downloads', value: user?.totalDownloads || 0 },
                    { label: 'Points', value: user?.points || 0 },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '18px 10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{s.value}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Daily Downloads Progress */}
                {!user?.isPremium && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Daily Downloads</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.dailyDownloadsUsed || 0} / {DAILY_DOWNLOAD_LIMIT}</span>
                    </div>
                    <div style={{ height: 8, backgroundColor: 'var(--bg-secondary)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${downloadPct}%`, borderRadius: 100, background: downloadPct >= 100 ? '#ef4444' : 'var(--accent-gradient)', transition: 'width 0.5s' }} />
                    </div>
                    {downloadPct >= 100 && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6 }}>Daily limit reached. Resets at midnight.</p>}
                  </div>
                )}

                {/* Info Table */}
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                    { label: 'Account Type', value: user?.isPremium ? '✨ Premium' : 'Free' },
                    { label: 'Reputation', value: user?.reputation || 0 },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* External Proof of Work */}
                <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                  <SectionTitle icon={Shield} label="External Proof of Work" color="#10b981" />
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Verify your external coding profiles to build credibility and unlock advanced badges.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Github */}
                    <div style={{ padding: 20, borderRadius: 16, border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GH" style={{ width: 24, height: 24, filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
                          <h4 style={{ fontWeight: 700 }}>GitHub Profile</h4>
                       </div>
                       <div style={{ display: 'flex', gap: 8 }}>
                          <input 
                            className="input-field" 
                            placeholder="Username" 
                            value={ghUsername} 
                            onChange={e => setGhUsername(e.target.value)} 
                            disabled={user?.githubUsername || isVerifying} 
                            style={{ height: 40, fontSize: 13 }}
                          />
                          {!user?.githubUsername && (
                            <button onClick={handleVerifyGithub} className="btn-primary" style={{ padding: '0 16px', borderRadius: 10, fontSize: 12 }} disabled={isVerifying}>
                              {isVerifying ? '...' : 'Verify'}
                            </button>
                          )}
                       </div>
                       {user?.githubUsername && <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 8, fontWeight: 700 }}>✓ Verified as {user.githubUsername}</p>}
                    </div>

                    {/* LeetCode */}
                    <div style={{ padding: 20, borderRadius: 16, border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LC" style={{ width: 20, height: 20, filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
                          <h4 style={{ fontWeight: 700 }}>LeetCode Profile</h4>
                       </div>
                       <div style={{ display: 'flex', gap: 8 }}>
                          <input 
                            className="input-field" 
                            placeholder="Username" 
                            value={lcUsername} 
                            onChange={e => setLcUsername(e.target.value)} 
                            disabled={user?.leetcodeUsername || isVerifying} 
                            style={{ height: 40, fontSize: 13 }}
                          />
                          {!user?.leetcodeUsername && (
                            <button onClick={handleVerifyLeetcode} className="btn-primary" style={{ padding: '0 16px', borderRadius: 10, fontSize: 12 }} disabled={isVerifying}>
                              {isVerifying ? '...' : 'Verify'}
                            </button>
                          )}
                       </div>
                       {user?.leetcodeUsername && <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 8, fontWeight: 700 }}>✓ Verified as {user.leetcodeUsername}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div>
              <SectionTitle icon={Bell} label="Notification Preferences" color="#f59e0b" />
              <div style={cardStyle}>
                <Toggle
                  on={notifSettings.groupMessages}
                  onChange={(v) => setNotifSettings(p => ({ ...p, groupMessages: v }))}
                  label="Group Message Alerts"
                  description="Get notified when someone posts in your groups."
                />
                <Toggle
                  on={notifSettings.badgeAwards}
                  onChange={(v) => setNotifSettings(p => ({ ...p, badgeAwards: v }))}
                  label="Badge Awards"
                  description="Celebrate when you unlock a new achievement badge."
                />
                <Toggle
                  on={notifSettings.uploadAlerts}
                  onChange={(v) => setNotifSettings(p => ({ ...p, uploadAlerts: v }))}
                  label="New Resource Uploads"
                  description="Be notified when new resources are added to your groups."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={saveToggles} disabled={isSaving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12 }}>
                    {isSaving ? 'Saving...' : <><Save size={16} /> Save</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {activeTab === 'privacy' && (
            <div>
              <SectionTitle icon={Shield} label="Privacy Settings" color="#10b981" />
              <div style={cardStyle}>
                <Toggle
                  on={privacySettings.showProfile}
                  onChange={(v) => setPrivacySettings(p => ({ ...p, showProfile: v }))}
                  label="Public Profile"
                  description="Allow other students to view your profile page."
                />
                <Toggle
                  on={privacySettings.showActivity}
                  onChange={(v) => setPrivacySettings(p => ({ ...p, showActivity: v }))}
                  label="Show Upload Activity"
                  description="Let others see your recent uploads and downloads."
                />
                <Toggle
                  on={privacySettings.allowDMs}
                  onChange={(v) => setPrivacySettings(p => ({ ...p, allowDMs: v }))}
                  label="Allow Direct Messages"
                  description="Allow group members to message you directly."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                  <button onClick={saveToggles} disabled={isSaving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12 }}>
                    {isSaving ? 'Saving...' : <><Save size={16} /> Save</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SUBJECTS ── */}
          {activeTab === 'subjects' && (
            <div>
              <SectionTitle icon={Tag} label="Subjects & Interests" color="#06b6d4" />
              <div style={cardStyle}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Add up to 8 subjects. These appear on your public profile so others can find you.</p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {subjects.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(6,182,212,0.12)', color: '#06b6d4', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>
                      {s}
                      <button onClick={() => removeSubject(s)} style={{ color: '#06b6d4', cursor: 'pointer', lineHeight: 0 }}><X size={12} /></button>
                    </span>
                  ))}
                  {subjects.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No subjects added yet.</p>}
                </div>

                {/* Input */}
                {subjects.length < 8 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    <input
                      className="input-field"
                      placeholder="Type a subject name…"
                      value={subjectInput}
                      onChange={e => setSubjectInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                      style={{ borderRadius: 12 }}
                    />
                    <button onClick={() => addSubject()} className="btn-primary" style={{ padding: '0 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                      <Plus size={16} /> Add
                    </button>
                  </div>
                )}

                {/* Suggestions */}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Suggestions</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SUBJECT_SUGGESTIONS.filter(s => !subjects.includes(s)).map(s => (
                      <button key={s} onClick={() => addSubject(s)} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  <button onClick={saveSubjects} disabled={isSaving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12 }}>
                    {isSaving ? 'Saving...' : <><Save size={16} /> Save Subjects</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {activeTab === 'appearance' && (
            <div>
              <SectionTitle icon={Sun} label="Appearance" color="#10b981" />
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Theme Mode</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Toggle between light and dark visual themes.</p>
                  </div>
                  <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderRadius: 14, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: 'var(--text-primary)', transition: 'all 0.2s' }}>
                    {theme === 'dark' ? <><Sun size={18} color="#f59e0b" /> Light Mode</> : <><Moon size={18} color="var(--accent)" /> Dark Mode</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div>
              <SectionTitle icon={Lock} label="Security" color="#ef4444" />
              <div style={cardStyle}>
                <form onSubmit={handlePwdSubmit(onChangePassword)}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
                    <div>
                      <label style={labelStyle}>New Password</label>
                      <input type="password" className="input-field" {...regPwd('newPassword', { required: true, minLength: 8 })} placeholder="Min 8 characters" style={{ borderRadius: 12 }} />
                    </div>
                    <div>
                      <label style={labelStyle}>Confirm New Password</label>
                      <input type="password" className="input-field" {...regPwd('confirmPassword', { required: true })} placeholder="Repeat new password" style={{ borderRadius: 12 }} />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14 }}>
                    {isSaving ? 'Updating...' : <><Lock size={16} /> Update Password</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeTab === 'danger' && (
            <div>
              <SectionTitle icon={Trash2} label="Danger Zone" color="#ef4444" />
              <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.3)' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>Delete Account</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                  This action is <strong>permanent</strong>. Your account, uploads, and all associated data will be irreversibly deleted. There is no undo.
                </p>
                <div style={{ padding: '16px 20px', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 12, marginBottom: 20, border: '1px dashed rgba(239,68,68,0.3)' }}>
                  <label style={{ ...labelStyle, color: '#ef4444' }}>Type <strong>DELETE</strong> to confirm</label>
                  <input
                    className="input-field"
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    style={{ borderRadius: 12, borderColor: deleteConfirm === 'DELETE' ? '#ef4444' : undefined }}
                  />
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirm !== 'DELETE'}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 14, backgroundColor: deleteConfirm === 'DELETE' ? '#ef4444' : 'var(--bg-secondary)', color: deleteConfirm === 'DELETE' ? '#fff' : 'var(--text-muted)', fontWeight: 700, cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed', border: 'none', fontSize: 14, transition: 'all 0.2s' }}
                >
                  <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
