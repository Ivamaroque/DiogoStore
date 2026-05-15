import { NextResponse } from "next/server";

export function updateSession(request) {
  return NextResponse.next({ request: { headers: request.headers } });
}