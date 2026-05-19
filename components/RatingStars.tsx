interface Props {
  rating: number
  size?: "sm" | "md" | "lg"
  precise?: boolean
}

const SIZE_CLASS: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-2xl",
}

export default function RatingStars({ rating, size = "md", precise = false }: Props) {
  const clamped = Math.max(0, Math.min(5, rating))
  const full = Math.floor(clamped)
  const fraction = clamped - full
  const showHalf = precise && fraction >= 0.25 && fraction < 0.75

  const stars: ("full" | "half" | "empty")[] = []
  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push("full")
    else if (i === full + 1 && showHalf) stars.push("half")
    else if (!precise && i <= Math.round(clamped)) stars.push("full")
    else stars.push("empty")
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 leading-none ${SIZE_CLASS[size]}`}
      aria-label={`${clamped.toFixed(1)} de 5 estrellas`}
      role="img"
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className={s === "empty" ? "text-gray-300" : "text-amber-400"}
          aria-hidden="true"
        >
          {s === "half" ? "★" : s === "full" ? "★" : "☆"}
        </span>
      ))}
    </span>
  )
}
