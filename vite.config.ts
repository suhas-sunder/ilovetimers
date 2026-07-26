// vite.config.ts
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

function staticPrerenderPreview(): Plugin {
  let clientBuildDirectory = "";

  return {
    name: "static-prerender-preview",
    configResolved(config) {
      clientBuildDirectory = path.resolve(config.root, "build", "client");
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method !== "GET" && request.method !== "HEAD") {
          next();
          return;
        }

        const pathname = new URL(
          request.url ?? "/",
          "http://static-preview.local",
        ).pathname;
        const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "";
        if (lastSegment.includes(".")) {
          next();
          return;
        }

        const relativeRoute = pathname.replace(/^\/+|\/+$/g, "");
        const routeHtml = relativeRoute
          ? path.join(clientBuildDirectory, relativeRoute, "index.html")
          : path.join(clientBuildDirectory, "index.html");
        const fallbackHtml = path.join(
          clientBuildDirectory,
          "__spa-fallback.html",
        );
        const file = existsSync(routeHtml) ? routeHtml : fallbackHtml;

        if (!existsSync(file)) {
          next();
          return;
        }

        response.statusCode = file === fallbackHtml ? 404 : 200;
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.setHeader("Content-Length", statSync(file).size);
        if (request.method === "HEAD") {
          response.end();
          return;
        }
        createReadStream(file).pipe(response);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
    staticPrerenderPreview(),
  ],
  ssr: {
    noExternal: ["posthog-js", "posthog-js/react"],
  },
});
