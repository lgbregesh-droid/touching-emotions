import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "model"]),
  text: z.string(),
});

const ChatSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string().trim().min(1).max(1000),
});

const SYSTEM_PROMPT = `אתה עוזר וירטואלי ידידותי של עמותת "לגעת ברגש" — עמותה ישראלית העוסקת בהעצמה ובניית חוסן רגשי.
אתה עוזר למבקרים באתר לקבל מידע על:
- סדנאות חוסן רגשי והעצמה אישית
- תוכניות לבתי ספר וארגונים
- אפשרויות תרומה וסיוע לעמותה
- אפשרויות התנדבות
- דרכי יצירת קשר

עונה תמיד בעברית, בטון חם, אמפתי ומקצועי.
אם שאלה חורגת מתחום העמותה — הפנה בעדינות לצוות.
אל תמציא מידע שאינך יודע — עדיף להפנות לצוות.
תשובות קצרות וממוקדות — עד 3 משפטים בדרך כלל.`;

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE") {
      throw new Error("GEMINI_API_KEY לא מוגדר");
    }

    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "שלום! אני העוזר הווירטואלי של לגעת ברגש. איך אוכל לעזור לך?" }] },
      ...data.history.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      { role: "user", parts: [{ text: data.message }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error: ${err}`);
    }

    const json = await res.json() as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    const reply = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "מצטערת, לא הצלחתי לענות. נסה שוב.";
    return { reply };
  });
