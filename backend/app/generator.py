from __future__ import annotations

import base64
import os
from io import BytesIO

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.oxml.ns import qn

from app.models import SlideRequest, ImageData

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "assets", "template.pptx")

# Layout indices from the template
LAYOUT_TITLE = 0      # 제목 슬라이드
LAYOUT_CONTENT = 1    # 제목 및 내용
LAYOUT_TWO_COL = 2    # 콘텐츠 2개
LAYOUT_COMPARE = 3    # 비교
LAYOUT_TITLE_ONLY = 4 # 제목만

COVER_BG = RGBColor(0x00, 0x1D, 0x2C)


def _set_slide_bg(slide, color):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def _add_textbox(slide, left, top, width, height, text, font_name="맑은 고딕",
                 font_size=Pt(14), font_color=RGBColor(0x33, 0x33, 0x33),
                 bold=False, alignment=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    txbox = slide.shapes.add_textbox(left, top, width, height)
    tf = txbox.text_frame
    tf.word_wrap = True

    anchor_map = {MSO_ANCHOR.TOP: "t", MSO_ANCHOR.MIDDLE: "ctr", MSO_ANCHOR.BOTTOM: "b"}
    body_pr = tf._txBody.find(qn("a:bodyPr"))
    if body_pr is not None:
        body_pr.set("anchor", anchor_map.get(anchor, "t"))

    p = tf.paragraphs[0]
    p.text = text
    p.font.name = font_name
    p.font.size = font_size
    p.font.color.rgb = font_color
    p.font.bold = bold
    p.alignment = alignment
    return txbox


def _add_bullets(slide, left, top, width, height, bullets,
                 font_name="맑은 고딕", font_size=Pt(14),
                 text_color=RGBColor(0x33, 0x33, 0x33)):
    txbox = slide.shapes.add_textbox(left, top, width, height)
    tf = txbox.text_frame
    tf.word_wrap = True

    for i, bullet_text in enumerate(bullets):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        if i > 0:
            p.space_before = Pt(6)
        p.text = bullet_text
        p.font.name = font_name
        p.font.size = font_size
        p.font.color.rgb = text_color

        pPr = p._p.get_or_add_pPr()
        for tag in ["a:buChar", "a:buFont", "a:buClr"]:
            for old in pPr.findall(qn(tag)):
                pPr.remove(old)
        pPr.append(pPr.makeelement(qn("a:buFont"), {"typeface": "Arial"}))
        pPr.append(pPr.makeelement(qn("a:buChar"), {"char": "●"}))
        pPr.set("indent", str(Emu(-228600)))
        pPr.set("marL", str(Emu(457200)))

    return txbox


def _add_divider(slide, left, top, width, color, thickness=Pt(1)):
    shape = slide.shapes.add_shape(1, left, top, width, thickness)
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()


def _decode_image(img_data: ImageData) -> BytesIO:
    raw = img_data.data
    if "," in raw:
        raw = raw.split(",", 1)[1]
    return BytesIO(base64.b64decode(raw))


def _add_image(slide, img_data: ImageData, left, top, width, height):
    stream = _decode_image(img_data)
    slide.shapes.add_picture(stream, left, top, width, height)


# ── Slide Builders (using template layouts) ──

def _build_title_slide(prs, data: SlideRequest):
    """표지: 원본 슬라이드1과 동일한 포맷"""
    slide = prs.slides.add_slide(prs.slide_layouts[LAYOUT_TITLE])
    _set_slide_bg(slide, COVER_BG)

    # 기존 placeholder 숨기기 (빈 텍스트)
    for ph in slide.placeholders:
        ph.text = ""

    _add_textbox(
        slide, Inches(3.44), Inches(1.86), Inches(3.39), Inches(0.76),
        data.title, font_size=Pt(40),
        font_color=RGBColor(0xFF, 0xFF, 0xFF),
        alignment=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
    )

    _add_divider(
        slide, Inches(1.63), Inches(2.70), Inches(7.01),
        RGBColor(0xFF, 0xFF, 0xFF),
    )

    if data.subtitle:
        _add_textbox(
            slide, Inches(5.79), Inches(3.91), Inches(2.91), Inches(0.45),
            data.subtitle, font_size=Pt(14),
            font_color=RGBColor(0xBB, 0xBB, 0xBB),
            alignment=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE,
        )


def _build_toc_slide(prs, data: SlideRequest):
    """목차: layout[1] 제목 및 내용 사용"""
    slide = prs.slides.add_slide(prs.slide_layouts[LAYOUT_CONTENT])

    # 제목 placeholder 채우기
    for ph in slide.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text = "목차"
            for run in ph.text_frame.paragraphs[0].runs:
                run.font.bold = True
        elif ph.placeholder_format.idx == 1:
            ph.text = ""

    if data.bullets:
        txbox = slide.shapes.add_textbox(Inches(0.5), Inches(1.06), Inches(5.48), Inches(2.93))
        tf = txbox.text_frame
        tf.word_wrap = True
        for i, b in enumerate(data.bullets):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            if i > 0:
                p.space_before = Pt(10)
            p.text = f"{i+1}. {b}"
            p.font.name = "맑은 고딕"
            p.font.size = Pt(15)
            p.font.bold = True


def _build_content_slide(prs, data: SlideRequest):
    """콘텐츠: layout[1] 제목 및 내용 사용"""
    slide = prs.slides.add_slide(prs.slide_layouts[LAYOUT_CONTENT])

    for ph in slide.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text = data.title
        elif ph.placeholder_format.idx == 1:
            ph.text = ""

    has_images = len(data.images) > 0
    text_width = Inches(5.5) if has_images else Inches(8.6)

    if data.bullets:
        _add_bullets(
            slide, Inches(0.5), Inches(1.08), text_width, Inches(3.9),
            data.bullets,
        )

    if has_images:
        _add_image(slide, data.images[0], Inches(6.3), Inches(1.08), Inches(3.2), Inches(2.5))
        if len(data.images) > 1:
            _add_image(slide, data.images[1], Inches(6.3), Inches(3.8), Inches(3.2), Inches(1.5))


def _build_image_text_slide(prs, data: SlideRequest):
    """이미지+텍스트: layout[1] 사용"""
    slide = prs.slides.add_slide(prs.slide_layouts[LAYOUT_CONTENT])

    for ph in slide.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text = data.title
        elif ph.placeholder_format.idx == 1:
            ph.text = ""

    if data.images:
        _add_image(slide, data.images[0], Inches(1.5), Inches(1.18), Inches(7), Inches(3.0))

    caption = data.caption or (data.bullets[0] if data.bullets else "")
    if caption:
        _add_textbox(
            slide, Inches(0.5), Inches(4.4), Inches(9), Inches(0.4),
            caption, font_size=Pt(15), bold=True,
        )


def _build_grid_slide(prs, data: SlideRequest):
    """이미지 그리드: layout[1] 사용"""
    slide = prs.slides.add_slide(prs.slide_layouts[LAYOUT_CONTENT])

    for ph in slide.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text = data.title
        elif ph.placeholder_format.idx == 1:
            ph.text = ""

    images = data.images
    labels = data.bullets
    count = len(images)
    if count == 0:
        return

    cols = min(count, 3)
    card_w = Inches(2.5)
    card_h = Inches(1.6)
    gap = Inches(0.3)
    total_w = cols * card_w + (cols - 1) * gap
    start_x = (Inches(10) - total_w) // 2

    for idx, img in enumerate(images):
        col = idx % cols
        row = idx // cols
        if row >= 2:
            break
        x = start_x + col * (card_w + gap)
        y = Inches(1.2) + row * (card_h + Inches(0.6))

        _add_image(slide, img, x, y, card_w, card_h)

        label = labels[idx] if idx < len(labels) else ""
        if label:
            _add_textbox(
                slide, x, y + card_h + Inches(0.05), card_w, Inches(0.25),
                label, font_size=Pt(10), alignment=PP_ALIGN.CENTER,
            )


def _build_two_column_slide(prs, data: SlideRequest):
    """2단 비교: layout[3] 비교 사용"""
    slide = prs.slides.add_slide(prs.slide_layouts[LAYOUT_COMPARE])

    for ph in slide.placeholders:
        idx = ph.placeholder_format.idx
        if idx == 0:
            ph.text = data.title
        elif idx == 1:
            ph.text = data.left_title
        elif idx == 2:
            tf = ph.text_frame
            tf.clear()
            for i, b in enumerate(data.left_bullets):
                p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                p.text = b
                p.font.size = Pt(14)
                p.font.name = "맑은 고딕"
        elif idx == 3:
            ph.text = data.right_title
        elif idx == 4:
            tf = ph.text_frame
            tf.clear()
            for i, b in enumerate(data.right_bullets):
                p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
                p.text = b
                p.font.size = Pt(14)
                p.font.name = "맑은 고딕"


def _build_closing_slide(prs, data: SlideRequest):
    """마무리: 원본 슬라이드13과 동일한 포맷"""
    slide = prs.slides.add_slide(prs.slide_layouts[LAYOUT_CONTENT])

    for ph in slide.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text = "맺음말"
        elif ph.placeholder_format.idx == 1:
            ph.text = ""

    _add_textbox(
        slide, Inches(2.80), Inches(2.16), Inches(7.00), Inches(2.04),
        data.title or "감사합니다.",
        font_size=Pt(54),
        font_color=RGBColor(0x33, 0x33, 0x33),
        alignment=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE,
    )


LAYOUT_BUILDERS = {
    "title": _build_title_slide,
    "toc": _build_toc_slide,
    "content": _build_content_slide,
    "image-text": _build_image_text_slide,
    "grid": _build_grid_slide,
    "two-column": _build_two_column_slide,
    "closing": _build_closing_slide,
}


def generate_pptx(title: str, theme_name: str, slides: list[SlideRequest]) -> BytesIO:
    prs = Presentation(TEMPLATE_PATH)

    for slide_data in slides:
        builder = LAYOUT_BUILDERS.get(slide_data.layout)
        if builder:
            builder(prs, slide_data)

    buffer = BytesIO()
    prs.save(buffer)
    buffer.seek(0)
    return buffer
