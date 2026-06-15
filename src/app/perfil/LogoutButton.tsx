"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    router.replace("/login");
  }
  return (
    <button
      onClick={logout}
      className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-200 ring-1 ring-white/10 hover:bg-neutral-700"
    >
      Cerrar sesión
    </button>
  );
}
