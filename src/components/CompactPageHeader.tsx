type Props = {
  label?: string;
  title: string;
  subtitle?: string;
};

export function CompactPageHeader({ label, title, subtitle }: Props) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#2D1B3D", padding: "28px 24px" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(78,140,133,0.10), transparent 70%)" }}
      />
      <div
        className="relative max-w-4xl mx-auto text-center"
        style={{ animation: "cph-fadeUp 0.6s ease-out both" }}
      >
        {label && (
          <div
            className="mb-2"
            style={{
              color: "rgba(245,240,232,0.55)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
        )}
        <h1
          style={{
            color: "#F5F0E8",
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 300,
            letterSpacing: "0.04em",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {title}
        </h1>
        <div
          aria-hidden
          style={{
            width: 32,
            height: 1.5,
            background: "#BA9B78",
            opacity: 0.65,
            margin: "10px auto",
          }}
        />
        {subtitle && (
          <p
            style={{
              color: "rgba(245,240,232,0.55)",
              fontSize: "13px",
              fontWeight: 300,
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <style>{`@keyframes cph-fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </section>
  );
}
