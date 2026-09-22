import { requireUser } from "@/lib/auth";
import { checkUpload, uploadFilename } from "@/lib/upload";
import { putObject, storageConfigured } from "@/lib/storage";
import { ok, fail, handleErrors } from "@/lib/api";

/**
 * Stores an upload in Neon Object Storage and returns its public URL.
 * Serverless hosts have no persistent disk, so nothing is written locally.
 */
export async function POST(req: Request) {
  try {
    await requireUser();
    if (!storageConfigured()) {
      return fail(
        "File storage is not configured on this server (missing AWS_* env vars).",
        503
      );
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No file uploaded.", 400);

    const check = checkUpload(file.type, file.size);
    if (!check.ok) return fail(check.error, 400);

    // Key prefix keeps the bucket browsable; the filename itself is random.
    const key = `${check.kind === "VIDEO" ? "video" : "image"}/${uploadFilename(check.ext)}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await putObject(key, bytes, file.type);

    return ok({ url, kind: check.kind }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
