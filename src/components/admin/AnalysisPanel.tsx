import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { analyzeSubmission, getSubmissionAnalysis } from "@/lib/ai/analyze.functions";
import { getAdminToken } from "@/lib/admin/session";
import { PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { toast } from "sonner";
import { Sparkles, Copy } from "lucide-react";

type Analysis = {
  summary: string | null;
  sentiment: "positive" | "neutral" | "negative" | "urgent" | null;
  category: string | null;
  priority: "low" | "medium" | "high" | null;
  suggested_response: string | null;
  rag_documents_used: { id: string; title: string; category: string }[] | null;
  created_at: string;
};

const SENT_LABEL: Record<string, { label: string; cls: string }> = {
  positive: { label: "חיובי", cls: "bg-green-100 text-green-800" },
  neutral: { label: "ניטרלי", cls: "bg-gray-100 text-gray-800" },
  negative: { label: "שלילי", cls: "bg-orange-100 text-orange-800" },
  urgent: { label: "דחוף", cls: "bg-red-100 text-red-800" },
};
const PRI_LABEL: Record<string, { label: string; cls: string }> = {
  low: { label: "נמוכה", cls: "bg-gray-100 text-gray-800" },
  medium: { label: "בינונית", cls: "bg-yellow-100 text-yellow-800" },
  high: { label: "גבוהה", cls: "bg-red-100 text-red-800" },
};

export function AnalysisPanel({ kind, id }: { kind: "contact" | "volunteer"; id: string }) {
  const qc = useQueryClient();
  const getFn = useServerFn(getSubmissionAnalysis);
  const analyzeFn = useServerFn(analyzeSubmission);
  const [running, setRunning] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["analysis", kind, id],
    queryFn: () => getFn({ data: { token: getAdminToken()!, kind, id } }),
  });
  const a = (data?.analysis ?? null) as Analysis | null;

  const run = async () => {
    setRunning(true);
    try {
      await analyzeFn({ data: { token: getAdminToken()!, kind, id } });
      toast.success("הניתוח הושלם");
      qc.invalidateQueries({ queryKey: ["analysis", kind, id] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const copyResp = async () => {
    if (!a?.suggested_response) return;
    await navigator.clipboard.writeText(a.suggested_response);
    toast.success("הועתק");
  };

  return (
    <div className="border-t border-[#E0D8CC] mt-4 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-[#BA9B78]" />
        <div className="text-sm font-medium text-[#2D1B3D]">ניתוח AI</div>
        <div className="flex-1" />
        {a ? (
          <SecondaryButton onClick={run} disabled={running}>{running ? "מנתח…" : "נתח מחדש"}</SecondaryButton>
        ) : (
          <PrimaryButton onClick={run} disabled={running || isLoading}>{running ? "מנתח…" : "נתח ב-AI"}</PrimaryButton>
        )}
      </div>

      {!a && !running && !isLoading && (
        <div className="text-xs text-[#A0907A]">עדיין לא בוצע ניתוח. לחצי "נתח ב-AI" כדי לקבל תקציר, עדיפות והמלצת פעולה פנימית לצוות.</div>
      )}

      {a && (
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-2 items-center">
            {a.sentiment && SENT_LABEL[a.sentiment] && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${SENT_LABEL[a.sentiment].cls}`}>{SENT_LABEL[a.sentiment].label}</span>
            )}
            {a.priority && PRI_LABEL[a.priority] && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${PRI_LABEL[a.priority].cls}`}>עדיפות {PRI_LABEL[a.priority].label}</span>
            )}
            {a.category && <span className="px-2 py-0.5 rounded-full text-xs bg-[#BA9B78]/15 text-[#2D1B3D]">{a.category}</span>}
          </div>
          {a.summary && (
            <div>
              <div className="text-xs text-[#A0907A] mb-1">תקציר הפנייה</div>
              <div className="text-[#2D1B3D]">{a.summary}</div>
            </div>
          )}
          {a.suggested_response && (
            <div>
              <div className="flex items-center gap-2 text-xs text-[#A0907A] mb-1">
                <span>המלצת פעולה לצוות (פנימי)</span>
                <button onClick={copyResp} className="hover:text-[#BA9B78]" title="העתק"><Copy className="w-3 h-3" /></button>
              </div>
              <div className="text-[#2D1B3D] whitespace-pre-wrap p-3 rounded-md bg-[#F5F0E8] border border-[#E0D8CC]">{a.suggested_response}</div>
              <div className="text-[11px] text-[#A0907A] mt-1">⚠️ זוהי המלצה פנימית — לא טיוטת תשובה לפונה.</div>
            </div>
          )}
          {a.rag_documents_used && a.rag_documents_used.length > 0 && (
            <div>
              <div className="text-xs text-[#A0907A] mb-1">מסמכי RAG שנכללו בניתוח</div>
              <div className="flex flex-wrap gap-1">
                {a.rag_documents_used.map((d) => (
                  <span key={d.id} className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#E0D8CC] text-[#2D1B3D]">📚 {d.title}</span>
                ))}
              </div>
            </div>
          )}
          <div className="text-xs text-[#A0907A]">נותח ב: {new Date(a.created_at).toLocaleString("he-IL")}</div>
        </div>
      )}
    </div>
  );
}
