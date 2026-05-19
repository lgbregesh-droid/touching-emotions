import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsManager, type Field } from "@/components/admin/CmsManager";

export const Route = createFileRoute("/admin/_authed/lectures")({
  head: () => ({ meta: [{ title: "הרצאות ומפגשים | ניהול" }] }),
  component: LecturesAdmin,
});

const fields: Field[] = [
  { key: "title", label: "כותרת", type: "text", required: true },
  { key: "short_description", label: "תיאור קצר", type: "textarea", rows: 2 },
  { key: "full_description", label: "תיאור מלא", type: "textarea", rows: 6 },
  { key: "target_audience", label: "קהל יעד", type: "text" },
  { key: "topics", label: "נושאים", type: "textarea", rows: 3 },
  { key: "duration", label: "משך זמן", type: "text", placeholder: "למשל: 60 דקות" },
  { key: "image_url", label: "תמונה", type: "image" },
  { key: "is_featured", label: "הצג בדף הבית", type: "boolean" },
  { key: "is_active", label: "פעיל באתר", type: "boolean" },
];

function LecturesAdmin() {
  return (
    <AdminShell title="הרצאות ומפגשים">
      <CmsManager
        table="lectures"
        fields={fields}
        primaryField="title"
        secondaryField="target_audience"
        imageField="image_url"
        hasFeatured
        hasActive
        hasOrder
        emptyText="עדיין לא נוספו הרצאות"
        newButtonLabel="הוספת הרצאה"
      />
    </AdminShell>
  );
}
