from __future__ import annotations

from pydantic import BaseModel


class TitleSlide(BaseModel):
    layout: str = "title"
    title: str
    subtitle: str = ""


class ContentSlide(BaseModel):
    layout: str = "content"
    title: str
    bullets: list[str] = []


class TwoColumnSlide(BaseModel):
    layout: str = "two-column"
    title: str
    left_title: str = ""
    left_bullets: list[str] = []
    right_title: str = ""
    right_bullets: list[str] = []


class ClosingSlide(BaseModel):
    layout: str = "closing"
    title: str = "감사합니다"


class SlideRequest(BaseModel):
    layout: str
    title: str = ""
    subtitle: str = ""
    bullets: list[str] = []
    left_title: str = ""
    left_bullets: list[str] = []
    right_title: str = ""
    right_bullets: list[str] = []


class PresentationRequest(BaseModel):
    title: str
    theme: str = "business"
    slides: list[SlideRequest]
