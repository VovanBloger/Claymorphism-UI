"""Read-only pixel measurements of the two user-supplied reference screenshots.

Geometric anchors were selected visually in the source pixels, not fitted to CSS.
Luma is encoded RGB Y' (0.2126R + 0.7152G + 0.0722B), not physical radiance.
"""
from pathlib import Path
from PIL import Image
import csv
import json
import statistics as stats

OUT = Path(__file__).parent
CASES = {
    "current": {
        "path": "C:/Users/vovan/AppData/Local/Temp/codex-clipboard-8fc59830-ad56-473e-97a1-31128e349d98.png",
        "board": (102, 25, 443, 373),
        "button": (133, 174, 410, 259),
        "left_y": (152, 158),
        "button_x": (174, 184),
        "bottom_x": (354, 362),
    },
    "reference": {
        "path": "C:/Users/vovan/AppData/Local/Temp/codex-clipboard-893c9e12-f001-480b-b0b7-3fe0f0b1cab1.png",
        "board": (184, 18, 545, 390),
        "button": (232, 183, 493, 272),
        "left_y": (169, 175),
        "button_x": (271, 279),
        "bottom_x": (450, 458),
    },
}


def luma(rgb):
    return sum(c * w for c, w in zip(rgb, (0.2126, 0.7152, 0.0722)))


def average(points):
    return tuple(stats.mean(p[c] for p in points) for c in range(3))


def patch(im, box):
    x0, y0, x1, y1 = box
    return average([im.getpixel((x, y)) for y in range(y0, y1) for x in range(x0, x1)])


def horizontal(im, ys, x0, x1):
    return [(x, average([im.getpixel((x, y)) for y in range(*ys)])) for x in range(x0, x1)]


def vertical(im, xs, y0, y1):
    return [(y, average([im.getpixel((x, y)) for x in range(*xs)])) for y in range(y0, y1)]


summary = {}
all_profiles = {}
csv_rows = []
for name, case in CASES.items():
    im = Image.open(case["path"]).convert("RGB")
    bx0, by0, bx1, by1 = case["board"]
    cx0, cy0, cx1, cy1 = case["button"]
    bw, bh, ch = bx1 - bx0, by1 - by0, cy1 - cy0
    profiles = {
        "board_left": horizontal(im, case["left_y"], bx0 - 8, bx0 + 64),
        "button_top": vertical(im, case["button_x"], cy0 - 6, cy0 + 34),
        "button_bottom": vertical(im, case["button_x"], cy1 - 30, cy1 + 22),
        "board_bottom": vertical(im, case["bottom_x"], by1 - 38, min(im.height, by1 + 35)),
    }
    baselines = {"board_left": (bx0, bw), "button_top": (cy0, ch), "button_bottom": (cy1, ch), "board_bottom": (by1, bh)}
    for label, profile in profiles.items():
        origin, scale = baselines[label]
        for pos, rgb in profile:
            csv_rows.append({"source": name, "profile": label, "pixel": pos, "offset_px": pos-origin, "normalized_percent": (pos-origin)*100/scale, "r": rgb[0], "g": rgb[1], "b": rgb[2], "luma": luma(rgb)})

    clean_x = (round(bx0 + bw*.77), round(bx0 + bw*.83))
    face_upper = patch(im, (*clean_x[:1], round(by0+bh*.40)-2, clean_x[1], round(by0+bh*.40)+3))
    face_lower = patch(im, (*clean_x[:1], round(by0+bh*.90)-2, clean_x[1], round(by0+bh*.90)+3))
    left_inner = [p for p in profiles["board_left"] if bx0 <= p[0] <= bx0 + 24]
    left_peak = max(left_inner, key=lambda p: luma(p[1]))
    top_inner = [p for p in profiles["button_top"] if cy0 <= p[0] <= cy0 + 18]
    top_peak = max(top_inner, key=lambda p: luma(p[1]))
    left_face = average([p[1] for p in profiles["board_left"] if bx0+40 <= p[0] <= bx0+55])
    button_face = patch(im, (case["button_x"][0], cy0+30, case["button_x"][1], cy0+45))
    left_half = (luma(left_peak[1]) + luma(left_face)) / 2
    left_half_pixels = [p for p in left_inner if luma(p[1]) >= left_half]
    top_half = (luma(top_peak[1]) + luma(button_face)) / 2
    top_half_pixels = [p for p in top_inner if luma(p[1]) >= top_half]
    bottom_inner = [p for p in profiles["button_bottom"] if cy1-12 <= p[0] < cy1]
    bottom_dark = min(bottom_inner, key=lambda p:luma(p[1]))
    bottom_outer = [p for p in profiles["board_bottom"] if by1 <= p[0] < min(im.height, by1+15)]
    cast_dark = min(bottom_outer, key=lambda p:luma(p[1]))
    summary[name] = {
        "image_size": im.size, "anchors": case,
        "board_size": (bw,bh), "button_size": (cx1-cx0,ch),
        "left_edge_luma": luma(left_inner[0][1]),
        "left_crest_x": left_peak[0], "left_crest_offset_px": left_peak[0]-bx0,
        "left_crest_offset_percent_board_width": (left_peak[0]-bx0)*100/bw,
        "left_crest_luma": luma(left_peak[1]), "left_face_luma": luma(left_face),
        "left_crest_half_excess_width_px": len(left_half_pixels),
        "button_top_edge_luma": luma(top_inner[0][1]),
        "button_crest_y": top_peak[0], "button_crest_offset_px": top_peak[0]-cy0,
        "button_crest_offset_percent_height": (top_peak[0]-cy0)*100/ch,
        "button_crest_luma": luma(top_peak[1]),
        "button_crest_half_excess_width_px": len(top_half_pixels),
        "button_face_rgb": button_face, "button_face_luma": luma(button_face),
        "button_darkest_inner_y": bottom_dark[0], "button_darkest_inner_luma": luma(bottom_dark[1]),
        "board_face_upper_rgb": face_upper, "board_face_lower_rgb": face_lower,
        "board_face_upper_luma": luma(face_upper), "board_face_lower_luma": luma(face_lower),
        "board_face_luma_change": luma(face_lower)-luma(face_upper),
        "board_cast_darkest_y": cast_dark[0], "board_cast_darkest_luma": luma(cast_dark[1]),
        "board_last_visible_cast_luma": luma(profiles["board_bottom"][-1][1]),
    }
    all_profiles[name] = (profiles, baselines, im)

with (OUT / "reference_profiles.csv").open("w",newline="",encoding="utf-8") as f:
    writer=csv.DictWriter(f,fieldnames=csv_rows[0].keys()); writer.writeheader(); writer.writerows(csv_rows)
(OUT / "reference_measurements.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding="utf-8")
print(json.dumps(summary,indent=2,ensure_ascii=False))

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(3,2,figsize=(13,12),layout="constrained")
    for i,(name,case) in enumerate(CASES.items()):
        profiles,baselines,im=all_profiles[name]
        axes[0,i].imshow(im); axes[0,i].set_title(name); axes[0,i].axis("off")
        bx0,by0,bx1,by1=case["board"]
        cx0,cy0,cx1,cy1=case["button"]
        axes[0,i].plot([bx0-5,bx0+60],[stats.mean(case["left_y"])]*2,color="#00a390",lw=2)
        axes[0,i].plot([stats.mean(case["button_x"])]*2,[cy0-5,cy1+20],color="#1267b1",lw=2)
        axes[0,i].plot([stats.mean(case["bottom_x"])]*2,[by1-35,min(im.height,by1+30)],color="#c53990",lw=2)
    for ax,label in zip(axes.flatten()[2:],("board_left","button_top","button_bottom","board_bottom")):
        for name,(profiles,baselines,im) in all_profiles.items():
            origin,scale=baselines[label]
            ax.plot([(p-origin)*100/scale for p,rgb in profiles[label]],[luma(rgb) for p,rgb in profiles[label]],label=name,lw=2)
        ax.axvline(0,color="#aaa",lw=1,ls="--"); ax.set_title(label); ax.set_xlabel("distance from outer edge / object size (%)"); ax.set_ylabel("encoded RGB luma (0-255)");ax.grid(alpha=.2);ax.legend()
    fig.savefig(OUT / "reference_profiles.png",dpi=150)
    print("Wrote reference_profiles.png")
except ImportError:
    print("matplotlib unavailable; CSV/JSON measurements completed")
