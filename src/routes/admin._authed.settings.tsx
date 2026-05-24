import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton } from "@/components/admin/AdminShell";
import { cmsList, cmsUpsert } from "@/lib/admin/cms.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/settings")({
  head: () => ({ meta: [{ title: "הגדרות אתר | ניהול" }] }),
  component: SettingsAdmin,
});

type Row = { id: string; key: string; label: string | null; value: string | null; type: string };

// Helper text + grouping. Keys not in this map appear under "אחר".
const HELP: Record<string, { group: string; help: string }> = {
  site_name: { group: "כללי", help: "שם העמותה כפי שמופיע בכותרת הדפדפן ובמטא-תגיות." },
  site_subtitle: { group: "כללי", help: "תת־כותרת קצרה (אופציונלי) למטא-תיאורים." },
  phone: { group: "פרטי קשר", help: "מופיע בעמוד צור קשר ובקישורי טלפון באתר." },
  whatsapp_number: { group: "פרטי קשר", help: "כולל קידומת בינלאומית, ללא + או רווחים. משמש בכפתור הוואטסאפ הצף, בעמוד צור קשר, בפוטר ובכל קישורי וואטסאפ." },
  email: { group: "פרטי קשר", help: "אימייל ציבורי ליצירת קשר. מופיע בפוטר ובעמוד צור קשר." },
  owner_email: { group: "פרטי קשר", help: "אימייל פנימי לקבלת התראות על פניות חדשות (לא מוצג באתר)." },
  facebook_url: { group: "רשתות חברתיות", help: "קישור מלא לדף הפייסבוק. מופיע בפוטר ובעמוד צור קשר." },
  instagram_url: { group: "רשתות חברתיות", help: "קישור מלא לאינסטגרם." },
  donation_link: { group: "תרומות", help: "קישור חיצוני לתרומה (אם קיים). אם ריק — נשתמש בעמוד התרומות הפנימי." },
  association_number: { group: "פוטר ומשפטי", help: "מספר עמותה — מופיע בפוטר ובמסמכים משפטיים." },
  footer_text: { group: "פוטר ומשפטי", help: "שורת זכויות יוצרים בתחתית האתר." },
  accessibility_statement_url: { group: "פוטר ומשפטי", help: "קישור להצהרת הנגישות." },
  privacy_policy_url: { group: "פוטר ומשפטי", help: "קישור למדיניות הפרטיות." },
  ai_enabled: { group: "AI ואוטומציה", help: "הפעלה כללית של מנוע ה-AI." },
  ai_analysis_enabled: { group: "AI ואוטומציה", help: "הפעלת ניתוח אוטומטי של פניות נכנסות." },
  ai_provider: { group: "AI ואוטומציה", help: "ספק ה-AI (gemini)." },
  gemini_model: { group: "AI ואוטומציה", help: "שם מודל ה-Gemini, למשל google/gemini-2.5-flash." },
  email_notifications_enabled: { group: "AI ואוטומציה", help: "שליחת התראות אימייל על פניות חדשות." },
  chatbot_enabled: { group: "AI ואוטומציה", help: "הצגת כפתור הצ׳אטבוט באתר." },
};

const GROUP_ORDER = ["כללי", "פרטי קשר", "רשתות חברתיות", "תרומות", "פוטר ומשפטי", "AI ואוטומציה", "אחר"];

function SettingsAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(cmsList);
  const saveFn = useServerFn(cmsUpsert);

  const { data, isLoading } = useQuery({
    queryKey: ["cms", "site_settings"],
    queryFn: () => listFn({ data: { token: getAdminToken()!, table: "site_settings" } }),
  });
  const rows = (data?.rows || []) as Row[];

  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const m: Record<string, string> = {};
    for (const r of rows) m[r.id] = r.value || "";
    setEdits(m);
  }, [data]);

  const dirty = rows.some((r) => (edits[r.id] ?? "") !== (r.value || ""));

  const save = async () => {
    setSaving(true);
    try {
      for (const r of rows) {
        if ((edits[r.id] ?? "") === (r.value || "")) continue;
        await saveFn({ data: { token: getAdminToken()!, table: "site_settings", id: r.id, values: { key: r.key, label: r.label, type: r.type, value: edits[r.id] || "" } } });
      }
      toast.success("השינוי נשמר בהצלחה");
      qc.invalidateQueries({ queryKey: ["cms", "site_settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  // Group rows
  const groups: Record<string, Row[]> = {};
  for (const r of rows) {
    const g = HELP[r.key]?.group || "אחר";
    (groups[g] ||= []).push(r);
  }

  return (
    <AdminShell title="הגדרות אתר">
      {isLoading ? (
        <AdminCard><div className="text-sm text-[#A0907A] text-center py-6">טוען...</div></AdminCard>
      ) : (
        <div className="space-y-5">
          {GROUP_ORDER.filter((g) => groups[g]?.length).map((g) => (
            <AdminCard key={g}>
              <h2 className="text-base text-[#2D1B3D] mb-4 font-medium">{g}</h2>
              <div className="space-y-4">
                {groups[g].map((r) => {
                  const help = HELP[r.key]?.help;
                  const isBoolean = r.type === "boolean";
                  return (
                    <div key={r.id}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm text-[#2D1B3D]">{r.label || r.key}</label>
                        <span className="text-[10px] text-[#A0907A] font-mono">{r.key}</span>
                      </div>
                      {r.type === "textarea" ? (
                        <textarea
                          dir="rtl" rows={3}
                          className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm"
                          value={edits[r.id] || ""}
                          onChange={(e) => setEdits({ ...edits, [r.id]: e.target.value })}
                        />
                      ) : isBoolean ? (
                        <select
                          className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm"
                          value={edits[r.id] || "false"}
                          onChange={(e) => setEdits({ ...edits, [r.id]: e.target.value })}
                        >
                          <option value="true">פעיל</option>
                          <option value="false">כבוי</option>
                        </select>
                      ) : (
                        <input
                          dir={r.type === "url" ? "ltr" : "rtl"}
                          placeholder={r.type === "url" ? "https://..." : ""}
                          className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm"
                          value={edits[r.id] || ""}
                          onChange={(e) => setEdits({ ...edits, [r.id]: e.target.value })}
                        />
                      )}
                      {help && <div className="text-xs text-[#A0907A] mt-1.5 leading-relaxed">{help}</div>}
                      {!edits[r.id] && (r.key === "whatsapp_number" || r.key === "email" || r.key === "phone") && (
                        <div className="text-xs text-orange-600 mt-1">⚠ לא הוגדר ערך — הקישור יוסתר באתר.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </AdminCard>
          ))}
          <div className="flex justify-end sticky bottom-4">
            <PrimaryButton onClick={save} disabled={!dirty || saving}>{saving ? "שומר..." : "שמירת הגדרות"}</PrimaryButton>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
