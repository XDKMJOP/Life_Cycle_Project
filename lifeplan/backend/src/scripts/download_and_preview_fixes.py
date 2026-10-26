import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import urllib.parse
import re
import os
from PIL import Image, ImageDraw, ImageFont

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'th,en-US;q=0.9,en;q=0.8'
}

def get_thumbs(q, count=4):
    url = f'https://www.bing.com/images/search?q={urllib.parse.quote(q)}&first=1&scenario=ImageBasicHover'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
        matches = re.findall(r'(https://tse\d\.mm\.bing\.net/th/id/OIP\.[^"&?]+)', html)
        seen = set()
        res = []
        for m in matches:
            if m not in seen:
                seen.add(m)
                res.append(m)
        return res[:count]
    except Exception as e:
        print(f"Error fetching {q}: {e}")
        return []

targets = [
    (10, 'ผัดผักรวมมิตร อกไก่ ผักรวม'),
    (17, 'ผัดมะเขือยาว โหระพา อกไก่'),
    (29, 'น้ำพริกหนุ่ม ผักลวก หมู'),
    (34, 'ลาบไก่สุก อีสาน มะนาว'),
    (51, 'โจ๊กหมูสับ ไข่ลวก ชาม'),
    (64, 'ไข่ลวก cp 7-11 ถ้วย'),
    (68, 'แซนวิช ทูน่า โฮลวีต'),
    (73, 'ซุปข้าวโพด ข้าวบาร์เลย์ ถ้วย'),
    (82, 'ไข่คน อาหารเช้า กระทะ'),
    (85, 'ยำปลากระป๋อง จาน ผัก'),
    (88, 'แกงจืดตำลึง หมูสับ ชาม'),
    (100, 'น้ำเต้าหู้ ฟองเต้าหู้ ถ้วย')
]

out_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5\fix_preview'
os.makedirs(out_dir, exist_ok=True)

# Download 3 candidates for each target
for meal_id, q in targets:
    thumbs = get_thumbs(q, 3)
    for c_idx, t in enumerate(thumbs):
        dest = os.path.join(out_dir, f'm{meal_id}_c{c_idx+1}.jpg')
        try:
            req = urllib.request.Request(t, headers={'User-Agent': headers['User-Agent']})
            with urllib.request.urlopen(req, timeout=10) as r, open(dest, 'wb') as f:
                f.write(r.read())
            print(f"Downloaded m{meal_id}_c{c_idx+1}")
        except Exception as e:
            print(f"Error m{meal_id}_c{c_idx+1}: {e}")

print("Creating comparison grid...")
# Grid layout: 12 rows (one per target), 3 columns (one per candidate)
cell_w, cell_h = 240, 200
rows = len(targets)
cols = 3

grid = Image.new('RGB', (cell_w * cols, cell_h * rows), (240, 240, 240))
draw = ImageDraw.Draw(grid)

for r_idx, (meal_id, q) in enumerate(targets):
    y = r_idx * cell_h
    for c_idx in range(cols):
        x = c_idx * cell_w
        fname = os.path.join(out_dir, f'm{meal_id}_c{c_idx+1}.jpg')
        if os.path.exists(fname):
            try:
                with Image.open(fname) as im:
                    im = im.convert('RGB')
                    im.thumbnail((cell_w - 10, cell_h - 30))
                    px = x + (cell_w - im.width) // 2
                    py = y + 25 + (cell_h - 25 - im.height) // 2
                    grid.paste(im, (px, py))
            except Exception as e:
                print(f"Error pasting {fname}: {e}")
        # Header
        draw.rectangle([x, y, x + cell_w, y + 22], fill=(40, 40, 40))
        draw.text((x + 8, y + 4), f"Meal {meal_id} Candidate {c_idx+1}", fill=(255, 255, 255))
        draw.rectangle([x, y, x + cell_w - 1, y + cell_h - 1], outline=(200, 200, 200), width=1)

grid_path = os.path.join(out_dir, 'grid_comparison.jpg')
grid.save(grid_path, quality=85)
print(f"Saved {grid_path}")
