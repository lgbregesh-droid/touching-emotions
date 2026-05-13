import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { listContent, saveContent } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authed/content")({
  head: () => ({ meta: [{ title: "תוכן האתר | ניהול" }] }),
  component: ContentAdmin,
});

const tabs: { id: string; label: string; keys: { key: string; label: string; long?: boolean }[] }[] = [
  { id: "home", label: "דף הבית", keys: [
    { key: "home.hero.title", label: "כותרת Hero" },
    { key: "home.hero.subtitle", label: "תת-כותרת Hero" },
    { key: "home.about.text", label: "טקסט מי אנחנו", long: true },
    { key: "home.quote", label: "ציטוט", long: true },
    { key: "home.cta.text", label: "טקסט באנר CTA" },
  ]},
  { id: "about", label: "אודות", keys: [
    { key: "about.main", label: "טקסט ראשי", long: true },
  ]},
  { id: "workshops", label: "סדנאות", keys: [
    { key: "workshops.title", label: "כותרת דף" },
    { key: "workshops.subtitle", label: "תת-כותרת" },
  ]},
];

type Row = { key: string; value_he: string | null; value_en: string | null };

function ContentAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listContent);
  const saveFn = useServerFn(saveContent);
  const { data } = useQuery({ queryKey: ["admin-content"], queryFn: () => listFn({ data: { token: getAdminToken()! } }) });

  const [tab, setTab] = useState(tabs[0].id);
  const [edits, setEdits] = useState<Record<string, { he: string; en: string }>>({});

  useEffect(() => {
    const map: Record<string, { he: string; en: string }> = {};
    for (const r of (data?.rows || []) as Row[]) map[r.key] = { he: r.value_he || "", en: r.value_en || "" };
    setEdits(map);
  }, [data]);

  const current = tabs.find((t) => t.id === tab)!;
  const dirty = useMemo(() => {
    const orig: Record<string, Row> = {};
    for (const r of (data?.rows || []) as Row[]) orig[r.key] = r;
    return current.keys.some(({ key }) => {
      const e = edits[key] || { he: "", en: "" };
      const o = orig[key];
      return (e.he || "") !== (o?.value_he || "") || (e.en || "") !== (o?.value_en || "");
    });
  }, [edits, data, current]);

  const save = async () => {
    const items = current.keys.map(({ key }) => ({ key, value_he: edits[key]?.he ?? "", value_en: edits[key]?.en ?? "" }));
    try {
      await saveFn({ data: { token: getAdminToken()!, items } });
      toast.success("נשמר");
      qc.invalidateQueries({ queryKey: ["admin-content"] });
    } catch (e) { toast.error((e as Error).message); }
  };
  const reset = () => {
    const map = { ...edits };
    for (const r of (data?.rows || []) as Row[]) if (current.keys.some((k) => k.key === r.key)) map[r.key] = { he: r.value_he || "", en: r.value_en || "" };
    setEdits(map);
  };

  return (
    <AdminShell title="תוכן האתר">
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm ${t.id === tab ? "bg-[#2D1B3D] text-white" : "bg-white border border-[#E0D8CC] text-[#2D1B3D]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <AdminCard>
        <div className="space-y-4">
          {current.keys.map(({ key, label, long }) => {
            const v = edits[key] || { he: "", en: "" };
            const Comp = long ? "textarea" : "input";
            return (
              <div key={key}>
                <div className="text-xs text-[#A0907A] mb-1">{label}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Comp dir="rtl" rows={long ? 4 : undefined} className={inp + " md:order-1"} value={v.he}
                    onChange={(e) => setEdits({ ...edits, [key]: { ...v, he: e.target.value } })} placeholder="עברית" />
                  <Comp dir="ltr" rows={long ? 4 : undefined} className={inp + " md:order-2 text-left"} value={v.en}
                    onChange={(e) => setEdits({ ...edits, [key]: { ...v, en: e.target.value } })} placeholder="English" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <SecondaryButton onClick={reset} disabled={!dirty}>בטל שינויים</SecondaryButton>
          <PrimaryButton onClick={save} disabled={!dirty}>שמור שינויים</PrimaryButton>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

const inp = "w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm";
