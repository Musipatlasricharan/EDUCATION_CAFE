import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, Code, Clock, Plus, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CodingProblemsList = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProblems();
    window.scrollTo(0, 0);
  }, [user]); // Fetch on mount and whenever user state changes

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coding/problems');
      if (res.data.success) {
        console.log('[Coding] Fetched problems:', res.data.data.length, res.data.data);
        setProblems(res.data.data);
      }
    } catch (err) {
      console.error('[Coding] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      const res = await api.post('/coding/seed');
      if (res.data.success) {
        alert('Initial coding challenges have been restored! Refreshing list...');
        fetchProblems();
      }
    } catch (err) {
      console.error('[Coding] Seed error:', err);
      alert('Seeding failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(p => {
    if (filterDifficulty !== 'All' && p.difficulty !== filterDifficulty) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', padding: 'var(--s-8)', paddingTop: 'var(--s-24)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Fancy Hero Header */}
        <div style={{ position: 'relative', padding: '48px', borderRadius: '32px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: '48px', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'var(--accent-gradient)', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }} />
           <div style={{ position: 'relative', zIndex: 1 }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ padding: 12, borderRadius: 16, background: 'var(--accent-gradient)', boxShadow: 'var(--shadow-p-lg)' }}>
                      <Code size={32} color="#fff" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Elite Collection</span>
                  </div>
                  <h1 style={{ fontSize: '48px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px', marginBottom: 12 }}>Coding Challenges</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 18, maxWidth: '500px', lineHeight: 1.6, fontWeight: 500 }}>Master data structures and algorithms with our curated problem set.</p>
               </div>
               <Link to="/coding/admin/upload" className="btn-primary" style={{ padding: '14px 28px', borderRadius: '18px', fontSize: 15, fontWeight: 700, boxShadow: 'var(--shadow-p-md)' }}>
                 <Plus size={20} /> Add Problem
               </Link>
             </div>
           </div>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filter by title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass"
              style={{ width: '100%', padding: '16px 20px 16px 56px', borderRadius: '20px', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none', fontSize: 15 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setFilterDifficulty(d)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '16px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid',
                  borderColor: filterDifficulty === d ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: filterDifficulty === d ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: filterDifficulty === d ? '#fff' : 'var(--text-secondary)',
                  boxShadow: filterDifficulty === d ? 'var(--shadow-p-md)' : 'none'
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
             <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}><Loader size={32} className="spin" /></div>
          ) : filteredProblems.length === 0 ? (
             <div className="card glass" style={{ padding: '80px', textAlign: 'center', borderRadius: '32px' }}>
               <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
               <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>No challenges found</h3>
               <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Try adjusting your search or filters. If the database is empty, you can initialize it below.</p>
               
               {user?.role === 'admin' && (
                 <button 
                   onClick={seedDatabase}
                   className="btn-primary" 
                   style={{ padding: '12px 32px', borderRadius: '16px', background: 'var(--accent-gradient)' }}
                 >
                   Restore Initial Challenges
                 </button>
               )}
             </div>
          ) : (
            filteredProblems.map((problem, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={problem._id} 
                className="card glass"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 1fr 180px 150px', 
                  alignItems: 'center', 
                  padding: '24px 32px', 
                  borderRadius: '24px', 
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => window.location.href = `/coding/solve/${problem._id}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'scale(1.01) translateX(10px)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'scale(1) translateX(0)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div>
                   {problem.status === 'Solved' ? (
                     <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <CheckCircle size={24} />
                     </div>
                   ) : (
                     <div style={{ width: 44, height: 44, borderRadius: 14, border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                       <Code size={18} />
                     </div>
                   )}
                </div>

                <div>
                   <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.3px' }}>{problem.title}</h3>
                   <div style={{ display: 'flex', gap: 8 }}>
                     {problem.tags?.slice(0, 3).map(tag => (
                       <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>{tag}</span>
                     ))}
                   </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ 
                    padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                    backgroundColor: problem.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.1)' : problem.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: problem.difficulty === 'Easy' ? '#10b981' : problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                    border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : problem.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {problem.difficulty}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                   <Link to={`/coding/solve/${problem._id}`} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                     Solve <Code size={16}/>
                   </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default CodingProblemsList;
