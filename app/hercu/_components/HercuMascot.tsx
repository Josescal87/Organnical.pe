// app/hercu/_components/HercuMascot.tsx
import React from 'react'

export type HercuPose = 'parado' | 'flex' | 'corriendo' | 'sentado'
export type HercuAnim = 'float' | 'bounce' | 'arrive' | 'still'

const ANIMS: Record<HercuAnim, string> = {
  float:  'hercu-float 3.2s ease-in-out infinite',
  bounce: 'hercu-bounce 1.8s ease-in-out infinite',
  arrive: 'hercu-arrive 0.65s cubic-bezier(0.22,1,0.36,1) both',
  still:  'none',
}

// Paleta Hercu: amarillo-naranja vibrante (energía y fuerza)
const C = { skin: '#fbbf24', skinD: '#d97706', body: '#f59e0b', bodyD: '#b45309', eye: '#111827' }

function PoseParado() {
  return (
    <>
      {/* Head */}
      <circle cx="40" cy="20" r="15" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      <circle cx="34" cy="18" r="2.5" fill={C.eye} />
      <circle cx="46" cy="18" r="2.5" fill={C.eye} />
      <path d="M34 24 Q40 29 46 24" stroke={C.eye} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="27" y="37" width="26" height="20" rx="6" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      {/* Arms */}
      <rect x="13" y="38" width="12" height="16" rx="6" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      <rect x="55" y="38" width="12" height="16" rx="6" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      {/* Legs */}
      <rect x="29" y="58" width="11" height="16" rx="5" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      <rect x="40" y="58" width="11" height="16" rx="5" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
    </>
  )
}

function PoseFlex() {
  return (
    <>
      {/* Head */}
      <circle cx="40" cy="20" r="15" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      <circle cx="34" cy="18" r="2.5" fill={C.eye} />
      <circle cx="46" cy="18" r="2.5" fill={C.eye} />
      <path d="M33 25 Q40 30 47 25" stroke={C.eye} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="27" y="37" width="26" height="20" rx="6" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      {/* Left arm (down) */}
      <rect x="13" y="38" width="12" height="16" rx="6" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      {/* Right arm (flexed up) */}
      <path d="M55 40 C62 30 70 26 68 20 C66 14 58 14 56 20 C54 26 60 32 57 40 Z"
        fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      {/* Bicep bump */}
      <circle cx="66" cy="22" r="5" fill={C.skin} stroke={C.skinD} strokeWidth="2" />
      {/* Legs */}
      <rect x="29" y="58" width="11" height="16" rx="5" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      <rect x="40" y="58" width="11" height="16" rx="5" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
    </>
  )
}

function PoseCorriendo() {
  return (
    <>
      {/* Head (slightly tilted) */}
      <circle cx="42" cy="18" r="14" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      <circle cx="37" cy="16" r="2.5" fill={C.eye} />
      <circle cx="48" cy="16" r="2.5" fill={C.eye} />
      <path d="M36 22 Q42 27 48 22" stroke={C.eye} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="28" y="34" width="24" height="18" rx="6" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      {/* Arms running */}
      <path d="M28 38 L14 28" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <path d="M52 38 L62 30" stroke={C.skin} strokeWidth="10" strokeLinecap="round" />
      <circle cx="14" cy="28" r="5" fill={C.skin} stroke={C.skinD} strokeWidth="2" />
      <circle cx="62" cy="30" r="5" fill={C.skin} stroke={C.skinD} strokeWidth="2" />
      {/* Legs running */}
      <path d="M32 52 L22 66" stroke={C.body} strokeWidth="11" strokeLinecap="round" />
      <path d="M44 52 L56 62" stroke={C.body} strokeWidth="11" strokeLinecap="round" />
    </>
  )
}

function PoseSentado() {
  return (
    <>
      {/* Head */}
      <circle cx="40" cy="18" r="15" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      <circle cx="34" cy="16" r="2.5" fill={C.eye} />
      <circle cx="46" cy="16" r="2.5" fill={C.eye} />
      <path d="M34 23 Q40 27 46 23" stroke={C.eye} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="27" y="35" width="26" height="18" rx="6" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      {/* Arms resting */}
      <rect x="13" y="36" width="12" height="14" rx="6" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      <rect x="55" y="36" width="12" height="14" rx="6" fill={C.skin} stroke={C.skinD} strokeWidth="2.5" />
      {/* Legs bent (sitting) */}
      <rect x="27" y="54" width="11" height="10" rx="4" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      <rect x="42" y="54" width="11" height="10" rx="4" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      <rect x="22" y="62" width="14" height="10" rx="4" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
      <rect x="44" y="62" width="14" height="10" rx="4" fill={C.body} stroke={C.bodyD} strokeWidth="2.5" />
    </>
  )
}

const POSES: Record<HercuPose, () => React.JSX.Element> = {
  parado:    PoseParado,
  flex:      PoseFlex,
  corriendo: PoseCorriendo,
  sentado:   PoseSentado,
}

interface Props {
  pose?: HercuPose
  size?: number
  anim?: HercuAnim
  style?: React.CSSProperties
}

export default function HercuMascot({ pose = 'parado', size = 80, anim = 'float', style = {} }: Props) {
  const PoseComponent = POSES[pose]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      style={{
        animation: ANIMS[anim],
        flexShrink: 0,
        filter: 'drop-shadow(0 6px 16px rgba(245,158,11,0.35))',
        ...style,
      }}
    >
      <PoseComponent />
    </svg>
  )
}
