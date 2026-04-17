"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMissingSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type AuthCardProps = {
  mode: "login" | "register";
  nextPath?: string;
};

export function AuthCard({
  mode,
  nextPath = "/konto",
}: AuthCardProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("klientka@ptwg.pl");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setFeedback(null);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setFeedback(
        `Brakuje konfiguracji Supabase: ${getMissingSupabaseEnv().join(", ")}.`,
      );
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
          setFeedback(result.error.issues[0]?.message ?? "Formularz zawiera błąd.");
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: result.data.email,
          password: result.data.password,
        });

        if (error) {
          throw error;
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const result = registerSchema.safeParse({ fullName, email, password });

      if (!result.success) {
        setFeedback(result.error.issues[0]?.message ?? "Formularz zawiera błąd.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: {
            full_name: result.data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/konto`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      setFeedback(
        "Konto zostało utworzone. Jeśli potwierdzenie e-mail jest włączone w Supabase, dokończ je w skrzynce i zaloguj się ponownie.",
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Nie udało się wykonać operacji auth.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="surface-panel gold-frame mx-auto w-full max-w-xl space-y-6 p-6 sm:p-8">
      <div className="space-y-3">
        <span className="eyebrow">
          {mode === "login" ? "Logowanie" : "Rejestracja"}
        </span>
        <div>
          <h1 className="text-4xl text-white sm:text-5xl">
            {mode === "login" ? "Witaj ponownie" : "Załóż konto"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Formularz korzysta już z prawdziwego Supabase Auth i zachowuje obecny
            UX placeholderów, ale bez demo sesji.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {mode === "register" ? (
          <label className="space-y-2">
            <span className="text-sm font-medium text-white">Imię i nazwisko</span>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Paweł Tokarski"
            />
          </label>
        ) : null}

        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Adres e-mail</span>
          <Input
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white">Hasło</span>
          <Input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 znaków"
          />
        </label>
      </div>

      <Button onClick={handleSubmit} size="lg" className="w-full" disabled={isLoading}>
        {isLoading
          ? mode === "login"
            ? "Logowanie..."
            : "Tworzenie konta..."
          : mode === "login"
            ? "Zaloguj się"
            : "Utwórz konto"}
      </Button>

      {feedback ? (
        <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
