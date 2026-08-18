"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/app/lib/prisma";
import { sendMail } from "@/app/lib/mailer";
import { renderWaitlistEmail } from "@/app/lib/waitlist-email";

export type WaitlistState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "joined"; email: string; alreadyOn: boolean };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function newToken() {
  return randomBytes(24).toString("base64url");
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

async function sendWelcome(id: string, email: string, token: string) {
  try {
    await sendMail({ to: email, ...renderWaitlistEmail(token) });
    await prisma.waitlistSignup.update({
      where: { id },
      data: { welcomeEmailSentAt: new Date() },
    });
  } catch (error) {
    console.error("[waitlist] welcome email failed for", email, error);
  }
}

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (String(formData.get("company") ?? "").length > 0) {
    return { status: "joined", email, alreadyOn: false };
  }

  if (!email || email.length > 254 || !EMAIL.test(email)) {
    return { status: "error", message: "That email address does not look right." };
  }

  const source = String(formData.get("source") ?? "/").slice(0, 120);

  try {
    const existing = await prisma.waitlistSignup.findUnique({ where: { email } });

    if (existing && existing.status !== "UNSUBSCRIBED") {
      return { status: "joined", email, alreadyOn: true };
    }

    if (existing) {
      const token = newToken();
      const signup = await prisma.waitlistSignup.update({
        where: { id: existing.id },
        data: {
          status: "PENDING",
          source,
          unsubscribeToken: token,
          unsubscribedAt: null,
          welcomeEmailSentAt: null,
        },
      });
      await sendWelcome(signup.id, email, token);
      return { status: "joined", email, alreadyOn: false };
    }

    const token = newToken();
    const signup = await prisma.waitlistSignup.create({
      data: { email, source, unsubscribeToken: token },
    });
    await sendWelcome(signup.id, email, token);
    return { status: "joined", email, alreadyOn: false };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { status: "joined", email, alreadyOn: true };
    }
    console.error("[waitlist] signup failed for", email, error);
    return {
      status: "error",
      message: "We could not save that just now. Please try again in a moment.",
    };
  }
}

export async function leaveWaitlist(token: string): Promise<{ ok: boolean }> {
  if (!token) return { ok: false };
  try {
    const signup = await prisma.waitlistSignup.findUnique({
      where: { unsubscribeToken: token },
    });
    if (!signup) return { ok: false };
    await prisma.waitlistSignup.update({
      where: { id: signup.id },
      data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
    });
    return { ok: true };
  } catch (error) {
    console.error("[waitlist] unsubscribe failed", error);
    return { ok: false };
  }
}
