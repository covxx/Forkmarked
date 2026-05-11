import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { meRoute } from "./routes/me.js";
import { usersRoute } from "./routes/users.js";
import { recipesRoute } from "./routes/recipes.js";
import { collectionsRoute } from "./routes/collections.js";
import { uploadsRoute } from "./routes/uploads.js";
import type { AppEnv } from "./types.js";

export const app = new Hono<AppEnv>();

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/me", meRoute);
app.route("/api/users", usersRoute);
app.route("/api/recipes", recipesRoute);
app.route("/api/collections", collectionsRoute);
app.route("/api/uploads", uploadsRoute);
