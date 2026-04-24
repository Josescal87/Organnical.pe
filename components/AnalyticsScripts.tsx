"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "organnical_cookie_consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function AnalyticsScripts() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function check() {
      setConsented(localStorage.getItem(STORAGE_KEY) === "accepted");
    }
    check();
    // Re-check when storage changes (user accepts in same tab via banner)
    window.addEventListener("storage", check);
    // Also poll for same-tab changes every 500ms until consented
    const interval = setInterval(check, 500);
    return () => {
      window.removeEventListener("storage", check);
      clearInterval(interval);
    };
  }, []);

  if (!consented) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
