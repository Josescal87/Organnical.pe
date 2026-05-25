import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { posts, publishTimestamp } from "@/lib/blog";
import { sendBlogPublishedNotification } from "@/lib/emails";

const NOTIFY_EMAIL = "jose@futura-farms.com";
// Ventana de detección: cron diario corre a 10:00 UTC (= 05:00 Lima). Si un post
// se publicó en los últimos 65 minutos (buffer ante drift del cron), notificamos.
const WINDOW_MINUTES = 65;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const expected = process.env.CRON_SECRET ?? "";

  if (!expected) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 });
  }

  const match =
    secret.length === expected.length &&
    timingSafeEqual(Buffer.from(secret), Buffer.from(expected));

  if (!match) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);

  const freshlyPublished = posts.filter((p) => {
    const ts = publishTimestamp(p);
    return ts >= windowStart && ts <= now;
  });

  const notified: string[] = [];
  const errors: { slug: string; error: string }[] = [];

  for (const post of freshlyPublished) {
    try {
      await sendBlogPublishedNotification({
        toEmail: NOTIFY_EMAIL,
        postTitle: post.title,
        postExcerpt: post.excerpt,
        postSlug: post.slug,
        postImage: post.image,
        postDateFormatted: post.dateFormatted,
        postAuthor: post.author,
        postCategory: post.category,
      });
      notified.push(post.slug);
    } catch (e) {
      errors.push({ slug: post.slug, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    now: now.toISOString(),
    windowStart: windowStart.toISOString(),
    notified,
    errors,
  });
}
