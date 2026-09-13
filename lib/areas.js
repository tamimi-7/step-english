/* مناطق النقاط: كل سؤال ينتمي لمنطقة حسب بادئة معرّفه — تُستخدم للتفصيل الشفاف للنقاط */
const AREAS = [
  { key: "gen-vocab", test: id => id.startsWith("gw-"), label: "إنقلش عام · المفردات" },
  { key: "gen-grammar", test: id => id.startsWith("gg-"), label: "إنقلش عام · القواعد" },
  { key: "gen-talk", test: id => id.startsWith("gd-"), label: "إنقلش عام · المحادثة" },
  { key: "gen-verbs", test: id => id.startsWith("vb-"), label: "إنقلش عام · الأفعال" },
  { key: "stories", test: id => id.startsWith("st-"), label: "القصص" },
  { key: "mywords", test: id => id.startsWith("sw-"), label: "كلماتي" },
  { key: "step-coll", test: id => /^c[lgr]-/.test(id), label: "ستيب · التجميعات" },
  { key: "step-vocab", test: id => id.startsWith("v-"), label: "ستيب · المفردات" },
  { key: "step-reading", test: id => /^p/.test(id), label: "ستيب · القراءة" },
  { key: "step-grammar", test: id => /^g\d/.test(id), label: "ستيب · القواعد" },
];
/* نقاط خارج الأسئلة: كلها مسجّلة ومسمّاة حتى يطابق المجموعُ التفصيلَ */
const EXTRAS = {
  events: "مكافآت الفعاليات (×٢)",
  gift: "هدايا شخصية",
  stages: "مكافأة إتمام المراحل",
  battle: "جوائز معركة الكلمات",
  daily: "مكافأة الدخول اليومي",
  comp: "تعويض",
  legacy: "نقاط قبل نظام «نقطة لكل سؤال»",
};
const areaOf = id => { const a = AREAS.find(x => x.test(String(id))); return a ? a.key : "other"; };
const LABELS = Object.assign({ other: "أخرى" }, ...AREAS.map(a => ({ [a.key]: a.label })));
const STAGE_POINTS = 10;
module.exports = { AREAS, EXTRAS, LABELS, areaOf, STAGE_POINTS };
