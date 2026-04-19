import React, { useState } from 'react';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { Code, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadCodingProblem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    tags: '',
    description: '',
    explanation: '',
    constraints: '',
    timeComplexity: '',
    spaceComplexity: '',
    timeLimit: 1000,
    memoryLimit: 256,
    examples: [],
    testCases: [],
    starterCode: { python: '', javascript: '', java: '', cpp: '' },
    editorial: ''
  });

  // Allowed all users for testing purpose as requested
  if (!user) {
    return <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-primary)' }}>Please log in to add problems.</div>;
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.description) {
      return alert("Title and Description are required!");
    }
    
    try {
      setLoading(true);
      const payload = { ...formData, tags: formData.tags ? formData.tags.split(',').map(t=>t.trim()) : [] };
      const res = await api.post('/coding/admin/problems', payload);
      if (res.data.success) {
        alert('Problem uploaded successfully!');
        navigate('/coding/problems');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert(`Error uploading problem: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--text-primary)', outline: 'none' };
  const labelStyle = { display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', padding: 'var(--s-8)', paddingTop: 'var(--s-16)' }}>
      <div className="card glass" style={{ maxWidth: '900px', margin: '0 auto', borderRadius: 'var(--radius-xl)' }}>
        
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Code color="var(--accent)" size={32} />
          Upload New Problem
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input type="text" style={inputStyle} value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} placeholder="e.g. Two Sum" />
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select style={inputStyle} value={formData.difficulty} onChange={e=>setFormData({...formData, difficulty: e.target.value})}>
                <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
              <label style={labelStyle}>Tags (comma separated)</label>
              <input type="text" style={inputStyle} value={formData.tags} onChange={e=>setFormData({...formData, tags: e.target.value})} placeholder="Array, Hash Table" />
          </div>

          <div>
              <label style={labelStyle}>Description / Problem Statement (HTML/Markdown)</label>
              <textarea rows={5} style={{...inputStyle, resize: 'vertical'}} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             <div>
                <label style={labelStyle}>Time Complexity Hint</label>
                <input type="text" style={inputStyle} value={formData.timeComplexity} onChange={e=>setFormData({...formData, timeComplexity: e.target.value})} />
             </div>
             <div>
                <label style={labelStyle}>Space Complexity Hint</label>
                <input type="text" style={inputStyle} value={formData.spaceComplexity} onChange={e=>setFormData({...formData, spaceComplexity: e.target.value})} />
             </div>
          </div>

          {/* Test Cases Section */}
          <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Test Cases</h3>
               <button onClick={() => setFormData({...formData, testCases: [...formData.testCases, {input: '', expectedOutput: '', isHidden: false}]})} className="btn-primary">
                 <Plus size={16}/> Add Test Case
               </button>
             </div>
             {formData.testCases.map((tc, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{...labelStyle, fontSize: '11px'}}>Input (stdin)</label>
                    <textarea style={{...inputStyle, padding: '8px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical'}} rows={2} value={tc.input} onChange={e=>{let n=[...formData.testCases]; n[idx].input=e.target.value; setFormData({...formData, testCases: n})}}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{...labelStyle, fontSize: '11px'}}>Expected Output</label>
                    <textarea style={{...inputStyle, padding: '8px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical'}} rows={2} value={tc.expectedOutput} onChange={e=>{let n=[...formData.testCases]; n[idx].expectedOutput=e.target.value; setFormData({...formData, testCases: n})}}/>
                  </div>
                  <div style={{ paddingTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={tc.isHidden} onChange={e=>{let n=[...formData.testCases]; n[idx].isHidden=e.target.checked; setFormData({...formData, testCases: n})}} />
                      Hidden
                    </label>
                    <button style={{ color: 'var(--danger)' }} onClick={()=>{let n=[...formData.testCases]; n.splice(idx,1); setFormData({...formData, testCases: n})}}>
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
             ))}
          </div>

          {/* Starter Code */}
          <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Starter Code</h3>
             {['python', 'javascript', 'java', 'cpp'].map(lang => (
               <div key={lang} style={{ marginBottom: '16px' }}>
                 <label style={{...labelStyle, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px'}}>{lang}</label>
                 <textarea rows={3} style={{...inputStyle, fontFamily: 'monospace', fontSize: '13px', padding: '12px'}} value={formData.starterCode[lang]} onChange={e => setFormData({...formData, starterCode: {...formData.starterCode, [lang]: e.target.value}})} placeholder={`// Initial code for ${lang}`}/>
               </div>
             ))}
          </div>

          <div>
             <label style={labelStyle}>Editorial / Solution</label>
             <textarea rows={8} style={{...inputStyle, resize: 'vertical'}} value={formData.editorial} onChange={e=>setFormData({...formData, editorial: e.target.value})} placeholder="Explain the approach..." />
          </div>

          <button onClick={handleCreate} disabled={loading} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: 'var(--radius-lg)', justifyContent: 'center' }}>
            {loading ? 'Saving...' : <><Save size={20}/> Publish Problem</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCodingProblem;
