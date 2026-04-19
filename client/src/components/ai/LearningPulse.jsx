import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Activity, Brain, Zap, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPulse() {
  const [pulseData, setPulseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const res = await api.get('/ai/learning-pulse');
        setPulseData(res.data.data);
      } catch (err) {
        console.error('Pulse error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPulse();
  }, []);

  if (loading) return (
    <div className="card" style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)' }}>
      <Activity className="spin" style={{ color: 'var(--accent)' }} />
    </div>
  );

  if (!pulseData) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card" 
      style={{ 
        padding: '1.5rem', 
        borderRadius: 24, 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}
    >
      {/* Background Gradient */}
      <div style={{ 
        position: 'absolute', 
        top: '-50%', 
        right: '-10%', 
        width: '150px', 
        height: '150px', 
        background: 'var(--accent-gradient)', 
        filter: 'blur(60px)', 
        opacity: 0.1,
        pointerEvents: 'none'
      }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            padding: '10px', 
            backgroundColor: 'rgba(79, 70, 229, 0.1)', 
            borderRadius: '12px',
            color: 'var(--accent)'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Your Learning Pulse</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>AI-Driven Engagement Analytics</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)' }}>{pulseData.score}%</div>
           <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Efficiency</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            {pulseData.isBurnoutRisk ? <AlertTriangle size={16} color="#f59e0b" /> : <Brain size={16} color="var(--accent)" />}
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AI Recommendation</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
             {pulseData.advice}
          </p>
          {pulseData.isBurnoutRisk && (
            <div style={{ marginTop: '0.75rem', padding: '8px 12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.8rem', color: '#d97706' }}>
              <strong>Burnout Warning:</strong> You've had {pulseData.stats.recentActivity} interactions in 24h. Take a short walk!
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', minWidth: '150px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pulseData.stats.aiInteractions}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>AI Agents</div>
          </div>
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{pulseData.stats.notesTaken}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Notes</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
