import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface PortfolioImage {
  src: string;
  alt: string;
  title?: string;
}

interface PortfolioGalleryProps {
  title?: string;
  archiveButton?: { text: string; href: string } | null;
  images: PortfolioImage[];
  className?: string;
  maxHeight?: number;
  spacing?: string;
  onImageClick?: (index: number) => void;
  marqueeRepeat?: number;
  showHeader?: boolean;
}

export function PortfolioGallery({
  title,
  archiveButton,
  images,
  className = "",
  maxHeight = 120,
  spacing = "-space-x-72 md:-space-x-80",
  onImageClick,
  marqueeRepeat = 4,
  showHeader = true,
}: PortfolioGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      {showHeader && (title || archiveButton) && (
        <div className="flex items-end justify-between mb-10 px-2">
          {title && (
            <h3 className="text-2xl md:text-4xl font-extralight text-[#F5F0E8] tracking-wider">{title}</h3>
          )}
          {archiveButton && (
            <Link
              to={archiveButton.href}
              className="group inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#F5F0E8]/70 hover:text-[#BA9B78] transition"
            >
              {archiveButton.text}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
          )}
        </div>
      )}

      {/* Desktop 3D overlapping layout */}
      <div className="hidden md:block">
        <div className={cn("flex items-end justify-center pt-32", spacing)}>
          {images.map((image, index) => {
            const totalImages = images.length;
            const middle = Math.floor(totalImages / 2);
            const distanceFromMiddle = Math.abs(index - middle);
            const staggerOffset = maxHeight - distanceFromMiddle * 20;
            const zIndex = totalImages - distanceFromMiddle;
            const isHovered = hoveredIndex === index;
            const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index;
            const yOffset = isHovered ? -120 : isOtherHovered ? 0 : -staggerOffset;

            return (
              <motion.div
                key={index}
                className="relative cursor-pointer"
                style={{ zIndex: isHovered ? 999 : zIndex }}
                animate={{ y: yOffset, scale: isHovered ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => onImageClick?.(index)}
              >
                <div
                  className="relative overflow-hidden rounded-2xl shadow-2xl"
                  style={{
                    width: 360,
                    height: 260,
                    boxShadow: "0 25px 60px -15px rgba(0,0,0,0.6)",
                    border: "4px solid #2D1B3D",
                  }}
                >
                  <img src={image.src} alt={image.alt} className="w-full h-full object-cover" loading="lazy" />
                  {image.title && isHovered && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-[#F5F0E8] text-sm tracking-wide">{image.title}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mobile marquee */}
      <div className="md:hidden overflow-hidden">
        <div className="marquee-track flex gap-3 w-max">
          {Array(marqueeRepeat)
            .fill(0)
            .map((_, repeat) => (
              <div key={repeat} className="flex gap-3">
                {images.map((image, index) => (
                  <div
                    key={`${repeat}-${index}`}
                    onClick={() => onImageClick?.(index)}
                    className="w-[220px] aspect-[4/3] shrink-0 rounded-xl overflow-hidden shadow-lg"
                    style={{ border: "2px solid #2D1B3D" }}
                  >
                    <img src={image.src} alt={image.alt} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
