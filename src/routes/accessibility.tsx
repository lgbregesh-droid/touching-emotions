import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "הצהרת נגישות | לגעת ברגש" },
      { name: "description", content: "הצהרת הנגישות של אתר עמותת לגעת ברגש." },
    ],
  }),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  return (
    <article className="py-16 md:py-24 px-6 bg-[#F5F0E8]" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#E0D8CC] p-8 md:p-12 space-y-6 text-[#4A3D30] leading-relaxed">
        <header>
          <h1 className="text-3xl md:text-5xl font-extralight text-[#2D1B3D] mb-3">הצהרת נגישות</h1>
          <p className="text-sm text-[#A0907A]">עודכן לאחרונה: מאי 2026</p>
        </header>

        <Section title="המחויבות שלנו">
          <p>
            עמותת לגעת ברגש רואה חשיבות רבה בהנגשת השירותים והמידע לכלל האוכלוסייה,
            לרבות אנשים עם מוגבלות. אנו פועלים להתאים את האתר לדרישות תקן
            ישראלי 5568 ברמה AA, בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות
            (התאמות נגישות לשירות), התשע״ג–2013.
          </p>
        </Section>

        <Section title="התאמות נגישות שבוצעו באתר">
          <ul className="list-disc pr-5 space-y-1">
            <li>מבנה סמנטי תקין (כותרות, רשימות, נקודות עיגון).</li>
            <li>ניווט מלא באמצעות מקלדת.</li>
            <li>טקסט חלופי לתמונות משמעותיות.</li>
            <li>ניגודיות צבעים מותאמת בין טקסט לרקע.</li>
            <li>עיצוב רספונסיבי לטלפון, טאבלט ומחשב.</li>
            <li>תמיכה בכיווניות RTL בעברית.</li>
            <li>טפסים עם תוויות ברורות והודעות שגיאה נגישות.</li>
          </ul>
        </Section>

        <Section title="חלקים שעדיין לא נגישים במלואם">
          <p>
            ייתכן שחלק מהתכנים שהועלו לפני זמן רב, סרטונים חיצוניים או תכנים של
            צד שלישי, אינם נגישים באופן מלא. אנו פועלים לשפר זאת בהדרגה.
          </p>
        </Section>

        <Section title="פנייה בנושא נגישות">
          <p>
            אם נתקלת בבעיית נגישות באתר, או שאתה זקוק להתאמה מסוימת, נשמח לקבל
            פנייה ולטפל בה בהקדם.
          </p>
          <ul className="list-disc pr-5 space-y-1 mt-2">
            <li>רכז/ת נגישות: יעודכן בקרוב</li>
            <li>מייל: <a className="text-[#BA9B78]" href="mailto:l.g.bregesh@gmail.com">l.g.bregesh@gmail.com</a></li>
          </ul>
          <p className="mt-2 text-sm text-[#A0907A]">
            נשתדל לחזור אליכם בתוך 14 ימי עבודה.
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
