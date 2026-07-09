import { NextRequest, NextResponse } from "next/server";
import { processDunningReminders } from "@/lib/payments/dunning-server";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET nicht konfiguriert." },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDunningReminders();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mahnwesen fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
