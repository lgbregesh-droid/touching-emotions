import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { getAdminToken } from "@/lib/admin/session";
import {
  generateLinkedInPosts,
  saveLinkedInDraft,
  publishLinkedInPost,
  listLinkedInPosts,
  archiveLinkedInPost,
  listLinkedInContextSources,
} from "@/lib/admin/linkedin.functions";
import { toast } from "sonner";
import {
  Sparkles, Megaphone, CalendarDays, Star, Lightbulb, Sprout, HandHeart,
  Copy, Archive, Eye, Loader2, Send, Save, RefreshCw, AlertTriangle, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/_authed/linkedin")({
  head: () => ({ meta: [{ title: "סוכן לינקדאין | ניהול" }] }),
  component: LinkedInAdmin,
});

const POST_TYPES = [
  { id: "workshop_promo",   label: "קידום סדנה",      desc: "פוסט על סדנה ספציפית מהמערכת",          icon: Megaphone },
  { id: "event_promo",      label: "קידום אירוע",     desc: "פוסט על אירוע קרוב עם קישור לרישום",    icon: CalendarDays },
  { id: "success_story",    label: "סיפור הצלחה",     desc: "סיפור מהשטח על השפעת הסדנה",            icon: Star },
  { id: "educational",      label: "תוכן חינוכי",     desc: "פוסט מקצועי על חוסן רגשי וחינוך רגשי",   icon: Lightbulb },
  { id: "nonprofit_update", label: "עדכון עמותה",     desc: "שיתוף על פעילות, צמיחה או חדשות",       icon: Sprout },
  { id: "volunteer_call",   label: "קריאה למתנדבים",  desc: "גיוס מתנדבים לעמותה",                  icon: HandHeart },
] as const;

type PostType = typeof POST_TYPES[number]["id"];

type Option = {
  id: number;
  he: string; en: string;
  hashtags_he: string[]; hashtags_en: string[];
  hook_he?: string; hook_en?: string;
};

type Row = {
  id: string;
  post_type: string;
  final_text_he: string | null;
  final_text_en: string | null;
  published_language: "he" | "en" | "both" | null;
  linkedin_status: "draft" | "published" | "failed" | "archived";
  linkedin_post_url: string | null;
  created_at: string;
  generated_options: Option[] | null;
  selected_option: number | null;
  context_data: Record<string, unknown> | null;
  error_message?: string | null;
};

function LinkedInAdmin() {
  const [tab, setTab] = useState<"create" | "history">("create");
  return (
    <AdminShell title="סוכן לינקדאין">
      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "create"} onClick={() => setTab("create")}>צור פוסט חדש</TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>היסטוריית פוסטים</TabButton>
      </div>
      {tab === "create" ? <CreateTab /> : <HistoryTab onEdit={() => setTab("create")} />}
    </AdminShell>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-md text-sm transition ${active ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D] hover:bg-[#F5F0E8]"}`}
    >
      {children}
    </button>
  );
}

/* ---------------- CREATE ---------------- */

function CreateTab({ initial }: { initial?: Partial<{ id: string; postType: PostType; options: Option[]; selected: number; finalHe: string; finalEn: string; language: "he" | "en" | "both"; ctx: Record<string, unknown> }> } = {}) {
  const token = getAdminToken()!;
  const listCtxFn = useServerFn(listLinkedInContextSources);
  const genFn = useServerFn(generateLinkedInPosts);
  const saveFn = useServerFn(saveLinkedInDraft);
  const pubFn = useServerFn(publishLinkedInPost);

  const { data: sources } = useQuery({
    queryKey: ["linkedin-sources"],
    queryFn: () => listCtxFn({ data: { token } }),
  });

  const [postType, setPostType] = useState<PostType | null>(initial?.postType ?? null);
  const [ctx, setCtx] = useState<Record<string, string>>((initial?.ctx as Record<string, string>) ?? {});
  const [options, setOptions] = useState<Option[]>(initial?.options ?? []);
  const [selected, setSelected] = useState<number | null>(initial?.selected ?? null);
  const [finalHe, setFinalHe] = useState(initial?.finalHe ?? "");
  const [finalEn, setFinalEn] = useState(initial?.finalEn ?? "");
  const [language, setLanguage] = useState<"he" | "en" | "both">(initial?.language ?? "he");
  const [postId, setPostId] = useState<string | null>(initial?.id ?? null);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const tokenAge = useMemo(() => {
    if (!sources?.token_updated_at) return null;
    const days = Math.floor((Date.now() - new Date(sources.token_updated_at).getTime()) / 86400000);
    return days;
  }, [sources?.token_updated_at]);

  const generate = async () => {
    if (!postType) return;
    setGenerating(true);
    try {
      const r = await genFn({ data: { token, post_type: postType, context: ctx } });
      setOptions(r.options);
      setSelected(r.options[0]?.id ?? null);
      const first = r.options[0];
      if (first) {
        setFinalHe([first.he, (first.hashtags_he ?? []).join(" ")].filter(Boolean).join("\n\n"));
        setFinalEn([first.en, (first.hashtags_en ?? []).join(" ")].filter(Boolean).join("\n\n"));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה ביצירה");
    } finally {
      setGenerating(false);
    }
  };

  const pickOption = (opt: Option) => {
    setSelected(opt.id);
    setFinalHe([opt.he, (opt.hashtags_he ?? []).join(" ")].filter(Boolean).join("\n\n"));
    setFinalEn([opt.en, (opt.hashtags_en ?? []).join(" ")].filter(Boolean).join("\n\n"));
  };

  const saveDraft = async () => {
    if (!postType) return;
    try {
      const r = await saveFn({
        data: {
          token, id: postId ?? undefined,
          post_type: postType, context_data: ctx, generated_options: options,
          selected_option: selected ?? undefined,
          final_text_he: finalHe, final_text_en: finalEn,
          published_language: language,
        },
      });
      setPostId(r.row.id);
      toast.success("נשמר כטיוטה");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בשמירה");
    }
  };

  const publish = async () => {
    if (!postType) return;
    setPublishing(true);
    try {
      // Save first to get post_id
      const saved = await saveFn({
        data: {
          token, id: postId ?? undefined,
          post_type: postType, context_data: ctx, generated_options: options,
          selected_option: selected ?? undefined,
          final_text_he: finalHe, final_text_en: finalEn,
          published_language: language,
        },
      });
      setPostId(saved.row.id);
      const r = await pubFn({
        data: { token, post_id: saved.row.id, text_he: finalHe, text_en: finalEn, language },
      });
      if (r.success) {
        const firstUrl = r.results.find((x) => x.url)?.url;
        toast.success("✓ הפוסט פורסם בהצלחה! 🎉");
        if (firstUrl) {
          setTimeout(() => window.open(firstUrl, "_blank"), 600);
        }
      } else {
        toast.error("הפרסום נכשל. הפוסט נשמר כטיוטה.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה בפרסום");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {tokenAge !== null && tokenAge >= 50 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          ⚠️ טוקן הלינקדאין עודכן לפני {tokenAge} ימים. הטוקן פג תוקף כל 60 יום — יש לחדש אותו ב-Supabase Secrets.
        </div>
      )}

      {/* Step 1 */}
      <AdminCard>
        <StepHeader n={1} title="בחר סוג פוסט" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {POST_TYPES.map((t) => {
            const Icon = t.icon;
            const active = postType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPostType(t.id)}
                className={`text-right p-4 rounded-lg border transition ${active ? "border-[#BA9B78] bg-[#BA9B78]/5 ring-2 ring-[#BA9B78]/30" : "border-[#E0D8CC] hover:border-[#BA9B78]/50 bg-white"}`}
              >
                <Icon className="w-6 h-6 text-[#BA9B78] mb-2" />
                <div className="font-medium text-[#2D1B3D]">{t.label}</div>
                <div className="text-xs text-[#2D1B3D]/60 mt-1">{t.desc}</div>
              </button>
            );
          })}
        </div>
      </AdminCard>

      {/* Step 2 */}
      {postType && (
        <AdminCard>
          <StepHeader n={2} title="הקשר ומידע" />
          <div className="mt-4 space-y-3">
            <ContextFields
              postType={postType}
              ctx={ctx}
              setCtx={setCtx}
              workshops={sources?.workshops ?? []}
              events={sources?.events ?? []}
            />
            <PrimaryButton onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Sparkles className="w-4 h-4 inline ml-1" />}
              <span className="mr-2">{generating ? "יוצר..." : "צור פוסטים"}</span>
            </PrimaryButton>
          </div>
        </AdminCard>
      )}

      {/* Step 3 */}
      {options.length > 0 && (
        <AdminCard>
          <div className="flex items-center justify-between">
            <StepHeader n={3} title="בחר ועורך" />
            <SecondaryButton onClick={generate} disabled={generating}>
              <RefreshCw className="w-4 h-4 inline ml-1" /> צור 3 אפשרויות חדשות
            </SecondaryButton>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
            {options.map((o) => (
              <OptionCard key={o.id} option={o} active={selected === o.id} onPick={() => pickOption(o)} />
            ))}
          </div>

          <div className="mt-6 border-t border-[#E0D8CC] pt-4">
            <div className="text-sm font-medium text-[#2D1B3D] mb-2">עריכת הפוסט הנבחר</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EditableField label="עברית" value={finalHe} onChange={setFinalHe} dir="rtl" />
              <EditableField label="English" value={finalEn} onChange={setFinalEn} dir="ltr" />
            </div>
          </div>
        </AdminCard>
      )}

      {/* Step 4 */}
      {(finalHe || finalEn) && (
        <AdminCard>
          <StepHeader n={4} title="פרסום" />
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <LangRadio v="he" cur={language} onPick={setLanguage}>פרסם בעברית בלבד</LangRadio>
              <LangRadio v="en" cur={language} onPick={setLanguage}>פרסם באנגלית בלבד</LangRadio>
              <LangRadio v="both" cur={language} onPick={setLanguage}>פרסם בשתי השפות</LangRadio>
            </div>
            <div className="flex gap-2 flex-wrap">
              <PrimaryButton onClick={publish} disabled={publishing}>
                {publishing ? <Loader2 className="w-4 h-4 animate-spin inline" /> : <Send className="w-4 h-4 inline ml-1" />}
                <span className="mr-2">{publishing ? "מפרסם..." : "📤 פרסם ללינקדאין"}</span>
              </PrimaryButton>
              <SecondaryButton onClick={saveDraft}><Save className="w-4 h-4 inline ml-1" /> שמור כטיוטה</SecondaryButton>
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

function StepHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#2D1B3D] text-white flex items-center justify-center text-sm font-medium">{n}</div>
      <div className="text-lg font-medium text-[#2D1B3D]">{title}</div>
    </div>
  );
}

function ContextFields({
  postType, ctx, setCtx, workshops, events,
}: {
  postType: PostType;
  ctx: Record<string, string>;
  setCtx: (c: Record<string, string>) => void;
  workshops: { id: string; name_he: string; short_description: string | null }[];
  events: { id: string; title_he: string; date: string; time: string | null }[];
}) {
  const set = (k: string, v: string) => setCtx({ ...ctx, [k]: v });
  const Input = (p: { label: string; k: string; required?: boolean; placeholder?: string }) => (
    <div>
      <label className="block text-sm text-[#2D1B3D] mb-1">{p.label}{p.required && " *"}</label>
      <input value={ctx[p.k] ?? ""} onChange={(e) => set(p.k, e.target.value)} placeholder={p.placeholder}
        className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
    </div>
  );
  const Area = (p: { label: string; k: string; required?: boolean; placeholder?: string }) => (
    <div>
      <label className="block text-sm text-[#2D1B3D] mb-1">{p.label}{p.required && " *"}</label>
      <textarea value={ctx[p.k] ?? ""} onChange={(e) => set(p.k, e.target.value)} rows={4} placeholder={p.placeholder}
        className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm" />
    </div>
  );
  const Select = (p: { label: string; k: string; options: { value: string; label: string }[] }) => (
    <div>
      <label className="block text-sm text-[#2D1B3D] mb-1">{p.label}</label>
      <select value={ctx[p.k] ?? ""} onChange={(e) => set(p.k, e.target.value)}
        className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm bg-white">
        <option value="">— בחר —</option>
        {p.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  switch (postType) {
    case "workshop_promo":
      return (
        <>
          <Select label="בחר סדנה" k="workshop_id" options={workshops.map((w) => ({ value: w.id, label: w.name_he }))} />
          <Area label="הערות נוספות (אופציונלי)" k="notes" placeholder="רוצה להדגיש משהו ספציפי?" />
        </>
      );
    case "event_promo":
      return (
        <>
          <Select label="בחר אירוע" k="event_id" options={events.map((e) => ({ value: e.id, label: `${e.title_he} — ${e.date}` }))} />
          <Area label="הערות נוספות (אופציונלי)" k="notes" />
        </>
      );
    case "success_story":
      return (
        <>
          <Area label="תיאור קצר של הסיפור" k="story" required placeholder="מה קרה? מה השתנה?" />
          <Input label="גיל / קהל (אופציונלי)" k="audience" />
          <div className="text-xs text-[#2D1B3D]/60">שמות ופרטים מזהים ייושמטו אוטומטית על ידי ה-AI</div>
        </>
      );
    case "educational":
      return (
        <>
          <Input label="נושא" k="topic" required placeholder="למשל: חרדת בחינות, גבולות בריאים, ויסות רגשי" />
          <Select label="קהל יעד" k="audience" options={[{ value: "הורים", label: "הורים" }, { value: "מחנכים", label: "מחנכים" }, { value: "כללי", label: "כללי" }]} />
        </>
      );
    case "nonprofit_update":
      return <Area label="מה לשתף" k="share" required />;
    case "volunteer_call":
      return (
        <>
          <Input label="תחומי התנדבות נדרשים (אופציונלי)" k="fields" />
          <Area label="הערות נוספות (אופציונלי)" k="notes" />
        </>
      );
  }
}

function OptionCard({ option, active, onPick }: { option: Option; active: boolean; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className={`text-right p-4 rounded-lg border transition ${active ? "border-[#BA9B78] bg-[#BA9B78]/5 ring-2 ring-[#BA9B78]/30" : "border-[#E0D8CC] bg-white hover:border-[#BA9B78]/50"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[#2D1B3D]">אפשרות {option.id}</span>
        <span className={`text-xs ${active ? "text-[#BA9B78]" : "text-[#2D1B3D]/40"}`}>{active ? "● נבחר" : "בחר"}</span>
      </div>
      <div className="text-xs text-[#2D1B3D]/70 line-clamp-4" dir="rtl">{option.hook_he || option.he.slice(0, 200)}</div>
      <div className="flex flex-wrap gap-1 mt-2">
        {option.hashtags_he.slice(0, 4).map((h) => (
          <span key={h} className="text-[10px] bg-[#F5F0E8] px-2 py-0.5 rounded-full text-[#2D1B3D]/70">{h}</span>
        ))}
      </div>
    </button>
  );
}

function EditableField({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir: "rtl" | "ltr" }) {
  const len = value.length;
  const color = len > 3000 ? "text-red-600" : len > 2800 ? "text-amber-600" : "text-green-600";
  const status = len > 3000 ? "חורג ממגבלת לינקדאין" : len > 2800 ? "מתקרב למגבלה" : "בטווח לינקדאין";
  return (
    <div>
      <label className="block text-sm text-[#2D1B3D] mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        dir={dir}
        className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md text-sm font-mono"
      />
      <div className={`text-xs mt-1 ${color}`}>{len} תווים · {status}</div>
    </div>
  );
}

function LangRadio({ v, cur, onPick, children }: { v: "he" | "en" | "both"; cur: string; onPick: (v: "he" | "en" | "both") => void; children: React.ReactNode }) {
  const active = cur === v;
  return (
    <button onClick={() => onPick(v)}
      className={`px-4 py-2 rounded-md text-sm border transition ${active ? "border-[#BA9B78] bg-[#BA9B78]/10 text-[#2D1B3D]" : "border-[#E0D8CC] bg-white text-[#2D1B3D]/70 hover:border-[#BA9B78]/50"}`}>
      {children}
    </button>
  );
}

/* ---------------- HISTORY ---------------- */

function HistoryTab({ onEdit }: { onEdit: () => void }) {
  const token = getAdminToken()!;
  const qc = useQueryClient();
  const listFn = useServerFn(listLinkedInPosts);
  const archFn = useServerFn(archiveLinkedInPost);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [viewing, setViewing] = useState<Row | null>(null);

  const { data } = useQuery({
    queryKey: ["linkedin-history", filterStatus, filterType],
    queryFn: () => listFn({ data: { token, status: filterStatus || undefined, post_type: filterType || undefined } }),
  });

  const rows = (data?.rows ?? []) as Row[];

  const archive = async (id: string) => {
    await archFn({ data: { token, id } });
    qc.invalidateQueries({ queryKey: ["linkedin-history"] });
    toast.success("הועבר לארכיון");
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("הועתק");
  };

  return (
    <AdminCard>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-[#E0D8CC] rounded-md text-sm bg-white">
          <option value="">כל הסטטוסים</option>
          <option value="draft">טיוטה</option>
          <option value="published">פורסם</option>
          <option value="failed">נכשל</option>
          <option value="archived">בארכיון</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-[#E0D8CC] rounded-md text-sm bg-white">
          <option value="">כל הסוגים</option>
          {POST_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-right text-[#2D1B3D]/60 border-b border-[#E0D8CC]">
              <th className="py-2">תאריך</th>
              <th>סוג</th>
              <th>תקציר</th>
              <th>שפה</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const preview = (r.final_text_he || r.final_text_en || "").slice(0, 80);
              const typeLabel = POST_TYPES.find((p) => p.id === r.post_type)?.label ?? r.post_type;
              return (
                <tr key={r.id} className="border-b border-[#E0D8CC]/50 hover:bg-[#F5F0E8]/30">
                  <td className="py-3 text-xs">{new Date(r.created_at).toLocaleString("he-IL")}</td>
                  <td className="text-xs">{typeLabel}</td>
                  <td className="max-w-[300px] truncate" dir="rtl">{preview}</td>
                  <td className="text-xs">{r.published_language ?? "—"}</td>
                  <td><StatusBadge s={r.linkedin_status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <IconBtn title="צפה" onClick={() => setViewing(r)}><Eye className="w-4 h-4" /></IconBtn>
                      <IconBtn title="העתק" onClick={() => copy(r.final_text_he || r.final_text_en || "")}><Copy className="w-4 h-4" /></IconBtn>
                      {r.linkedin_status !== "archived" && (
                        <IconBtn title="ארכב" onClick={() => archive(r.id)}><Archive className="w-4 h-4" /></IconBtn>
                      )}
                      {r.linkedin_post_url && (
                        <a href={r.linkedin_post_url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-[#F5F0E8] rounded" title="פתח בלינקדאין">
                          <ChevronRight className="w-4 h-4 text-[#BA9B78]" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-[#2D1B3D]/40">אין פוסטים עדיין</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && <ViewModal row={viewing} onClose={() => setViewing(null)} />}
    </AdminCard>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    draft: "bg-gray-100 text-gray-700",
    failed: "bg-red-100 text-red-800",
    archived: "bg-[#F5F0E8] text-[#2D1B3D]/50",
  };
  const lbl: Record<string, string> = { published: "פורסם", draft: "טיוטה", failed: "נכשל", archived: "בארכיון" };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[s] ?? "bg-gray-100"}`}>{lbl[s] ?? s}</span>;
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return <button onClick={onClick} title={title} className="p-1.5 hover:bg-[#F5F0E8] rounded text-[#2D1B3D]/70">{children}</button>;
}

function ViewModal({ row, onClose }: { row: Row; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[#2D1B3D]">פוסט #{row.id.slice(0, 8)}</h3>
          <button onClick={onClose} className="text-[#2D1B3D]/60">✕</button>
        </div>
        {row.final_text_he && (
          <div className="mb-4">
            <div className="text-xs text-[#2D1B3D]/60 mb-1">עברית</div>
            <pre className="whitespace-pre-wrap text-sm bg-[#F5F0E8] p-3 rounded" dir="rtl">{row.final_text_he}</pre>
          </div>
        )}
        {row.final_text_en && (
          <div className="mb-4">
            <div className="text-xs text-[#2D1B3D]/60 mb-1">English</div>
            <pre className="whitespace-pre-wrap text-sm bg-[#F5F0E8] p-3 rounded" dir="ltr">{row.final_text_en}</pre>
          </div>
        )}
        {row.error_message && (
          <div className="text-xs text-red-700 bg-red-50 p-2 rounded">{row.error_message}</div>
        )}
        {row.linkedin_post_url && (
          <a href={row.linkedin_post_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#BA9B78] underline">פתח בלינקדאין →</a>
        )}
      </div>
    </div>
  );
}
