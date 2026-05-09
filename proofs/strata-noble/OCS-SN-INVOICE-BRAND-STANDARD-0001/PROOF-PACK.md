# Proof pack — OCS-SN-INVOICE-BRAND-STANDARD-0001

## Rendered outputs (primary)

| Invoice | PDF path |
|---------|----------|
| SN-020426 | `proofs/strata-noble/OCS-SN-INVOICE-BRAND-STANDARD-0001/pdf/SN-020426-Strata-Noble-Invoice.pdf` |
| SN-030429 | `proofs/strata-noble/OCS-SN-INVOICE-BRAND-STANDARD-0001/pdf/SN-030429-Strata-Noble-Invoice.pdf` |

## PNG previews (proof)

| Invoice | Screenshot path |
|---------|-----------------|
| SN-020426 | `previews/sn-020426-preview.png` |
| SN-030429 | `previews/sn-030429-preview.png` |

Regenerate: `node proofs/strata-noble/OCS-SN-INVOICE-BRAND-STANDARD-0001/render-previews.mjs` (Puppeteer).

## Source template paths

| Asset | Path |
|-------|------|
| Base styles | `template/invoice-base.css` |
| SN-020426 HTML | `template/sn-020426.html` |
| SN-030429 HTML | `template/sn-030429.html` |
| PDF render script | `render-pdfs.mjs` |

## Brand assets referenced

- Strata icon graphic (inline SVG): same geometry as `branding/stratanoble_logoICON.svg` (also published as `apps/website/public/stratanoble_logoICON.svg`).

## Design decision notes (short)

- Light document surface (not marketing dark theme) to read as **record**, not **campaign**.
- **One** status treatment per page; paid uses **Balance**; open uses **Amount due** — no duplicate “due” labels.
- Wordmark is **title case** “Strata Noble” with a single **Strata Noble LLC** legal subline — avoids the rejected all-caps LLC treatment.
- **Screenshots:** Open the two PDFs locally for pixel proof; they are the authoritative render of the HTML templates.

## Regenerate PDFs

From repository root (requires `puppeteer` available to Node, e.g. `npm install puppeteer` if not present):

```bash
node proofs/strata-noble/OCS-SN-INVOICE-BRAND-STANDARD-0001/render-pdfs.mjs
```
