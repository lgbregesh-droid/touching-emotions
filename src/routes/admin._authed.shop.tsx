import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import { getProduct, updateProduct, listOrders, setOrderShipping, deleteOrder } from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/shop")({
  head: () => ({ meta: [{ title: "חנות | ניהול" }] }),
  component: ShopAdmin,
});

type Product = { name_he: string; name_en?: string | null; desc_he?: string | null; desc_en?: string | null; price: number; image_url?: string | null; in_stock: boolean };
type Order = { id: string; created_at: string; buyer_name: string; email?: string | null; phone?: string | null; quantity: number; amount: number; shipping_status: "pending" | "shipped" | "delivered" };

const shipColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
};
const shipLabel: Record<string, string> = { pending: "ממתין לטיפול", shipped: "נשלח", delivered: "נמסר" };

function ShopAdmin() {
  const qc = useQueryClient();
  const getP = useServerFn(getProduct);
  const updP = useServerFn(updateProduct);
  const listOrd = useServerFn(listOrders);
  const setShip = useServerFn(setOrderShipping);
  const delOrd = useServerFn(deleteOrder);

  const { data: pd } = useQuery({ queryKey: ["admin-product"], queryFn: () => getP({ data: { token: getAdminToken()! } }) });
  const { data: od } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listOrd({ data: { token: getAdminToken()! } }) });

  const [p, setP] = useState<Product | null>(null);
  useEffect(() => { if (pd?.product) setP(pd.product as Product); }, [pd]);

  const save = async () => {
    if (!p) return;
    try {
      await updP({ data: { token: getAdminToken()!, values: { ...p, price: Number(p.price) || 0 } } });
      toast.success("נשמר");
      qc.invalidateQueries({ queryKey: ["admin-product"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const cycleShip = async (o: Order) => {
    const next = o.shipping_status === "pending" ? "shipped" : o.shipping_status === "shipped" ? "delivered" : "pending";
    await setShip({ data: { token: getAdminToken()!, id: o.id, status: next } });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };
  const remove = async (id: string) => {
    if (!confirm("למחוק הזמנה?")) return;
    await delOrd({ data: { token: getAdminToken()!, id } });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };

  const exportCSV = () => {
    const rows = (od?.rows || []) as Order[];
    const lines = [["תאריך", "שם", "מייל", "טלפון", "כמות", "סכום", "משלוח"].join(",")];
    for (const r of rows) lines.push([r.created_at, r.buyer_name, r.email, r.phone, r.quantity, r.amount, shipLabel[r.shipping_status]].map((x) => `"${(x ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="חנות">
      <AdminCard className="mb-6">
        <h2 className="text-lg font-light text-[#2D1B3D] mb-4">עריכת המוצר</h2>
        {p && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <Field label="שם מוצר (עברית)"><input className={inp} value={p.name_he} onChange={(e) => setP({ ...p, name_he: e.target.value })} /></Field>
            <Field label="Product name (English)" ltr><input dir="ltr" className={inp} value={p.name_en || ""} onChange={(e) => setP({ ...p, name_en: e.target.value })} /></Field>
            <Field label="תיאור"><textarea rows={3} className={inp} value={p.desc_he || ""} onChange={(e) => setP({ ...p, desc_he: e.target.value })} /></Field>
            <Field label="Description" ltr><textarea dir="ltr" rows={3} className={inp} value={p.desc_en || ""} onChange={(e) => setP({ ...p, desc_en: e.target.value })} /></Field>
            <Field label="מחיר ₪"><input type="number" min={0} className={inp} value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} /></Field>
            <Field label="קישור לתמונה"><input className={inp} value={p.image_url || ""} onChange={(e) => setP({ ...p, image_url: e.target.value })} /></Field>
            <Field label="מלאי">
              <button onClick={() => setP({ ...p, in_stock: !p.in_stock })}
                className={`px-4 py-2 rounded-full text-xs ${p.in_stock ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                {p.in_stock ? "זמין" : "אזל המלאי"}
              </button>
            </Field>
          </div>
        )}
        <div className="text-end mt-4"><PrimaryButton onClick={save}>שמור שינויים</PrimaryButton></div>
      </AdminCard>

      <AdminCard>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-light text-[#2D1B3D]">הזמנות שנכנסו</h2>
          <SecondaryButton onClick={exportCSV}>ייצוא CSV</SecondaryButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-right text-xs text-[#A0907A] border-b border-[#E0D8CC]">
              <th className="py-2 px-2">תאריך</th><th className="py-2 px-2">שם קונה</th><th className="py-2 px-2">מייל</th><th className="py-2 px-2">טלפון</th>
              <th className="py-2 px-2">כמות</th><th className="py-2 px-2">סכום</th><th className="py-2 px-2">משלוח</th><th></th>
            </tr></thead>
            <tbody>
              {(od?.rows || []).length === 0 && <tr><td colSpan={8} className="py-6 text-center text-[#A0907A]">אין הזמנות עדיין.</td></tr>}
              {((od?.rows || []) as Order[]).map((o) => (
                <tr key={o.id} className="border-b border-[#E0D8CC]/60">
                  <td className="py-2 px-2 text-[#A0907A]">{new Date(o.created_at).toLocaleDateString("he-IL")}</td>
                  <td className="py-2 px-2">{o.buyer_name}</td><td className="py-2 px-2">{o.email || "—"}</td><td className="py-2 px-2">{o.phone || "—"}</td>
                  <td className="py-2 px-2">{o.quantity}</td><td className="py-2 px-2">₪{o.amount}</td>
                  <td className="py-2 px-2">
                    <button onClick={() => cycleShip(o)} className={`px-2 py-1 rounded-full text-xs ${shipColors[o.shipping_status]}`}>{shipLabel[o.shipping_status]}</button>
                  </td>
                  <td className="py-2 px-2"><button onClick={() => remove(o.id)} className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </AdminShell>
  );
}

const inp = "w-full px-3 py-2 border border-[#E0D8CC] rounded-md bg-white";
function Field({ label, children, ltr }: { label: string; children: React.ReactNode; ltr?: boolean }) {
  return <label className={`block ${ltr ? "text-left" : ""}`}><span className="text-xs text-[#A0907A] block mb-1">{label}</span>{children}</label>;
}
