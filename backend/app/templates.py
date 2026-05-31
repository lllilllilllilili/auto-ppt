from pptx.util import Pt
from pptx.dml.color import RGBColor


THEMES = {
    "business": {
        "name": "비즈니스",
        "bg_color": RGBColor(0xFF, 0xFF, 0xFF),
        "title_color": RGBColor(0x1B, 0x3A, 0x5C),
        "text_color": RGBColor(0x33, 0x33, 0x33),
        "accent_color": RGBColor(0x1B, 0x3A, 0x5C),
        "subtitle_color": RGBColor(0x66, 0x66, 0x66),
        "divider_color": RGBColor(0x1B, 0x3A, 0x5C),
        "bullet_color": RGBColor(0x1B, 0x3A, 0x5C),
        "title_font": "맑은 고딕",
        "body_font": "맑은 고딕",
        "title_size": Pt(36),
        "subtitle_size": Pt(18),
        "heading_size": Pt(28),
        "body_size": Pt(16),
        "column_heading_size": Pt(18),
    },
    "simple": {
        "name": "심플",
        "bg_color": RGBColor(0xF5, 0xF5, 0xF5),
        "title_color": RGBColor(0x22, 0x22, 0x22),
        "text_color": RGBColor(0x44, 0x44, 0x44),
        "accent_color": RGBColor(0x22, 0x22, 0x22),
        "subtitle_color": RGBColor(0x77, 0x77, 0x77),
        "divider_color": RGBColor(0xBB, 0xBB, 0xBB),
        "bullet_color": RGBColor(0x22, 0x22, 0x22),
        "title_font": "나눔고딕",
        "body_font": "나눔고딕",
        "title_size": Pt(36),
        "subtitle_size": Pt(18),
        "heading_size": Pt(28),
        "body_size": Pt(16),
        "column_heading_size": Pt(18),
    },
    "dark": {
        "name": "다크",
        "bg_color": RGBColor(0x2D, 0x2D, 0x2D),
        "title_color": RGBColor(0xFF, 0xFF, 0xFF),
        "text_color": RGBColor(0xDD, 0xDD, 0xDD),
        "accent_color": RGBColor(0x00, 0xBC, 0xD4),
        "subtitle_color": RGBColor(0xAA, 0xAA, 0xAA),
        "divider_color": RGBColor(0x00, 0xBC, 0xD4),
        "bullet_color": RGBColor(0x00, 0xBC, 0xD4),
        "title_font": "맑은 고딕",
        "body_font": "맑은 고딕",
        "title_size": Pt(36),
        "subtitle_size": Pt(18),
        "heading_size": Pt(28),
        "body_size": Pt(16),
        "column_heading_size": Pt(18),
    },
}


def get_theme(name: str) -> dict:
    return THEMES.get(name, THEMES["business"])
