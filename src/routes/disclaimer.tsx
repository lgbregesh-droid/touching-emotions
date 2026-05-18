import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "דיסקליימר | לגעת ברגש" },
      { name: "description", content: "פעילות לגעת ברגש איננה תחליף לטיפול נפשי או רפואי." },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <article className="py-10 md:py-14 px-6 bg-[#F5F0E8]" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-xl border border-[#E0D8CC] p-6 md:p-8 text-[#4A3D30] leading-relaxed space-y-4">
          <header>
            <h1 className="text-2xl md:text-3xl font-light text-[#2D1B3D] mb-3">דיסקליימר — אינו טיפול</h1>
            <p className="text-xs text-[#A0907A]">עודכן לאחרונה: מאי 2026</p>
          </header>

          <p className="text-lg">
            התכנים, הסדנאות, ההרצאות והפעילויות של לגעת ברגש <strong>אינם מהווים
            טיפול נפשי, אבחון, ייעוץ רפואי או תחליף לפנייה לאיש מקצוע מוסמך</strong>.
          </p>
          <p>
            פעילות העמותה מתמקדת בחיזוק חוסן רגשי, יצירת מרחב לשיח והקשבה,
            וכלים לביטוי רגשי במסגרות קבוצתיות וחווייתיות.
          </p>
          <p>
            במקרה של מצוקה חריפה, סכנה מיידית או חירום — יש לפנות לאדם מבוגר
            אחראי, איש מקצוע מוסמך, או לשירותי חירום.
          </p>
        </div>

        <EmergencyBox />
      </div>
    </article>
  );
}

export function EmergencyBox() {
  return (
    <aside
      className="rounded-2xl border-2 border-[#BA9B78]/40 bg-[#F0F5F3] p-6 md:p-8 text-[#2D1B3D]"
      dir="rtl"
      role="note"
      aria-label="הודעת חירום"
    >
      <h2 className="text-lg md:text-xl font-medium mb-2">במקרה של מצוקה או חירום</h2>
      <p className="text-[13px] leading-relaxed leading-relaxed">
        לגעת ברגש איננה שירות חירום או טיפול נפשי. במקרה של סכנה מיידית או
        מצוקה חריפה יש לפנות לשירותי חירום או לעזרה ראשונה נפשית בטלפון{" "}
        <a href="tel:1201" className="font-semibold text-[#4E8C85] underline">1201</a>{" "}
        (ער״ן — עזרה ראשונה נפשית), או למוקד החירום{" "}
        <a href="tel:101" className="font-semibold text-[#4E8C85] underline">101</a>.
      </p>
    </aside>
  );
}
