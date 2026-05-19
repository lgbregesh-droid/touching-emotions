import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsManager, type Field } from "@/components/admin/CmsManager";

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
      />
    </AdminShell>
  );
}
