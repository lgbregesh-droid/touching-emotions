import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "מדיניות פרטיות | לגעת ברגש" },
      { name: "description", content: "מדיניות הפרטיות של עמותת לגעת ברגש — איזה מידע נאסף, למה ואיך הוא נשמר." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="py-10 md:py-14 px-6 bg-[#F5F0E8]" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-[#E0D8CC] p-6 md:p-8 space-y-4 text-[13px] text-[#4A3D30] leading-relaxed">
        <header>
          <h1 className="text-2xl md:text-3xl font-light text-[#2D1B3D] mb-3">מדיניות פרטיות</h1>
          <p className="text-xs text-[#A0907A]">עודכן לאחרונה: מאי 2026</p>
        </header>

        <p>
          עמותת לגעת ברגש (ע״ר 580795755) מכבדת את פרטיות המשתמשים באתר. מסמך זה
          מסביר איזה מידע נאסף באתר, למה, איך הוא נשמר ומה הזכויות שלך לגביו.
        </p>

        <Section title="איזה מידע נאסף">
          <ul className="list-disc pr-5 space-y-1">
            <li>פרטים שנמסרים בטופס יצירת קשר או טופס התנדבות: שם, טלפון, מייל, הודעה.</li>
            <li>פרטים בעת רישום לאירוע או רכישת מוצר.</li>
            <li>פניות דרך וואטסאפ או מייל ביוזמתך.</li>
            <li>מידע טכני אנונימי שנאסף באמצעות עוגיות וכלי אנליטיקה (סוג דפדפן, דפים שנצפו, זמן שהייה).</li>
          </ul>
        </Section>

        <Section title="למה נאסף המידע">
          <ul className="list-disc pr-5 space-y-1">
            <li>כדי לחזור אליך עם מענה לפנייה.</li>
            <li>כדי לטפל בהרשמה לאירוע או בתרומה/רכישה.</li>
            <li>כדי לשפר את חוויית השימוש באתר.</li>
            <li>כדי לעמוד בדרישות חוק (למשל קבלות, ניהול פנימי).</li>
          </ul>
        </Section>

        <Section title="שיתוף מידע עם צד שלישי">
          <p>
            איננו מוכרים מידע אישי. ייתכן שימוש בספקי שירות חיצוניים לצורך
            תפעול האתר (אחסון, אנליטיקה, סליקת תשלומים, שליחת מיילים). ספקים
            אלה מחויבים לטפל במידע בהתאם להוראתנו ולחוק.
          </p>
        </Section>

        <Section title="זכויותיך">
          <p>
            יש לך זכות לעיין במידע שנשמר עליך, לתקן אותו, או לבקש את מחיקתו.
            לפנייה: <a className="text-[#BA9B78]" href="mailto:l.g.bregesh@gmail.com">l.g.bregesh@gmail.com</a>.
          </p>
        </Section>

        <Section title="ילדים ובני נוער">
          <p>
            פרטים אישיים אודות קטינים יימסרו לעמותה אך ורק על ידי הורה, אפוטרופוס,
            מוסד חינוכי או מבוגר מוסמך אחר. אנא אל תמסרו מידע אישי של קטין ללא
            הסכמת מי שאחראי עליו.
          </p>
        </Section>

        <Section title="עוגיות">
          <p>
            לפרטים על השימוש בעוגיות באתר ראו <Link to="/cookies" className="text-[#BA9B78]">מדיניות עוגיות</Link>.
          </p>
        </Section>

        <Section title="יצירת קשר בנושא פרטיות">
          <p>
            לכל פנייה בנושא פרטיות ניתן לפנות במייל
            <a className="text-[#BA9B78]" href="mailto:l.g.bregesh@gmail.com"> l.g.bregesh@gmail.com</a>.
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
