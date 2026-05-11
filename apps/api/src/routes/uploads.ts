import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createPresignedUpload, uploadBuffer } from "../lib/r2.js";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export const uploadsRoute = new Hono<AppEnv>();

uploadsRoute.use("*", requireAuth);

const presignSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic"]),
  folder: z.enum(["avatars", "recipes", "uploads"]).default("uploads"),
});

uploadsRoute.post(
  "/presign",
  zValidator("json", presignSchema),
  async (c) => {
    const { contentType, folder } = c.req.valid("json");

    try {
      const result = await createPresignedUpload(contentType, folder);
      return c.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      return c.json({ error: message, code: "UPLOAD_FAILED" }, 400);
    }
  },
);

uploadsRoute.post("/direct", async (c) => {
  const contentType = c.req.header("Content-Type") ?? "";
  const folder = c.req.query("folder") ?? "uploads";

  try {
    const body = await c.req.arrayBuffer();
    const buffer = Buffer.from(body);
    const result = await uploadBuffer(buffer, contentType, folder);
    return c.json(result, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return c.json({ error: message, code: "UPLOAD_FAILED" }, 400);
  }
});
