import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import urllib.parse
import re
import os
from PIL import Image, ImageDraw

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'th,en-US;q=0.9,en;q=0.8'
}

def fetch_and_make_grid(meal_id, query):
    url = f'https://www.bing.com/images/search?q={urllib.parse.quote(query)}&first=1&scenario=ImageBasicHover'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
        matches = re.findall(r'(https://tse\d\.mm\.bing\.net/th/id/OIP\.[^"&?]+)', html)
        seen = set()
        thumbs = []
        for m in matches:
            if m not in seen:
                seen.add(m)
                thumbs.append(m)
        thumbs = thumbs[:10]
        
        base_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5\review'
        os.makedirs(base_dir, exist_ok=True)
        
        cell_w, cell_h = 240, 240
        cols, rows = 5, 2
        grid = Image.new('RGB', (cell_w * cols, cell_h * rows), (255, 255, 255))
        draw = ImageDraw.Draw(grid)
        
        for i, t in enumerate(thumbs):
            c = i % cols
            r = i // cols
            x = c * cell_w
            y = r * cell_h
            
            try:
                img_req = urllib.request.Request(t, headers={'User-Agent': headers['User-Agent']})
                with urllib.request.urlopen(img_req, timeout=8) as ir:
                    raw = ir.read()
                temp_img = os.path.join(base_dir, f'm{meal_id}_cand{i+1}.jpg')
                with open(temp_img, 'wb') as f:
                    f.write(raw)
                    
                with Image.open(temp_img) as im:
                    im = im.convert('RGB')
                    im.thumbnail((cell_w, cell_h - 26))
                    px = x + (cell_w - im.width) // 2
                    py = y + 26 + (cell_h - 26 - im.height) // 2
                    grid.paste(im, (px, py))
            except Exception as e:
                print(f"Error loading thumb {i+1}: {e}")
                
            draw.rectangle([x, y, x + cell_w, y + 24], fill=(30, 30, 30))
            draw.text((x + 10, y + 5), f"Meal {meal_id} #{i+1}", fill=(255, 255, 255))
            draw.rectangle([x, y, x + cell_w - 1, y + cell_h - 1], outline=(200, 200, 200), width=1)
            
        out_path = os.path.join(base_dir, f'grid_meal_{meal_id}.jpg')
        grid.save(out_path, quality=85)
        print(f"Saved {out_path} with {len(thumbs)} candidates")
    except Exception as e:
        print(f"Error in meal {meal_id}: {e}")

tasks = [
    (17, 'ผัดมะเขือยาว โหระพา หมูสับ ราดข้าว'),
    (29, 'น้ำพริกหนุ่ม แคบหมู ผักลวก ไข่ต้ม'),
    (64, 'ไข่ลวก 2 ฟอง เหยาะซอส'),
    (68, 'แซนวิชทูน่า ขนมปังโฮลวีท'),
    (82, 'scrambled egg ไข่คน อาหารเช้า'),
    (88, 'ต้มจืดตำลึงหมูสับ แกงจืด'),
    (100, 'น้ำเต้าหู้ ทรงเครื่อง ฟองเต้าหู้')
]

for m_id, q in tasks:
    fetch_and_make_grid(m_id, q)
