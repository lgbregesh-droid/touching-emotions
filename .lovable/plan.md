# תוכנית: דאשבורד ניהול לאתר לגעת ברגש

מערכת ניהול מלאה ב-`/admin/*`, מוגנת בסיסמה, באותה שפת עיצוב של האתר הציבורי. ההיקף גדול — אבנה אותו במשלוח אחד מקצה לקצה, עם כל הטבלאות, ההעלאות והעדכונים.

## 1. סכימת מסד הנתונים (מיגרציה אחת)

טבלאות חדשות / שינויים:
- `contact_messages`: הוספת `status` (`new` / `handled`, ברירת מחדל `new`).
- `volunteers`: הוספת `status` זהה.
- `workshops`: he/en שם+תיאור, date, time, location, audience, price, max_participants, image_url, status (`open`/`closed`/`ended`), order_index.
- `workshop_registrants`: workshop_id (FK), name, phone, email.
- `products`: מוצר יחיד (קלפים) — שם he/en, תיאור he/en, price, image_url, in_stock.
- `orders`: buyer_name, email, phone, quantity, amount, shipping_status (`pending`/`shipped`/`delivered`).
- `donations` (read-only mirror): name, email, amount, type (`one_time`/`recurring`), status, created_at. נשלוף מ-Stripe מאוחר יותר; כרגע ריק עם UI מוכן.
- `site_content`: key (unique), value_he, value_en, updated_at — לכל שדות ה-CMS של דף הבית/אודות/סדנאות.
- `gallery`: url, storage_path, order_index, featured (bool), created_at. אילוץ: לא יותר מ-8 featured (אכיפה ב-trigger).
- Storage buckets: `gallery` (public read), `workshops` (public read), `products` (public read).

RLS:
- כל הטבלאות: קריאה ציבורית רק היכן שהאתר הציבורי צריך (workshops עם status≠draft, products, gallery, site_content). Insert ציבורי רק ל-`contact_messages`, `volunteers`, `workshop_registrants`.
- כל יתר הפעולות (update/delete/admin reads) עוברות דרך **server functions** עם `supabaseAdmin` אחרי אימות סיסמת אדמין — אין אדמין בצד הלקוח שעוקף RLS.

## 2. אימות אדמין

- סוד חדש: `ADMIN_PASSWORD` (אבקש מהמשתמש להזין).
- Server function `adminLogin({ password })` משווה ל-`process.env.ADMIN_PASSWORD`, ובהצלחה מחזיר טוקן חתום (HMAC עם `ADMIN_SESSION_SECRET` שייווצר אוטומטית או יתבקש) שתוקפו 24 שעות.
- הטוקן נשמר ב-`localStorage` ונשלח כ-`data.token` בכל קריאה לפעולת אדמין; middleware משותף `requireAdmin` מאמת אותו.
- `/admin/login` ציבורי. שאר `/admin/*` תחת layout שמוודא טוקן תקף ב-`beforeLoad`, אחרת `redirect` ל-login.

## 3. מבנה קוד

```
src/routes/admin/
  login.tsx
  _layout.tsx           // sidebar + header + auth guard
  index.tsx             // Dashboard
  inquiries.tsx
  workshops.tsx
  shop.tsx
  donations.tsx
  content.tsx
  gallery.tsx
src/components/admin/
  AdminSidebar.tsx, AdminHeader.tsx, StatusBadge.tsx,
  ConfirmDialog.tsx, DataTable.tsx, ImageDropzone.tsx, BilingualField.tsx
src/lib/admin/
  auth.functions.ts     // adminLogin, verifySession
  inquiries.functions.ts
  workshops.functions.ts
  shop.functions.ts
  donations.functions.ts
  content.functions.ts
  gallery.functions.ts  // upload, toggle featured, reorder, delete
src/lib/admin/session.ts // localStorage helpers (client-safe)
```

כל ה-`*.functions.ts` יהיו דקים: רק `createServerFn` + middleware `requireAdmin` שמייבא `supabaseAdmin` מ-`client.server`.

## 4. מסכים (סיכום קצר)

1. **לוח בקרה** — 4 כרטיסי סיכום (פניות חדשות, מתנדבים השבוע, תרומות החודש, סדנה קרובה) + 10 פעילויות אחרונות (UNION ALL מהטבלאות).
2. **פניות וטפסים** — שני טאבים (פניות / מתנדבים), טבלה עם חיפוש/פילטר/תאריך, toggle סטטוס, modal לפרטים, מחיקה, ייצוא CSV בצד לקוח.
3. **סדנאות** — רשת כרטיסים, modal הוספה/עריכה דו-לשוני, שכפול, מודל נרשמים, toggle סטטוס.
4. **חנות** — טופס עריכת מוצר יחיד עם העלאת תמונה, מתחת טבלת הזמנות עם שינוי סטטוס משלוח + CSV.
5. **תרומות** — כרטיסי סיכום + טבלה (read-only), פילטר חודש/סוג, באנר Stripe, קישור חיצוני. אם אין נתונים עדיין → empty state עם הסבר.
6. **תוכן האתר** — 3 טאבים, שדות דו-לשוניים (RTL ימין, LTR שמאל), שמירה/ביטול לכל טאב. seed ראשוני יזין את הטקסטים הקיימים מ-`translations.ts` כדי שהאתר ימשיך לעבוד.
7. **גלריה** — Dropzone (jpg/png/webp, 5MB, multi), העלאה ל-Storage עם progress, רשת תמונות עם כוכב featured (אכיפת מקסימום 8 + toast), מחיקה (Storage + DB), גרירה לסידור מחדש (`@dnd-kit/sortable`).

## 5. אינטגרציה עם האתר הציבורי

- `index.tsx` → קורא `gallery` עם `featured=true` (במקום הפלייסהולדרים), `site_content` לטקסטים.
- `workshops.tsx` הציבורי → רשימת סדנאות אמיתית מה-DB + טופס הרשמה שנכתב ל-`workshop_registrants`.
- `shop.tsx` → קורא `products` (פריט אחד) + מציג "אזל המלאי" כשצריך.
- `gallery.tsx` הציבורי → כל הגלריה לפי `order_index`.
- `LanguageContext` ימשיך לעבוד; שדות שלא נמצאים ב-`site_content` ייפלו חזרה ל-translations.ts.

## 6. התראות מייל לפניות

- Server route `src/routes/api/public/notify-inquiry.ts` שמופעל מיד אחרי insert מוצלח של פנייה/מתנדב (נקרא בתוך אותה server function כדי לא לחשוף webhook).
- שולח דרך **Resend connector** ל-`l.g.bregesh@gmail.com`.
- צריך `RESEND_API_KEY` (אבקש דרך connectors).

## 7. סודות שאבקש מהמשתמש

- `ADMIN_PASSWORD` (חובה לפני שהאדמין יעבוד).
- `RESEND_API_KEY` (אופציונלי — בלעדיו האדמין יעבוד אבל בלי מיילים).
- אינטגרציית Stripe להצגת תרומות אמיתיות תיעשה בסבב נפרד כשהמשתמש יחבר Stripe.

## 8. סדר ביצוע במשלוח אחד

1. הרצת מיגרציה אחת (כל הטבלאות + RLS + triggers + buckets + seed `site_content`).
2. בקשת `ADMIN_PASSWORD` (חוסם המשך עד שהמשתמש מזין).
3. כתיבת auth + layout + sidebar.
4. כתיבת 7 המסכים + server functions.
5. חיווט האתר הציבורי לקרוא מה-DB.
6. בדיקה: build + לוגין + יצירת סדנה + העלאת תמונה.

## פרטים טכניים
- חבילות חדשות: `@dnd-kit/core`, `@dnd-kit/sortable`, `react-dropzone`.
- אין שימוש ב-Supabase Auth — אימות בסיסמה אחת בלבד כפי שהוגדר.
- כל הטבלאות נטולות `auth.users` FK.
- הסיכון העיקרי: היקף גדול → ייתכן שיידרש סבב תיקונים אחרי בנייה ראשונה. אעבוד מהר ואצמצם בלוט.

מאשר/ת? אם תרצי שינוי כלשהו (למשל: לדחות את הגלריה/חנות לסבב הבא, או לוותר על מיילים) — תגידי לפני שאני מתחיל.
