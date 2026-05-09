/**
 * Renders invoice HTML templates to PDF (Letter) via Puppeteer.
 * Run from repo root: node proofs/strata-noble/OCS-SN-INVOICE-BRAND-STANDARD-0001/render-pdfs.mjs
 */
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.join(__dirname, "template");
const outDir = path.join(__dirname, "pdf");

const files = [
  ["sn-020426.html", "SN-020426-Strata-Noble-Invoice.pdf"],
  ["sn-030429.html", "SN-030429-Strata-Noble-Invoice.pdf"],
];

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  for (const [htmlName, pdfName] of files) {
    const page = await browser.newPage();
    const url = pathToFileURL(path.join(templateDir, htmlName)).href;
    await page.goto(url, { waitUntil: "load" });
    await page.evaluateHandle(() => document.fonts.ready);
    await page.pdf({
      path: path.join(outDir, pdfName),
      format: "Letter",
      printBackground: true,
      margin: { top: "0.55in", bottom: "0.55in", left: "0.6in", right: "0.6in" },
    });
    await page.close();
    console.log("Wrote", pdfName);
  }
} finally {
  await browser.close();
}
