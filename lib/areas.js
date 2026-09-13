/* مناطق النقاط: كل سؤال ينتمي لمنطقة حسب بادئة معرّفه — تُستخدم للتفصيل الشفاف للنقاط */
const AREAS = [
  { key: "golden", test: id => id.startsWith("gh-"), label: "تحدي ساعة الذهب" },
  { key: "gen-vocab", test: id => id.startsWith("gw-"), label: "إنقلش عام · المفردات" },
  { key: "gen-grammar", test: id => id.startsWith("gg-"), label: "إنقلش عام · القواعد" },
  { key: "gen-talk", test: id => id.startsWith("gd-"), label: "إنقلش عام · المحادثة" },
  { key: "gen-verbs", test: id => id.startsWith("vb-"), label: "إنقلش عام · الأفعال" },
  { key: "stories", test: id => /^s[tg]-/.test(id), label: "القصص" },
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
  storybonus: "مكافأة إتمام القصص",
  battle: "جوائز معركة الكلمات",
  comp: "تعويض",
  legacy: "نقاط قبل نظام «نقطة لكل سؤال»",
};
const areaOf = id => { const a = AREAS.find(x => x.test(String(id))); return a ? a.key : "other"; };
const LABELS = Object.assign({ other: "أخرى" }, ...AREAS.map(a => ({ [a.key]: a.label })));
const STAGE_POINTS = 10;
/* مكافأة إتمام القصة (نجاح ٦٠٪ فأكثر في أسئلة الفهم) — تكبر مع المستوى لأن القصة أطول */
const STORY_POINTS = { A1: 6, A2: 8, B1: 10, B2: 12, C1: 14, C2: 16 };
module.exports = { AREAS, EXTRAS, LABELS, areaOf, STAGE_POINTS, STORY_POINTS };
