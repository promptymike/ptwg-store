"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, loginSchema } from "@/lib/validations/auth";

type MockAuthCardProps = {
  mode: "login" | "register";
  nextPath?: string;
};

export function MockAuthCard({
  mode,
  nextPath = "/konto",
}: MockAuthCardProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("Paweł Tokarski");
  const [email, setEmail] = useState("klientka@ptwg.pl");
  const [password, setPassword] = useState("12345678");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleMockSession(role: "user" | "admin") {
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/auth/mock-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się utworzyć sesji demo.");
      }

      router.push(role === "admin" ? "/admin" : nextPath);
      router.refresh();
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Wystąpił błąd przy logowaniu demo.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleValidateOnly() {
    const schema = mode === "register" ? registerSchema : loginSchema;
    const payload =
      mode === "register"
        ? { fullName, email, password }
        : { email, password };
    const result = schema.safeParse(payload);

    if (!result.success) {
      setFeedback(result.error.issues[0]?.message ?? "Formularz zawiera błąd.");
      return;
    }

    setFeedback(
      "Walidacja przeszła poprawnie. To placeholder auth gotowy pod Supabase Auth.",
    );
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
            Formularz waliduje dane przez Zod. Poniższe przyciski uruchamiają sesję
            demo na cookie, żeby przetestować ochronę tras i role.
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
          />
        </label>
      </div>

      <div className="grid gap-3">
        <Button onClick={handleValidateOnly} size="lg">
          Sprawdź placeholder formularza
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleMockSession("user")}
          disabled={isLoading}
        >
          Wejdź jako demo user
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleMockSession("admin")}
          disabled={isLoading}
        >
          Wejdź jako demo admin
        </Button>
      </div>

      {feedback ? (
        <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
