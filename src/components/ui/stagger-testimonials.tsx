"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type StaggerTestimonialItem = {
  testimonial: string;
  by: string;
};

interface InternalItem extends StaggerTestimonialItem {
  tempId: number;
}

interface TestimonialCardProps {
  position: number;
  testimonial: InternalItem;
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-7 md:p-8 transition-all duration-500 ease-in-out flex flex-col",
        isCenter
          ? "z-10 bg-[#2D1B3D] text-[#F5F0E8] border-[#BA9B78]"
          : "z-0 bg-[#FBF6EE] text-[#4A3D30] border-[#E0D8CC] hover:border-[#BA9B78]/70"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(40px 0%, calc(100% - 40px) 0%, 100% 40px, 100% 100%, calc(100% - 40px) 100%, 40px 100%, 0 100%, 0 0)`,
        transform: `translate(-50%, -50%) translateX(${(cardSize / 1.5) * position}px) translateY(${
          isCenter ? -55 : position % 2 ? 15 : -15
        }px) rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)`,
        boxShadow: isCenter ? "0px 8px 0px 4px rgba(186,155,120,0.55)" : "none",
      }}
    >
      <span
        className={cn(
          "font-serif text-5xl leading-none mb-3 select-none",
          isCenter ? "text-[#BA9B78]" : "text-[#BA9B78]/40"
        )}
      >
        "
      </span>
      <h3
        className={cn(
          "text-sm md:text-base font-light leading-relaxed flex-1 overflow-hidden",
          isCenter ? "text-[#F5F0E8]" : "text-[#4A3D30]"
        )}
      >
        {testimonial.testimonial}
      </h3>
      <p
        className={cn(
          "text-xs md:text-sm font-medium mt-4 pt-3 border-t",
          isCenter ? "text-[#BA9B78] border-[#BA9B78]/30" : "text-[#2D1B3D] border-[#E0D8CC]"
        )}
      >
        — {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials: React.FC<{
  items: StaggerTestimonialItem[];
  prevLabel?: string;
  nextLabel?: string;
}> = ({ items, prevLabel = "Previous", nextLabel = "Next" }) => {
  const [cardSize, setCardSize] = useState(290);
  const [list, setList] = useState<InternalItem[]>(
    items.map((it, i) => ({ ...it, tempId: i }))
  );

  const handleMove = (steps: number) => {
    const newList = [...list];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 340 : 260);
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-transparent"
      style={{ height: 540 }}
    >
      {list.map((testimonial, index) => {
        const position =
          list.length % 2
            ? index - (list.length + 1) / 2
            : index - list.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            position={position}
            testimonial={testimonial}
            handleMove={handleMove}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        <button
          onClick={() => handleMove(-1)}
          aria-label={prevLabel}
          className="flex h-12 w-12 items-center justify-center bg-[#F5F0E8] border-2 border-[#BA9B78]/50 text-[#2D1B3D] hover:bg-[#2D1B3D] hover:text-[#F5F0E8] hover:border-[#2D1B3D] transition-colors rounded-full"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={() => handleMove(1)}
          aria-label={nextLabel}
          className="flex h-12 w-12 items-center justify-center bg-[#F5F0E8] border-2 border-[#BA9B78]/50 text-[#2D1B3D] hover:bg-[#2D1B3D] hover:text-[#F5F0E8] hover:border-[#2D1B3D] transition-colors rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    </div>
  );
};
