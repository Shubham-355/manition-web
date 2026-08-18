import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — outgoing mail is not configured.`);
  return value;
}

function createTransport(): Transporter {
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port,
    // Implicit TLS on 465, STARTTLS on 587/25 unless overridden.
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    auth: { user: required("SMTP_USER"), pass: required("SMTP_PASS") },
  });
}

const globalForMailer = globalThis as unknown as { mailer?: Transporter };

/** Lazy so a missing SMTP env var fails on send, not at module import. */
export function getTransport(): Transporter {
  const transport = globalForMailer.mailer ?? createTransport();
  if (process.env.NODE_ENV !== "production") globalForMailer.mailer = transport;
  return transport;
}

export function mailFrom(): string {
  const configured = process.env.MAIL_FROM;
  if (configured) return configured;
  return `Manition <${required("SMTP_USER")}>`;
}

export async function sendMail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}) {
  return getTransport().sendMail({
    from: mailFrom(),
    replyTo: process.env.MAIL_REPLY_TO ?? undefined,
    ...message,
  });
}
