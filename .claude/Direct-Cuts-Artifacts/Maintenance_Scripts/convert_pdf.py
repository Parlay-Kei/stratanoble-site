import pypdfium2 as pdfium
import os

pdf_path = "Direct Cuts Deck Powerpoint.pdf"
output_dir = "output_images"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print(f"Converting {pdf_path} to images using pypdfium2...")

pdf = pdfium.PdfDocument(pdf_path)
n_pages = len(pdf)

for i in range(n_pages):
    page = pdf[i]
    # Render the page to a PIL image
    # scale=3 corresponds roughly to 300 DPI (72 * 3 = 216, close enough for high res)
    # or we can specify exact size. Let's use scale=3 for good quality.
    image = page.render(scale=3).to_pil()
    
    output_file = os.path.join(output_dir, f"page_{i+1:03d}.png")
    image.save(output_file)
    print(f"Saved {output_file}")

print("Conversion complete.")
