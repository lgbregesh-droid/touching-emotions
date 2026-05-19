import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await db.from("site_settings").select("key,value");
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const r of (data || []) as { key: string; value: string | null }[]) map[r.key] = r.value || "";
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTestimonials(opts: { featuredOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ["testimonials", opts],
    queryFn: async () => {
      let q = db.from("testimonials").select("*").eq("is_active", true).order("order_index");
      if (opts.featuredOnly) q = q.eq("is_featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useFaq() {
  return useQuery({
    queryKey: ["faq"],
    queryFn: async () => {
      const { data, error } = await db.from("faq").select("*").eq("is_active", true).order("order_index");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useLectures(opts: { featuredOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ["lectures", opts],
    queryFn: async () => {
      let q = db.from("lectures").select("*").eq("is_active", true).order("order_index");
      if (opts.featuredOnly) q = q.eq("is_featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useSupportItems() {
  return useQuery({
    queryKey: ["support-items"],
    queryFn: async () => {
      const { data, error } = await db.from("support_items").select("*").eq("is_active", true).order("order_index");
      if (error) throw error;
      return data || [];
    },
  });
}
