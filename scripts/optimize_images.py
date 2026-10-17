"""Create WebP assets and update rendered images without modifying HTML heads.

Run from any directory: python scripts/optimize_images.py
Requires Pillow and pillow-heif. Original files and existing WebPs are preserved.
"""

from io import BytesIO
from pathlib import Path
import json
import re

from PIL import Image, ImageOps
from pillow_heif import register_heif_opener

ROOT = Path(__file__).resolve().parents[1]
EXTENSIONS = {'.png', '.jpg', '.jpeg', '.heic'}
MAX_EDGE = 2048
register_heif_opener()


def webp_path(source):
    # 6.HEIC and 6.jpeg are different photographs; never overwrite either.
    if source.suffix.lower() == '.heic':
        return source.with_name(source.stem + '-heic.webp')
    return source.with_suffix('.webp')


def convert(source, target):
    if target.exists():
        return
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
        image.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        if source.name == 'logoprincipal.png':
            image.save(target, 'WEBP', lossless=True, method=6)
        else:
            # Avoid turning an already compact JPEG into a heavier asset.
            for quality in (86, 82, 78):
                buffer = BytesIO()
                image.save(buffer, 'WEBP', quality=quality, method=6)
                encoded = buffer.getvalue()
                if len(encoded) < source.stat().st_size:
                    break
            target.write_bytes(encoded)
    with Image.open(target) as check:
        check.verify()


def main():
    originals = [ROOT / 'logoprincipal.png']
    originals += sorted(
        p for folder in ('img', 'proyectos')
        for p in (ROOT / folder).rglob('*')
        if p.is_file() and p.suffix.lower() in EXTENSIONS
    )
    mapping = {}
    for source in originals:
        target = webp_path(source)
        convert(source, target)
        mapping[source.relative_to(ROOT).as_posix().lower()] = target.relative_to(ROOT).as_posix()

    def replace_url(match):
        old = match.group('url')
        new = mapping.get(old.removeprefix('./').lower())
        if not new:
            return match.group(0)
        return match.group('prefix') + ('./' if old.startswith('./') else '') + new + match.group('quote')

    updated = 0
    for page in ROOT.glob('*.html'):
        original = page.read_text(encoding='utf-8')
        head, body = original.split('</head>', 1)
        body = re.sub(
            r'(?P<prefix>\b(?:src|href)\s*=\s*(?P<quote>[\"\']))(?P<url>[^\"\']+)\2',
            replace_url, body,
        )
        hero = re.search(r'<div class="hero-bg"[^>]*>\s*(<img\b[^>]*>)', body)
        hero_tag = hero.group(1) if hero else None

        def optimize_tag(match):
            tag = match.group(0)
            is_hero = tag == hero_tag
            is_logo = 'brand-logo' in tag
            attrs = ' decoding="async"' if not re.search(r'\bdecoding=', tag) else ''
            if not is_hero and not is_logo and not re.search(r'\bloading=', tag):
                attrs += ' loading="lazy"'
            if is_hero and not re.search(r'\bfetchpriority=', tag):
                attrs += ' fetchpriority="high"'
            return re.sub(r'\s*/?>$', lambda end: attrs + end.group(0), tag)

        body = re.sub(r'<img\b[^>]*>', optimize_tag, body)
        result = head + '</head>' + body
        if result != original:
            page.write_text(result, encoding='utf-8')
            updated += 1

    before = sum(p.stat().st_size for p in originals)
    after = sum(webp_path(p).stat().st_size for p in originals)
    print(json.dumps({
        'converted_assets': len(originals), 'updated_pages': updated,
        'original_bytes': before, 'webp_bytes': after,
        'reduction_percent': round((1 - after / before) * 100, 1),
    }, indent=2))


if __name__ == '__main__':
    main()
