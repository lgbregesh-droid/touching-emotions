import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listIntegrationLogs } from "@/lib/ai/process-submission.functions";
import { getAdminToken } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/_authed/integration-logs")({
  component: IntegrationLogsPage,
});

function IntegrationLogsPage() {
  const fn = useServerFn(listIntegrationLogs);
  const [filter, setFilter] = useState<string>("");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["integration-logs", filter],
    queryFn: () => fn({ data: { token: getAdminToken()!, integration_type: filter || undefined, limit: 200 } }),
  });
  const rows = data?.rows ?? [];

  return (
    <AdminShell title="יומני אינטגרציות">
      <div className="flex gap-3 items-center mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-[#E0D8CC] bg-white text-sm"
        >
          <option value="">כל הסוגים</option>
          <option value="gemini_ai_analysis">ניתוח Gemini AI</option>
          <option value="email_notification">התראות אימייל</option>
          <option value="ai_pipeline">צינור AI</option>
          <option value="rag_extraction">חילוץ RAG</option>
          <option value="ai_analysis">ניתוח AI (legacy)</option>
        </select>
        <button onClick={() => refetch()} className="text-sm text-[#461C5B] underline">רענן</button>
      </div>

      {isLoading ? (
        <div className="text-[#A0907A]">טוען...</div>
      ) : rows.length === 0 ? (
        <div className="text-[#A0907A]">אין יומנים.</div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E0D8CC] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F0E8] text-[#461C5B]">
              <tr>
                <th className="text-right p-3">תאריך</th>
                <th className="text-right p-3">סוג</th>
                <th className="text-right p-3">סטטוס</th>
                <th className="text-right p-3">שגיאה</th>
                <th className="text-right p-3">מטא</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[#E0D8CC] align-top">
                  <td className="p-3 text-xs text-[#666] whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString("he-IL")}
                  </td>
                  <td className="p-3">{r.integration_type}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        r.status === "success"
                          ? "bg-green-100 text-green-800"
                          : r.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-[#a83232] max-w-xs truncate">{r.error_message ?? "—"}</td>
                  <td className="p-3 text-xs text-[#666]">
                    <pre className="whitespace-pre-wrap font-mono text-[10px]">
                      {JSON.stringify(r.metadata ?? {}, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
