from __future__ import annotations

import base64
from io import BytesIO

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

from pptx.dml.color import RGBColor

from app.models import SlideRequest, ImageData
from app.templates import get_theme

SLIDE_WIDTH = Inches(10)
SLIDE_HEIGHT = Inches(5.625)


def _set_slide_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def _add_textbox(slide, left, top, width, height, text, font_name, font_size, font_color,
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


def _add_multiline(slide, left, top, width, height, lines, font_name, font_size,
                   text_color, bold=False, line_spacing=Pt(8), alignment=PP_ALIGN.LEFT):
    txbox = slide.shapes.add_textbox(left, top, width, height)
    tf = txbox.text_frame
    tf.word_wrap = True

    for i, line_text in enumerate(lines):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
            p.space_before = line_spacing

        p.text = line_text
        p.font.name = font_name
        p.font.size = font_size
        p.font.color.rgb = text_color
        p.font.bold = bold
        p.alignment = alignment


def _add_bullets(slide, left, top, width, height, bullets, font_name, font_size,
                 text_color, bullet_color):
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
        p.level = 0

        pPr = p._p.get_or_add_pPr()
        for tag in ["a:buChar", "a:buFont", "a:buClr"]:
            for old in pPr.findall(qn(tag)):
                pPr.remove(old)

        buClr = pPr.makeelement(qn("a:buClr"), {})
        srgb = buClr.makeelement(qn("a:srgbClr"), {"val": str(bullet_color)})
        buClr.append(srgb)
        pPr.append(buClr)
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


def _add_title_bar(slide, left, top, width, height, text, theme):
    shape = slide.shapes.add_shape(1, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = theme["heading_bg"]
    shape.line.fill.background()

    tf = shape.text_frame
    tf.word_wrap = True
    body_pr = tf._txBody.find(qn("a:bodyPr"))
    if body_pr is not None:
        body_pr.set("anchor", "ctr")
        body_pr.set("lIns", str(Emu(Inches(0.3))))

    p = tf.paragraphs[0]
    p.text = text
    p.font.name = theme["title_font"]
    p.font.size = theme["heading_size"]
    p.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    p.font.bold = True


def _decode_image(img_data: ImageData) -> BytesIO:
    raw = img_data.data
    if "," in raw:
        raw = raw.split(",", 1)[1]
    return BytesIO(base64.b64decode(raw))


def _add_image(slide, img_data: ImageData, left, top, width, height):
    stream = _decode_image(img_data)
    slide.shapes.add_picture(stream, left, top, width, height)


# --- Slide Builders ---

def _build_title_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["cover_bg"])

    _add_textbox(
        slide, Inches(1.5), Inches(1.6), Inches(7), Inches(1),
        slide_data.title,
        theme["title_font"], theme["cover_title_size"], theme["title_color_light"],
        bold=False, alignment=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.BOTTOM,
    )

    _add_divider(slide, Inches(1.5), Inches(2.7), Inches(7), theme["divider_color"])

    if slide_data.subtitle:
        _add_textbox(
            slide, Inches(4), Inches(3.2), Inches(4.5), Inches(0.5),
            slide_data.subtitle,
            theme["body_font"], theme["cover_subtitle_size"], theme["subtitle_color"],
            alignment=PP_ALIGN.RIGHT,
        )


def _build_toc_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["content_bg"])

    _add_title_bar(slide, Inches(0), Inches(0.15), Inches(10), Inches(0.56), "목차", theme)

    if slide_data.bullets:
        lines = [f"{i+1}. {b}" for i, b in enumerate(slide_data.bullets)]
        _add_multiline(
            slide, Inches(0.5), Inches(1.0), Inches(9), Inches(3.8),
            lines, theme["body_font"], Pt(15), theme["text_color"], bold=True,
            line_spacing=Pt(14),
        )


def _build_content_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["content_bg"])

    _add_title_bar(slide, Inches(0), Inches(0.15), Inches(10), Inches(0.56), slide_data.title, theme)

    has_images = len(slide_data.images) > 0
    text_width = Inches(5.5) if has_images else Inches(9)

    if slide_data.bullets:
        _add_bullets(
            slide, Inches(0.5), Inches(1.0), text_width, Inches(4),
            slide_data.bullets,
            theme["body_font"], theme["body_size"], theme["text_color"], theme["bullet_color"],
        )

    if has_images:
        img = slide_data.images[0]
        _add_image(slide, img, Inches(6.3), Inches(1.0), Inches(3.2), Inches(3.2))

        if len(slide_data.images) > 1:
            img2 = slide_data.images[1]
            _add_image(slide, img2, Inches(6.3), Inches(4.4), Inches(3.2), Inches(1.0))


def _build_image_text_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["content_bg"])

    _add_title_bar(slide, Inches(0), Inches(0.15), Inches(10), Inches(0.56), slide_data.title, theme)

    if slide_data.images:
        img = slide_data.images[0]
        _add_image(slide, img, Inches(1.5), Inches(1.0), Inches(7), Inches(3.2))

    caption = slide_data.caption or (slide_data.bullets[0] if slide_data.bullets else "")
    if caption:
        _add_textbox(
            slide, Inches(0.5), Inches(4.4), Inches(9), Inches(0.5),
            caption,
            theme["body_font"], theme["caption_size"], theme["text_color"],
            bold=True, alignment=PP_ALIGN.LEFT,
        )


def _build_grid_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["content_bg"])

    _add_title_bar(slide, Inches(0), Inches(0.15), Inches(10), Inches(0.56), slide_data.title, theme)

    images = slide_data.images
    labels = slide_data.bullets
    count = len(images)

    if count <= 2:
        cols, rows = count, 1
    elif count <= 4:
        cols, rows = 2, 2
    elif count <= 6:
        cols, rows = 3, 2
    else:
        cols, rows = 4, 2

    card_w = Inches(8.5 / cols)
    card_h = Inches(1.6)
    start_x = Inches(0.5)
    start_y = Inches(0.9)
    gap_x = Inches(0.3)
    gap_y = Inches(0.3)

    for idx, img in enumerate(images):
        col = idx % cols
        row = idx // cols
        if row >= rows:
            break

        x = start_x + col * (card_w + gap_x)
        y = start_y + row * (card_h + gap_y + Inches(0.4))

        _add_image(slide, img, x, y, card_w, card_h)

        label = labels[idx] if idx < len(labels) else ""
        if label:
            _add_textbox(
                slide, x, y + card_h + Inches(0.05), card_w, Inches(0.3),
                label,
                theme["body_font"], theme["small_size"], theme["text_color"],
                alignment=PP_ALIGN.CENTER,
            )


def _build_two_column_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["content_bg"])

    _add_title_bar(slide, Inches(0), Inches(0.15), Inches(10), Inches(0.56), slide_data.title, theme)

    col_width = Inches(4.2)
    left_x = Inches(0.5)
    right_x = Inches(5.3)

    if slide_data.left_title:
        _add_textbox(
            slide, left_x, Inches(1.0), col_width, Inches(0.5),
            slide_data.left_title,
            theme["title_font"], Pt(16), theme["accent_color"], bold=True,
        )
    if slide_data.left_bullets:
        _add_bullets(
            slide, left_x, Inches(1.6), col_width, Inches(3.5),
            slide_data.left_bullets,
            theme["body_font"], theme["body_size"], theme["text_color"], theme["bullet_color"],
        )

    if slide_data.right_title:
        _add_textbox(
            slide, right_x, Inches(1.0), col_width, Inches(0.5),
            slide_data.right_title,
            theme["title_font"], Pt(16), theme["accent_color"], bold=True,
        )
    if slide_data.right_bullets:
        _add_bullets(
            slide, right_x, Inches(1.6), col_width, Inches(3.5),
            slide_data.right_bullets,
            theme["body_font"], theme["body_size"], theme["text_color"], theme["bullet_color"],
        )


def _build_closing_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["cover_bg"])

    _add_textbox(
        slide, Inches(1), Inches(1.5), Inches(8), Inches(2.5),
        slide_data.title or "감사합니다.",
        theme["title_font"], Pt(54), theme["title_color_light"],
        bold=False, alignment=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
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
    theme = get_theme(theme_name)

    prs = Presentation()
    prs.slide_width = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT

    for slide_data in slides:
        builder = LAYOUT_BUILDERS.get(slide_data.layout)
        if builder:
            builder(prs, slide_data, theme)

    buffer = BytesIO()
    prs.save(buffer)
    buffer.seek(0)
    return buffer
