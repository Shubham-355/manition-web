import type { Metadata } from "next";
import Link from "next/link";
import { parseStyle } from "../lib/css";
import { prisma } from "../lib/prisma";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
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

  return (
    <div
      style={parseStyle(
        "font-family:'IBM Plex Sans',ui-sans-serif,system-ui; color:#16161a; background:#f7f6f3; overflow-x:hidden; display:flex; flex-direction:column; min-height:100vh;",
      )}
    >
      <Nav />

      <section
        style={parseStyle(
          "flex:1; max-width:1120px; width:100%; margin:0 auto; padding:80px 30px 90px;",
        )}
      >
        <p
          style={parseStyle(
            "font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#3b62e0; margin:0 0 16px;",
          )}
        >
          Waitlist
        </p>

        {result.kind === "found" && (
          <>
            <h1
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(30px,5.6vw,44px); line-height:1.05; letter-spacing:-0.035em;",
              )}
            >
              Leave the waitlist?
            </h1>
            <p
              style={parseStyle(
                "margin:18px 0 30px; max-width:520px; font-size:16.5px; line-height:1.65; color:#54545c; text-wrap:pretty;",
              )}
            >
              We will delete{" "}
              <strong style={parseStyle("font-weight:600; color:#16161a;")}>
                {result.email}
              </strong>{" "}
              and you will not get an invite when a seat opens. You can always
              sign up again later.
            </p>
            <UnsubscribeButton token={token as string} />
          </>
        )}

        {result.kind === "already" && (
          <>
            <h1
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(30px,5.6vw,44px); line-height:1.05; letter-spacing:-0.035em;",
              )}
            >
              You have already left.
            </h1>
            <p
              style={parseStyle(
                "margin:18px 0 0; max-width:520px; font-size:16.5px; line-height:1.65; color:#54545c;",
              )}
            >
              That address is off the waitlist. Nothing more to do.{" "}
              <Link href="/">Back to the site</Link>.
            </p>
          </>
        )}

        {(result.kind === "missing" || result.kind === "unknown") && (
          <>
            <h1
              style={parseStyle(
                "margin:0; font-family:'Space Grotesk'; font-weight:700; font-size:clamp(30px,5.6vw,44px); line-height:1.05; letter-spacing:-0.035em;",
              )}
            >
              This link has expired.
            </h1>
            <p
              style={parseStyle(
                "margin:18px 0 0; max-width:520px; font-size:16.5px; line-height:1.65; color:#54545c; text-wrap:pretty;",
              )}
            >
              We could not match it to anyone on the waitlist. Reply to the email
              you received and we will remove you by hand.{" "}
              <Link href="/">Back to the site</Link>.
            </p>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
