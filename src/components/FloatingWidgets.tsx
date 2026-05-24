import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { useSiteSettings, buildWhatsAppLink } from "@/lib/site-settings";

const CONTACT_URL = "/contact";
const ERROR_MESSAGE =
  "כרגע יש תקלה בצ׳אט. אפשר לפנות אלינו ישירות בוואטסאפ או להשאיר פרטים בעמוד צור קשר ונחזור אליכם 💙";

const OPENING = "שלום! אני הבוט של לגעת ברגש 💙 מה מביא אותך אלינו היום?";

type Msg = { role: "user" | "assistant"; content: string };

export function FloatingWidgets() {
  const { data: settings } = useSiteSettings();
  const whatsappUrl = buildWhatsAppLink(
    settings?.whatsapp_number,
    "שלום, אני רוצה לדעת עוד על עמותת לגעת ברגש",
  );
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: OPENING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener("lgr:open-chat", openHandler);
    return () => window.removeEventListener("lgr:open-chat", openHandler);
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json().catch(() => ({ reply: "" }))) as { reply?: string };
      if (!res.ok) throw new Error(data.reply || (await res.text().catch(() => "Chat error")));
      setMessages((m) => [...m, { role: "assistant", content: data.reply || ERROR_MESSAGE }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: "assistant", content: ERROR_MESSAGE }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat popup */}
      {open && (
        <div
          dir="rtl"
          className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[80] w-[min(360px,calc(100vw-1.5rem))] h-[min(520px,70vh)] bg-white rounded-2xl shadow-2xl border border-[#E0D8CC] flex flex-col overflow-hidden"
          style={{ animation: "chatPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)", transformOrigin: "top" }}
        >
          <style>{`
            @keyframes chatPop {
              from { opacity: 0; transform: translateY(-8px) scale(0.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes dotBounce {
              0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
              40% { transform: translateY(-4px); opacity: 1; }
            }
          `}</style>
          <div
            className="px-4 py-3 flex items-center justify-between text-white"
            style={{ background: "linear-gradient(135deg, #2D1B3D 0%, #4E8C85 100%)" }}
          >
            <span className="text-sm font-medium">💬 שאלו את הבוט שלנו</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/15 transition"
              aria-label="סגור"
            >
              <X size={18} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#F5F0E8]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-[#BA9B78] text-white rounded-br-sm"
                      : "bg-white text-[#2D1B3D] border border-[#E0D8CC] rounded-bl-sm"
                  }`}
                >
                  {m.content}
                  {m.role === "assistant" && m.content === ERROR_MESSAGE && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-[#4E8C85] px-3 py-1 text-xs text-white transition hover:opacity-90"
                      >
                        וואטסאפ
                      </a>
                      <a
                        href={CONTACT_URL}
                        className="rounded-full border border-[#BA9B78] px-3 py-1 text-xs text-[#2D1B3D] transition hover:bg-[#F5F0E8]"
                      >
                        צור קשר
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-white border border-[#E0D8CC] rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[#4E8C85]"
                      style={{ animation: `dotBounce 1.2s ${i * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-2.5 border-t border-[#E0D8CC] bg-white flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="כתבו שאלה..."
              className="flex-1 rounded-full border border-[#E0D8CC] px-4 py-2 text-sm text-[#2D1B3D] placeholder-[#A0907A] outline-none focus:border-[#4E8C85] transition"
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="rounded-full w-10 h-10 flex items-center justify-center text-white disabled:opacity-50 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2D1B3D 0%, #4E8C85 100%)" }}
              aria-label="שלח"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp — bottom-left, next to accessibility button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-4 left-20 z-[95] w-12 h-12 rounded-full shadow-lg bg-[#25D366] text-white flex items-center justify-center transition hover:scale-105 hover:bg-[#1ebe57]"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.27c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.46l-.52-.01c-.18 0-.48.07-.73.34s-.96.94-.96 2.29.99 2.66 1.12 2.84c.14.18 1.95 2.97 4.72 4.17.66.29 1.18.46 1.58.59.66.21 1.27.18 1.75.11.53-.08 1.6-.66 1.83-1.29.23-.63.23-1.17.16-1.29-.07-.12-.25-.18-.52-.32zM16 4C9.37 4 4 9.37 4 16c0 2.11.55 4.17 1.6 5.98L4 28l6.2-1.63A11.93 11.93 0 0 0 16 28c6.63 0 12-5.37 12-12S22.63 4 16 4zm0 21.82a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.68.97.98-3.59-.23-.37A9.8 9.8 0 1 1 16 25.82z" />
        </svg>
        <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-[#2D1B3D] text-white px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">
          וואטסאפ
        </span>
      </a>
    </>
  );
}
