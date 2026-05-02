// Cartoon SVG landscape scenes — ported from sami-prototype-v3
// Each scene supports compact (160px) and full (300px) height modes.

const STROKE = '#3d2b6e'

interface SceneProps {
  isNight: boolean
  compact?: boolean
}

export function CartoonCostaScene({ isNight, compact = false }: SceneProps) {
  const h = compact ? 160 : 300
  return (
    <svg viewBox={`0 0 390 ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      {/* Sky */}
      <rect width="390" height={h} fill={isNight ? '#07111c' : '#0d2035'} />

      {/* Stars */}
      {isNight && (
        <>
          <circle cx="35" cy="18" r="2.5" fill="#a8ecf8" style={{ animation: 'sami-star-pop 3s 0.2s infinite ease-in-out' }} />
          <circle cx="80" cy="12" r="2" fill="white" style={{ animation: 'sami-star-pop 2.8s 0.8s infinite ease-in-out' }} opacity=".8" />
          <circle cx="140" cy="22" r="3" fill="#a78bfa" style={{ animation: 'sami-star-pop 3.5s 0.4s infinite ease-in-out' }} />
          <circle cx="200" cy="10" r="2" fill="white" style={{ animation: 'sami-star-pop 2.5s 1.1s infinite ease-in-out' }} opacity=".9" />
          <circle cx="260" cy="20" r="2.5" fill="#a8ecf8" style={{ animation: 'sami-star-pop 3.2s 0.6s infinite ease-in-out' }} />
          <circle cx="330" cy="14" r="2" fill="white" style={{ animation: 'sami-star-pop 2.9s 1.5s infinite ease-in-out' }} opacity=".8" />
          <circle cx="370" cy="25" r="2.5" fill="#a78bfa" style={{ animation: 'sami-star-pop 3.4s 0.3s infinite ease-in-out' }} />
        </>
      )}

      {/* Cartoon moon */}
      {isNight && (
        <>
          <circle cx="315" cy="45" r="26" fill="#fffde0" stroke="#c8b840" strokeWidth="3" />
          <circle cx="325" cy="38" r="20" fill={isNight ? '#07111c' : '#0d2035'} />
          <circle cx="306" cy="48" r="2.5" fill="#c8b840" />
          <path d="M302 55 Q306 57 310 55" stroke="#c8b840" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {!isNight && <circle cx="60" cy="60" r="38" fill="#ffe87a" stroke="#d4a800" strokeWidth="3.5" />}

      {/* Cartoon clouds */}
      {!isNight && (
        <>
          <g style={{ animation: 'sami-cloud-drift 8s ease-in-out infinite' }}>
            <ellipse cx="120" cy="55" rx="28" ry="18" fill="rgba(200,230,255,.3)" stroke="rgba(100,180,230,.4)" strokeWidth="2" />
            <ellipse cx="140" cy="50" rx="20" ry="14" fill="rgba(200,230,255,.3)" stroke="rgba(100,180,230,.4)" strokeWidth="2" />
            <ellipse cx="105" cy="52" rx="16" ry="12" fill="rgba(200,230,255,.3)" stroke="rgba(100,180,230,.4)" strokeWidth="2" />
          </g>
        </>
      )}

      {/* Distant shore */}
      <path
        d={`M0,${h * 0.62} C60,${h * 0.56} 130,${h * 0.64} 200,${h * 0.58} C270,${h * 0.52} 330,${h * 0.62} 390,${h * 0.56} L390,${h * 0.7} L0,${h * 0.7} Z`}
        fill="#0d2535" stroke="#1a4a60" strokeWidth="2"
      />

      {/* Sea */}
      <rect x="0" y={h * 0.68} width="390" height={h * 0.32} fill="#0d2535" />
      <path
        d={`M0,${h * 0.71} C30,${h * 0.68} 55,${h * 0.74} 80,${h * 0.70} C105,${h * 0.66} 130,${h * 0.72} 155,${h * 0.68} C180,${h * 0.64} 210,${h * 0.70} 240,${h * 0.66} C270,${h * 0.62} 300,${h * 0.70} 330,${h * 0.66} C355,${h * 0.62} 380,${h * 0.69} 390,${h * 0.66}`}
        stroke="#5ec9e8" strokeWidth="3.5" fill="none" strokeLinecap="round"
        style={{ animation: 'sami-wave-bob 4s ease-in-out infinite' }}
      />
      <path
        d={`M0,${h * 0.77} C40,${h * 0.74} 70,${h * 0.79} 100,${h * 0.75} C130,${h * 0.71} 160,${h * 0.77} 195,${h * 0.73} C225,${h * 0.69} 255,${h * 0.76} 285,${h * 0.72} C315,${h * 0.68} 355,${h * 0.76} 390,${h * 0.72}`}
        stroke="rgba(94,201,232,.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"
        style={{ animation: 'sami-wave-bob 5s 1s ease-in-out infinite' }}
      />

      {/* Cartoon boat */}
      <g transform={`translate(88,${h * 0.69})`}>
        <path d="M-26,0 C-24,8 24,8 26,0 Z" fill="#1e3f52" stroke="#1a4a60" strokeWidth="2.5" strokeLinejoin="round" />
        <line x1="0" y1="0" x2="0" y2="-28" stroke="#2a5a70" strokeWidth="3" strokeLinecap="round" />
        <path d="M2,-26 C14,-20 18,-10 14,-2 L2,-2 Z" fill="#5ec9e8" stroke="#1a4a60" strokeWidth="2" strokeLinejoin="round" opacity=".8" />
        <path d="M0,-28 L8,-23 L0,-18 Z" fill="#a78bfa" stroke="#3d2b6e" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

export function CartoonSierraScene({ isNight, compact = false }: SceneProps) {
  const h = compact ? 160 : 300
  return (
    <svg viewBox={`0 0 390 ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="skg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#04010e' : '#0c0820'} />
          <stop offset="100%" stopColor={isNight ? '#130e2e' : '#1a1040'} />
        </linearGradient>
      </defs>
      <rect width="390" height={h} fill="url(#skg)" />

      {/* Milky way */}
      {isNight && (
        <path d="M20,15 Q100,50 200,30 Q290,12 370,55"
          stroke="rgba(167,139,250,.12)" strokeWidth="18" fill="none" style={{ filter: 'blur(4px)' }} />
      )}

      {/* Stars */}
      {isNight && (
        <>
          {([[22,12,3],[55,8,2.5],[95,20,3.5],[140,6,2.5],[185,18,3],[240,8,3.5],[285,16,2.5],[335,9,3],[370,22,2.5],[60,38,2],[170,42,2.5],[310,36,2]] as [number,number,number][]).map(([x,y,r],i) => (
            <circle key={i} cx={x} cy={y} r={r}
              fill={i % 3 === 0 ? '#a78bfa' : i % 3 === 1 ? 'white' : '#e9d5ff'}
              style={{ animation: `sami-star-pop ${2.5 + i * 0.2}s ${i * 0.3}s infinite ease-in-out` }}
              opacity=".9"
            />
          ))}
        </>
      )}

      {/* Moon */}
      {isNight && (
        <>
          <circle cx="318" cy="42" r="28" fill="#fffde0" stroke="#c8b840" strokeWidth="3" />
          <circle cx="328" cy="35" r="22" fill="url(#skg)" />
          <circle cx="308" cy="46" r="2.5" fill="#c8b840" />
          <path d="M305 52 Q309 54 313 52" stroke="#c8b840" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      {!isNight && (
        <>
          <circle cx="195" cy="52" r="44" fill="#ffe87a" stroke="#d4a800" strokeWidth="3" />
        </>
      )}

      {/* Shooting star */}
      {isNight && (
        <g style={{ animation: 'sami-shoot-star 10s 4s infinite ease-out', transformOrigin: 'left center' }}>
          <line x1="18" y1={h * 0.08} x2="88" y2={h * 0.08 + 18} stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".9" />
          <circle cx="18" cy={h * 0.08} r="3" fill="white" />
        </g>
      )}

      {/* Mountains */}
      <path d={`M-20,${h} L90,${h * 0.3} L190,${h * 0.7} L390,${h} Z`}
        fill="#10082a" stroke="#2a1a50" strokeWidth="3" strokeLinejoin="round" />
      <path d={`M190,${h} L280,${h * 0.32} L390,${h * 0.62} L390,${h} Z`}
        fill="#180e38" stroke="#2a1a50" strokeWidth="3" strokeLinejoin="round" />
      <path d={`M55,${h} L168,${h * 0.14} L275,${h} Z`}
        fill="#1e1048" stroke={STROKE} strokeWidth="3.5" strokeLinejoin="round" />
      {/* Snow cap */}
      <path d={`M168,${h * 0.14} L152,${h * 0.3} Q160,${h * 0.28} 168,${h * 0.3} Q176,${h * 0.28} 184,${h * 0.3} Z`}
        fill="white" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Ground */}
      <path d={`M0,${h * 0.86} C80,${h * 0.82} 180,${h * 0.88} 300,${h * 0.84} C350,${h * 0.82} 380,${h * 0.87} 390,${h * 0.85} L390,${h} L0,${h} Z`}
        fill="#0d0825" stroke={STROKE} strokeWidth="2" />

      {/* Apacheta stones */}
      {!compact && (
        <g transform={`translate(48,${h * 0.83})`}>
          <ellipse cx="0" cy="0" rx="14" ry="6" fill="#2a1a50" stroke={STROKE} strokeWidth="2" />
          <ellipse cx="0" cy="-7" rx="10" ry="5" fill="#3a2460" stroke={STROKE} strokeWidth="2" />
          <ellipse cx="0" cy="-13" rx="7" ry="4" fill="#4a2e70" stroke={STROKE} strokeWidth="2" />
          <ellipse cx="0" cy="-18" rx="4" ry="3" fill="#5a3880" stroke={STROKE} strokeWidth="1.5" />
        </g>
      )}
    </svg>
  )
}

export function CartoonSelvaScene({ isNight, compact = false }: SceneProps) {
  const h = compact ? 160 : 300
  const fireflyPositions = [
    { x: 52, y: h * 0.58, d: 3.5 },
    { x: 118, y: h * 0.65, d: 4.2 },
    { x: 178, y: h * 0.55, d: 3.8 },
    { x: 245, y: h * 0.62, d: 4.5 },
    { x: 308, y: h * 0.57, d: 3.2 },
  ]
  return (
    <svg viewBox={`0 0 390 ${h}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="jkg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isNight ? '#020804' : '#040e06'} />
          <stop offset="100%" stopColor={isNight ? '#071209' : '#0d1f0f'} />
        </linearGradient>
      </defs>
      <rect width="390" height={h} fill="url(#jkg)" />

      {/* Stars */}
      {isNight && (
        <>
          <circle cx="50" cy="18" r="2" fill="white" opacity=".5" style={{ animation: 'sami-star-pop 3s 0.5s infinite' }} />
          <circle cx="120" cy="12" r="2.5" fill="#bbf7d0" style={{ animation: 'sami-star-pop 2.8s 1s infinite' }} />
          <circle cx="200" cy="22" r="2" fill="white" opacity=".6" style={{ animation: 'sami-star-pop 3.2s 0.2s infinite' }} />
          <circle cx="290" cy="14" r="2.5" fill="#bbf7d0" style={{ animation: 'sami-star-pop 2.6s 0.8s infinite' }} />
          <circle cx="360" cy="20" r="2" fill="white" opacity=".5" style={{ animation: 'sami-star-pop 3s 1.4s infinite' }} />
        </>
      )}

      {/* Moon */}
      {isNight && (
        <>
          <circle cx="278" cy="38" r="24" fill="#d4ffd4" stroke="#5ae891" strokeWidth="3" />
          <circle cx="286" cy="32" r="19" fill="url(#jkg)" />
          <circle cx="268" cy="41" r="2.5" fill="#5ae891" />
          <path d="M265 47 Q269 49 273 47" stroke="#5ae891" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* River */}
      <path
        d={`M-20,${h * 0.7} C50,${h * 0.65} 120,${h * 0.73} 195,${h * 0.68} C270,${h * 0.63} 340,${h * 0.71} 420,${h * 0.66}`}
        stroke="#5ae891" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".3"
        style={{ animation: 'sami-wave-bob 4s ease-in-out infinite' }}
      />

      {/* Trees back */}
      <path
        d={`M-10,${h} Q10,${h*0.52} 35,${h*0.56} Q55,${h*0.48} 75,${h*0.54} Q95,${h*0.44} 118,${h*0.50} Q140,${h*0.42} 162,${h*0.48} Q188,${h*0.38} 210,${h*0.45} Q235,${h*0.36} 258,${h*0.44} Q280,${h*0.36} 305,${h*0.44} Q325,${h*0.38} 345,${h*0.46} Q368,${h*0.4} 390,${h*0.5} L390,${h} Z`}
        fill="#0a2210" stroke="#1a4a28" strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Trees mid */}
      <path
        d={`M-10,${h} Q5,${h*0.58} 28,${h*0.62} Q48,${h*0.54} 68,${h*0.60} Q90,${h*0.50} 112,${h*0.56} Q135,${h*0.48} 155,${h*0.54} Q180,${h*0.44} 202,${h*0.51} Q225,${h*0.42} 248,${h*0.50} Q272,${h*0.44} 295,${h*0.52} Q318,${h*0.46} 342,${h*0.54} Q365,${h*0.48} 390,${h*0.56} L390,${h} Z`}
        fill="#071a09" stroke="#1a4a28" strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Trees front */}
      <path
        d={`M-10,${h} Q8,${h*0.62} 30,${h*0.66} Q52,${h*0.58} 72,${h*0.65} Q95,${h*0.55} 118,${h*0.62} Q142,${h*0.54} 164,${h*0.60} Q188,${h*0.5} 210,${h*0.58} Q235,${h*0.5} 258,${h*0.58} Q280,${h*0.52} 305,${h*0.60} Q328,${h*0.54} 350,${h*0.62} Q372,${h*0.56} 390,${h*0.64} L390,${h} Z`}
        fill="#040c05" stroke="#0d2210" strokeWidth="3" strokeLinejoin="round"
      />

      {/* Fireflies */}
      {isNight && fireflyPositions.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r="4" fill="#5ae891" stroke="#2a8058" strokeWidth="1.5"
          style={{ animation: `sami-firefly ${f.d}s ${i * 0.7}s infinite ease-in-out` }} />
      ))}

      {/* Canoe */}
      {!compact && (
        <g transform={`translate(145,${h * 0.69})`}>
          <path d="M-22,0 C-18,7 18,7 22,0 Z" fill="#0d2a15" stroke="#1a4a28" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="0" y1="0" x2="0" y2="-22" stroke="#2a5a35" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

// Shared animation keyframes — inject once at app level
export const CARTOON_KEYFRAMES = `
@keyframes sami-star-pop {
  0%, 100% { opacity: 0.4; transform: scale(0.7); }
  50%       { opacity: 1;   transform: scale(1.3); }
}
@keyframes sami-wave-bob {
  0%, 100% { transform: translateX(0) translateY(0); }
  50%       { transform: translateX(5px) translateY(-8px); }
}
@keyframes sami-firefly {
  0%   { opacity: 0; transform: translate(0,0); }
  20%  { opacity: 1; }
  60%  { opacity: 0.4; transform: translate(8px,-26px); }
  100% { opacity: 0; transform: translate(-3px,-50px); }
}
@keyframes sami-shoot-star {
  0%   { opacity: 0; transform: translate(0,0); }
  8%   { opacity: 1; }
  92%  { opacity: 0.8; }
  100% { opacity: 0; transform: translate(380px,82px); }
}
@keyframes sami-cloud-drift {
  0%, 100% { transform: translateX(0); }
  50%       { transform: translateX(8px); }
}
@keyframes sami-dog-float {
  0%, 100% { transform: translateY(0) rotate(-0.5deg); }
  50%       { transform: translateY(-10px) rotate(0.5deg); }
}
@keyframes sami-dog-bounce {
  0%, 100% { transform: translateY(0) scaleY(1); }
  40%       { transform: translateY(-9px) scaleY(1.04); }
  60%       { transform: translateY(-6px) scaleY(0.98); }
}
@keyframes sami-dog-arrive {
  0%   { transform: translateX(-50px) scale(0.82) rotate(-4deg); opacity: 0; }
  65%  { transform: translateX(5px) scale(1.05) rotate(1deg);    opacity: 1; }
  100% { transform: translateX(0) scale(1) rotate(0deg);          opacity: 1; }
}
@keyframes sami-slide-up {
  from { transform: translateY(28px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes sami-bubble-pop {
  0%   { transform: scale(0) translateY(10px); opacity: 0; }
  60%  { transform: scale(1.1) translateY(-3px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
@keyframes sami-breathe {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.04); }
}
@keyframes sami-ripple {
  0%   { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(3);   opacity: 0; }
}
`
