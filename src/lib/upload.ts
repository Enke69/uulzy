import { randomBytes } from "node:crypto";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export type UploadKind = "IMAGE" | "VIDEO";

export type UploadCheck =
  | { ok: true; kind: UploadKind; ext: string }
  | { ok: false; error: string };

/**
 * Decide whether a submitted file may be stored, based on its declared MIME
 * type and size. The extension comes from the MIME map, never from the
 * client-supplied filename, so a renamed file cannot choose its own extension.
 */
export function checkUpload(mimeType: string, size: number): UploadCheck {
  const type = mimeType.toLowerCase().split(";")[0].trim();
  const imageExt = IMAGE_TYPES[type];
  const videoExt = VIDEO_TYPES[type];

  if (!imageExt && !videoExt) {
    return {
      ok: false,
      error: "Only JPG, PNG, WebP, GIF images or MP4, WebM, MOV videos.",
    };
  }
  if (size <= 0) return { ok: false, error: "File is empty." };

  if (imageExt) {
    if (size > MAX_IMAGE_BYTES) {
      return { ok: false, error: "Images must be 8MB or smaller." };
    }
    return { ok: true, kind: "IMAGE", ext: imageExt };
  }
  if (size > MAX_VIDEO_BYTES) {
    return { ok: false, error: "Videos must be 50MB or smaller." };
  }
  return { ok: true, kind: "VIDEO", ext: videoExt };
}

/** Random, non-guessable filename — never derived from user input. */
export function uploadFilename(ext: string): string {
  return `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${ext}`;
}
