import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadProductImage(
  file: File,
  folder = "products"
): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Nur JPEG, PNG, WebP und GIF sind erlaubt.");
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Maximale Dateigröße: ${MAX_SIZE_MB} MB`);
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: { originalName: file.name },
  });

  return getDownloadURL(storageRef);
}

export async function uploadCategoryImage(file: File): Promise<string> {
  return uploadProductImage(file, "categories");
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
