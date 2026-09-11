const db = require("../lib/db");
const A = require("../lib/auth");
const H = require("../lib/http");

module.exports = H.handler(["POST"], async (req, res) => {
  const b = await H.body(req);
  const u = A.normUser(b.username);
  const user = await db.getJSON("user:" + u);
  if(!user || !A.verifyPassword(String(b.password || ""), user.salt, user.hash)) return H.err(res, 401, "اسم المستخدم أو كلمة المرور غير صحيحة");
  H.ok(res, { token: A.sign({ u: user.u, name: user.name }), user: { u: user.u, name: user.name } });
});
