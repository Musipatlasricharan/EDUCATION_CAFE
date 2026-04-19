import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyGroups, useCreateGroup, useDiscoverGroups, useJoinGroup } from '../hooks/useGroups'
import { Plus, Users, Search, Globe, Lock, Compass } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { useForm } from 'react-hook-form'

export default function Groups() {
  const { data: groups, isLoading } = useMyGroups()
  const { data: discoverable, isLoading: discoveryLoading } = useDiscoverGroups()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { isPrivate: false, category: 'Other' }
  })
  const createGroup = useCreateGroup()
  const joinGroup = useJoinGroup()

  const onSubmit = (data) => {
    createGroup.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false)
        reset()
      }
    })
  }

  return (
    <div style={{ paddingBottom: 'var(--s-12)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--s-10)' }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--s-2)', letterSpacing: '-0.5px' }}>My Study Groups</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>Collaborate and grow with your study circles.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
          <button onClick={() => {
            const code = prompt('Enter the 6-character Invite Code:')
            if (code) joinGroup.mutate(code)
          }} className="btn-primary" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <Search size={18} /> Join via Code
          </button>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Create Group
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--s-6)', marginBottom: 'var(--s-16)' }}>
        {isLoading ? (
          <div className="loading-screen" style={{ minHeight: 200, gridColumn: '1/-1' }}><div className="spinner"></div></div>
        ) : groups?.length === 0 ? (
          <div className="card" style={{ padding: 'var(--s-16)', textAlign: 'center', gridColumn: '1/-1', border: '2px dashed var(--border)', background: 'transparent' }}>
            <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto var(--s-6)' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 'var(--s-3)' }}>Your Workspace is Empty</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--s-8)', maxWidth: 400, margin: '0 auto var(--s-8)' }}>Join a study group to collaborate, share resources, and chat with peers.</p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">Create Your First Group</button>
          </div>
        ) : (
          groups?.map(group => (
            <Link key={group._id} to={`/groups/${group._id}`} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', textDecoration: 'none', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
                <div style={{ 
                  width: 52, height: 52, borderRadius: 'var(--radius-md)', 
                  background: 'var(--accent-gradient)', color: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 22, fontWeight: 800, boxShadow: 'var(--shadow-p-md)'
                }}>
                  {group.avatar ? <img src={group.avatar} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} /> : group.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{group.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{group.memberCount} members</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    {group.isPrivate ? <Lock size={12} color="var(--text-muted)" /> : <Globe size={12} color="var(--text-muted)" />}
                  </div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                {group.description}
              </p>
            </Link>
          ))
        )}
      </div>

      <div style={{ marginBottom: 'var(--s-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', marginBottom: 'var(--s-8)' }}>
          <div style={{ padding: 'var(--s-2)', borderRadius: 'var(--radius-sm)', background: 'rgba(79, 70, 229, 0.1)' }}>
            <Compass size={24} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Explore Global Communities</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--s-6)' }}>
          {discoveryLoading ? (
            <div className="loading-screen" style={{ minHeight: 150, gridColumn: '1/-1' }}><div className="spinner"></div></div>
          ) : discoverable?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 'var(--s-10)' }}>No public groups found. Try searching by code or create your own!</p>
          ) : (
            discoverable?.map(group => (
              <div key={group._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'var(--bg-secondary)', color: 'var(--accent)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: 20, fontWeight: 800 
                  }}>
                    {group.avatar ? <img src={group.avatar} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} /> : group.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{group.name}</h3>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginTop: 2 }}>{group.memberCount} members • {group.category}</p>
                  </div>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, height: 44, overflow: 'hidden', lineHeight: 1.6 }}>{group.description}</p>
                <button 
                  onClick={() => joinGroup.mutate(group.inviteCode)}
                  disabled={joinGroup.isPending}
                  className="btn-primary" 
                  style={{ width: '100%', fontSize: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                >
                  {joinGroup.isPending ? 'Joining community...' : 'Join Community'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Study Group">
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Group Name</label>
            <input className="input-field" {...register('name', { required: true })} placeholder="e.g. Advanced Calculus Study Group" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Category</label>
              <select className="input-field" {...register('category')}>
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical</option>
                <option value="Arts">Arts</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Privacy</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 44 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" value="false" {...register('isPrivate')} /> Public
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" value="true" {...register('isPrivate')} /> Private
                </label>
              </div>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Description</label>
            <textarea className="input-field" {...register('description')} rows={3} placeholder="What will you study together?" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-primary" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>Cancel</button>
            <button type="submit" disabled={createGroup.isPending} className="btn-primary">
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
