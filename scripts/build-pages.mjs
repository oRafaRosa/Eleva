import { spawnSync } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

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
const html = readFileSync("dist/index.html", "utf8").replace(
  'href="/apple-touch-icon.png"',
  `href="${basePath}/apple-touch-icon.png"`,
);
writeFileSync("dist/index.html", html);
if (!html.includes(`${basePath}/_expo/`)) {
  throw new Error(
    "O build não contém os caminhos esperados para GitHub Pages.",
  );
}
if (!html.includes(`href="${basePath}/apple-touch-icon.png"`)) {
  throw new Error("O ícone de Tela de Início não está configurado no HTML.");
}
const touchIcon = readFileSync("dist/apple-touch-icon.png");
if (touchIcon.readUInt32BE(16) !== 180 || touchIcon.readUInt32BE(20) !== 180) {
  throw new Error("O ícone de Tela de Início deve ter 180 × 180 pixels.");
}
// GitHub Pages does not provide SPA rewrites. Deep links load the same app.
copyFileSync("dist/index.html", "dist/404.html");
mkdirSync("dist/convite", { recursive: true });
const invitationHtml = html
  .replace(
    /<title>.*?<\/title>/,
    "<title>Um convite para você | ELEVA · 24.10</title>",
  )
  .replace(
    "</head>",
    '<meta name="description" content="24 de outubro. Um convite para o lançamento da ELEVA The Club."/><meta property="og:title" content="Um convite para você | ELEVA · 24.10"/><meta property="og:description" content="24 de outubro. Abra o convite para o lançamento da ELEVA The Club."/><meta property="og:type" content="website"/><meta property="og:url" content="https://orafarosa.github.io/Eleva/convite/"/></head>',
  );
writeFileSync("dist/convite/index.html", invitationHtml);
writeFileSync("dist/.nojekyll", "");
console.log(
  "Build GitHub Pages pronto: /Eleva, fallback 404 e assets verificados.",
);
