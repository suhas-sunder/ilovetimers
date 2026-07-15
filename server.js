import compression from "compression";
import express from "express";
import morgan from "morgan";
import { Readable } from "node:stream";
import { getPermanentRedirect } from "./app/config/redirects.js";

// Short-circuit the type-checking of the built output.
const BUILD_PATH = "./build/server/server.js";
const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3008");
const HMR_PORT = Number.parseInt(process.env.HMR_PORT || "3009");

const app = express();

app.use(compression());
app.disable("x-powered-by");

app.use((req, res, next) => {
  const url = new URL(req.originalUrl || req.url, "http://localhost");
  const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
  const destination = getPermanentRedirect(normalizedPath);

  if (!destination) {
    next();
    return;
  }

  res.redirect(301, destination + url.search);
});

/**
 * @param {import("express").Request} req
 */
function toFetchRequest(req) {
  const protocol = req.protocol ?? "http";
  const host = req.get("host") ?? "localhost";
  const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value != null) {
      headers.set(key, String(value));
    }
  }

  /** @type {RequestInit & { body?: any; duplex?: "half" }} */
  const init = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req;
    init.duplex = "half";
  }

  return new Request(url.href, init);
}

/**
 * @param {(request: Request, context: Record<string, unknown>) => Promise<Response>} fetchHandler
 * @returns {import("express").RequestHandler}
 */
function createExpressMiddleware(fetchHandler) {
  return async (req, res, next) => {
    try {
      const response = await fetchHandler(toFetchRequest(req), {});

      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      if (!response.body) {
        res.end();
        return;
      }

      Readable.fromWeb(
        /** @type {import("node:stream/web").ReadableStream} */ (response.body),
      ).pipe(res);
    } catch (error) {
      next(error);
    }
  };
}

if (DEVELOPMENT) {
  console.log("Starting development server");
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true, hmr: { port: HMR_PORT } },
    }),
  );
  app.use(viteDevServer.middlewares);
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule("./server/app.ts");
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === "object" && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  console.log("Starting production server");
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
  app.use(morgan("tiny"));
  app.use(express.static("build/client", { maxAge: "1h" }));
  app.use(
    await import(BUILD_PATH).then((mod) => {
      const handler = mod.app ?? mod.default;
      if (typeof handler !== "function") {
        throw new TypeError("React Router build did not export a request handler");
      }
      return createExpressMiddleware(handler);
    }),
  );
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
