import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { CmsManager, type Field } from "@/components/admin/CmsManager";

export const Route = createFileRoute("/admin/_authed/faq")({
  head: () => ({ meta: [{ title: "שאלות נפוצות | ניהול" }] }),
  component: FaqAdmin,
});

const fields: Field[] = [
  { key: "question", label: "שאלה", type: "text", required: true },
  { key: "answer", label: "תשובה", type: "textarea", rows: 5, required: true },
  { key: "category", label: "קטגוריה", type: "text", placeholder: "כללי / סדנאות / תרומות" },
  { key: "is_active", label: "פעיל באתר", type: "boolean" },
];

function FaqAdmin() {
  return (
    <AdminShell title="שאלות נפוצות">
      <CmsManager
        table="faq"
        fields={fields}
        primaryField="question"
        secondaryField="category"
        hasActive
        hasOrder
        emptyText="עדיין לא נוספו שאלות"
        newButtonLabel="הוספת שאלה"
      />
    </AdminShell>
  );
}
