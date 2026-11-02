import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Course = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  duration: string;
  tuition_fee: number;
  application_fee: number;
  requirements: string[];
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export const naira = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const prettyDate = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

export const coursesQuery = queryOptions({
  queryKey: ["courses"],
  staleTime: 0,
  refetchOnMount: "always",
  queryFn: async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Course[];
  },
});


export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("news_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const faqsQuery = queryOptions({
  queryKey: ["faqs"],
  queryFn: async () => {
    const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const brochuresQuery = queryOptions({
  queryKey: ["brochures"],
  queryFn: async () => {
    const { data, error } = await supabase.from("brochures").select("*").order("created_at");
    if (error) throw error;
    return data ?? [];
  },
});

export const bannersQuery = queryOptions({
  queryKey: ["banners"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

export type SiteSettings = {
  school_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  map_embed: string;
  office_hours: string;
};

export const SETTINGS_FALLBACK: SiteSettings = {
  school_name: "Pathway Pro Aviation Training",
  phone: "+234 901 441 7010",
  whatsapp: "2349014417010",
  email: "info@pathwaypro.com",
  address: "No 5 Gyadi-Gyadi Gidan Glass, Kano Nigeria",
  map_embed:
    "https://www.google.com/maps?q=Gidan+Glass+Kano&output=embed",
  office_hours: "Monday – Friday, 8:00am – 5:00pm",
};

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  queryFn: async (): Promise<SiteSettings> => {
    const { data, error } = await supabase.from("site_settings").select("key,value");
    if (error) throw error;
    return {
      ...SETTINGS_FALLBACK,
      ...Object.fromEntries((data ?? []).map((row) => [row.key, row.value])),
    } as SiteSettings;
  },
});
