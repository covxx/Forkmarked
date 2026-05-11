import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
  };
  return map[mime] ?? "jpg";
}

export async function createPresignedUpload(
  contentType: string,
  folder: string = "uploads",
) {
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  const key = `${folder}/${randomUUID()}.${extFromMime(contentType)}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  const publicUrl = PUBLIC_URL
    ? `${PUBLIC_URL}/${key}`
    : `${process.env.R2_ENDPOINT}/${BUCKET}/${key}`;

  return { presignedUrl, key, publicUrl };
}

export async function uploadBuffer(
  buffer: Buffer,
  contentType: string,
  folder: string = "uploads",
) {
  if (!ALLOWED_TYPES.has(contentType)) {
    throw new Error(`Unsupported content type: ${contentType}`);
  }

  if (buffer.length > MAX_SIZE) {
    throw new Error("File too large (max 10 MB)");
  }

  const key = `${folder}/${randomUUID()}.${extFromMime(contentType)}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const publicUrl = PUBLIC_URL
    ? `${PUBLIC_URL}/${key}`
    : `${process.env.R2_ENDPOINT}/${BUCKET}/${key}`;

  return { key, publicUrl };
}

export async function deleteObject(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}
