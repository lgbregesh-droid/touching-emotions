import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAdminAuthed } from "@/lib/admin/session";

export const Route = createFileRoute("/admin/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!isAdminAuthed()) {
      nav({ to: "/admin/login" });
    } else {
      setOk(true);
    }
  }, [nav]);
  if (!ok) return null;
  return <Outlet />;
}
