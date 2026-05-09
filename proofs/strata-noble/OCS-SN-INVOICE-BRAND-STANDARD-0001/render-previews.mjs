/**
 * PNG previews for proof pack (Letter viewport).
 */
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.join(__dirname, "template");
const outDir = path.join(__dirname, "previews");

const files = ["sn-020426.html", "sn-030429.html"];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const htmlName of files) {
    const page = await browser.newPage();
    await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(path.join(templateDir, htmlName)).href, {
      waitUntil: "load",
    });
    await page.evaluateHandle(() => document.fonts.ready);
    const base = htmlName.replace(".html", "");
    await page.screenshot({
      path: path.join(outDir, `${base}-preview.png`),
      fullPage: true,
    });
    await page.close();
    console.log("Wrote previews/" + base + "-preview.png");
  }
} finally {
  await browser.close();
}
