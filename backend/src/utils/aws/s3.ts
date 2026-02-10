import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from '../../config/config';

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
interface UploadResult {
  Bucket: string;
  Key: string;
  ETag?: string;
  Location: string;
}

interface UploadItemBuffer {
  buffer: Buffer;
  key?: string;
  contentType?: string;
  originalName?: string;
  folderPrefix?: string;
}

interface UploadItemStream {
  stream: NodeJS.ReadableStream;
  key?: string;
  contentType?: string;
  originalName?: string;
  folderPrefix?: string;
}

interface DeleteResult {
  Deleted: Array<{ Key?: string }>;
  Errors: Array<{ Key?: string; Code?: string; Message?: string }>;
}

// ────────────────────────────────────────────────
// S3 CLIENT SETUP
// ────────────────────────────────────────────────
const region = config.AWS_REGION || config.AWS_DEFAULT_REGION || 'us-west-1';
const bucket = config.AWS_S3_BUCKET;

if (!bucket) {
  console.warn('AWS_S3_BUCKET is not set. S3 operations will fail until configured.');
}

const s3Client = new S3Client({
  region,
  credentials:
    config.AWS_ACCESS_KEY && config.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: config.AWS_ACCESS_KEY,
          secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

// ────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ────────────────────────────────────────────────

function sanitizeKey(key: string | undefined): string {
  if (!key) return '';
  return key.replace(/^\/+/, '').replace(/\.\.+/g, '').replace(/\\/g, '/');
}

function generateKey(originalName = '', folderPrefix = ''): string {
  const ext = path.extname(originalName) || '';
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

async function uploadBuffer(
  buffer: Buffer,
  key?: string,
  contentType?: string,
  folderPrefix = ''
): Promise<UploadResult> {
  if (!bucket)
    throw Object.assign(new Error('S3 bucket not configured'), {
      status: 500,
      code: 'S3_BUCKET_NOT_CONFIGURED',
    });

  const finalKey = key ? sanitizeKey(key) : generateKey('', folderPrefix);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: finalKey,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
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

async function uploadStream(
  stream: NodeJS.ReadableStream,
  key?: string,
  contentType?: string,
  folderPrefix = ''
): Promise<UploadResult> {
  if (!bucket)
    throw Object.assign(new Error('S3 bucket not configured'), {
      status: 500,
      code: 'S3_BUCKET_NOT_CONFIGURED',
    });

  const finalKey = key ? sanitizeKey(key) : generateKey('', folderPrefix);

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: finalKey,
      Body: stream as any,
      ContentType: contentType || 'application/octet-stream',
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

async function deleteObject(key: string): Promise<void> {
  if (!bucket) throw new Error('S3 bucket not configured');

  const safeKey = sanitizeKey(key);
  const cmd = new DeleteObjectCommand({ Bucket: bucket, Key: safeKey });
  await s3Client.send(cmd);
}

async function getObjectStream(key: string): Promise<NodeJS.ReadableStream> {
  if (!bucket) throw new Error('S3 bucket not configured');

  const safeKey = sanitizeKey(key);
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: safeKey });
  const res = (await s3Client.send(cmd)) as GetObjectCommandOutput;

  if (!res.Body) {
    throw new Error('No body returned from S3');
  }

  return res.Body as NodeJS.ReadableStream;
}

async function getSignedDownloadUrl(key: string, expiresIn = 900): Promise<string> {
  if (!bucket) throw new Error('S3 bucket not configured');

  const safeKey = sanitizeKey(key);
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: safeKey });

  return getSignedUrl(s3Client, cmd, { expiresIn });
}

// ────────────────────────────────────────────────
// BATCH / MULTIPLE FILE FUNCTIONS
// ────────────────────────────────────────────────

async function uploadBuffers(
  items: UploadItemBuffer[],
  concurrency = 5
): Promise<
  Array<{ status: 'fulfilled'; value: UploadResult } | { status: 'rejected'; reason: unknown }>
> {
  if (!bucket) throw new Error('S3 bucket not configured');
  if (!items?.length) return [];

  const results = new Array(items.length);
  const queue = items.map((item, ix) => ({ item, ix }));

  async function processNext() {
    while (queue.length > 0) {
      const { item, ix } = queue.shift()!;

      try {
        const safeKey = sanitizeKey(
          item.key || generateKey(item.originalName || '', item.folderPrefix || '')
        );

        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: bucket,
            Key: safeKey,
            Body: item.buffer,
            ContentType: item.contentType || 'application/octet-stream',
          },
        });

        const result = await upload.done();

        results[ix] = {
          status: 'fulfilled',
          value: {
            Bucket: bucket,
            Key: safeKey,
            ETag: result.ETag,
            Location: `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(safeKey)}`,
          },
        };
      } catch (err) {
        results[ix] = { status: 'rejected', reason: err };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => processNext());

  await Promise.all(workers);

  return results;
}

async function uploadStreams(
  items: UploadItemStream[],
  concurrency = 5
): Promise<
  Array<{ status: 'fulfilled'; value: UploadResult } | { status: 'rejected'; reason: unknown }>
> {
  if (!bucket) throw new Error('S3 bucket not configured');
  if (!items?.length) return [];

  const results = new Array(items.length);
  const queue = items.map((item, ix) => ({ item, ix }));

  async function processNext() {
    while (queue.length > 0) {
      const { item, ix } = queue.shift()!;

      try {
        const safeKey = sanitizeKey(
          item.key || generateKey(item.originalName || '', item.folderPrefix || '')
        );

        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: bucket,
            Key: safeKey,
            Body: item.stream as any,
            ContentType: item.contentType || 'application/octet-stream',
          },
        });

        const result = await upload.done();

        results[ix] = {
          status: 'fulfilled',
          value: {
            Bucket: bucket,
            Key: safeKey,
            ETag: result.ETag,
            Location: `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(safeKey)}`,
          },
        };
      } catch (err) {
        results[ix] = { status: 'rejected', reason: err };
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => processNext());

  await Promise.all(workers);

  return results;
}

async function deleteObjects(keys: string[]): Promise<DeleteResult> {
  if (!bucket) throw new Error('S3 bucket not configured');
  if (!keys?.length) return { Deleted: [], Errors: [] };

  const safeKeys = keys.map(sanitizeKey).filter(Boolean);

  const chunks: string[][] = [];
  for (let i = 0; i < safeKeys.length; i += 1000) {
    chunks.push(safeKeys.slice(i, i + 1000));
  }

  const finalResult: DeleteResult = { Deleted: [], Errors: [] };

  for (const chunk of chunks) {
    const cmd = new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: {
        Objects: chunk.map((Key) => ({ Key })),
        Quiet: false,
      },
    });

    const response = await s3Client.send(cmd);

    if (response.Deleted) finalResult.Deleted.push(...response.Deleted);
    if (response.Errors) finalResult.Errors.push(...response.Errors);
  }

  return finalResult;
}

// ────────────────────────────────────────────────
// Exports
// ────────────────────────────────────────────────

export {
  deleteObject,
  deleteObjects,
  DeleteResult,
  generateKey,
  getObjectStream,
  getSignedDownloadUrl,
  uploadBuffer,
  uploadBuffers,
  UploadItemBuffer,
  UploadItemStream,
  // Types
  UploadResult,
  uploadStream,
  uploadStreams,
};
