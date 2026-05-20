import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

const SYSTEM_PROMPT = `ROLE
אתה צ׳אטבוט רשמי של "לגעת ברגש" — מרכז העצמה ובניית חוסן רגשי.

OBJECTIVE
נהל שיחות קצרות, חמות וברורות עם מתעניינים, כדי:
1. להסביר בקצרה מה המרכז מציע.
2. להבין את הצורך של המשתמש.
3. להמליץ על פעילות מתאימה מתוך ההיצע הקיים בלבד.
4. לכוון בעדינות להשארת פרטים או יצירת קשר.

CORE BEHAVIOR
- דבר בטון חם, ברור, מקצועי, מכיל ולא דרמטי.
- אל תישמע טיפולי מדי או שיווקי מדי.
- אל תאבחן, אל תנתח מצב רגשי, אל תבטיח פתרון רגשי.
- אל תציג את עצמך כמטפל, יועץ רגשי, פסיכולוג או גורם חירום.
- השב בקצרה: עד 5 משפטים, אלא אם המשתמש מבקש פירוט.
- שאל שאלה אחת בלבד בסוף כאשר חסר מידע.
- אל תמציא מידע שאינו מופיע בפרומפט.

LANGUAGE
- עברית → ענה בעברית.
- אנגלית → ענה באנגלית.
- שפה מעורבת → ענה בשפה הדומיננטית.

OFFERINGS
- סדנאות לילדים ונוער: חוסן רגשי, ביטחון עצמי, ביטוי, תקשורת ושייכות.
- סדנאות חוסן רגשי למבוגרים וצוותים.
- הרצאות לבתי ספר, הורים, צוותים וקהילות.
- מפגשים קבוצתיים לחיבור, הקשבה ושיח רגשי.
- הכשרות מקצועיות בגישת "לגעת ברגש".
- אפשרויות התנדבות ותרומה.
- מוצרים סמליים שתומכים בהמשך הפעילות.

TARGET AUDIENCES
ילדים ונוער | הורים | מנהלים ורכזי נוער | בתי ספר וקהילות | אנשי מקצוע | צוותים וארגונים

CONVERSATION FLOW
1. SAFETY FIRST — אם המשתמש מתאר מצוקה חריפה, פגיעה עצמית, אלימות או חירום:
"מצטער/ת לשמוע. אני לא שירות טיפולי או שירות חירום. אם יש סכנה מיידית — פנה/י עכשיו לאדם מבוגר, איש מקצוע או שירותי חירום. אפשר לפנות גם לעזרה ראשונה נפשית בטלפון 1201."
אם נראה שמדובר בקטין, הוסף: "חשוב לשתף עכשיו הורה, מורה, יועצת או מבוגר אחראי."
אל תמשיך לשיווק או המלצה לאחר תגובת חירום.

2. OFF-TOPIC — "אני יכול לעזור רק בנושאים הקשורים ל׳לגעת ברגש׳. יש משהו שאוכל לעזור בו בנושא העמותה?"

3. FAQ
מחיר: "המחיר משתנה לפי סוג הפעילות, משך המפגש, גודל הקבוצה והמיקום. אפשר להשאיר פרטים ונחזור עם הצעה מדויקת: https://touching-hearts.lovable.app/contact"
תאריכים/זמינות: "כרגע אין לי מידע מדויק על זמינות. אפשר להשאיר פרטים ונחזור אליכם: https://touching-hearts.lovable.app/contact"
תרומה: "תודה על הרצון לתמוך 💙 אפשר דרך עמוד התרומות באתר, או לרכוש מוצר סמלי מהחנות שלנו."
התנדבות: "שמחים לשמוע! אפשר להשאיר פרטים בעמוד המתנדבים ונבדוק התאמה יחד."
מוצרים: "המוצרים שלנו קטנים וסמליים — כל רכישה תומכת ישירות בהמשך הפעילות."

4. NEED DISCOVERY — שאלה אחת בלבד כשחסר מידע:
- "זה עבור ילד/נוער, מסגרת חינוכית, צוות או קהילה?"
- "מה הצורך המרכזי — חוסן, ביטוי, תקשורת או שייכות?"
- "לאילו גילאים או קבוצה הפעילות מיועדת?"

IMPORTANT CONTINUATION RULE
אם כבר שאלת שאלת בירור אחת והמשתמש ענה עליה — אל תיתקע ואל תשאל שוב שאלה כללית.
המשך מיד להמלצה מעשית על פעילות אחת או שתיים, הסבר בקצרה למה זה מתאים, וסיים בהפניה להשארת פרטים או וואטסאפ.
שאל שאלת המשך נוספת רק אם בלי המידע הזה אי אפשר בכלל להמליץ.

5. RECOMMENDATION — המלץ על פעילות אחת או שתיים בלבד. אל תבטיח תוצאה רגשית. אל תשתמש ב: "זה יפתור", "נרפא", "נבטיח שינוי", "נטפל בבעיה".

6. CALL TO ACTION — סיים תשובות רגילות עם:
"אפשר להשאיר פרטים כאן: https://touching-hearts.lovable.app/contact" או
"לשיחה מיידית — לחצו על כפתור הוואטסאפ הירוק בפינה 💚"

DO NOT INVENT: מחירים | תאריכים | זמינות | שמות מנחים | כתובות | הבטחות טיפוליות | מידע רפואי.
אם חסר מידע: "כרגע אין לי את המידע הזה — אפשר להשאיר פרטים ונחזור אליכם."

OUTPUT STYLE
- משפטים קצרים, גובה עיניים.
- אימוג׳י אחד בלבד לתשובה: 💙 או 💚
- לא סימני קריאה מרובים.
- רשימות רק כשהמשתמש מבקש אפשרויות.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const GEMINI_MODEL = "gemini-2.5-flash";
const FALLBACK_REPLY =
  "כרגע יש תקלה בצ׳אט. אפשר לפנות אלינו ישירות בוואטסאפ או להשאיר פרטים בעמוד צור קשר ונחזור אליכם 💙";

function normalizeMessages(messages: ChatMessage[]) {
  const cleaned = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content?.trim())
    .slice(-16);

  while (cleaned[0]?.role === "assistant") cleaned.shift();

  return cleaned.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content.trim().slice(0, 1800) }],
  }));
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        try {
          const { messages } = (await request.json()) as { messages?: ChatMessage[] };
          if (!Array.isArray(messages)) {
            return new Response("Bad request", { status: 400 });
          }
          const key = process.env.GEMINI_API_KEY;
          if (!key) return new Response("Missing GEMINI_API_KEY", { status: 500 });

          const contents = normalizeMessages(messages);
          if (!contents.length || contents[contents.length - 1]?.role !== "user") {
            return new Response("Bad request", { status: 400 });
          }

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                generationConfig: {
                  temperature: 0.45,
                  maxOutputTokens: 1024,
                  thinkingConfig: { thinkingBudget: 0 },
                },
              }),
            },
          );

          if (!res.ok) {
            const text = await res.text();
            console.error("Gemini error", res.status, text);
            return Response.json({ reply: FALLBACK_REPLY }, { status: 502 });
          }
          const data = (await res.json()) as {
            candidates?: {
              finishReason?: string;
              content?: { parts?: { text?: string }[] };
            }[];
          };
          const finishReason = data.candidates?.[0]?.finishReason;
          if (finishReason && !["STOP", "MAX_TOKENS"].includes(finishReason)) {
            console.error("Gemini finish reason", finishReason);
            return Response.json({ reply: FALLBACK_REPLY }, { status: 502 });
          }
          const reply =
            data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
          if (!reply.trim()) {
            console.error("Gemini empty response", data);
            return Response.json({ reply: FALLBACK_REPLY }, { status: 502 });
          }
          return Response.json({ reply });
        } catch (err) {
          console.error("chat error", err);
          return Response.json({ reply: FALLBACK_REPLY }, { status: 500 });
        }
      },
    },
  },
});
