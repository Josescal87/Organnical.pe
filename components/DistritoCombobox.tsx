"use client"
import { DISTRITOS } from "@/lib/pricing"

interface Props {
  value: string
  onChange: (next: string) => void
  required?: boolean
  id?: string
  name?: string
  dark?: boolean
}

const LIST_ID = "distritos-list"

export default function DistritoCombobox({ value, onChange, required, id, name = "distrito", dark = false }: Props) {
  return (
    <>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={LIST_ID}
        autoComplete="off"
        required={required}
        placeholder="Empieza a escribir el distrito..."
        className={`w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
          dark
            ? "bg-white/[0.08] border border-white/15 text-white placeholder:text-white/25 focus:ring-violet-400 focus:border-transparent"
            : "border border-gray-200 focus:ring-purple-500"
        }`}
      />
      <datalist id={LIST_ID}>
        {DISTRITOS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
    </>
  )
}
