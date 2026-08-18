import type { NextRequest } from "next/server";
import { sendMail } from "@/app/lib/mailer";
import {
  renderWaitlistEmail,
  unsubscribeUrl,
  waitlistEmailHtml,
} from "@/app/lib/waitlist-email";

/**
 * Development helper. `/api/waitlist/preview` renders the welcome email exactly
 * as it will be sent; `?send=you@example.com` pushes it through the configured
 * SMTP transport so credentials can be checked without creating a signup.
 * Disabled in production.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const to = request.nextUrl.searchParams.get("send");
  if (to) {
    try {
      const info = await sendMail({ to, ...renderWaitlistEmail("preview-token") });
      return Response.json({ sent: true, to, messageId: info.messageId });
    } catch (error) {
      return Response.json(
        { sent: false, to, error: String(error) },
        { status: 500 },
      );
    }
  }

  return new Response(waitlistEmailHtml(unsubscribeUrl("preview-token")), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
