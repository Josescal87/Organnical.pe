import Link from "next/link"
import Image from "next/image"

export default function HeroSlider() {
  return (
    <Link href="/tienda" className="block w-full overflow-hidden">
      <Image
        src="/Organnical_YumiGumi_v2_SLIDER_2560x766.webp"
        alt="Ver tienda Organnical"
        width={2560}
        height={766}
        priority
        className="w-full h-auto"
        style={{ aspectRatio: "2560/766" }}
      />
    </Link>
  )
}
