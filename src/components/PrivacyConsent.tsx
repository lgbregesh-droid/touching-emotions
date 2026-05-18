import { Link } from "@tanstack/react-router";

export function PrivacyConsent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-[#4A3D30] cursor-pointer">
      <input
        type="checkbox"
        required
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 accent-[#BA9B78]"
      />
      <span>
        אני מאשר/ת שקראתי את{" "}
        <Link to="/privacy" target="_blank" className="text-[#BA9B78] underline">
          מדיניות הפרטיות
        </Link>
        <span className="text-[#BA9B78]"> *</span>
      </span>
    </label>
  );
}

export function MarketingConsent({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm text-[#4A3D30] cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 accent-[#BA9B78]"
      />
      <span>
        אני מאשר/ת קבלת עדכונים, מידע ותוכן שיווקי מלגעת ברגש. ניתן להסיר בכל עת.
      </span>
    </label>
  );
}
