import { cn } from "@/lib/utils";
import { useState } from "react";

export interface GalleryImage {
  src: string;
  alt?: string;
}

interface ImageGalleryProps {
  title?: string;
  description?: string;
  images: GalleryImage[];
  className?: string;
}

export default function ImageGallery({ title, description, images, className }: ImageGalleryProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!images?.length) return null;

  return (
    <div className={cn("w-full", className)}>
      {(title || description) && (
        <div className="text-center mb-12 max-w-2xl mx-auto">
          {title && (
            <h3 className="text-3xl md:text-5xl font-extralight text-[#F5F0E8] tracking-wider mb-4">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm md:text-base text-[#F5F0E8]/60 leading-relaxed font-light">
              {description}
            </p>
          )}
        </div>
      )}

      <div
        className="flex w-full gap-2 md:gap-3 h-[280px] md:h-[440px]"
        onMouseLeave={() => setHovered(null)}
      >
        {images.map((img, idx) => {
          const isHovered = hovered === idx;
          const anyHovered = hovered !== null;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHovered(idx)}
              className={cn(
                "relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                isHovered ? "flex-[4]" : anyHovered ? "flex-[0.7]" : "flex-1"
              )}
              style={{ border: "2px solid rgba(186,155,120,0.25)" }}
            >
              <img
                src={img.src}
                alt={img.alt || ""}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B3D]/50 via-transparent to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
