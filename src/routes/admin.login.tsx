import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adminLogin } from "@/lib/admin/auth.functions";
import { setAdminToken, isAdminAuthed } from "@/lib/admin/session";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "כניסת מנהל | לגעת ברגש" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const nav = useNavigate();
  const login = useServerFn(adminLogin);
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdminAuthed()) nav({ to: "/admin" });
  }, [nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await login({ data: { password: pw } });
      setAdminToken(res.token);
      nav({ to: "/admin" });
    } catch (err) {
      toast.error((err as Error).message || "סיסמה שגויה");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen relative bg-[#2D1B3D] flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(186,155,120,0.18), transparent 70%)" }} />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(78,140,133,0.15), transparent 70%)" }} />
      <div className="relative w-full max-w-md bg-[#F5F0E8] rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-light text-[#2D1B3D] tracking-wider">לגעת ברגש</h1>
          <p className="text-xs text-[#A0907A] tracking-[0.25em] uppercase mt-2">פאנל ניהול</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#2D1B3D] mb-2">סיסמה</label>
            <input
              type="password"
              autoFocus
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-[#E0D8CC] bg-white text-[#2D1B3D] focus:outline-none focus:border-[#BA9B78]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-md bg-[#BA9B78] text-white text-sm hover:bg-[#a78865] disabled:opacity-50 transition"
          >
            {busy ? "טוען..." : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}
