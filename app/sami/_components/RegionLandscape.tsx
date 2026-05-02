'use client'

import { REGION_THEMES } from './content-helpers'

type ActiveRegion = 'costa' | 'sierra' | 'selva'

interface Props {
  activeRegion: ActiveRegion
  onRegionChange: (region: ActiveRegion) => void
  accent: string
}

const PANEL_ORDER: ActiveRegion[] = ['costa', 'sierra', 'selva']
const REGION_NAMES: Record<ActiveRegion, string> = {
  costa:  'Costa',
  sierra: 'Sierra',
  selva:  'Selva',
}

function CostaLandscape() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {/* Sky */}
      <rect width="200" height="200" fill="#080e1a" />
      {/* Stars */}
      <circle cx="30" cy="28" r="1" fill="white" opacity="0.45" />
      <circle cx="150" cy="18" r="1.5" fill="white" opacity="0.3" />
      <circle cx="85" cy="48" r="1" fill="white" opacity="0.5" />
      <circle cx="170" cy="38" r="1" fill="white" opacity="0.35" />
      {/* Sea — base layer */}
      <path d="M0,140 C40,125 80,155 120,135 C160,115 200,145 200,145 L200,200 L0,200 Z" fill="#0f2a38" />
      {/* Sea — mid layer */}
      <path d="M0,150 C30,138 70,162 110,145 C150,128 180,152 200,144 L200,200 L0,200 Z" fill="#1a3a4a" />
      {/* Wave crest */}
      <path d="M0,150 C30,138 70,162 110,145 C150,128 180,152 200,144" stroke="#4a9ebb" strokeWidth="1.5" fill="none" opacity="0.55" />
      {/* Fishing boat — hull */}
      <path d="M72,140 C74,147 126,147 128,140 Z" fill="#1e3f52" />
      {/* Fishing boat — mast */}
      <line x1="100" y1="140" x2="100" y2="118" stroke="#2a5a70" strokeWidth="1.5" />
      {/* Fishing boat — sail */}
      <path d="M100,119 L100,134 L118,130 Z" fill="#4a9ebb" opacity="0.45" />
      {/* Distant shore silhouette */}
      <path d="M0,132 C20,128 50,130 70,126 C90,122 110,128 130,124 C160,118 190,126 200,122 L200,135 L0,135 Z" fill="#0d1f2a" opacity="0.6" />
    </svg>
  )
}

function SierraLandscape() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sierraGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0620" />
          <stop offset="100%" stopColor="#0f0a1e" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="200" height="200" fill="url(#sierraGrad)" />
      {/* Milky Way — blurred sinuous path */}
      <path
        d="M20,10 Q60,40 100,25 Q140,10 170,50 Q190,70 200,60"
        stroke="rgba(167,139,250,0.12)"
        strokeWidth="10"
        fill="none"
        style={{ filter: 'blur(4px)' }}
      />
      {/* Stars */}
      <circle cx="15" cy="14" r="1.5" fill="white" opacity="0.8" />
      <circle cx="45" cy="8" r="1" fill="white" opacity="0.6" />
      <circle cx="80" cy="20" r="1.5" fill="white" opacity="0.9" />
      <circle cx="110" cy="12" r="1" fill="white" opacity="0.7" />
      <circle cx="140" cy="5" r="1.5" fill="white" opacity="0.8" />
      <circle cx="165" cy="18" r="1" fill="white" opacity="0.5" />
      <circle cx="25" cy="38" r="1" fill="white" opacity="0.6" />
      <circle cx="135" cy="42" r="1.5" fill="white" opacity="0.7" />
      <circle cx="172" cy="30" r="1" fill="white" opacity="0.8" />
      <circle cx="55" cy="45" r="1" fill="white" opacity="0.5" />
      <circle cx="95" cy="55" r="1" fill="white" opacity="0.4" />
      {/* Mountain — back layer */}
      <path d="M-10,200 L50,95 L100,165 L200,200 Z" fill="#120a2a" opacity="0.8" />
      {/* Mountain — center protagonist */}
      <path d="M30,200 L82,68 L132,200 Z" fill="#1e1048" />
      {/* Mountain — right layer */}
      <path d="M100,200 L155,105 L200,175 L200,200 Z" fill="#180e38" />
      {/* Snow cap */}
      <path d="M82,68 L74,96 L90,96 Z" fill="rgba(255,255,255,0.65)" />
    </svg>
  )
}

function SelvaLandscape() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="selvaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#051008" />
          <stop offset="100%" stopColor="#0a1a0f" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="200" height="200" fill="url(#selvaGrad)" />
      {/* River shimmer */}
      <path
        d="M-10,175 C30,165 60,180 100,170 C140,160 170,178 210,168"
        stroke="rgba(74,222,128,0.12)"
        strokeWidth="9"
        fill="none"
      />
      {/* Treetops — back layer */}
      <path
        d="M-10,200 C-5,162 18,155 35,155 C52,155 56,172 62,172 C68,155 82,143 97,143 C112,143 117,162 122,162 C127,145 142,133 157,133 C172,133 178,155 184,155 C194,152 202,168 210,200 Z"
        fill="#0a2210"
      />
      {/* Treetops — mid layer */}
      <path
        d="M-10,200 C2,170 16,160 32,160 C48,160 52,178 58,178 C65,160 78,146 94,146 C110,146 115,168 120,168 C126,150 140,137 156,137 C172,137 178,160 185,158 C195,155 202,172 210,200 Z"
        fill="#071a09"
      />
      {/* Treetops — front layer (tallest) */}
      <path
        d="M-10,200 C0,172 14,164 28,164 C44,164 48,182 54,182 C62,162 76,150 90,150 C106,150 112,170 116,170 C124,152 138,140 152,140 C168,140 175,164 182,162 C192,158 200,175 210,200 Z"
        fill="#040e05"
      />
      {/* Fireflies — rendered as glowing dots */}
      <circle cx="42" cy="102" r="2.5" fill="#4ade80" opacity="0.85" style={{ filter: 'blur(1px)' }} />
      <circle cx="84" cy="128" r="2" fill="#4ade80" opacity="0.7" style={{ filter: 'blur(1px)' }} />
      <circle cx="122" cy="115" r="2.5" fill="#4ade80" opacity="0.9" style={{ filter: 'blur(1px)' }} />
      <circle cx="162" cy="98" r="2" fill="#4ade80" opacity="0.75" style={{ filter: 'blur(1px)' }} />
    </svg>
  )
}

export default function RegionLandscape({ activeRegion, onRegionChange, accent }: Props) {
  return (
    <>
      <style>{`
        @keyframes sami-region-pulse { 0%,100%{opacity:0.75} 50%{opacity:1} }
        @keyframes sami-landscape-glow { 0%,100%{opacity:0.06} 50%{opacity:0.22} }
        @keyframes sami-firefly-panel {
          0%   { opacity:0; transform:translate(0,0) scale(1); }
          20%  { opacity:0.9; }
          55%  { opacity:0.4; transform:translate(8px,-24px) scale(0.8); }
          100% { opacity:0; transform:translate(-4px,-52px) scale(0.6); }
        }
        .sami-landscape-btn {
          transition: filter 500ms ease, transform 500ms ease;
        }
        .sami-landscape-btn:focus-visible {
          outline: 2px solid ${accent};
          outline-offset: -2px;
        }
      `}</style>
      <div
        className="relative flex overflow-hidden rounded-2xl border"
        style={{
          height: 200,
          borderColor: `${accent}22`,
          backgroundColor: '#06040f',
        }}
      >
        {PANEL_ORDER.map((region, idx) => {
          const isActive = activeRegion === region
          const theme = REGION_THEMES[region]
          return (
            <button
              key={region}
              onClick={() => onRegionChange(region)}
              className="sami-landscape-btn relative flex-1 overflow-hidden"
              style={{
                filter: isActive ? 'brightness(1.25)' : 'brightness(0.65)',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                borderRight: idx < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                zIndex: isActive ? 2 : 1,
              }}
              aria-label={`Viajar a la ${REGION_NAMES[region]}`}
              aria-pressed={isActive}
            >
              {/* Landscape SVG */}
              {region === 'costa'  && <CostaLandscape />}
              {region === 'sierra' && <SierraLandscape />}
              {region === 'selva'  && <SelvaLandscape />}

              {/* Active glow overlay */}
              {isActive && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 50% 30%, ${theme.accent}18 0%, transparent 70%)`,
                    animation: 'sami-landscape-glow 3s ease-in-out infinite',
                  }}
                />
              )}

              {/* Bottom label gradient + text */}
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center pb-3 pt-8"
                style={{ background: 'linear-gradient(to top, rgba(4,2,10,0.88) 0%, transparent 100%)' }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: isActive ? theme.accent : '#4b5563',
                    animation: isActive ? 'sami-region-pulse 2.5s ease-in-out infinite' : 'none',
                    transition: 'color 500ms',
                  }}
                >
                  {REGION_NAMES[region]}
                </span>
              </div>
            </button>
          )
        })}

        {/* Divider lines */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
          <div className="absolute inset-y-0 left-1/3 w-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="absolute inset-y-0 right-1/3 w-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
    </>
  )
}
