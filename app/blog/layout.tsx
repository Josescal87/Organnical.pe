import Footer from "@/components/Footer"
import WhatsAppButton from "@/components/WhatsAppButton"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  )
}
