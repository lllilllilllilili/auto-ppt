from __future__ import annotations

from io import BytesIO

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

from app.models import SlideRequest
from app.templates import get_theme

SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)


def _set_slide_bg(slide, color):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def _add_textbox(slide, left, top, width, height, text, font_name, font_size, font_color, bold=False, alignment=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    txbox = slide.shapes.add_textbox(left, top, width, height)
    tf = txbox.text_frame
    tf.word_wrap = True

    anchor_map = {
        MSO_ANCHOR.TOP: "t",
        MSO_ANCHOR.MIDDLE: "ctr",
        MSO_ANCHOR.BOTTOM: "b",
    }
    tf_elem = tf._txBody
    body_pr = tf_elem.find(qn("a:bodyPr"))
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


def _add_bullets(slide, left, top, width, height, bullets, font_name, font_size, text_color, bullet_color):
    txbox = slide.shapes.add_textbox(left, top, width, height)
    tf = txbox.text_frame
    tf.word_wrap = True

    for i, bullet_text in enumerate(bullets):
        if i == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
            p.space_before = Pt(8)

        p.text = bullet_text
        p.font.name = font_name
        p.font.size = font_size
        p.font.color.rgb = text_color
        p.level = 0

        pPr = p._pPr
        if pPr is None:
            pPr = p._p.get_or_add_pPr()

        buFont = pPr.makeelement(qn("a:buFont"), {"typeface": "Arial"})
        buChar = pPr.makeelement(qn("a:buChar"), {"char": "●"})

        for old in pPr.findall(qn("a:buChar")):
            pPr.remove(old)
        for old in pPr.findall(qn("a:buFont")):
            pPr.remove(old)
        for old in pPr.findall(qn("a:buClr")):
            pPr.remove(old)

        buClr = pPr.makeelement(qn("a:buClr"), {})
        srgb = buClr.makeelement(qn("a:srgbClr"), {"val": str(bullet_color)})
        buClr.append(srgb)

        pPr.append(buClr)
        pPr.append(buFont)
        pPr.append(buChar)

        pPr.set("indent", str(Emu(-228600)))
        pPr.set("marL", str(Emu(457200)))

    return txbox


def _add_divider(slide, left, top, width, color):
    shape = slide.shapes.add_shape(
        1, left, top, width, Pt(2)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()


def _build_title_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["bg_color"])

    _add_textbox(
        slide,
        Inches(1.5), Inches(2.2), Inches(10.3), Inches(1.5),
        slide_data.title,
        theme["title_font"], Pt(44), theme["title_color"],
        bold=True, alignment=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.BOTTOM,
    )

    _add_divider(
        slide, Inches(4.5), Inches(3.9), Inches(4.3), theme["divider_color"]
    )

    if slide_data.subtitle:
        _add_textbox(
            slide,
            Inches(1.5), Inches(4.2), Inches(10.3), Inches(1),
            slide_data.subtitle,
            theme["body_font"], theme["subtitle_size"], theme["subtitle_color"],
            alignment=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.TOP,
        )


def _build_content_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["bg_color"])

    _add_textbox(
        slide,
        Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9),
        slide_data.title,
        theme["title_font"], theme["heading_size"], theme["title_color"],
        bold=True,
    )

    _add_divider(
        slide, Inches(0.8), Inches(1.4), Inches(2), theme["divider_color"]
    )

    if slide_data.bullets:
        _add_bullets(
            slide,
            Inches(0.8), Inches(1.8), Inches(11.7), Inches(5),
            slide_data.bullets,
            theme["body_font"], theme["body_size"],
            theme["text_color"], theme["bullet_color"],
        )


def _build_two_column_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["bg_color"])

    _add_textbox(
        slide,
        Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.9),
        slide_data.title,
        theme["title_font"], theme["heading_size"], theme["title_color"],
        bold=True,
    )

    _add_divider(
        slide, Inches(0.8), Inches(1.4), Inches(2), theme["divider_color"]
    )

    col_width = Inches(5.3)
    left_x = Inches(0.8)
    right_x = Inches(7.2)

    if slide_data.left_title:
        _add_textbox(
            slide, left_x, Inches(1.8), col_width, Inches(0.6),
            slide_data.left_title,
            theme["title_font"], theme["column_heading_size"], theme["accent_color"],
            bold=True,
        )
    if slide_data.left_bullets:
        _add_bullets(
            slide, left_x, Inches(2.5), col_width, Inches(4.2),
            slide_data.left_bullets,
            theme["body_font"], theme["body_size"],
            theme["text_color"], theme["bullet_color"],
        )

    if slide_data.right_title:
        _add_textbox(
            slide, right_x, Inches(1.8), col_width, Inches(0.6),
            slide_data.right_title,
            theme["title_font"], theme["column_heading_size"], theme["accent_color"],
            bold=True,
        )
    if slide_data.right_bullets:
        _add_bullets(
            slide, right_x, Inches(2.5), col_width, Inches(4.2),
            slide_data.right_bullets,
            theme["body_font"], theme["body_size"],
            theme["text_color"], theme["bullet_color"],
        )


def _build_closing_slide(prs, slide_data: SlideRequest, theme: dict):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    _set_slide_bg(slide, theme["bg_color"])

    _add_textbox(
        slide,
        Inches(1.5), Inches(2.5), Inches(10.3), Inches(2.5),
        slide_data.title,
        theme["title_font"], Pt(48), theme["accent_color"],
        bold=True, alignment=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
    )


LAYOUT_BUILDERS = {
    "title": _build_title_slide,
    "content": _build_content_slide,
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
