// Verifies a signed invitation token (?i=...) and returns which functions it includes.
// Needs the Netlify environment variable INVITE_SECRET.
const crypto = require("crypto");
const IDS = ["bride-mehndi", "groom-mehndi", "barat", "walima"];
const sign = (secret, payload) => crypto.createHmac("sha256", secret).update(payload).digest("hex").slice(0, 12);
const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== "GET") return json(405, { error: "method" });
  const secret = process.env.INVITE_SECRET;
  if (!secret) return json(503, { error: "not_configured" });
  const token = String((event.queryStringParameters || {}).i || "");
  const m = /^([bg])(\d{1,2})-([0-9a-f]{12})$/.exec(token);
  if (!m) return json(400, { error: "invalid" });
  const side = m[1] === "b" ? "bride" : "groom", mask = parseInt(m[2], 10);
  const expected = sign(secret, m[1] + m[2]);
  const a = Buffer.from(expected), b = Buffer.from(m[3]);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return json(404, { error: "invalid" });
  const events = IDS.filter((id, i) => mask & (1 << i));
  if (!events.length || (side === "bride" && events.includes("groom-mehndi")) || (side === "groom" && events.includes("bride-mehndi"))) return json(404, { error: "invalid" });
  return json(200, { side, events });
};
