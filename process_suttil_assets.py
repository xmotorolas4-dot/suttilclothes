from __future__ import annotations

from collections import deque
from pathlib import Path
import warnings

import numpy as np
from PIL import Image, ImageFilter

warnings.simplefilter("ignore")
Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
SOURCE = Path(r"C:\Users\Nico_\Downloads\SUTTIL\PNG REMERAS")
OLD_LOGO = ASSETS / "suttil-logo.png"
STICKER = ASSETS / "sticker.png"

TARGETS = [
    ("1.png", "olive-gold-logo.png"),
    ("2.png", "sky-brown-logo.png"),
    ("3.png", "vintage-shadow-logo.png"),
    ("4.png", "vintage-red-logo.png"),
    ("5.png", "vintage-gold-logo.png"),
    ("6.png", "army-skater-black.png"),
    ("7.png", "sky-minimal-logo.png"),
    ("8.png", "liberty-pizza-vintage.png"),
    ("9.png", "vintage-black-logo.png"),
    ("10.png", "einstein-redcap-vintage.png"),
    ("11.png", "fuck-logo-black.png"),
    ("12.png", "black-shadow-logo.png"),
    ("13.png", "sand-red-logo.png"),
    ("14.png", "sand-brown-logo.png"),
]

MAX_DIMENSION = 2400
WHITE_THRESHOLD = 225
LOW_SATURATION_DELTA = 18


def resize_image(image: Image.Image) -> Image.Image:
    image = image.copy()
    image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
    return image


def remove_edge_white_background(image: Image.Image) -> Image.Image:
    arr = np.array(image.convert("RGBA"), dtype=np.uint8)
    rgb = arr[..., :3]
    alpha = arr[..., 3]

    bright = (rgb[..., 0] >= WHITE_THRESHOLD) & (rgb[..., 1] >= WHITE_THRESHOLD) & (rgb[..., 2] >= WHITE_THRESHOLD)
    low_sat = (
        (np.abs(rgb[..., 0].astype(np.int16) - rgb[..., 1].astype(np.int16)) <= LOW_SATURATION_DELTA)
        & (np.abs(rgb[..., 1].astype(np.int16) - rgb[..., 2].astype(np.int16)) <= LOW_SATURATION_DELTA)
        & (np.abs(rgb[..., 0].astype(np.int16) - rgb[..., 2].astype(np.int16)) <= LOW_SATURATION_DELTA)
    )
    candidates = bright & low_sat & (alpha >= 245)

    height, width = candidates.shape
    visited = np.zeros_like(candidates, dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        if 0 <= x < width and 0 <= y < height and candidates[y, x] and not visited[y, x]:
            visited[y, x] = True
            queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        enqueue(x - 1, y)
        enqueue(x + 1, y)
        enqueue(x, y - 1)
        enqueue(x, y + 1)

    arr[visited, 3] = 0
    arr[visited, 0] = 0
    arr[visited, 1] = 0
    arr[visited, 2] = 0
    return Image.fromarray(arr, "RGBA")


def crop_to_alpha(image: Image.Image, margin: int = 18) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image

    left, top, right, bottom = bbox
    left = max(0, left - margin)
    top = max(0, top - margin)
    right = min(image.width, right + margin)
    bottom = min(image.height, bottom + margin)
    return image.crop((left, top, right, bottom))


def decontaminate_white_halo(image: Image.Image) -> Image.Image:
    arr = np.array(image.convert("RGBA"), dtype=np.float32)
    rgb = arr[..., :3]
    alpha = arr[..., 3:4] / 255.0
    mask = (alpha > 0) & (alpha < 1)
    corrected = np.clip((rgb - ((1.0 - alpha) * 255.0)) / np.maximum(alpha, 1e-6), 0, 255)
    rgb = np.where(mask, corrected, rgb)
    rgb = np.where(alpha <= 0, 0, rgb)
    arr[..., :3] = rgb
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def process_image(src: Path, dest: Path) -> None:
    image = Image.open(src).convert("RGBA")
    image = resize_image(image)
    image = remove_edge_white_background(image)
    image = crop_to_alpha(image)
    image = decontaminate_white_halo(image)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=2))
    image.save(dest, format="PNG", optimize=True, compress_level=9)


def main() -> None:
    ASSETS.mkdir(exist_ok=True)

    sticker_source = OLD_LOGO if OLD_LOGO.exists() else STICKER
    sticker = Image.open(sticker_source).convert("RGBA")
    sticker = resize_image(sticker)
    sticker.save(STICKER, format="PNG", optimize=True, compress_level=9)

    for existing in ASSETS.glob("*.png"):
        if existing.name != STICKER.name:
            existing.unlink()

    for source_name, output_name in TARGETS:
        process_image(SOURCE / source_name, ASSETS / output_name)


if __name__ == "__main__":
    main()
