"use server";

import { cookies } from "next/headers";

export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("maya_access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("maya_access_token");
}
