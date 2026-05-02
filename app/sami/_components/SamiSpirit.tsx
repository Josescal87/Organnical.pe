'use client'

type ActiveRegion = 'costa' | 'sierra' | 'selva'

interface Props {
  region: ActiveRegion
  arriving: boolean
}

const ORB_COLORS: Record<ActiveRegion, { core: string; mid: string; glow: string; outer: string }> = {
  costa:  { core: '#7dd3fc', mid: '#0ea5e9', glow: 'rgba(74,158,187,0.55)',  outer: 'rgba(74,158,187,0.12)'  },
  sierra: { core: '#e9d5ff', mid: '#a78bfa', glow: 'rgba(167,139,250,0.55)', outer: 'rgba(167,139,250,0.12)' },
  selva:  { core: '#bbf7d0', mid: '#4ade80', glow: 'rgba(74,222,128,0.55)',  outer: 'rgba(74,222,128,0.12)'  },
}

export default function SamiSpirit({ region, arriving }: Props) {
  const c = ORB_COLORS[region]
  return (
    <>
      <style>{`
        @keyframes sami-arrive {
          0%   { transform: translateY(-18px) scale(0.5); opacity: 0; }
          60%  { transform: translateY(-4px) scale(1.12); opacity: 0.9; }
          100% { transform: translateY(0px) scale(1); opacity: 1; }
        }
        @keyframes sami-spirit-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `radial-gradient(circle at 40% 38%, ${c.core} 0%, ${c.mid} 55%, transparent 100%)`,
          boxShadow: `0 0 20px 8px ${c.glow}, 0 0 50px 20px ${c.outer}, inset 0 0 12px rgba(255,255,255,0.15)`,
          animation: arriving
            ? 'sami-arrive 0.6s ease-out forwards, sami-spirit-float 3s 0.6s ease-in-out infinite'
            : 'sami-spirit-float 3s ease-in-out infinite',
          transition: 'background 600ms, box-shadow 600ms',
          flexShrink: 0,
        }}
        aria-hidden
      />
    </>
  )
}
