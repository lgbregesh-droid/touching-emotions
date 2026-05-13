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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={cn(
              "relative overflow-hidden rounded-2xl aspect-square cursor-pointer transition-all duration-500",
              hovered !== null && hovered !== idx && "opacity-50 scale-[0.98]"
            )}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            style={{ border: "2px solid rgba(186,155,120,0.25)" }}
          >
            <img
              src={img.src}
              alt={img.alt || ""}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B3D]/40 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
