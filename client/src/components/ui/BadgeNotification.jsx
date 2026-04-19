import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Rocket, Flame, Zap, Star, Shield, Award } from 'lucide-react';

const icons = {
  Rocket: Rocket,
  Trophy: Trophy,
  Flame: Flame,
  Zap: Zap,
  Star: Star,
  Shield: Shield,
  Award: Award,
};

const BadgeNotification = ({ socket }) => {
  const [activeBadge, setActiveBadge] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleBadgeEarned = (badgesData) => {
      // Sometimes it's an array, sometimes a single object depending on trigger
      const badges = Array.isArray(badgesData) ? badgesData : [badgesData];
      
      badges.forEach((badge, index) => {
        setTimeout(() => {
          setActiveBadge(badge);
          setTimeout(() => setActiveBadge(null), 5000);
        }, index * 6000);
      });
    };

    socket.on('badge_earned', handleBadgeEarned);
    return () => socket.off('badge_earned', handleBadgeEarned);
  }, [socket]);

  return (
    <AnimatePresence>
      {activeBadge && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 20, padding: 20,
            borderRadius: 24, backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: 400, color: '#fff'
          }}
        >
          <div 
            style={{ 
              width: 64, height: 64, flexShrink: 0, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', borderRadius: 16,
              backgroundColor: `${activeBadge.color}20` 
            }}
          >
            {React.createElement(icons[activeBadge.icon] || Award, {
              size: 40,
              style: { color: activeBadge.color }
            })}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontBold: 800, textTransform: 'uppercase', tracking: 1, backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 6, color: 'rgba(255,255,255,0.6)' }}>
                {activeBadge.rarity}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: activeBadge.color }}>
                NEW BADGE EARNED
              </span>
            </div>
            <h4 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>
              {activeBadge.name}
            </h4>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4, lineHeight: 1.4 }}>
              {activeBadge.description}
            </p>
          </div>

          <button 
            onClick={() => setActiveBadge(null)}
            style={{ alignSelf: 'flex-start', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 24, border: 'none', background: 'none' }}
          >
            ×
          </button>
          
          <div 
            style={{ 
              position: 'absolute', bottom: 0, left: 0, height: 4, borderRadius: 2,
              width: '100%', backgroundColor: activeBadge.color,
              animation: 'progress 5s linear forwards'
            }}
          />
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes progress {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeNotification;
