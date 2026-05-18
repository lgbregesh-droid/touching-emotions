import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { sendChatMessage } from "@/lib/chat.functions";

const WHATSAPP_NUMBER = "972XXXXXXXXXX"; // ← החלף במספר הוואטסאפ שלך

type Message = {
  id: number;
  role: "user" | "model";
  text: string;
};

const WELCOME: Message = {
  id: 0,
  role: "model",
  text: "שלום! אני העוזרת הווירטואלית של לגעת ברגש 💜\nאשמח לענות על שאלות על סדנאות, תרומות, התנדבות ועוד.\nאיך אוכל לעזור?",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(1);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: nextId.current++, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 0)
        .map((m) => ({ role: m.role, text: m.text }));

      const { reply } = await sendChatMessage({ data: { history, message: text } });
      setMessages((prev) => [...prev, { id: nextId.current++, role: "model", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "model", text: "מצטערת, הייתה תקלה. נסה שוב או פנה אלינו בוואטסאפ." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("שלום, אשמח לקבל מידע על הפעילויות של לגעת ברגש")}`;

  return (
    <>
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-24 left-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[#BA9B78]/30"
            style={{ height: "min(520px, 75vh)" }}
          >
            {/* Header */}
            <div className="bg-[#2D1B3D] px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#BA9B78]/20 flex items-center justify-center text-lg">💜</div>
              <div className="flex-1">
                <p className="text-[#F5F0E8] text-sm font-medium leading-none">עוזרת לגעת ברגש</p>
                <p className="text-[#BA9B78] text-xs mt-0.5">מענה מיידי</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition-colors p-1 rounded-lg hover:bg-white/10"
                aria-label="סגור צ'אט"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-[#F5F0E8] px-3 py-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#2D1B3D] text-[#F5F0E8] rounded-br-sm"
                        : "bg-white text-[#4A3D30] rounded-bl-sm shadow-sm border border-[#BA9B78]/15"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-end">
                  <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm border border-[#BA9B78]/15">
                    <Loader2 size={16} className="text-[#BA9B78] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* WhatsApp banner */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border-t border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366] flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs text-[#1a9950] font-medium">רוצה לדבר עם אדם אמיתי? כתוב לנו בוואטסאפ</span>
              <span className="mr-auto text-[#25D366] text-xs">←</span>
            </a>

            {/* Input */}
            <div className="bg-white border-t border-[#BA9B78]/20 px-3 py-2.5 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-[#2D1B3D] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3d2555] transition-colors flex-shrink-0"
                aria-label="שלח"
              >
                <Send size={16} />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="כתוב הודעה..."
                maxLength={1000}
                className="flex-1 text-sm text-[#4A3D30] bg-transparent outline-none placeholder:text-[#A0907A] text-right"
                disabled={loading}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 left-4 z-50 w-14 h-14 rounded-full bg-[#2D1B3D] text-white shadow-lg flex items-center justify-center hover:bg-[#3d2555] transition-colors"
        aria-label={open ? "סגור צ'אט" : "פתח צ'אט"}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
