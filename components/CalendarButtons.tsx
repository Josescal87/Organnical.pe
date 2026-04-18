"use client";

import { googleCalendarUrl, outlookUrl, downloadIcs, type CalendarEvent } from "@/lib/calendar-links";
import { CalendarPlus } from "lucide-react";

interface Props {
  event: CalendarEvent;
  compact?: boolean;
}

export default function CalendarButtons({ event, compact = false }: Props) {
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-1"}`}>
      {!compact && (
        <p className="w-full flex items-center gap-1.5 text-xs font-semibold text-zinc-500 mb-1">
          <CalendarPlus className="w-3.5 h-3.5" />
          Agregar a mi calendario
        </p>
      )}

      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M6 2v2M18 2v2M2 8h20M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Google Calendar
      </a>

      <a
        href={outlookUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 9h20" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 4v5M17 4v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Outlook
      </a>

      <button
        onClick={() => downloadIcs(event)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M12 15V3m0 12-4-4m4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Apple / iCal
      </button>
    </div>
  );
}
