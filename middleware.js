/* ملفات الخادم (فيها منطق النقاط وكلمة اليوم) ما تنفتح من المتصفح — تشتغل داخل الـ API بس */
export const config = { matcher: ["/lib/:path*"] };

export default function middleware(){
  return new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
}
