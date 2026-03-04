
import path from "path";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import type { Readable } from "stream";

// ────────────────────────────────────────────────
// S3 CLIENT SETUP
// ────────────────────────────────────────────────

const region: string =
  process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-west-1";
const bucket: string | undefined = process.env.AWS_S3_BUCKET;

// Warn if bucket not set
if (!bucket) {
  console.warn(
    "AWS_S3_BUCKET is not set. S3 operations will fail until configured.",
  );
}

// Create S3 client
const s3Client = new S3Client({
  region,
  credentials:
    process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        }
      : undefined,
});

/**
 * Sanitize S3 object key to prevent path traversal
 */
export function sanitizeKey(key: string): string {
  if (!key) return "";
  // Remove leading/trailing slashes, prevent path traversal
  return key.replace(/^\/+/ , "").replace(/\.\.+/g, "").replace(/\\/g, "/");
}


/**
 * Generate unique object key with optional folder prefix
 */
function generateKey(originalName: string = "", folderPrefix: string = ""): string {
  const ext = path.extname(originalName || "") || "";
  const uniquePart = `${uuidv4()}${ext}`;
  if (folderPrefix) {
    const cleanPrefix = sanitizeKey(folderPrefix);
    return cleanPrefix ? `${cleanPrefix}/${uniquePart}` : uniquePart;
  }
  return uniquePart;
}

// ────────────────────────────────────────────────
// SINGLE FILE FUNCTIONS
// ────────────────────────────────────────────────


/**
 * Upload buffer with optional folder prefix
 */
export async function uploadBuffer(
  buffer: Buffer,
  key?: string,
  contentType?: string,
  folderPrefix: string = ""
): Promise<{ Bucket: string; Key: string; ETag: string; Location: string }> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  const finalKey = key ? sanitizeKey(key) : generateKey("", folderPrefix);
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: finalKey,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    },
  });
  const result = await upload.done();
  return {
    Bucket: bucket,
    Key: finalKey,
    ETag: result.ETag,
    Location: `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(finalKey)}`,
  };
}


/**
 * Upload stream with optional folder prefix
 */
export async function uploadStream(
  stream: Readable,
  key?: string,
  contentType?: string,
  folderPrefix: string = ""
): Promise<{ Bucket: string; Key: string; ETag: string; Location: string }> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  const finalKey = key ? sanitizeKey(key) : generateKey("", folderPrefix);
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: finalKey,
      Body: stream,
      ContentType: contentType || "application/octet-stream",
    },
  });
  const result = await upload.done();
  return {
    Bucket: bucket,
    Key: finalKey,
    ETag: result.ETag,
    Location: `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(finalKey)}`,
  };
}


/**
 * Delete a single object
 */
export async function deleteObject(key: string): Promise<any> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  const safeKey = sanitizeKey(key);
  const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: safeKey });
  return s3Client.send(cmd);
}


/**
 * Get object as stream
 */
export async function getObjectStream(key: string): Promise<Readable> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  const safeKey = sanitizeKey(key);
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: safeKey });
  const res = await s3Client.send(cmd);
  return res.Body as Readable;
}


/**
 * Get signed download URL
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 900): Promise<string> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  const safeKey = sanitizeKey(key);
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: safeKey });
  return getSignedUrl(s3Client, cmd, { expiresIn });
}

// ────────────────────────────────────────────────
// BATCH / MULTIPLE FILE FUNCTIONS
// ────────────────────────────────────────────────


export interface UploadBufferItem {
  buffer: Buffer;
  key?: string;
  contentType?: string;
  originalName?: string;
  folderPrefix?: string;
}

/**
 * Upload multiple buffers – supports folderPrefix per item
 */
export async function uploadBuffers(
  items: UploadBufferItem[],
  concurrency: number = 5
): Promise<Array<{ status: "fulfilled" | "rejected"; value?: any; reason?: any }>> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  if (!Array.isArray(items) || items.length === 0) return [];
  const results: Array<{ status: "fulfilled" | "rejected"; value?: any; reason?: any }> = new Array(items.length);
  const queue = items.map((it, ix) => ({ item: it, ix }));
  async function processNext() {
    while (queue.length > 0) {
      const { item, ix } = queue.shift()!;
      try {
        const safeKey = sanitizeKey(
          item.key || generateKey(item.originalName || "", item.folderPrefix || "")
        );
        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: bucket,
            Key: safeKey,
            Body: item.buffer,
            ContentType: item.contentType || "application/octet-stream",
          },
        });
        const result = await upload.done();
        results[ix] = {
          status: "fulfilled",
          value: {
            Bucket: bucket,
            Key: safeKey,
            ETag: result.ETag,
            Location: `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(safeKey)}`,
          },
        };
      } catch (err) {
        results[ix] = { status: "rejected", reason: err };
      }
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => processNext(),
  );
  await Promise.all(workers);
  return results;
}


export interface UploadStreamItem {
  stream: Readable;
  key?: string;
  contentType?: string;
  originalName?: string;
  folderPrefix?: string;
}

/**
 * Upload multiple streams – supports folderPrefix per item
 */
export async function uploadStreams(
  items: UploadStreamItem[],
  concurrency: number = 5
): Promise<Array<{ status: "fulfilled" | "rejected"; value?: any; reason?: any }>> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  if (!Array.isArray(items) || items.length === 0) return [];
  const results: Array<{ status: "fulfilled" | "rejected"; value?: any; reason?: any }> = new Array(items.length);
  const queue = items.map((it, ix) => ({ item: it, ix }));
  async function processNext() {
    while (queue.length > 0) {
      const { item, ix } = queue.shift()!;
      try {
        const safeKey = sanitizeKey(
          item.key || generateKey(item.originalName || "", item.folderPrefix || "")
        );
        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: bucket,
            Key: safeKey,
            Body: item.stream,
            ContentType: item.contentType || "application/octet-stream",
          },
        });
        const result = await upload.done();
        results[ix] = {
          status: "fulfilled",
          value: {
            Bucket: bucket,
            Key: safeKey,
            ETag: result.ETag,
            Location: `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(safeKey)}`,
          },
        };
      } catch (err) {
        results[ix] = { status: "rejected", reason: err };
      }
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => processNext(),
  );
  await Promise.all(workers);
  return results;
}


/**
 * Delete multiple objects (batched)
 */
export async function deleteObjects(keys: string[]): Promise<{ Deleted: any[]; Errors: any[] }> {
  if (!bucket) {
    const err = new Error("S3 bucket not configured");
    (err as any).code = 500;
    throw err;
  }
  if (!keys || keys.length === 0) return { Deleted: [], Errors: [] };
  const safeKeys = keys.map(sanitizeKey).filter(Boolean);
  const chunks: string[][] = [];
  for (let i = 0; i < safeKeys.length; i += 1000) {
    chunks.push(safeKeys.slice(i, i + 1000));
  }
  const finalResult: { Deleted: any[]; Errors: any[] } = { Deleted: [], Errors: [] };
  for (const chunk of chunks) {
    const cmd = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: chunk.map((Key) => ({ Key })),
        Quiet: false,
      },
    });
    const response: any = await s3Client.send(cmd);
    if (response.Deleted) finalResult.Deleted.push(...(response.Deleted || []));
    if (response.Errors) finalResult.Errors.push(...(response.Errors || []));
  }
  return finalResult;
}


export { generateKey };
