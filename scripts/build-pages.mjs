import { spawnSync } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const basePath = "/Eleva";
const build = spawnSync(
  process.execPath,
  ["node_modules/expo/bin/cli", "export", "--platform", "web"],
  {
    stdio: "inherit",
    env: { ...process.env, ELEVA_WEB_BASE_PATH: basePath },
  },
);
if (build.status !== 0) process.exit(build.status ?? 1);
const html = readFileSync("dist/index.html", "utf8");
if (!html.includes(`${basePath}/_expo/`)) {
  throw new Error(
    "O build não contém os caminhos esperados para GitHub Pages.",
  );
}
// GitHub Pages does not provide SPA rewrites. Deep links load the same app.
copyFileSync("dist/index.html", "dist/404.html");
writeFileSync("dist/.nojekyll", "");
console.log(
  "Build GitHub Pages pronto: /Eleva, fallback 404 e assets verificados.",
);
