import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell, AdminCard, PrimaryButton, SecondaryButton } from "@/components/admin/AdminShell";
import {
  listProducts,
  createProduct,
  updateProductById,
  deleteProductById,
  listOrders,
  setOrderShipping,
  deleteOrder,
} from "@/lib/admin/data.functions";
import { getAdminToken } from "@/lib/admin/session";
import { toast } from "sonner";
import { Trash2, Plus, Pencil, X } from "lucide-react";

export const Route = createFileRoute("/admin/_authed/shop")({
  head: () => ({ meta: [{ title: "מוצרים נלווים | ניהול" }] }),
  component: ShopAdmin,
});

type Product = {
  id: string;
  name_he: string;
  name_en?: string | null;
  desc_he?: string | null;
  desc_en?: string | null;
  price: number;
  image_url?: string | null;
  in_stock: boolean;
};
type Order = {
  id: string;
  created_at: string;
  buyer_name: string;
  email?: string | null;
  phone?: string | null;
  quantity: number;
  amount: number;
  shipping_status: "pending" | "shipped" | "delivered";
};

const shipColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
};
const shipLabel: Record<string, string> = { pending: "ממתין לטיפול", shipped: "נשלח", delivered: "נמסר" };

const empty = (): Omit<Product, "id"> => ({
  name_he: "",
  name_en: "",
  desc_he: "",
  desc_en: "",
  price: 0,
  image_url: "",
  in_stock: true,
});

function ShopAdmin() {
  const qc = useQueryClient();
  const listP = useServerFn(listProducts);
  const createP = useServerFn(createProduct);
  const updP = useServerFn(updateProductById);
  const delP = useServerFn(deleteProductById);
  const listOrd = useServerFn(listOrders);
  const setShip = useServerFn(setOrderShipping);
  const delOrd = useServerFn(deleteOrder);

  const { data: pd } = useQuery({ queryKey: ["admin-products"], queryFn: () => listP({ data: { token: getAdminToken()! } }) });
  const { data: od } = useQuery({ queryKey: ["admin-orders"], queryFn: () => listOrd({ data: { token: getAdminToken()! } }) });

  const [editing, setEditing] = useState<{ id?: string; values: Omit<Product, "id"> } | null>(null);

  const products = (pd?.rows || []) as Product[];

  const save = async () => {
    if (!editing) return;
    if (!editing.values.name_he.trim()) { toast.error("יש למלא שם מוצר"); return; }
    try {
      const values = { ...editing.values, price: Number(editing.values.price) || 0 };
      if (editing.id) {
        await updP({ data: { token: getAdminToken()!, id: editing.id, values } });
      } else {
        await createP({ data: { token: getAdminToken()!, values } });
      }
      toast.success("נשמר");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("למחוק מוצר?")) return;
    try {
      await delP({ data: { token: getAdminToken()!, id } });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const cycleShip = async (o: Order) => {
    const next = o.shipping_status === "pending" ? "shipped" : o.shipping_status === "shipped" ? "delivered" : "pending";
    await setShip({ data: { token: getAdminToken()!, id: o.id, status: next } });
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  };
  const removeOrd = async (id: string) => {
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
    <AdminShell title="מוצרים נלווים">
      <AdminCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light text-[#2D1B3D]">קטלוג מוצרים</h2>
          <PrimaryButton onClick={() => setEditing({ values: empty() })}>
            <span className="inline-flex items-center gap-1"><Plus className="w-4 h-4" />הוסף מוצר</span>
          </PrimaryButton>
        </div>

        {products.length === 0 && <div className="text-sm text-[#A0907A] py-6 text-center">אין מוצרים. הוסיפו את הראשון.</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border border-[#E0D8CC] rounded-xl overflow-hidden bg-white flex flex-col">
              <div className="aspect-video bg-[#F5F0E8] flex items-center justify-center overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.name_he} className="w-full h-full object-cover" />
                  : <span className="text-xs text-[#A0907A]">אין תמונה</span>}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-normal text-[#2D1B3D]">{p.name_he}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.in_stock ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{p.in_stock ? "זמין" : "אזל"}</span>
                </div>
                {p.desc_he && <p className="text-xs text-[#A0907A] mt-1 line-clamp-2">{p.desc_he}</p>}
                <div className="mt-3 text-[#BA9B78] font-medium">₪{Number(p.price).toLocaleString()}</div>
                <div className="mt-3 flex gap-2">
                  <SecondaryButton onClick={() => setEditing({ id: p.id, values: { name_he: p.name_he, name_en: p.name_en || "", desc_he: p.desc_he || "", desc_en: p.desc_en || "", price: Number(p.price), image_url: p.image_url || "", in_stock: p.in_stock } })}>
                    <span className="inline-flex items-center gap-1"><Pencil className="w-3 h-3" />ערוך</span>
                  </SecondaryButton>
                  <button onClick={() => remove(p.id)} className="p-2 text-[#A0907A] hover:text-red-600" aria-label="מחק"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-light text-[#2D1B3D]">{editing.id ? "עריכת מוצר" : "מוצר חדש"}</h3>
              <button onClick={() => setEditing(null)} className="text-[#A0907A] hover:text-[#2D1B3D]"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <Field label="שם מוצר (עברית) *"><input className={inp} value={editing.values.name_he} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, name_he: e.target.value } })} /></Field>
              <Field label="Name (English)" ltr><input dir="ltr" className={inp} value={editing.values.name_en || ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, name_en: e.target.value } })} /></Field>
              <Field label="תיאור"><textarea rows={3} className={inp} value={editing.values.desc_he || ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, desc_he: e.target.value } })} /></Field>
              <Field label="Description" ltr><textarea dir="ltr" rows={3} className={inp} value={editing.values.desc_en || ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, desc_en: e.target.value } })} /></Field>
              <Field label="מחיר ₪"><input type="number" min={0} className={inp} value={editing.values.price} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, price: Number(e.target.value) } })} /></Field>
              <Field label="קישור לתמונה"><input className={inp} value={editing.values.image_url || ""} onChange={(e) => setEditing({ ...editing, values: { ...editing.values, image_url: e.target.value } })} /></Field>
              <Field label="מלאי">
                <button onClick={() => setEditing({ ...editing, values: { ...editing.values, in_stock: !editing.values.in_stock } })} className={`px-4 py-2 rounded-full text-xs ${editing.values.in_stock ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                  {editing.values.in_stock ? "זמין" : "אזל המלאי"}
                </button>
              </Field>
            </div>
            <div className="text-end mt-6 flex gap-2 justify-end">
              <SecondaryButton onClick={() => setEditing(null)}>ביטול</SecondaryButton>
              <PrimaryButton onClick={save}>שמור</PrimaryButton>
            </div>
          </div>
        </div>
      )}

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
                  <td className="py-2 px-2"><button onClick={() => removeOrd(o.id)} className="p-1 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
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
