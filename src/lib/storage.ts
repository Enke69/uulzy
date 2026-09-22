import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

/**
 * Neon Object Storage (S3-compatible). Credentials, endpoint and region come
 * from the AWS_* env vars Neon injects, so the client needs no explicit config
 * beyond path-style addressing, which Neon requires.
 */
const BUCKET = process.env.STORAGE_BUCKET ?? "uulzy";

let client: S3Client | null = null;
function s3(): S3Client {
  if (!client) client = new S3Client({ forcePathStyle: true });
  return client;
}

export function storageConfigured(): boolean {
  return Boolean(
    process.env.AWS_ENDPOINT_URL_S3 &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
  );
}

/** Public base for anonymous reads: <endpoint>/<bucket> */
export function publicBaseUrl(): string {
  const endpoint = (process.env.AWS_ENDPOINT_URL_S3 ?? "").replace(/\/+$/, "");
  return `${endpoint}/${BUCKET}`;
}

/** Stores bytes and returns the public URL. Keys are random — never user input. */
export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Objects are immutable (every upload gets a fresh key), so they can be
      // cached hard by browsers and any CDN placed in front of the bucket.
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return `${publicBaseUrl()}/${key}`;
}

/** Best-effort delete of a stored object, given the public URL we handed out. */
export async function deleteObjectByUrl(url: string): Promise<void> {
  const prefix = `${publicBaseUrl()}/`;
  if (!url.startsWith(prefix)) return; // not ours (or legacy local path)
  const key = url.slice(prefix.length);
  if (!key) return;
  await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
