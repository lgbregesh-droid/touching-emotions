import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "תנאי שימוש | לגעת ברגש" },
      { name: "description", content: "תנאי השימוש באתר עמותת לגעת ברגש." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="py-10 md:py-14 px-6 bg-[#F5F0E8]" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-[#E0D8CC] p-6 md:p-8 space-y-4 text-[13px] text-[#4A3D30] leading-relaxed">
        <header>
          <h1 className="text-2xl md:text-3xl font-light text-[#2D1B3D] mb-3">תנאי שימוש</h1>
          <p className="text-xs text-[#A0907A]">עודכן לאחרונה: מאי 2026</p>
        </header>

        <p>
          השימוש באתר של עמותת לגעת ברגש (ע״ר 580795755) כפוף לתנאים שלהלן.
          הגלישה באתר מהווה הסכמה לתנאים אלה.
        </p>

        <Section title="שימוש באתר">
          <p>
            האתר מיועד לשימוש אישי ולא מסחרי. אין לעשות באתר שימוש בלתי חוקי,
            פוגעני, או כזה שעלול לשבש את פעולתו או לפגוע במשתמשים אחרים.
          </p>
        </Section>

        <Section title="קניין רוחני">
          <p>
            כל התכנים באתר — טקסטים, תמונות, סרטונים, סמלילים, עיצוב ושמות —
            הם רכושה של עמותת לגעת ברגש או של בעלי זכויות שאישרו את השימוש בהם.
            אין להעתיק, להפיץ, לשכפל או לעשות בהם שימוש מסחרי ללא אישור מראש
            ובכתב מהעמותה.
          </p>
        </Section>

        <Section title="הגבלת אחריות">
          <p>
            התכנים באתר מובאים כמידע כללי בלבד ואינם מהווים תחליף לייעוץ
            מקצועי. העמותה איננה אחראית לכל נזק, ישיר או עקיף, שייגרם כתוצאה
            משימוש באתר או מהסתמכות על תוכן שמופיע בו.
          </p>
        </Section>

        <Section title="אין הבטחה לתוצאות">
          <p>
            הסדנאות, ההרצאות והפעילויות של העמותה הן תהליכים חווייתיים וקבוצתיים
            המכוונים לחיזוק חוסן רגשי. אין באמור באתר כדי להבטיח תוצאה אישית
            כלשהי לכל משתתף.
          </p>
        </Section>

        <Section title="התכנים — אינפורמטיביים בלבד">
          <p>
            המידע באתר הוא אינפורמטיבי בלבד ואינו מהווה טיפול נפשי, אבחון או
            ייעוץ רפואי. ראו גם <a className="text-[#BA9B78]" href="/disclaimer">דיסקליימר</a>.
          </p>
        </Section>

        <Section title="יצירת קשר">
          <p>
            בכל שאלה ניתן לפנות במייל
            <a className="text-[#BA9B78]" href="mailto:l.g.bregesh@gmail.com"> l.g.bregesh@gmail.com</a>.
          </p>
        </Section>

        <Section title="הדין החל">
          <p>
            על השימוש באתר ועל תנאים אלה חלים דיני מדינת ישראל. סמכות השיפוט
            הבלעדית בכל סכסוך הקשור לאתר תהיה לבתי המשפט המוסמכים במחוז תל אביב.
          </p>
        </Section>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base md:text-lg font-medium text-[#2D1B3D]">{title}</h2>
      <div className="text-[13px] leading-relaxed">{children}</div>
    </section>
  );
}
