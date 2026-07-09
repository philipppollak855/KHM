import { NextRequest, NextResponse } from "next/server";
import { requireModuleWrite } from "@/lib/admin-auth";
import { handleRouteError } from "@/lib/api-route";
import { buildImageSearchQuery, searchImageLibrary } from "@/lib/image-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireModuleWrite(req, "products");
    if ("error" in auth && auth.error) return auth.error;

    const rawQuery = req.nextUrl.searchParams.get("q")?.trim() || "";
    const query = buildImageSearchQuery(rawQuery);
    const results = await searchImageLibrary(query, 12);

    return NextResponse.json({ query, results });
  } catch (err) {
    return handleRouteError(err, "admin/image-search GET");
  }
}
