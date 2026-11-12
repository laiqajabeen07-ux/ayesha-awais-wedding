// Server-rendered Open Graph preview for signed guest invitation links.
// Social crawlers read this HTML; browsers are forwarded to the actual invitation.
const crypto = require("crypto");
const IDS = ["bride-mehndi", "groom-mehndi", "barat", "walima"];
const NAMES = {
  "bride-mehndi": "Bride's Mehndi",
  "groom-mehndi": "Groom's Mehndi",
  barat: "Barat",
  walima: "Walima"
};
const sign = (secret, payload) => crypto.createHmac("sha256", secret).update(payload).digest("hex").slice(0, 12);
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));

exports.handler = async event => {
  const token = String((event.queryStringParameters || {}).i || "");
  const match = /^([bg])(\d{1,2})-([0-9a-f]{12})$/.exec(token);
  const secret = process.env.INVITE_SECRET;
  if (!secret || !match) return { statusCode: 404, headers: { "Cache-Control": "no-store" }, body: "Invitation not found" };

  const [, sideCode, maskText, signature] = match;
  const key = sideCode + maskText;
  const expected = sign(secret, key);
  const a = Buffer.from(expected), b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { statusCode: 404, headers: { "Cache-Control": "no-store" }, body: "Invitation not found" };
  }

  const mask = Number(maskText);
  const events = IDS.filter((id, index) => mask & (1 << index));
  const side = sideCode === "b" ? "Bride's Family" : "Groom's Family";
  if (!events.length || (sideCode === "b" && events.includes("groom-mehndi")) ||
      (sideCode === "g" && events.includes("bride-mehndi"))) {
    return { statusCode: 404, headers: { "Cache-Control": "no-store" }, body: "Invitation not found" };
  }

  const origin = "https://ayesha-awais-wedding-invitation.netlify.app";
  const title = "Awais & Ayesha | Wedding Invitation";
  const description = "A special invitation for " + side + ": " + events.map(id => NAMES[id]).join(", ") + ". Join us in celebrating Awais & Ayesha.";
  const image = origin + "/assets/og-share.jpg";
  const destination = origin + "/?i=" + encodeURIComponent(token);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Awais &amp; Ayesha">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(origin + "/.netlify/functions/invite-preview?i=" + token)}">
<meta property="og:image" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Awais and Ayesha wedding invitation cover">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${image}">
<meta http-equiv="refresh" content="0;url=${escapeHtml(destination)}">
<script>location.replace(${JSON.stringify(destination)})</script>
</head><body><p>Opening your <a href="${escapeHtml(destination)}">wedding invitation</a>…</p></body></html>`;
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
    body: html
  };
};
