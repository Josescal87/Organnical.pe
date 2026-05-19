"use client"
import { DISTRITOS } from "@/lib/pricing"

interface Props {
  value: string
  onChange: (next: string) => void
  required?: boolean
  id?: string
  name?: string
}

const LIST_ID = "distritos-list"

export default function DistritoCombobox({ value, onChange, required, id, name = "distrito" }: Props) {
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
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <datalist id={LIST_ID}>
        {DISTRITOS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
    </>
  )
}
