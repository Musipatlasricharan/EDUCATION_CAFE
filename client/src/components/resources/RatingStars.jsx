import { Star } from 'lucide-react'
import { useState } from 'react'

export default function RatingStars({ value = 0, interactive = false, onRate = () => {}, count = 0 }) {
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverValue(star)}
            onMouseLeave={() => interactive && setHoverValue(0)}
            onClick={() => interactive && onRate(star)}
            style={{ padding: 2, cursor: interactive ? 'pointer' : 'default', color: '#f59e0b', transition: 'transform 0.1s' }}
            onMouseDown={(e) => interactive && (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => interactive && (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Star
              size={22}
              fill={(hoverValue || value) >= star ? '#f59e0b' : 'transparent'}
            />
          </button>
        ))}
      </div>
      {(value > 0 || count > 0) && (
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {value.toFixed(1)} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>({count} reviews)</span>
        </span>
      )}
    </div>
  )
}
