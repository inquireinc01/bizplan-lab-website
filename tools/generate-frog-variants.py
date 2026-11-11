from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "images"

NAVY = "#052957"
WHITE = "#FFFFFF"


BODY = f'''
  <rect width="171" height="205" fill="{WHITE}"/>

  <g fill="{NAVY}">
    <ellipse cx="45" cy="160" rx="27" ry="24"/>
    <ellipse cx="130" cy="160" rx="27" ry="24"/>
    <ellipse cx="88" cy="165" rx="30" ry="17"/>
    <ellipse cx="35" cy="126" rx="14" ry="10.5"/>
    <ellipse cx="141" cy="126" rx="14" ry="10.5"/>
    <ellipse cx="51" cy="50" rx="22" ry="23"/>
    <ellipse cx="126" cy="50" rx="22" ry="23"/>
    <path d="
      M 60 50
      C 68 45, 77 43, 88 44
      C 99 43, 108 45, 116 50
      C 136 57, 149 74, 149 94
      C 149 106, 145 114, 138 119
      C 144 124, 146 131, 142 136
      C 138 141, 130 143, 124 146
      C 115 151, 109 158, 104 164
      C 99 170, 94 173, 88 173
      C 82 173, 77 170, 72 164
      C 67 158, 61 151, 52 146
      C 46 143, 38 141, 34 136
      C 30 131, 32 124, 38 119
      C 31 114, 27 106, 27 94
      C 27 74, 40 57, 60 50
      Z"/>
  </g>
'''


BELLY = f'''  <ellipse cx="88" cy="147" rx="30" ry="27" fill="{WHITE}"/>'''


VARIANTS = {
    "study": {
        "title": "勉強しているカエル",
        "description": "本を開いて集中して勉強しているカエル",
        "face": f'''
  <ellipse cx="51" cy="51" rx="13" ry="15" fill="{WHITE}"/>
  <ellipse cx="126" cy="51" rx="13" ry="14.5" fill="{WHITE}"/>
  <ellipse cx="55" cy="52" rx="5" ry="6" fill="{NAVY}"/>
  <ellipse cx="127" cy="52" rx="5" ry="6" fill="{NAVY}"/>
  <path d="M 82 88 C 85 86, 91 86, 94 88"
        fill="none" stroke="{WHITE}" stroke-width="3" stroke-linecap="round"/>
''',
        "overlay": f'''
  <g aria-label="開いた本">
    <path d="M 58 135 C 69 131, 80 133, 88 138 C 96 133, 107 131, 118 135
             L 116 159 C 106 156, 97 157, 88 162 C 79 157, 70 156, 60 159 Z"
          fill="{NAVY}"/>
    <path d="M 62 137 C 70 135, 79 137, 86 141 L 86 157
             C 78 154, 70 153, 62 156 Z" fill="{WHITE}"/>
    <path d="M 90 141 C 97 137, 106 135, 114 137 L 114 156
             C 106 153, 98 154, 90 157 Z" fill="{WHITE}"/>
    <path d="M 66 142 C 72 140, 78 141, 82 143 M 66 147 C 72 145, 78 146, 82 148
             M 94 143 C 98 141, 104 140, 110 142 M 94 148 C 98 146, 104 145, 110 147"
          fill="none" stroke="{NAVY}" stroke-width="1.5" stroke-linecap="round"/>
  </g>
''',
    },
    "joy": {
        "title": "大喜びしているカエル",
        "description": "目を細め、大きく笑って喜んでいるカエル",
        "face": f'''
  <path d="M 40 55 C 46 46, 56 46, 62 55 M 115 55 C 121 46, 131 46, 137 55"
        fill="none" stroke="{WHITE}" stroke-width="5" stroke-linecap="round"/>
  <path d="M 70 84 C 79 91, 97 91, 106 84
           C 103 98, 96 105, 88 105 C 80 105, 73 98, 70 84 Z"
        fill="{WHITE}"/>
  <path d="M 19 61 L 10 55 M 19 71 L 8 71 M 152 61 L 161 55 M 153 71 L 165 71"
        fill="none" stroke="{NAVY}" stroke-width="3" stroke-linecap="round"/>
''',
        "overlay": "",
    },
    "sad": {
        "title": "悲しんでいるカエル",
        "description": "涙を流し、悲しそうな口をしたカエル",
        "face": f'''
  <ellipse cx="51" cy="51" rx="13" ry="15" fill="{WHITE}"/>
  <ellipse cx="126" cy="51" rx="13" ry="14.5" fill="{WHITE}"/>
  <ellipse cx="55" cy="53" rx="5" ry="6" fill="{NAVY}"/>
  <ellipse cx="129" cy="53" rx="5" ry="6" fill="{NAVY}"/>
  <path d="M 75 94 C 82 84, 94 84, 101 94"
        fill="none" stroke="{WHITE}" stroke-width="4" stroke-linecap="round"/>
  <path d="M 43 70 C 38 77, 38 82, 43 84 C 48 82, 48 77, 43 70 Z
           M 134 70 C 129 77, 129 82, 134 84 C 139 82, 139 77, 134 70 Z"
        fill="{WHITE}"/>
''',
        "overlay": "",
    },
    "sweat": {
        "title": "冷や汗をかいているカエル",
        "description": "大きな汗をかき、困った表情をしているカエル",
        "face": f'''
  <ellipse cx="51" cy="51" rx="13" ry="15" fill="{WHITE}"/>
  <ellipse cx="126" cy="51" rx="13" ry="14.5" fill="{WHITE}"/>
  <ellipse cx="53" cy="47" rx="4" ry="5" fill="{NAVY}"/>
  <ellipse cx="128" cy="47" rx="4" ry="5" fill="{NAVY}"/>
  <path d="M 76 90 C 80 85, 84 95, 88 90 C 92 85, 96 95, 100 90"
        fill="none" stroke="{WHITE}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M 140 68 C 134 77, 134 83, 140 86 C 146 83, 146 77, 140 68 Z"
        fill="{WHITE}"/>
''',
        "overlay": "",
    },
    "sleep": {
        "title": "寝ているカエル",
        "description": "目を閉じ、静かに眠っているカエル",
        "face": f'''
  <path d="M 39 50 C 45 59, 57 59, 63 50 M 114 50 C 120 59, 132 59, 138 50"
        fill="none" stroke="{WHITE}" stroke-width="4.5" stroke-linecap="round"/>
  <ellipse cx="88" cy="90" rx="4" ry="2.7" fill="{WHITE}"/>
  <path d="M 149 15 H 161 L 150 27 H 163 M 145 31 H 155 L 146 41 H 157"
        fill="none" stroke="{NAVY}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
''',
        "overlay": "",
    },
    "wink": {
        "title": "ウインクしているカエル",
        "description": "片目を閉じてウインクしているカエル",
        "face": f'''
  <ellipse cx="51" cy="51" rx="13" ry="15" fill="{WHITE}"/>
  <ellipse cx="55" cy="46" rx="5" ry="6" fill="{NAVY}"/>
  <path d="M 114 52 C 120 60, 132 60, 138 52"
        fill="none" stroke="{WHITE}" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M 74 86 C 82 91, 95 91, 103 84"
        fill="none" stroke="{WHITE}" stroke-width="4" stroke-linecap="round"/>
''',
        "overlay": "",
    },
}


def build_svg(title: str, description: str, face: str, overlay: str) -> str:
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 171 205"
     width="171"
     height="205"
     role="img"
     aria-labelledby="frog-title frog-desc">
  <title id="frog-title">{title}</title>
  <desc id="frog-desc">{description}</desc>

  <!-- Fixed character body. Exactly two flat colors are used. -->
{BODY}
  <!-- Variant expression. -->
{face}
  <!-- Fixed belly. -->
{BELLY}
  <!-- Variant prop or accent. -->
{overlay}
</svg>
'''


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for slug, data in VARIANTS.items():
        output = OUTPUT_DIR / f"bankers-holiday-frog-{slug}.svg"
        output.write_text(build_svg(**data), encoding="utf-8", newline="\n")
        print(output.name)


if __name__ == "__main__":
    main()
