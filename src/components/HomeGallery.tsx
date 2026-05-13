import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import ImageGallery, { GalleryImage } from "@/components/ui/image-gallery";

export function HomeGallery({ count = 6 }: { count?: number }) {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("gallery")
        .select("id,url,order_index,featured")
        .eq("featured", true)
        .order("order_index", { ascending: true });
      if (!active) return;
      const rows = (data || []).slice(0, count).map((r: { url: string }) => ({
        src: r.url,
        alt: t.gallery.placeholder,
      }));
      setImages(rows);
    })();
    return () => {
      active = false;
    };
  }, [count, t.gallery.placeholder]);

  return <ImageGallery images={images} />;
}
