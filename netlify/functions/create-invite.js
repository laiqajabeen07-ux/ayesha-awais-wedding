// Private dashboard backend: checks a host password and signs invitation tokens.
// Environment variables (Netlify > Site configuration > Environment variables):
//   INVITE_SECRET   long random string used to sign links (required)
//   BRIDE_PASSWORD  password for the bride's account  -> can create Bride's Family links only
//   GROOM_PASSWORD  password for the groom's account  -> can create Groom's Family links only
const crypto = require("crypto");
const IDS = ["bride-mehndi", "groom-mehndi", "barat", "walima"];
const sign = (secret, payload) => crypto.createHmac("sha256", secret).update(payload).digest("hex").slice(0, 12);
const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify(body) });
const same = (x, y) => { const a = crypto.createHash("sha256").update(String(x)).digest(), b = crypto.createHash("sha256").update(String(y)).digest(); return crypto.timingSafeEqual(a, b); };
const PASS = { bride: "BRIDE_PASSWORD", groom: "GROOM_PASSWORD" };

exports.handler = async (event) => {
  const secret = process.env.INVITE_SECRET;
  if (!secret) return json(503, { error: "not_configured" });
  if (event.httpMethod !== "POST") return json(405, { error: "method" });
  let body; try { body = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "bad_request" }); }
  const role = String(body.role || "");
  if (!PASS[role]) return json(400, { error: "role" });
  const expected = process.env[PASS[role]];
  if (!expected) return json(503, { error: "not_configured", detail: PASS[role] + " is not set" });
  if (!same(body.password || "", expected)) { await new Promise(r => setTimeout(r, 800)); return json(401, { error: "wrong_password" }); }
  if (body.check) return json(200, { ok: true, role });                 // login check only
  const side = body.side, events = Array.isArray(body.events) ? body.events : [];
  if (side !== "bride" && side !== "groom") return json(400, { error: "side" });
  if (role !== side) return json(403, { error: "not_your_side" });   // bride account -> bride links only, groom account -> groom links only
  if (events.some(id => !IDS.includes(id))) return json(400, { error: "events" });
  if ((side === "bride" && events.includes("groom-mehndi")) || (side === "groom" && events.includes("bride-mehndi"))) return json(400, { error: "invalid_for_side" });
  const mask = IDS.reduce((m, id, i) => m | (events.includes(id) ? 1 << i : 0), 0);
  if (!mask) return json(400, { error: "no_events" });
  const key = (side === "bride" ? "b" : "g") + mask;
  return json(200, { token: key + "-" + sign(secret, key) });
};
