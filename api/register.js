const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");

module.exports = H.handler(["POST"], async (req, res) => {
  const b = await H.body(req);
  const u = A.normUser(b.username);
  const name = String(b.name || "").trim().slice(0, 30);
  const pw = String(b.password || "");
  if(!A.USER_RE.test(u)) return H.err(res, 400, "اسم المستخدم: ٣–٢٠ حرفًا أو رقمًا بدون مسافات");
  if(!name) return H.err(res, 400, "اكتب الاسم الذي يظهر في الترتيب");
  if(pw.length < 4) return H.err(res, 400, "كلمة المرور ٤ أحرف على الأقل");
  if(await db.call("EXISTS", "user:" + u)) return H.err(res, 409, "اسم المستخدم مستخدم من قبل");
  const { salt, hash } = A.hashPassword(pw);
  const user = { u, name, salt, hash, created: Date.now() };
  await db.pipeline([
    ["SET", "user:" + u, JSON.stringify(user)],
    ["SADD", "users", u],
    ["HSET", "names", u, name],
    ["SET", "stats:" + u, JSON.stringify({ quizzes: 0, correct: 0, answered: 0, best: 0, last: null })]
  ]);
  H.ok(res, { token: A.sign({ u, name }), user: { u, name } });
});
