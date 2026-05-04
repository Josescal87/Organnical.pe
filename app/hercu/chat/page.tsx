// app/hercu/chat/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HercuChatClient from './_chat'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/hercu/auth/login')
  return <HercuChatClient />
}
