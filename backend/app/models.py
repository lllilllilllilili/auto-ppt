from __future__ import annotations

from pydantic import BaseModel


class ImageData(BaseModel):
    data: str  # base64
    content_type: str = "image/png"


class SlideRequest(BaseModel):
    layout: str
    title: str = ""
    subtitle: str = ""
    bullets: list[str] = []
    left_title: str = ""
    left_bullets: list[str] = []
    right_title: str = ""
    right_bullets: list[str] = []
    images: list[ImageData] = []
    caption: str = ""


class PresentationRequest(BaseModel):
    title: str
    theme: str = "business"
    slides: list[SlideRequest]
