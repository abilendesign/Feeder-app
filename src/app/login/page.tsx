"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else router.replace("/");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else
        setMsg(
          "Cuenta creada. Si pide confirmar correo, revísalo; si no, ya puedes entrar."
        );
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a] px-4 text-neutral-100">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 p-6 ring-1 ring-white/10">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-5 w-1.5 rounded bg-[#d6ff00]" />
          <h1 className="text-lg font-bold">Feeder</h1>
        </div>

        <h2 className="mb-4 text-sm text-neutral-400">
          {mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}
        </h2>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 placeholder:text-neutral-500 focus:ring-[#d6ff00]/60"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mín. 6)"
            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm outline-none ring-1 ring-white/10 placeholder:text-neutral-500 focus:ring-[#d6ff00]/60"
          />

          {msg && <p className="text-xs text-neutral-300">{msg}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#d6ff00] px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {busy ? "..." : mode === "login" ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMsg(null);
          }}
          className="mt-4 w-full text-center text-xs text-neutral-400 hover:text-neutral-200"
        >
          {mode === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </main>
  );
}
