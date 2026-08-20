"""PDF generation endpoint using Playwright (headless Chromium)."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from playwright.async_api import async_playwright

router = APIRouter()


class PdfRequest(BaseModel):
    html: str


@router.post("/api/pdf")
async def generate_pdf(request: PdfRequest) -> Response:
    """
    Render HTML to PDF using headless Chromium (Playwright).
    Accepts raw HTML, returns application/pdf bytes.
    """
    if not request.html or len(request.html) > 2_000_000:
        raise HTTPException(status_code=400, detail="Invalid HTML payload")

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                args=["--no-sandbox", "--disable-setuid-sandbox"]
            )
            page = await browser.new_page()

            # Load HTML directly (no network round-trip)
            await page.set_content(request.html, wait_until="networkidle")

            pdf_bytes = await page.pdf(
                format="A4",
                print_background=True,   # needed for dark cover
                margin={
                    "top": "0",
                    "bottom": "0",
                    "left": "0",
                    "right": "0",
                },
            )
            await browser.close()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=business-energie.pdf"
            },
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {exc}") from exc
