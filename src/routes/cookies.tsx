import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "מדיניות עוגיות | לגעת ברגש" },
      { name: "description", content: "מדיניות העוגיות (Cookies) של אתר עמותת לגעת ברגש." },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <article className="py-16 md:py-24 px-6 bg-[#F5F0E8]" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-12 space-y-6 text-[#4A3D30] leading-relaxed">
        <header>
          <h1 className="text-3xl md:text-5xl font-extralight text-[#2D1B3D] mb-3">מדיניות עוגיות</h1>
          <p className="text-sm text-[#A0907A]">עודכן לאחרונה: מאי 2026</p>
        </header>

        <Section title="מהן עוגיות?">
          <p>
            עוגיות (Cookies) הן קבצי טקסט קטנים שנשמרים בדפדפן שלך כשאתה מבקר
            באתר. הן עוזרות לזכור העדפות, לשמור הקשר בין דפים, ולשפר את החוויה.
          </p>
        </Section>

        <Section title="סוגי עוגיות באתר">
          <ul className="list-disc pr-5 space-y-2">
            <li>
              <strong>עוגיות חיוניות</strong> — נדרשות לתפעול בסיסי של האתר
              (שפת ממשק, שמירה של הסכמה למדיניות עוגיות). נטענות תמיד.
            </li>
            <li>
              <strong>עוגיות אנליטיקה</strong> — מסייעות לנו להבין איך משתמשים
              באתר (דפים פופולריים, שגיאות). נטענות רק לאחר הסכמתך.
            </li>
            <li>
              <strong>עוגיות שיווק</strong> — אם נשתמש בהן, ישמשו להצגת תוכן
              מותאם. נטענות רק לאחר הסכמתך.
            </li>
          </ul>
        </Section>

        <Section title="ניהול עוגיות">
          <p>
            אפשר לאשר, לסרב או לעדכן את ההסכמה בכל עת דרך הבאנר שמופיע
            בכניסה לאתר. בנוסף, ניתן לחסום עוגיות בהגדרות הדפדפן. חסימת עוגיות
            חיוניות עלולה לפגוע בתפקוד האתר.
          </p>
        </Section>

        <Section title="קישור למדיניות פרטיות">
          <p>
            לפרטים נוספים על המידע שאנו אוספים ראו <Link to="/privacy" className="text-[#BA9B78]">מדיניות פרטיות</Link>.
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl md:text-2xl font-light text-[#2D1B3D]">{title}</h2>
      <div className="text-[15px]">{children}</div>
    </section>
  );
}
