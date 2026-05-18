import { Link } from "@tanstack/react-router";

export function ServiceCard({
  image,
  title,
  desc,
  audience,
  cta,
  to,
}: {
  image: string;
  title: string;
  desc: string;
  audience: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="card-hover bg-white border border-[#E0D8CC] rounded-2xl overflow-hidden h-full flex flex-col shadow-sm">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EDE6DC]">
        <img src={image} alt={title} loading="lazy" width={1024} height={640} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B3D]/40 via-transparent to-transparent" />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="text-lg text-[#2D1B3D] font-medium leading-tight">{title}</h3>
        <p className="text-sm text-[#4A3D30] font-light leading-relaxed flex-1">{desc}</p>
        <div className="text-[11px] tracking-wider uppercase text-[#BA9B78] font-medium">{audience}</div>
        <Link
          to={to}
          className="mt-1 inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#2D1B3D] text-white text-sm hover:bg-[#3d2750] transition-colors"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
