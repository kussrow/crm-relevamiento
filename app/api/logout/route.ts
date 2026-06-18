import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL("/login", request.url), 303);
  res.cookies.set("crm_session", "", { path: "/", maxAge: 0 });
  return res;
}
