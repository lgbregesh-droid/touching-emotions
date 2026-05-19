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
      toast.success("ההגדרות נשמרו");
      qc.invalidateQueries({ queryKey: ["cms", "site_settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  return (
    <AdminShell title="הגדרות אתר">
      <AdminCard>
        {isLoading ? (
          <div className="text-sm text-[#A0907A] text-center py-6">טוען...</div>
        ) : (
          <div className="space-y-4">
            {rows.map((r) => (
              <div key={r.id}>
                <div className="text-xs text-[#A0907A] mb-1">{r.label || r.key}</div>
                {r.type === "textarea" ? (
                  <textarea
                    dir="rtl" rows={3}
                    className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm"
                    value={edits[r.id] || ""}
                    onChange={(e) => setEdits({ ...edits, [r.id]: e.target.value })}
                  />
                ) : (
                  <input
                    dir={r.type === "url" ? "ltr" : "rtl"}
                    className="w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white text-sm"
                    value={edits[r.id] || ""}
                    onChange={(e) => setEdits({ ...edits, [r.id]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-5">
          <PrimaryButton onClick={save} disabled={!dirty || saving}>{saving ? "שומר..." : "שמירת הגדרות"}</PrimaryButton>
        </div>
      </AdminCard>
    </AdminShell>
  );
}
