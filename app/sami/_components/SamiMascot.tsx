import Image from 'next/image'

export type MascotPose = 'sentado' | 'caminando' | 'parado' | 'feliz' | 'corriendo'
export type MascotAnim = 'float' | 'bounce' | 'arrive' | 'still'

const POSES: Record<MascotPose, string> = {
  sentado:   '/sami/mascota-sentado.png',
  caminando: '/sami/mascota-caminando.png',
  parado:    '/sami/mascota-parado.png',
  feliz:     '/sami/mascota-feliz.png',
  corriendo: '/sami/mascota-corriendo.png',
}

const ANIMS: Record<MascotAnim, string> = {
  float:  'sami-dog-float 3.2s ease-in-out infinite',
  bounce: 'sami-dog-bounce 1.8s ease-in-out infinite',
  arrive: 'sami-dog-arrive 0.65s cubic-bezier(0.22,1,0.36,1) both',
  still:  'none',
}

interface Props {
  pose?: MascotPose
  size?: number
  anim?: MascotAnim
  style?: React.CSSProperties
}

export default function SamiMascot({ pose = 'sentado', size = 140, anim = 'float', style = {} }: Props) {
  return (
    <Image
      src={POSES[pose]}
      alt="Sami"
      width={size}
      height={size}
      style={{
        width: size,
        height: 'auto',
        objectFit: 'contain',
        objectPosition: 'center bottom',
        filter: 'drop-shadow(0 6px 20px rgba(139,111,232,0.4))',
        animation: ANIMS[anim],
        flexShrink: 0,
        ...style,
      }}
      priority
    />
  )
}
