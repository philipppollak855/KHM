import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { requireAdmin } from "@/lib/admin-auth";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FOLDERS = ["products", "categories"];

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if ("error" in auth && auth.error) return auth.error;

  const formData = await req.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") || "products");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei übermittelt." }, { status: 400 });
  }

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Ungültiger Ordner." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Nur JPEG, PNG, WebP und GIF sind erlaubt." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `Maximale Dateigröße: ${MAX_SIZE_MB} MB` },
      { status: 400 }
    );
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = getStorage().bucket();
    const storageFile = bucket.file(path);

    await storageFile.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: { originalName: file.name, uploadedBy: auth.uid },
      },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media`;
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
