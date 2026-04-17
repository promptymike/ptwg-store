import { NextResponse } from "next/server";
import { z } from "zod";

import { SESSION_COOKIE_NAME } from "@/lib/session";

const mockSessionSchema = z.object({
  role: z.enum(["admin", "user"]),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = mockSessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Niepoprawna rola sesji demo." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    message: "Sesja demo ustawiona.",
    role: parsed.data.role,
  });

  response.cookies.set(SESSION_COOKIE_NAME, parsed.data.role, {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Sesja demo wyczyszczona." });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
