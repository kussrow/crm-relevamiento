import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  if (password && password === process.env.CRM_PASSWORD) {
    const res = NextResponse.redirect(new URL("/", request.url), 303);
    res.cookies.set("crm_session", process.env.AUTH_SECRET ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    });
    return res;
  }

  return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
}
