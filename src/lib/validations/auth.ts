import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Podaj poprawny adres e-mail."),
  password: z
    .string()
    .min(8, "Hasło powinno mieć co najmniej 8 znaków.")
    .max(128, "Hasło jest zbyt długie."),
});

export const registerSchema = loginSchema.extend({
  fullName: z
    .string()
    .min(2, "Imię i nazwisko jest za krótkie.")
    .max(80, "Imię i nazwisko jest zbyt długie."),
});
