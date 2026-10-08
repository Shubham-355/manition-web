import type { Metadata } from "next";
import Link from "next/link";
import { parseStyle } from "../lib/css";
import { prisma } from "../lib/prisma";
import NightShell from "../components/night/NightShell";
import { GridBg } from "../components/night/parts";
import { nightFonts } from "../lib/night-fonts";
import UnsubscribeButton from "./UnsubscribeButton";

export const metadata: Metadata = {
  title: "Leave the waitlist · Manition",
  robots: { index: false, follow: false },
};

type Lookup =
  | { kind: "missing" }
  | { kind: "unknown" }
  | { kind: "already" }
  | { kind: "found"; email: string };

async function lookup(token: string | undefined): Promise<Lookup> {
  if (!token) return { kind: "missing" };
  try {
    const signup = await prisma.waitlistSignup.findUnique({
      where: { unsubscribeToken: token },
      select: { email: true, status: true },
    });
    if (!signup) return { kind: "unknown" };
    if (signup.status === "UNSUBSCRIBED") return { kind: "already" };
    return { kind: "found", email: signup.email };
  } catch (error) {
    console.error("[waitlist] unsubscribe lookup failed", error);
    return { kind: "unknown" };
  }
}

export default async function Unsubscribe({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = (await searchParams).token;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const result = await lookup(token);

  const h1 = parseStyle("margin:0; font-family:'Instrument Serif',serif; font-weight:400; font-size:clamp(40px,5.6vw,64px); line-height:1; letter-spacing:-0.03em;");
  const p = parseStyle("margin:20px 0 0; max-width:520px; font-size:16.5px; line-height:1.65; color:#a9a59d; text-wrap:pretty;");

  return (
    <NightShell fontClass={nightFonts} sky="#0A0A0B">
      <GridBg>
        <section style={parseStyle("position:relative; max-width:1160px; margin:0 auto; padding:clamp(140px,14vw,180px) clamp(16px,4vw,40px) clamp(110px,12vw,160px); min-height:56vh;")}>
          <p style={parseStyle("margin:0 0 18px; font-family:'Geist Mono',monospace; font-size:12.5px; letter-spacing:.14em; color:#FF5B1F;")}>WAITLIST</p>

          {result.kind === "found" && (
            <>
              <h1 style={h1}>
                Leave the <span style={parseStyle("font-style:italic; color:#FF5B1F;")}>waitlist?</span>
              </h1>
              <p style={{ ...p, marginBottom: "30px" }}>
                We will delete <strong style={parseStyle("font-weight:600; color:#EDEAE3;")}>{result.email}</strong> and you will not get an invite when a seat opens. You can always sign up again later.
              </p>
              <UnsubscribeButton token={token as string} />
            </>
          )}

          {result.kind === "already" && (
            <>
              <h1 style={h1}>You have already left.</h1>
              <p style={p}>
                That address is off the waitlist. Nothing more to do. <Link href="/">Back to the site</Link>.
              </p>
            </>
          )}

          {(result.kind === "missing" || result.kind === "unknown") && (
            <>
              <h1 style={h1}>This link has expired.</h1>
              <p style={p}>
                We could not match it to anyone on the waitlist. Reply to the email you received and we will remove you by hand. <Link href="/">Back to the site</Link>.
              </p>
            </>
          )}
        </section>
      </GridBg>
    </NightShell>
  );
}
