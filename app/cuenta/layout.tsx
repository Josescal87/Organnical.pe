import WhatsAppButton from "@/components/WhatsAppButton"

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WhatsAppButton />
    </>
  )
}
