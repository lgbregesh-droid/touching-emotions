import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { listContent, saveContent } from "@/lib/admin/data.functions";
import { cmsUploadImage } from "@/lib/admin/cms.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Upload, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/content")({
  head: () => ({ meta: [{ title: "תוכן האתר | ניהול" }] }),
  component: ContentAdmin,
});

type FieldType = "text" | "image";
type FieldDef = {
  key: string;
  label: string;
  type?: FieldType; // default "text"
  long?: boolean;
  rows?: number;
  defaultHe?: string;
  defaultEn?: string;
  hint?: string;
};

type TabDef = { id: string; label: string; groups: { title?: string; keys: FieldDef[] }[] };

const tabs: TabDef[] = [
  {
    id: "home",
    label: "דף הבית",
    groups: [
      {
        title: "Hero ראשי",
        keys: [
          { key: "home.hero.badge", label: "כיתוב קטן מעל הכותרת", defaultHe: "מרכז לחוסן והעצמה רגשית", defaultEn: "Center for Resilience & Emotional Empowerment" },
          { key: "home.hero.title", label: "כותרת ראשית", defaultHe: "לגעת ברגש. לבנות חוסן מבפנים.", defaultEn: "Touching emotion. Building resilience from within." },
          { key: "home.hero.subtitle", label: "תת-כותרת", long: true, rows: 3, defaultHe: "סדנאות, הרצאות ומפגשים חווייתיים לחיזוק רגשות, ביטחון עצמי, תקשורת ושייכות — לילדים, נוער, מוסדות וקהילות.", defaultEn: "Workshops, lectures and experiential gatherings that strengthen emotions, confidence, communication and belonging — for children, teens, organizations and communities." },
          { key: "home.hero.cta_primary", label: "כפתור ראשי", defaultHe: "לתיאום סדנה או הרצאה", defaultEn: "Book a workshop or lecture" },
          { key: "home.hero.cta_secondary", label: "כפתור משני", defaultHe: "לצפייה בסדנאות", defaultEn: "View workshops" },
        ],
      },
      {
        title: "מי אנחנו (סקשן עליון)",
        keys: [
          { key: "home.about.label", label: "תווית קטנה", defaultHe: "מי אנחנו", defaultEn: "Who we are" },
          { key: "home.about.tagline", label: "סלוגן מודגש", defaultHe: "נוגעים בלב, בונים חוסן, יוצרים שינוי", defaultEn: "Touching hearts, building resilience, creating change" },
          { key: "home.about.text", label: "פסקה עיקרית", long: true, rows: 6, defaultHe: "עמותת לגעת ברגש פועלת מתוך אמונה עמוקה שכל אדם זכאי למרחב רגשי בטוח, מזמין ומאפשר. אנו מתמחים בהעצמה רגשית ובניית חוסן באמצעות סדנאות, מפגשים קבוצתיים ותוכניות מותאמות לילדים, נוער, מוסדות חינוך, ארגונים וקהילות.", defaultEn: "Touching Emotion works from a deep belief that every person deserves a safe, inviting emotional space. We specialize in emotional empowerment and resilience-building through workshops, group meetings and tailored programs for children, teens, schools, organizations and communities." },
          { key: "home.about.pill1", label: "תג 1", defaultHe: "חוסן רגשי", defaultEn: "Emotional resilience" },
          { key: "home.about.pill2", label: "תג 2", defaultHe: "העצמה אישית", defaultEn: "Personal empowerment" },
          { key: "home.about.pill3", label: "תג 3", defaultHe: "שפה רגשית משותפת", defaultEn: "Shared emotional language" },
          { key: "home.quote", label: "ציטוט בכרטיס", long: true, rows: 3, defaultHe: "התחלה של דרך חדשה היא קשה, אבל לא כמו להישאר במצב שלא מתאים לך.", defaultEn: "Starting a new path is hard — but not as hard as staying in a place that doesn't fit you." },
        ],
      },
      {
        title: "קהלי יעד",
        keys: [
          { key: "home.audiences.label", label: "תווית", defaultHe: "למי זה מיועד", defaultEn: "Who it's for" },
          { key: "home.audiences.heading", label: "כותרת", defaultHe: "אנחנו עובדים עם", defaultEn: "We work with" },
        ],
      },
      {
        title: "מה אנחנו מציעים",
        keys: [
          { key: "home.offer.label", label: "תווית", defaultHe: "מה אנחנו מציעים", defaultEn: "What we offer" },
          { key: "home.offer.heading", label: "כותרת", defaultHe: "פעילויות, סדנאות והכשרות", defaultEn: "Activities, workshops & training" },
          { key: "home.offer.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "כל תוכנית מותאמת אישית לקהל היעד, לגיל ולמטרה — בשיתוף איתכם.", defaultEn: "Every program is tailored to the audience, age and goal — together with you." },
        ],
      },
      {
        title: "התהליך",
        keys: [
          { key: "home.process.label", label: "תווית", defaultHe: "איך זה עובד", defaultEn: "How it works" },
          { key: "home.process.heading", label: "כותרת", defaultHe: "התהליך של סדנה איתנו", defaultEn: "What working with us looks like" },
          { key: "home.process.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "אנחנו לא מגיעים עם סדנה מוכנה — אנחנו בונים אותה יחד איתכם.", defaultEn: "We don't show up with a ready-made workshop — we build it together with you." },
        ],
      },
      {
        title: "השפעה",
        keys: [
          { key: "home.impact.label", label: "תווית", defaultHe: "מה משאירים אחרינו", defaultEn: "Our impact" },
          { key: "home.impact.heading", label: "כותרת", defaultHe: "השפעה שמורגשת", defaultEn: "Impact you can feel" },
        ],
      },
      {
        title: "המלצות",
        keys: [
          { key: "home.testimonials.label", label: "תווית", defaultHe: "המלצות", defaultEn: "Testimonials" },
          { key: "home.testimonials.heading", label: "כותרת", defaultHe: "מה אומרים עלינו", defaultEn: "What people say about us" },
        ],
      },
      {
        title: "באנר תמיכה",
        keys: [
          { key: "home.support.label", label: "תווית", defaultHe: "תמיכה בעשייה", defaultEn: "Support our work" },
          { key: "home.support.heading", label: "כותרת", defaultHe: "אפשר לתמוך גם בקטן", defaultEn: "You can support — even in small ways" },
          { key: "home.support.desc", label: "טקסט", long: true, rows: 3, defaultHe: "פריט סמלי, תרומה חד-פעמית או הוראת קבע — כל בחירה מאפשרת לנו להגיע לעוד ילד ולעוד קהילה.", defaultEn: "A symbolic item, a one-time donation or a monthly standing order — every choice helps us reach another child and another community." },
          { key: "home.support.cta", label: "כפתור פריטים", defaultHe: "לפריטים סמליים", defaultEn: "Symbolic items" },
          { key: "home.support.donate_cta", label: "כפתור תרומה", defaultHe: "לתרומה", defaultEn: "Donate" },
        ],
      },
      {
        title: "CTA סופי",
        keys: [
          { key: "home.cta.label", label: "תווית", defaultHe: "צרו קשר", defaultEn: "Get in touch" },
          { key: "home.cta.heading", label: "כותרת", defaultHe: "רוצים להתחיל? אנחנו כאן.", defaultEn: "Ready to begin? We're here." },
          { key: "home.cta.text", label: "טקסט", long: true, rows: 3, defaultHe: "השאירו פרטים ונחזור אליכם תוך 48 שעות עם הצעה מותאמת לקבוצה שלכם.", defaultEn: "Leave your details and we'll get back to you within 48 hours with a tailored proposal." },
          { key: "home.cta.primary", label: "כפתור ראשי", defaultHe: "השאירו פרטים", defaultEn: "Leave details" },
          { key: "home.cta.whatsapp", label: "כפתור וואטסאפ", defaultHe: "וואטסאפ", defaultEn: "WhatsApp" },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "אודות",
    groups: [
      {
        title: "Hero העמוד",
        keys: [
          { key: "about.hero.label", label: "תווית מעל הכותרת", defaultHe: "על לגעת ברגש", defaultEn: "About Us" },
          { key: "about.hero.title", label: "כותרת", defaultHe: "בית רגשי לילדים, לנוער ולקהילות", defaultEn: "An emotional home for children, teens and communities" },
          { key: "about.hero.intro", label: "טקסט הקדמה", long: true, rows: 4, defaultHe: "לגעת ברגש הוא מרכז להעצמה רגשית ולבניית חוסן. אנחנו עובדים עם ילדים, נוער, בתי ספר, ארגונים והורים — דרך סדנאות, הרצאות ותוכניות מותאמות.", defaultEn: "Touching Emotion is a center for emotional empowerment and resilience-building. We work with children, teens, schools, organizations and parents — through workshops, lectures and tailored programs." },
        ],
      },
      {
        title: "תמונות Hero",
        keys: [
          { key: "about.hero.image1", label: "תמונה ראשית (גדולה משמאל)", type: "image", hint: "תמונה אנכית — מומלץ יחס 3:4" },
          { key: "about.hero.image2", label: "תמונה עליונה (ימין)", type: "image", hint: "תמונה ריבועית" },
          { key: "about.hero.image3", label: "תמונה תחתונה (ימין)", type: "image", hint: "תמונה ריבועית" },
        ],
      },
      {
        title: "הסיפור שלנו",
        keys: [
          { key: "about.story.label", label: "תווית", defaultHe: "הסיפור שלנו", defaultEn: "Our Story" },
          { key: "about.story.heading", label: "כותרת", defaultHe: "למה הקמנו את המקום הזה", defaultEn: "Why we built this place" },
          { key: "about.main", label: "טקסט הסיפור", long: true, rows: 10, defaultHe: "לגעת ברגש נולד מתובנה פשוטה: יותר מדי ילדים, נוער ומבוגרים נושאים בתוכם רגשות שאין להם מילים אליהם. הם גדלים בכיתות, במשפחות ובקהילות שלא תמיד נתנו מקום לדבר על מה שקורה בפנים.\n\nהמשימה שלנו היא להכניס מודעות רגשית, ביטוי, חוסן והעצמה אל המקומות שבהם החיים באמת קורים — בתי ספר, תנועות נוער, בתים וקהילות. לא כהרצאה, אלא כחוויה חיה.", defaultEn: "Touching Emotion was born from a simple insight: too many children, teens and adults carry feelings they have no language for. They grow up in classrooms, families and communities that never made room to talk about what's happening inside.\n\nOur mission is to bring emotional awareness, expression, resilience and empowerment into the places where life actually happens — schools, youth groups, family homes and community spaces. Not as a lecture, but as a lived experience." },
        ],
      },
      {
        title: "הגישה שלנו",
        keys: [
          { key: "about.approach.label", label: "תווית", defaultHe: "הגישה שלנו", defaultEn: "Our Approach" },
          { key: "about.approach.heading", label: "כותרת", defaultHe: "ארבעה עוגנים שמובילים כל מפגש", defaultEn: "Four pillars that guide every session" },
        ],
      },
      {
        title: "עם מי אנחנו עובדים",
        keys: [
          { key: "about.audiences.label", label: "תווית", defaultHe: "עם מי אנחנו עובדים", defaultEn: "Who We Work With" },
          { key: "about.audiences.heading", label: "כותרת", defaultHe: "מותאם לכל קהל", defaultEn: "Tailored to each audience" },
        ],
      },
      {
        title: "ציטוט",
        keys: [
          { key: "about.quote", label: "ציטוט", long: true, rows: 3, defaultHe: "התחלה של דרך חדשה היא קשה, אבל לא כמו להישאר במצב שלא מתאים לך.", defaultEn: "Starting a new path is hard — but not as hard as staying in a place that doesn't fit you." },
        ],
      },
      {
        title: "CTA תחתון",
        keys: [
          { key: "about.cta.title", label: "כותרת", defaultHe: "רוצים להבין איזו פעילות מתאימה לכם?", defaultEn: "Want to understand which activity fits you?" },
          { key: "about.cta.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "השאירו פרטים ונחזור אליכם עם הצעה מותאמת אישית.", defaultEn: "Leave your details and we'll get back to you with a tailored suggestion." },
          { key: "about.cta.primary", label: "כפתור", defaultHe: "השאירו פרטים", defaultEn: "Leave details" },
        ],
      },
    ],
  },
  {
    id: "workshops",
    label: "סדנאות",
    groups: [
      {
        title: "Hero",
        keys: [
          { key: "workshops.label", label: "תווית", defaultHe: "סדנאות ופעילויות", defaultEn: "Workshops & Activities" },
          { key: "workshops.title", label: "כותרת", defaultHe: "סדנאות שמותאמות לגיל, לקבוצה ולצורך", defaultEn: "Workshops tailored to age, group and need" },
          { key: "workshops.subtitle", label: "תת-כותרת", long: true, rows: 3, defaultHe: "כל סדנה נבנית יחד איתכם. בחרו לפי קהל יעד, ראו איך התהליך עובד והזמינו מפגש מותאם לבית הספר, לקבוצה או לקהילה שלכם.", defaultEn: "Every workshop is built together with you. Choose by audience, see how it works, and book a tailored session for your school, group or community." },
          { key: "workshops.cta_label", label: "כפתור Hero", defaultHe: "להזמנת סדנה", defaultEn: "Book a workshop" },
        ],
      },
      {
        title: "תהליך ההתאמה",
        keys: [
          { key: "workshops.process.label", label: "תווית", defaultHe: "התהליך", defaultEn: "Our Process" },
          { key: "workshops.process.heading", label: "כותרת", defaultHe: "איך אנחנו מתאימים כל סדנה", defaultEn: "How we adapt every workshop" },
        ],
      },
      {
        title: "מה משתתפים מקבלים",
        keys: [
          { key: "workshops.gains.label", label: "תווית", defaultHe: "מה המשתתפים מקבלים", defaultEn: "What Participants Gain" },
          { key: "workshops.gains.heading", label: "כותרת", defaultHe: "חמישה דברים שיוצאים איתם מהסדנה", defaultEn: "Five things people take with them" },
        ],
      },
      {
        title: "CTA תחתון",
        keys: [
          { key: "workshops.cta.title", label: "כותרת", defaultHe: "רוצים להזמין סדנה מותאמת?", defaultEn: "Want a tailored workshop?" },
          { key: "workshops.cta.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "ספרו לנו על הקבוצה שלכם — ונבנה מפגש שמתאים.", defaultEn: "Tell us about your group — we'll design a session that fits." },
        ],
      },
    ],
  },
  {
    id: "events",
    label: "אירועים",
    groups: [
      {
        title: "Hero",
        keys: [
          { key: "events.label", label: "תווית", defaultHe: "אירועים קרובים", defaultEn: "Upcoming Events" },
          { key: "events.title", label: "כותרת", defaultHe: "מפגשים פתוחים לקהל הרחב", defaultEn: "Open events for the public" },
          { key: "events.subtitle", label: "תת-כותרת", long: true, rows: 3, defaultHe: "הרצאות, סדנאות פתוחות וערבי שיח — בחרו אירוע, הירשמו ונשלח לכם תזכורת לפני המפגש.", defaultEn: "Lectures, open workshops and dialogue evenings — pick an event, register and we'll send you a reminder before the meeting." },
          { key: "events.empty", label: "כשאין אירועים", defaultHe: "כרגע אין אירועים — בקרוב נעדכן באירועים הבאים.", defaultEn: "No events right now — we'll update with the next ones soon." },
        ],
      },
      {
        title: "CTA תחתון",
        keys: [
          { key: "events.cta.title", label: "כותרת", defaultHe: "רוצים להזמין אירוע פרטי?", defaultEn: "Want to host a private event?" },
          { key: "events.cta.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "ספרו לנו על הקבוצה והמטרה — נחזור אליכם עם הצעה מותאמת.", defaultEn: "Tell us about the group and the goal — we'll come back with a tailored proposal." },
        ],
      },
    ],
  },
  {
    id: "volunteers",
    label: "התנדבות",
    groups: [
      {
        title: "Hero",
        keys: [
          { key: "volunteers.label", label: "תווית", defaultHe: "התנדבות", defaultEn: "Volunteer" },
          { key: "volunteers.title", label: "כותרת", defaultHe: "הצטרפו לצוות שנוגע בלב", defaultEn: "Join a team that touches the heart" },
          { key: "volunteers.intro", label: "טקסט הקדמה", long: true, rows: 3, defaultHe: "להתנדב בלגעת ברגש זה להיות חלק מפעילות אמיתית — סדנאות, הרצאות ומפגשים — שמשנה את הדרך שבה ילדים ונוער מרגישים עם עצמם.", defaultEn: "Volunteering with Touching Emotion means being part of real activity — workshops, lectures and community meetings — that changes the way children and teens feel about themselves." },
          { key: "volunteers.cta_label", label: "כפתור Hero", defaultHe: "מילוי טופס", defaultEn: "Fill the form" },
        ],
      },
      {
        title: "תפקידי התנדבות",
        keys: [
          { key: "volunteers.roles.label", label: "תווית", defaultHe: "תפקידי התנדבות", defaultEn: "Volunteer Roles" },
          { key: "volunteers.roles.heading", label: "כותרת", defaultHe: "איך אפשר לעזור", defaultEn: "How you can help" },
        ],
      },
      {
        title: "מה המתנדבים מקבלים",
        keys: [
          { key: "volunteers.gains.label", label: "תווית", defaultHe: "מה מקבלים", defaultEn: "What You Gain" },
          { key: "volunteers.gains.heading", label: "כותרת", defaultHe: "מה המתנדבים מקבלים בחזרה", defaultEn: "What volunteers take with them" },
        ],
      },
      {
        title: "טופס התנדבות",
        keys: [
          { key: "volunteers.form.label", label: "תווית", defaultHe: "טופס התנדבות", defaultEn: "Volunteer Form" },
          { key: "volunteers.form.heading", label: "כותרת", defaultHe: "השאירו פרטים", defaultEn: "Leave your details" },
          { key: "volunteers.form.sub", label: "טקסט", long: true, rows: 2, defaultHe: "נחזור אליכם עם תפקיד שמתאים.", defaultEn: "We'll get back to you with a fitting role." },
        ],
      },
      {
        title: "CTA תחתון",
        keys: [
          { key: "volunteers.cta.title", label: "כותרת", defaultHe: "מעדיפים הודעה מהירה?", defaultEn: "Prefer a quick message?" },
          { key: "volunteers.cta.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "אפשר לפנות אלינו בוואטסאפ וניצור קשר מהר.", defaultEn: "Reach us on WhatsApp and we'll get back fast." },
        ],
      },
    ],
  },
  {
    id: "donations",
    label: "תרומות",
    groups: [
      {
        title: "Hero",
        keys: [
          { key: "donations.label", label: "תווית", defaultHe: "תרומות", defaultEn: "Donate" },
          { key: "donations.title", label: "כותרת", defaultHe: "כל תרומה מגיעה לילד אחד", defaultEn: "Every donation reaches a child" },
          { key: "donations.intro", label: "טקסט הקדמה", long: true, rows: 3, defaultHe: "התרומה שלכם מאפשרת לנו להגיע לעוד ילד, לעוד כיתה, לעוד קהילה — ולהנגיש מענה רגשי איכותי לכל מי שזקוק לו.", defaultEn: "Your donation lets us reach another child, another classroom, another community — and bring quality emotional support to everyone who needs it." },
        ],
      },
      {
        title: "ההשפעה שלכם",
        keys: [
          { key: "donations.impact.label", label: "תווית", defaultHe: "ההשפעה שלכם", defaultEn: "Your Impact" },
        ],
      },
      {
        title: "ציטוט",
        keys: [
          { key: "donations.quote", label: "ציטוט", long: true, rows: 3, defaultHe: "כל תרומה, בכל גודל, פותחת דלת לעוד ילד שירגיש שמקשיבים לו.", defaultEn: "Every donation, no matter the size, opens a door for another child to feel heard." },
        ],
      },
      {
        title: "CTA תחתון",
        keys: [
          { key: "donations.cta.title", label: "כותרת", defaultHe: "מעדיפים לדבר איתנו?", defaultEn: "Prefer to talk to us?" },
          { key: "donations.cta.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "נשמח לשמוע — בטלפון, במייל או בהודעה.", defaultEn: "We'd love to hear from you — by phone, email or message." },
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "צור קשר",
    groups: [
      {
        title: "כותרות הדף",
        keys: [
          { key: "contact.label", label: "תווית", defaultHe: "צרו קשר", defaultEn: "Contact" },
          { key: "contact.heading", label: "כותרת ראשית", defaultHe: "שלחו הודעה", defaultEn: "Send a message" },
        ],
      },
      {
        title: "מה קורה אחר כך",
        keys: [
          { key: "contact.next.label", label: "תווית", defaultHe: "מה קורה אחר כך", defaultEn: "What Happens Next" },
          { key: "contact.next.heading", label: "כותרת", defaultHe: "אחרי ששולחים את הפנייה", defaultEn: "After you send your message" },
        ],
      },
      {
        title: "שאלות נפוצות",
        keys: [
          { key: "contact.faq.label", label: "תווית", defaultHe: "שאלות נפוצות", defaultEn: "FAQ" },
          { key: "contact.faq.heading", label: "כותרת", defaultHe: "שאלות שחוזרות", defaultEn: "Common questions" },
        ],
      },
    ],
  },
  {
    id: "shop",
    label: "תמיכה / מוצרים",
    groups: [
      {
        title: "Hero",
        keys: [
          { key: "shop.label", label: "תווית", defaultHe: "תמיכה בעשייה", defaultEn: "Support Our Work" },
          { key: "shop.title", label: "כותרת", defaultHe: "פריטים קטנים, תמיכה אמיתית", defaultEn: "Small items, real support" },
          { key: "shop.intro", label: "טקסט הקדמה", long: true, rows: 4, defaultHe: "הפריטים שלנו הם לא חנות. הם חפצים סמליים שנושאים את השפה הרגשית שלנו — וכל רכישה עוזרת לנו להגיע לעוד ילדים, נוער וקהילות.", defaultEn: "Our companion items aren't a shop. They're symbolic objects that carry our emotional language — and every purchase helps us reach more children, teens and communities." },
        ],
      },
      {
        title: "למה התמיכה משנה",
        keys: [
          { key: "shop.why.heading", label: "כותרת", defaultHe: "למה התמיכה משנה", defaultEn: "Why support matters" },
          { key: "shop.why.text", label: "טקסט", long: true, rows: 4, defaultHe: "כל סדנה, כל הכשרת צוות, כל ערב הורים — דורשים משאבים אמיתיים. התמיכה שלכם, בין שדרך פריט סמלי ובין שדרך תרומה, מאפשרת לנו להמשיך להגיע לבתי ספר וקהילות שהכי זקוקים.", defaultEn: "Every workshop, every staff training, every parent evening — costs real resources. Your support, whether through a symbolic item or a donation, lets us keep showing up in schools and communities that need it most." },
        ],
      },
      {
        title: "פריטים סמליים",
        keys: [
          { key: "shop.items.label", label: "תווית", defaultHe: "פריטים סמליים", defaultEn: "Symbolic Items" },
          { key: "shop.items.heading", label: "כותרת", defaultHe: "קחו הביתה משהו מהשפה שלנו", defaultEn: "Take a piece of our language home" },
        ],
      },
      {
        title: "דרכים נוספות לתמוך",
        keys: [
          { key: "shop.other.label", label: "תווית", defaultHe: "דרכים נוספות", defaultEn: "Other Ways" },
          { key: "shop.other.heading", label: "כותרת", defaultHe: "עוד דרכים לתמוך", defaultEn: "More ways to support" },
        ],
      },
      {
        title: "CTA תחתון",
        keys: [
          { key: "shop.cta.title", label: "כותרת", defaultHe: "רוצים לתמוך בדרך שמתאימה לכם?", defaultEn: "Want to support in a way that fits you?" },
          { key: "shop.cta.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "ספרו לנו טיפה — נמצא יחד את הדרך שמתאימה.", defaultEn: "Tell us a little — we'll find the right way together." },
        ],
      },
    ],
  },
  {
    id: "gallery",
    label: "גלריה",
    groups: [
      {
        title: "Hero",
        keys: [
          { key: "gallery.label", label: "תווית", defaultHe: "גלריה", defaultEn: "Gallery" },
          { key: "gallery.title", label: "כותרת", defaultHe: "הרגעים שאנחנו יוצרים יחד", defaultEn: "Moments we create together" },
          { key: "gallery.intro", label: "טקסט הקדמה", long: true, rows: 3, defaultHe: "תמונות מהסדנאות, ההרצאות, המפגשים הקהילתיים והפעילויות עם הנוער — חלון קטן לעשייה שאנחנו אוהבים.", defaultEn: "Photos from our workshops, lectures, community gatherings and youth activities — a small window into the work we love." },
        ],
      },
      {
        title: "CTA תחתון",
        keys: [
          { key: "gallery.cta.title", label: "כותרת", defaultHe: "רוצים להזמין פעילות דומה?", defaultEn: "Want to host a similar activity?" },
          { key: "gallery.cta.sub", label: "תת-כותרת", long: true, rows: 2, defaultHe: "ספרו לנו על הקבוצה ונבנה משהו שמתאים.", defaultEn: "Tell us about your group and we'll tailor it." },
        ],
      },
    ],
  },
  {
    id: "footer",
    label: "פוטר",
    groups: [
      {
        keys: [
          { key: "footer.tagline", label: "סלוגן בפוטר", long: true, rows: 2, defaultHe: "מרכז להעצמה רגשית, חוסן ושייכות — לילדים, נוער ולקהילות.", defaultEn: "A center for emotional empowerment, resilience and belonging — for children, teens and communities." },
          { key: "footer.rights", label: "שורת זכויות יוצרים", defaultHe: "© לגעת ברגש — כל הזכויות שמורות.", defaultEn: "© Touching Emotion — All rights reserved." },
        ],
      },
    ],
  },
];

type Row = { key: string; value_he: string | null; value_en: string | null };

function ContentAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listContent);
  const saveFn = useServerFn(saveContent);
  const uploadFn = useServerFn(cmsUploadImage);
  const { data } = useQuery({ queryKey: ["admin-content"], queryFn: () => listFn({ data: { token: getAdminToken()! } }) });

  const [tab, setTab] = useState(tabs[0].id);
  // edits[key] is set only when user explicitly touched the field (override).
  const [edits, setEdits] = useState<Record<string, { he: string; en: string }>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadKey = useRef<string | null>(null);

  // Original DB values, keyed by `key`
  const original = useMemo(() => {
    const map: Record<string, { he: string; en: string }> = {};
    for (const r of (data?.rows || []) as Row[]) map[r.key] = { he: r.value_he || "", en: r.value_en || "" };
    return map;
  }, [data]);

  // Reset edits when tab changes (avoid lingering edits across tabs)
  useEffect(() => { setEdits({}); }, [tab]);

  const current = tabs.find((t) => t.id === tab)!;
  const allKeys = current.groups.flatMap((g) => g.keys);

  const dirty = allKeys.some((f) => {
    const e = edits[f.key];
    if (!e) return false;
    const o = original[f.key] || { he: "", en: "" };
    return e.he !== o.he || e.en !== o.en;
  });

  const valueFor = (f: FieldDef): { he: string; en: string } => {
    const e = edits[f.key];
    if (e) return e;
    const o = original[f.key];
    if (o && (o.he || o.en)) return o;
    return { he: f.defaultHe || "", en: f.defaultEn || "" };
  };

  const setField = (key: string, patch: Partial<{ he: string; en: string }>) => {
    setEdits((p) => {
      const cur = p[key] || valueFor(allKeys.find((k) => k.key === key)!);
      return { ...p, [key]: { he: cur.he, en: cur.en, ...patch } };
    });
  };

  const save = async () => {
    const items = Object.entries(edits)
      .filter(([key]) => allKeys.some((k) => k.key === key))
      .map(([key, v]) => ({ key, value_he: v.he, value_en: v.en }));
    if (items.length === 0) return;
    try {
      await saveFn({ data: { token: getAdminToken()!, items } });
      toast.success("נשמר בהצלחה");
      setEdits({});
      qc.invalidateQueries({ queryKey: ["admin-content"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    } catch (e) { toast.error((e as Error).message); }
  };
  const reset = () => setEdits({});

  const restoreDefault = (f: FieldDef) => {
    setEdits((p) => ({ ...p, [f.key]: { he: f.defaultHe || "", en: f.defaultEn || "" } }));
  };

  const triggerUpload = (key: string) => {
    currentUploadKey.current = key;
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const key = currentUploadKey.current;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file || !key) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("הקובץ גדול מ-5MB"); return; }
    setUploadingKey(key);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onloadend = () => res((r.result as string).split(",")[1]);
        r.onerror = () => rej(r.error);
        r.readAsDataURL(file);
      });
      const out = await uploadFn({ data: { token: getAdminToken()!, table: "media", filename: file.name, contentType: file.type, base64: b64 } });
      setEdits((p) => ({ ...p, [key]: { he: out.url, en: out.url } }));
      toast.success("התמונה הועלתה — אל תשכח/י לשמור");
    } catch (err) { toast.error((err as Error).message); }
    finally { setUploadingKey(null); currentUploadKey.current = null; }
  };

  return (
    <AdminShell title="תוכן האתר">
      <div className="mb-4 p-3 bg-[#FBF4EE] border border-[#E5D5C0] rounded-lg text-xs text-[#4A3D30] leading-relaxed">
        כל בלוק טקסט מציג את הטקסט שמוצג כרגע באתר — אפשר לערוך אותו ישירות ולשמור. שינוי שמור מחליף את הטקסט שמופיע למבקרים.
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm ${t.id === tab ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />

      <div className="space-y-5">
        {current.groups.map((g, gi) => (
          <AdminCard key={gi}>
            {g.title && <div className="text-base font-medium text-[#2D1B3D] mb-4 pb-2 border-b border-[#EDE6DC]">{g.title}</div>}
            <div className="space-y-5">
              {g.keys.map((f) => {
                const v = valueFor(f);
                const isOverride = !!original[f.key]?.he || !!original[f.key]?.en;
                if (f.type === "image") {
                  return (
                    <div key={f.key} className="pb-4 border-b border-[#EDE6DC] last:border-0">
                      <div className="text-sm font-medium text-[#2D1B3D] mb-1">{f.label}</div>
                      {f.hint && <div className="text-xs text-[#A0907A] mb-2">{f.hint}</div>}
                      <div className="flex items-start gap-3">
                        <div className="w-28 h-28 bg-[#EDE6DC] rounded-md overflow-hidden flex-shrink-0 border border-[#E0D8CC]">
                          {v.he ? <img src={v.he} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#A0907A] text-xs">אין תמונה</div>}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input dir="ltr" className={inp} placeholder="URL של תמונה" value={v.he}
                            onChange={(e) => setField(f.key, { he: e.target.value, en: e.target.value })} />
                          <div className="flex gap-2 flex-wrap">
                            <SecondaryButton onClick={() => triggerUpload(f.key)} disabled={uploadingKey === f.key}>
                              <Upload className="w-4 h-4 inline ml-1" />{uploadingKey === f.key ? "מעלה..." : "העלאת תמונה"}
                            </SecondaryButton>
                            {v.he && (
                              <SecondaryButton onClick={() => setField(f.key, { he: "", en: "" })}>הסרה</SecondaryButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                const rows = f.rows || (f.long ? 4 : 2);
                return (
                  <div key={f.key} className="pb-4 border-b border-[#EDE6DC] last:border-0">
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-sm font-medium text-[#2D1B3D] truncate">{f.label}</div>
                        {isOverride ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAE3DA] text-[#7A6A55] flex-shrink-0">ערוך</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F0F5F3] text-[#4E8C85] flex-shrink-0">ברירת מחדל</span>
                        )}
                      </div>
                      {(f.defaultHe || f.defaultEn) && (
                        <button
                          type="button"
                          className="text-[11px] text-[#BA9B78] hover:text-[#2D1B3D] flex items-center gap-1 flex-shrink-0"
                          onClick={() => restoreDefault(f)}
                          title="שחזור לטקסט המקורי"
                        >
                          <RotateCcw className="w-3 h-3" />שחזור מקורי
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <div className="text-[10px] text-[#A0907A] mb-1">עברית</div>
                        <textarea dir="rtl" rows={rows} className={inp}
                          value={v.he}
                          onChange={(e) => setField(f.key, { he: e.target.value })} />
                      </div>
                      <div>
                        <div className="text-[10px] text-[#A0907A] mb-1">English</div>
                        <textarea dir="ltr" rows={rows} className={inp + " text-left"}
                          value={v.en}
                          onChange={(e) => setField(f.key, { en: e.target.value })} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminCard>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-5 sticky bottom-0 bg-[#FDFBF7] py-3 -mx-4 px-4 border-t border-[#EDE6DC]">
        <SecondaryButton onClick={reset} disabled={!dirty}>בטל שינויים</SecondaryButton>
        <PrimaryButton onClick={save} disabled={!dirty}>שמור שינויים</PrimaryButton>
      </div>
    </AdminShell>
  );
}

const inp = "w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm focus:outline-none focus:border-[#BA9B78]";
