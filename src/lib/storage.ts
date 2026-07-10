import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, storage } from "./firebase";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Nur JPEG, PNG, WebP und GIF sind erlaubt.");
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Maximale Dateigröße: ${MAX_SIZE_MB} MB`);
  }
}

type UploadFolder = "products" | "categories" | "branding" | "marketing";

async function uploadViaApi(file: File, folder: UploadFolder): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Bitte als Admin anmelden, um Bilder hochzuladen.");
  }

  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || "Upload fehlgeschlagen.");
  }

  return payload.url as string;
}

async function uploadViaClient(file: File, folder: UploadFolder): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: { originalName: file.name },
  });

  return getDownloadURL(storageRef);
}

export async function uploadProductImage(
  file: File,
  folder: UploadFolder = "products"
): Promise<string> {
  validateImageFile(file);

  try {
    return await uploadViaApi(file, folder);
  } catch (apiError) {
    try {
      return await uploadViaClient(file, folder);
    } catch {
      throw apiError instanceof Error
        ? apiError
        : new Error("Upload fehlgeschlagen.");
    }
  }
}

export async function uploadCategoryImage(file: File): Promise<string> {
  return uploadProductImage(file, "categories");
}

export async function uploadBrandingImage(file: File): Promise<string> {
  return uploadProductImage(file, "branding");
}

export async function uploadMarketingImage(file: File): Promise<string> {
  return uploadProductImage(file, "marketing");
}

export async function deleteStorageFile(url: string): Promise<void> {
  try {
    const path = decodeURIComponent(
      url.split("/o/")[1]?.split("?")[0] || ""
    );
    if (path) {
      await deleteObject(ref(storage, path));
    }
  } catch {
    // Datei existiert möglicherweise nicht mehr
  }
}
