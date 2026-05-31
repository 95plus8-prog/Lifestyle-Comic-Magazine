#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
mkdir -p assets/photos/光影 assets/photos/城市 assets/photos/自然 assets/photos/黑白 assets/photos/旅途 assets/photos/美食 assets/photos/运动 assets/photos/其他

python3 - <<'PY'
from pathlib import Path
import json
import re

root = Path("assets/photos")
extensions = {".jpg", ".jpeg", ".png", ".webp"}
series_labels = {
    "light": "光影",
    "city": "城市",
    "nature": "自然",
    "bw": "黑白",
    "travel": "旅途",
    "food": "美食",
    "sport": "运动",
    "other": "其他",
}
folder_series = {
    "光影": "light",
    "城市": "city",
    "自然": "nature",
    "黑白": "bw",
    "旅途": "travel",
    "美食": "food",
    "运动": "sport",
    "其他": "other",
    "light": "light",
    "city": "city",
    "nature": "nature",
    "bw": "bw",
    "travel": "travel",
    "food": "food",
    "sport": "sport",
    "other": "other",
}
series_keywords = {
    "light": {"光影", "晨光", "静物", "light", "shadow"},
    "city": {"城市", "雨后", "街", "建筑", "city", "urban", "street"},
    "nature": {"自然", "肌理", "山", "水", "森林", "nature", "landscape"},
    "bw": {"黑白", "bw", "black", "white", "mono"},
    "travel": {"旅途", "旅行", "海", "路", "travel", "journey", "trip"},
    "food": {"美食", "餐", "饭", "菜", "咖啡", "点心", "食", "food", "meal", "restaurant", "cafe"},
    "sport": {"运动", "跑步", "马拉松", "骑行", "篮球", "足球", "sport", "run", "running", "marathon", "bike"},
}
photos = sorted(
    [path for path in root.rglob("*") if path.is_file() and path.suffix.lower() in extensions],
    key=lambda path: path.relative_to(root).as_posix().casefold(),
)

def title_from_name(path):
    stem = path.stem.strip()
    title = re.sub(r"[-_]+", " ", stem)
    title = re.sub(r"\s+", " ", title).strip()
    return title or "未命名作品"

def series_from_name(path):
    relative = path.relative_to(root)
    if len(relative.parts) > 1:
        folder = relative.parts[0]
        if folder in folder_series:
            return folder_series[folder]

    haystack = f"{path.stem} {path.name}".casefold()
    for series, keywords in series_keywords.items():
        if any(keyword.casefold() in haystack for keyword in keywords):
            return series
    return "other"

items = []
for path in photos:
    src = path.as_posix()
    item = {
        "src": src,
        "title": title_from_name(path),
        "series": series_from_name(path),
    }
    if path.stem in {"自然肌理", "雨后界面"}:
        item["tone"] = "warm"
    items.append(item)

content = "window.seriesLabels = "
content += json.dumps(series_labels, ensure_ascii=False, indent=2)
content += ";\n\nwindow.galleryItems = "
content += json.dumps(items, ensure_ascii=False, indent=2)
content += ";\n"
Path("gallery-data.js").write_text(content, encoding="utf-8")

print(f"已更新 gallery-data.js，共 {len(items)} 张作品。")
print("现在可以打开或刷新 index.html 查看。")
PY

if [ -t 0 ]; then
  echo
  echo "完成。按任意键关闭窗口。"
  read -r -n 1 _
fi
