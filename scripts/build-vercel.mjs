import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

// Keep auth links on the verified origin until the custom domain's DNS is ready.
const configured =
  process.env.EXPO_PUBLIC_SITE_URL || "https://eleva-the-club.vercel.app";
if (!configured)
  throw new Error(
    "Configure EXPO_PUBLIC_SITE_URL ou habilite as variáveis de sistema da Vercel.",
  );
const site = new URL(configured);
if (
  site.protocol !== "https:" ||
  site.pathname !== "/" ||
  site.search ||
  site.hash ||
  site.username ||
  site.password
) {
  throw new Error(
    "A URL da Vercel deve ser uma origem HTTPS, sem subpasta, credenciais ou parâmetros.",
  );
}
const siteUrl = site.origin;
const result = spawnSync(
  process.execPath,
  ["node_modules/expo/bin/cli", "export", "--platform", "web"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      ELEVA_WEB_BASE_PATH: "",
      EXPO_PUBLIC_SITE_URL: siteUrl,
    },
  },
);
if (result.status !== 0) process.exit(result.status ?? 1);
const html = readFileSync("dist/index.html", "utf8");
if (html.includes("/Eleva/_expo/"))
  throw new Error("O build Vercel não deve usar a subpasta do Pages.");
if (!html.includes('href="/icons/eleva-seal-180-v2.png"'))
  throw new Error("Ícone de Tela de Início ausente.");
mkdirSync("dist/email", { recursive: true });
for (const [source, target] of [
  [
    "public/email/confirmation-preview.html",
    "dist/email/confirmation-preview.html",
  ],
  [
    "supabase/templates/confirmation.html",
    "dist/email/confirmation-template.html",
  ],
]) {
  writeFileSync(
    target,
    readFileSync(source, "utf8")
      .replaceAll("https://orafarosa.github.io/Eleva", siteUrl)
      .replaceAll("https://eleva-the-club.vercel.app", siteUrl),
  );
}
mkdirSync("dist/convite", { recursive: true });
writeFileSync(
  "dist/convite/index.html",
  html
    .replace(
      /<title>.*?<\/title>/,
      "<title>Um convite para você | ELEVA · 24.10</title>",
    )
    .replace(
      "</head>",
      `<meta property="og:title" content="Um convite para você | ELEVA · 24.10"/><meta property="og:url" content="${siteUrl}/convite/"/></head>`,
    ),
);
console.log(
  "Build Vercel pronto: origem HTTPS, rotas na raiz e imagens de e-mail locais.",
);
