import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

export function spawnStaticPreview({
  root,
  port,
  stdio = "ignore",
}) {
  const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");

  return spawn(
    process.execPath,
    [
      viteCli,
      "preview",
      "--host",
      "127.0.0.1",
      "--port",
      String(port),
      "--strictPort",
    ],
    {
      cwd: root,
      env: { ...process.env, NODE_ENV: "production" },
      stdio,
    },
  );
}

export async function readStaticRedirectRules(root) {
  const file = path.join(root, "build", "client", "_redirects");
  const source = await readFile(file, "utf8");
  const rules = source
    .split(/\r?\n/)
    .map((line) => line.replace(/#.*$/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const [from, to, status] = line.split(/\s+/);
      return { from, to, status };
    });

  return {
    rules,
    permanent: new Map(
      rules
        .filter(({ status }) => status === "301" || status === "301!")
        .map(({ from, to }) => [from, to]),
    ),
  };
}
