import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteObjectByUrl } from "@/lib/storage";
import { ok, fail, handleErrors } from "@/lib/api";

/** Uploader or admin can take a post down. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const media = await db.activityMedia.findUnique({ where: { id } });
    if (!media) return fail("Not found.", 404);
    if (media.userId !== user.id && user.role !== "ADMIN") {
      return fail("Not your post.", 403);
    }
    await db.activityMedia.delete({ where: { id } });

    // Remove the stored file too — the bucket is public, so a surviving object
    // would stay reachable by URL after the post is "deleted". A storage
    // failure must not resurrect the row, so it only gets logged.
    try {
      await deleteObjectByUrl(media.url);
    } catch (err) {
      console.error("Failed to delete stored object", media.url, err);
    }

    return ok({ ok: true });
  } catch (err) {
    return handleErrors(err);
  }
}
