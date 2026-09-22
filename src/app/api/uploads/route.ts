import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireUser } from "@/lib/auth";
import { checkUpload, uploadFilename } from "@/lib/upload";
import { ok, fail, handleErrors } from "@/lib/api";

/**
 * Stores an upload on local disk under public/uploads and returns its URL.
 * For production, swap the write below for object storage (Supabase Storage,
 * UploadThing, S3) — callers only depend on the returned `url`.
 */
export async function POST(req: Request) {
  try {
    await requireUser();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return fail("No file uploaded.", 400);

    const check = checkUpload(file.type, file.size);
    if (!check.ok) return fail(check.error, 400);

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const name = uploadFilename(check.ext);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), bytes);

    return ok({ url: `/uploads/${name}`, kind: check.kind }, 201);
  } catch (err) {
    return handleErrors(err);
  }
}
