import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsManager, type Field } from "@/components/admin/CmsManager";

export const Route = createFileRoute("/admin/_authed/support")({
  head: () => ({ meta: [{ title: "תמיכה בעשייה | ניהול" }] }),
  component: SupportAdmin,
});

const fields: Field[] = [
  { key: "title", label: "כותרת", type: "text", required: true },
  { key: "description", label: "תיאור", type: "textarea", rows: 4 },
  { key: "price", label: "סכום מוצע", type: "text", placeholder: "למשל: ₪50" },
  { key: "image_url", label: "תמונה", type: "image" },
  { key: "contact_link", label: "קישור ליצירת קשר (וואטסאפ / טופס)", type: "url" },
  { key: "is_active", label: "פעיל באתר", type: "boolean" },
];

function SupportAdmin() {
  return (
    <AdminShell title="תמיכה בעשייה">
      <CmsManager
        table="support_items"
        fields={fields}
        primaryField="title"
        secondaryField="price"
        imageField="image_url"
        hasActive
        hasOrder
        emptyText="עדיין לא נוספו פריטי תמיכה"
        newButtonLabel="הוספת פריט"
      />
    </AdminShell>
  );
}
