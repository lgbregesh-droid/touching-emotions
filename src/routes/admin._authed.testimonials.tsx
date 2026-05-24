import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsManager, type Field } from "@/components/admin/CmsManager";
import { aiAnalyzeTestimonialImage } from "@/lib/admin/cms.functions";
import { getAdminToken } from "@/lib/admin/session";

export const Route = createFileRoute("/admin/_authed/testimonials")({
  head: () => ({ meta: [{ title: "המלצות | ניהול" }] }),
  component: TestimonialsAdmin,
});

const fields: Field[] = [
  { key: "name", label: "שם", type: "text", required: true },
  { key: "role", label: "תפקיד / שיוך", type: "text", placeholder: "למשל: אמא לתלמיד כיתה ה׳" },
  { key: "text", label: "ההמלצה", type: "textarea", rows: 5, required: true },
  { key: "image_url", label: "תמונה", type: "image" },
  { key: "category", label: "קטגוריה", type: "text", placeholder: "הורה / מנהלת / מתנדבת" },
  { key: "is_featured", label: "הצג בדף הבית", type: "boolean" },
  { key: "is_active", label: "פעיל באתר", type: "boolean" },
];

function TestimonialsAdmin() {
  const analyzeFn = useServerFn(aiAnalyzeTestimonialImage);
  return (
    <AdminShell title="המלצות">
      <CmsManager
        table="testimonials"
        fields={fields}
        primaryField="name"
        secondaryField="role"
        imageField="image_url"
        hasFeatured
        hasActive
        hasOrder
        emptyText="עדיין לא נוספו המלצות"
        newButtonLabel="הוספת המלצה"
        aiAnalyze={{
          label: "מילוי אוטומטי מתמונה",
          hint: "העלי צילום מסך של ההמלצה (וואטסאפ, מייל, פתק) וה-AI ימלא שם, תפקיד, קטגוריה וטקסט.",
          analyze: async (base64, contentType) => {
            const out = await analyzeFn({ data: { token: getAdminToken()!, base64, contentType } });
            return out.values as Record<string, unknown>;
          },
        }}
      />
    </AdminShell>
  );
}
