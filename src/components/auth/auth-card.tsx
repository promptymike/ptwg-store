"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAuthCallbackUrl } from "@/lib/auth-url";
import { getMissingSupabaseEnv } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

type AuthCardProps = {
  mode: "login" | "register";
  nextPath?: string;
  initialFeedback?: string | null;
};

type FeedbackTone = "info" | "error" | "success";

type Feedback = {
  message: string;
  tone: FeedbackTone;
  showResend?: boolean;
};

/**
 * Dopasowuje surowy komunikat Supabase do stabilnego kodu używanego przez UI.
 * Supabase zwraca kody w `AuthError.code` dopiero od nowszych SDK, więc
 * dublujemy logikę przez prosty match po `message`.
 */
function categorizeAuthError(error: AuthError | Error): {
  code: "invalid_credentials" | "email_not_confirmed" | "rate_limited" | "user_already_registered" | "unknown";
  message: string;
} {
  const raw = error.message ?? "";
  const lowered = raw.toLowerCase();

  if (lowered.includes("email not confirmed") || lowered.includes("confirm your email")) {
    return {
      code: "email_not_confirmed",
      message:
        "Twój adres e-mail nie został jeszcze potwierdzony. Sprawdź skrzynkę i kliknij link aktywacyjny, albo wyślij go ponownie.",
    };
  }

  if (lowered.includes("invalid login credentials") || lowered.includes("invalid credentials")) {
    return {
      code: "invalid_credentials",
      message: "Nieprawidłowy adres e-mail lub hasło.",
    };
  }

  if (lowered.includes("rate limit") || lowered.includes("too many")) {
    return {
      code: "rate_limited",
      message:
        "Zbyt wiele prób. Odczekaj chwilę (zwykle 30-60 sekund) i spróbuj ponownie.",
    };
  }

  if (lowered.includes("already registered") || lowered.includes("already exists")) {
    return {
      code: "user_already_registered",
      message:
        "Konto z tym adresem już istnieje. Przejdź do logowania albo zresetuj hasło.",
    };
  }

  return {
    code: "unknown",
    message: raw || "Nie udało się ukończyć operacji. Spróbuj ponownie za chwilę.",
  };
}

export function AuthCard({
  mode,
  nextPath = "/konto",
  initialFeedback = null,
}: AuthCardProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(
    initialFeedback ? { message: initialFeedback, tone: "error" } : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleResendConfirmation() {
    if (!email) {
      setFeedback({
        message: "Podaj adres e-mail, aby wysłać link aktywacyjny ponownie.",
        tone: "error",
      });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(nextPath),
        },
      });

      if (error) {
        const { message } = categorizeAuthError(error);
        setFeedback({ message, tone: "error" });
        return;
      }

      setFeedback({
        message:
          "Wysłaliśmy nowy link aktywacyjny. Sprawdź skrzynkę (także folder Spam).",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się wysłać linku. Spróbuj ponownie.",
        tone: "error",
      });
    } finally {
      setIsResending(false);
    }
  }

  async function handleSubmit() {
    setFeedback(null);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      console.warn("Auth missing env:", getMissingSupabaseEnv().join(", "));
      setFeedback({
        message:
          "Logowanie jest chwilowo niedostępne. Spróbuj ponownie za chwilę lub napisz na kontakt@templify.store.",
        tone: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
          setFeedback({
            message: result.error.issues[0]?.message ?? "Formularz zawiera błąd.",
            tone: "error",
          });
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: result.data.email,
          password: result.data.password,
        });

        if (error) {
          const { code, message } = categorizeAuthError(error);
          setFeedback({
            message,
            tone: "error",
            showResend: code === "email_not_confirmed",
          });
          return;
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const result = registerSchema.safeParse({ fullName, email, password });

      if (!result.success) {
        setFeedback({
          message: result.error.issues[0]?.message ?? "Formularz zawiera błąd.",
          tone: "error",
        });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
          data: {
            full_name: result.data.fullName,
          },
          emailRedirectTo: getAuthCallbackUrl(nextPath),
        },
      });

      if (error) {
        const { message } = categorizeAuthError(error);
        setFeedback({ message, tone: "error" });
        return;
      }

      if (data.session) {
        router.push(nextPath);
        router.refresh();
        return;
      }

      setFeedback({
        message:
          "Konto zostało utworzone. Sprawdź skrzynkę e-mail i kliknij w link aktywacyjny, aby zalogować się po raz pierwszy.",
        tone: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? categorizeAuthError(error).message
          : "Nie udało się ukończyć operacji. Spróbuj ponownie za chwilę.";
      setFeedback({ message, tone: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  const feedbackToneClass =
    feedback?.tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : feedback?.tone === "error"
        ? "border-destructive/30 bg-destructive/10 text-foreground"
        : "border-primary/20 bg-primary/10 text-muted-foreground";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isLoading) handleSubmit();
      }}
      className="surface-panel gold-frame mx-auto w-full max-w-xl space-y-6 p-6 sm:p-8"
      noValidate
    >
      <div className="space-y-3">
        <span className="eyebrow">
          {mode === "login" ? "Logowanie" : "Rejestracja"}
        </span>
        <div>
          <h1 className="text-4xl text-foreground sm:text-5xl">
            {mode === "login" ? "Witaj ponownie" : "Załóż konto"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {mode === "login"
              ? "Zaloguj się, aby zobaczyć swoje zamówienia i pobrać pliki z biblioteki."
              : "Konto pozwala pobierać pliki, śledzić zamówienia i wracać do zakupów w dowolnym momencie."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {mode === "register" ? (
          <label className="space-y-2" htmlFor="auth-full-name">
            <span className="text-sm font-medium text-foreground">Imię i nazwisko</span>
            <Input
              id="auth-full-name"
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="np. Anna Kowalska"
              autoComplete="name"
              autoCapitalize="words"
              spellCheck={false}
            />
          </label>
        ) : null}

        <label className="space-y-2" htmlFor="auth-email">
          <span className="text-sm font-medium text-foreground">Adres e-mail</span>
          <Input
            id="auth-email"
            name="email"
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="twoj@adres.pl"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
          />
        </label>

        <label className="space-y-2" htmlFor="auth-password">
          <span className="text-sm font-medium text-foreground">Hasło</span>
          <Input
            id="auth-password"
            name="password"
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 znaków"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {mode === "login" ? "Logowanie..." : "Tworzenie konta..."}
          </>
        ) : mode === "login" ? (
          "Zaloguj się"
        ) : (
          "Utwórz konto"
        )}
      </Button>

      {feedback ? (
        <div
          className={`space-y-3 rounded-[1.4rem] border p-4 text-sm animate-in fade-in slide-in-from-top-1 duration-200 ${feedbackToneClass}`}
          role={feedback.tone === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <p>{feedback.message}</p>
          {feedback.showResend ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResendConfirmation}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                "Wyślij link aktywacyjny ponownie"
              )}
            </Button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
