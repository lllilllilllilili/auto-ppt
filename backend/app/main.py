from urllib.parse import quote

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.models import PresentationRequest
from app.generator import generate_pptx

app = FastAPI(title="Auto PPT Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate")
def generate(req: PresentationRequest):
    buffer = generate_pptx(req.title, req.slides)

    filename = f"{req.title}.pptx"
    encoded = quote(filename)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded}"},
    )


@app.get("/health")
def health():
    return {"status": "ok"}
