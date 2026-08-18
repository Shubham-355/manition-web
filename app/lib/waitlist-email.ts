import "server-only";

const PREHEADER =
  "You're on the list. Your invite lands in this inbox as soon as a seat opens.";

const SUBJECT = "You're on the Manition waitlist";

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://manition.pro";
  return raw.replace(/\/+$/, "");
}

function siteHost(): string {
  return siteUrl().replace(/^https?:\/\//, "");
}

function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

function waitlistEmailText(unsubscribe: string): string {
  const site = siteUrl();
  return [
    "You're on the list.",
    "",
    "Thanks for signing up. Manition turns one sentence of plain language into a rendered math animation. No Python, no timeline, no keyframes. Your invite lands in this inbox as soon as a seat opens.",
    "",
    `Watch a scene get made: ${site}/gallery`,
    "",
    "Sitting tight is the whole job for now. Reply to this email if you want to tell us what you plan to animate first, we read every one.",
    "",
    "Describe the math. Watch it animate.",
    `Gallery ${site}/gallery · Features ${site}/features · Docs ${site}/docs · Blog ${site}/blog`,
    "",
    `You are getting this because you asked for early access at ${siteHost()}.`,
    `Leave the waitlist and we will delete your address: ${unsubscribe}`,
  ].join("\n");
}

function waitlistEmailHtml(unsubscribe: string): string {
  const site = siteUrl();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${SUBJECT}</title>
<!--[if mso]>
<xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
<style>
  body, table, td, p, a, h1 { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  img { border:0; outline:none; }
  @media only screen and (max-width:620px) {
    .m-outer { padding:16px 10px 26px !important; }
    .m-shell { width:100% !important; max-width:100% !important; }
    .m-pad { padding-left:20px !important; padding-right:20px !important; }
    .m-head { padding-top:0 !important; padding-bottom:14px !important; }
    .m-cardtop { padding-top:32px !important; }
    .m-h1 { font-size:32px !important; line-height:35px !important; letter-spacing:-1px !important; }
    .m-lede { font-size:16px !important; line-height:26px !important; }
    .m-cta { padding-top:26px !important; }
    .m-btn { width:100% !important; }
    .m-btnwrap { width:100% !important; }
    .m-btn a { display:block !important; text-align:center !important; padding:16px 18px !important; }
    .m-signoff { padding-top:26px !important; padding-bottom:30px !important; }
    .m-foot { padding:22px 22px 22px !important; }
    .m-footlinks a { display:inline-block !important; padding:4px 0 !important; }
  }
  @media only screen and (max-width:400px) {
    .m-h1 { font-size:28px !important; line-height:31px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#efece7;">

<span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all;">${PREHEADER}</span>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#efece7;">
<tr>
<td align="center" class="m-outer" style="padding:30px 12px 44px;">
<!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;"><tr><td><![endif]-->

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="m-shell" style="width:100%; max-width:600px;">

    <!-- masthead -->
    <tr>
      <td class="m-pad m-head" style="padding:0 28px 14px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="left" width="150" style="width:150px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="26" height="26" align="center" valign="middle" bgcolor="#191920" style="width:26px; height:26px; background:#191920; border:1px solid #3a3a40; border-radius:8px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="9" height="9" style="width:9px; height:9px; border:2px solid #d4d4d8; border-radius:9px; font-size:0; line-height:0;">&nbsp;</td></tr></table>
              </td>
              <td width="9" style="width:9px; font-size:0; line-height:0;">&nbsp;</td>
              <td align="left" style="font-family:Helvetica,Arial,sans-serif; font-size:16px; font-weight:bold; letter-spacing:-0.4px; color:#16161a; mso-line-height-rule:exactly; line-height:20px;">Manition</td>
            </tr>
            </table>
          </td>
          <td align="right" style="font-family:'Courier New',Courier,monospace; font-size:10px; letter-spacing:1.7px; text-transform:uppercase; color:#8b8779; mso-line-height-rule:exactly; line-height:16px;">Waitlist</td>
        </tr>
        </table>
      </td>
    </tr>

    <!-- card -->
    <tr>
      <td bgcolor="#fdfcfa" style="background:#fdfcfa; border:1px solid #e2ddd3; border-radius:20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

          <!-- headline -->
          <tr>
            <td class="m-pad m-cardtop" style="padding:34px 30px 0;">
              <h1 class="m-h1" style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:40px; font-weight:bold; letter-spacing:-1.5px; color:#16161a; mso-line-height-rule:exactly; line-height:43px;">You're on the list.</h1>
              <p class="m-lede" style="margin:20px 0 0; font-family:Helvetica,Arial,sans-serif; font-size:16.5px; color:#54545c; mso-line-height-rule:exactly; line-height:27px;">Thanks for signing up. Manition turns one sentence of plain language into a rendered math animation. No Python, no timeline, no keyframes. Your invite lands in this inbox as soon as a seat opens.</p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="m-pad m-cta" style="padding:26px 30px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="m-btnwrap">
              <tr>
                <td class="m-btn" bgcolor="#16161a" style="background:#16161a; border-radius:12px;">
                  <a href="${site}/gallery" style="display:inline-block; padding:15px 26px; font-family:Helvetica,Arial,sans-serif; font-size:15px; font-weight:bold; color:#f7f6f3; text-decoration:none; border-radius:12px; mso-line-height-rule:exactly; line-height:18px;">Watch a scene get made &nbsp;&rarr;</a>
                </td>
              </tr>
              </table>
            </td>
          </tr>

          <!-- sign off -->
          <tr>
            <td class="m-pad m-signoff" style="padding:28px 30px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td height="1" bgcolor="#ece8e0" style="height:1px; background:#ece8e0; font-size:0; line-height:0;">&nbsp;</td></tr>
              <tr>
                <td style="padding:18px 0 0; font-family:Helvetica,Arial,sans-serif; font-size:14px; color:#6b6b73; mso-line-height-rule:exactly; line-height:22px;">Sitting tight is the whole job for now. Reply to this email if you want to tell us what you plan to animate first, we read every one.</td>
              </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>

    <!-- footer -->
    <tr>
      <td style="padding:18px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#111114" style="background:#111114; border-radius:16px;">
        <tr>
          <td class="m-pad m-foot" style="padding:24px 28px 22px;">
            <p style="margin:0 0 16px; font-family:Helvetica,Arial,sans-serif; font-size:13px; color:#8b8b93; mso-line-height-rule:exactly; line-height:21px;">Describe the math. Watch it animate.</p>
            <p class="m-footlinks" style="margin:0 0 18px; font-family:Helvetica,Arial,sans-serif; font-size:13px; mso-line-height-rule:exactly; line-height:21px;">
              <a href="${site}/gallery" style="color:#c8c8cc; text-decoration:none;">Gallery</a>
              <span style="color:#3a3a42;">&nbsp; &middot; &nbsp;</span>
              <a href="${site}/features" style="color:#c8c8cc; text-decoration:none;">Features</a>
              <span style="color:#3a3a42;">&nbsp; &middot; &nbsp;</span>
              <a href="${site}/docs" style="color:#c8c8cc; text-decoration:none;">Docs</a>
              <span style="color:#3a3a42;">&nbsp; &middot; &nbsp;</span>
              <a href="${site}/blog" style="color:#c8c8cc; text-decoration:none;">Blog</a>
            </p>
            <p style="margin:0; font-family:Helvetica,Arial,sans-serif; font-size:11.5px; color:#6b6b73; mso-line-height-rule:exactly; line-height:19px;">You are getting this because you asked for early access at ${siteHost()}.<br>
              <a href="${unsubscribe}" style="color:#8b8b93; text-decoration:underline;">Leave the waitlist</a> and we will delete your address.</p>
          </td>
        </tr>
        </table>
      </td>
    </tr>

  </table>
<!--[if mso]></td></tr></table><![endif]-->

</td>
</tr>
</table>

</body>
</html>
`;
}

export function renderWaitlistEmail(token: string) {
  const unsubscribe = unsubscribeUrl(token);
  return {
    subject: SUBJECT,
    html: waitlistEmailHtml(unsubscribe),
    text: waitlistEmailText(unsubscribe),
    headers: {
      "List-Unsubscribe": `<${unsubscribe}>`,
    },
  };
}
