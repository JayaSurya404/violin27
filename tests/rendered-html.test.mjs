import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://purple-aurora.example/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Purple Aurora arrival", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="en"/i);
  assert.match(html, /A birthday aurora for Yazhini Sri/i);
  assert.match(html, /Hold to unlock your birthday surprise/i);
  assert.match(html, /Purple Aurora/i);
  assert.match(html, /og:image/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/i);
});

test("keeps personal content centralized and removes starter UI", async () => {
  const [page, layout, config, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/config/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /BirthdayExperience/);
  assert.match(layout, /generateMetadata/);
  assert.match(config, /const recipientName = "Yazhini Sri"/);
  assert.match(config, /moonUnlockInteractions:\s*5/);
  assert.match(config, /tapToExtinguishCandles:\s*false/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(
    access(new URL("../app/_sites-preview", templateRoot)),
  );
});
