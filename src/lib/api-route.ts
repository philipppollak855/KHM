import { NextResponse } from "next/server";

export function apiError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function parseJsonBody<T = Record<string, unknown>>(
  req: Request
): Promise<T | NextResponse> {
  try {
    return (await req.json()) as T;
  } catch {
    return apiError("Ungültiger JSON-Request.", 400);
  }
}

export function handleRouteError(err: unknown, context: string) {
  console.error(`[${context}]`, err);
  const message =
    err instanceof Error ? err.message : "Interner Serverfehler.";
  return apiError(message, 500);
}
