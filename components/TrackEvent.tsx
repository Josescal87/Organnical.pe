"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

type Props = {
  ga4Event: string
  ga4Params?: Record<string, unknown>
  metaEvent?: string
  metaParams?: Record<string, unknown>
}

export default function TrackEvent({ ga4Event, ga4Params, metaEvent, metaParams }: Props) {
  useEffect(() => {
    window.gtag?.("event", ga4Event, ga4Params)
    if (metaEvent) window.fbq?.("track", metaEvent, metaParams)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
