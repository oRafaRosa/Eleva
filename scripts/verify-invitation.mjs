import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { chromium, webkit } = createRequire(import.meta.url)("playwright");

// Optional local browser QA, not part of the production dependency graph.
const output = process.argv[2] || "/tmp/eleva-invitation-qa";
fs.mkdirSync(output, { recursive: true });
const root = path.resolve("dist");
const mime = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpeg": "image/jpeg",
  ".ttf": "font/ttf",
  ".json": "application/json",
};
const server = http.createServer((req, res) => {
  const route = decodeURIComponent(
    new URL(req.url, "http://localhost").pathname,
  ).replace(/^\/Eleva/, "");
  let file = path.resolve(root, "." + route);
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory())
    file = path.join(file, "index.html");
  if (!fs.existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": mime[path.extname(file)] || "application/octet-stream",
  });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = `http://127.0.0.1:${server.address().port}/Eleva/convite/`;
if (process.argv.includes("--serve")) {
  console.log(address);
  await new Promise(() => {});
}
let verified = 0;
try {
  for (const [name, engine] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    if (!fs.existsSync(engine.executablePath())) {
      console.log(`${name}: executável não disponível`);
      continue;
    }
    const browser = await engine.launch({
      headless: true,
      args: name === "chromium" ? ["--no-sandbox"] : [],
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (response) => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(address);
      await page.locator(".invite-seal").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      for (const p of [0, 0.25, 0.6, 1]) {
        await page.evaluate((progress) => {
          const root = document.querySelector(".invite-page");
          const story = document.querySelector(".invite-story");
          root.scrollTop = (story.offsetHeight - root.clientHeight) * progress;
        }, p);
        await page.waitForTimeout(800);
        await page.screenshot({ path: `${output}/${name}-${p}.png` });
        console.log(
          name,
          p,
          await page.locator(".invite-letter").boundingBox(),
        );
      }
      assert.equal(
        await page.locator(".invite-final").getAttribute("aria-hidden"),
        "false",
      );
      assert.equal(
        await page
          .getByRole("link", { name: /Quero saber mais/ })
          .getAttribute("href"),
        "https://www.instagram.com/elevatheclub/",
      );
      await page.getByRole("button", { name: "Fechar o envelope" }).click();
      await page.waitForTimeout(1000);
      assert.equal(
        await page
          .locator(".invite-page")
          .evaluate((el) => Math.round(el.scrollTop)),
        0,
      );
      await page.getByRole("button", { name: "Ler convite" }).click();
      assert.equal(await page.locator(".invite-story").count(), 0);
      assert.ok(
        await page
          .getByRole("heading", { name: /Você está convidada/ })
          .isVisible(),
      );
      await page.screenshot({
        path: `${output}/${name}-readable.png`,
        fullPage: true,
      });
      for (const viewport of [
        { width: 320, height: 568 },
        { width: 1440, height: 900 },
      ]) {
        await page.setViewportSize(viewport);
        await page.reload();
        await page.locator(".invite-seal").waitFor();
        await page.evaluate(() => {
          const root = document.querySelector(".invite-page");
          root.scrollTop = root.scrollHeight;
        });
        await page.waitForTimeout(1000);
        assert.equal(
          await page.locator(".invite-final").getAttribute("aria-hidden"),
          "false",
        );
        await page.screenshot({
          path: `${output}/${name}-${viewport.width}-open.png`,
        });
      }
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.reload();
      await page
        .getByRole("heading", { name: /Você está convidada/ })
        .waitFor();
      assert.equal(await page.locator(".invite-story").count(), 0);
      assert.equal(await page.locator(".invite-flap").count(), 0);
      assert.deepEqual(errors, []);
      console.log(
        `${name}: rolagem, retorno, leitura, redução de movimento e recursos sem erros`,
      );
      verified++;
    } finally {
      await browser.close();
    }
  }
} finally {
  server.close();
}
if (!verified)
  throw new Error("Nenhum navegador disponível para validar o convite.");
