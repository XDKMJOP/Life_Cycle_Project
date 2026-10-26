import urllib.request
import urllib.parse
import re
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'th,en-US;q=0.9,en;q=0.8'
}

def search_thumbs(query, max_count=3):
    q = urllib.parse.quote(query)
    url = f'https://www.bing.com/images/search?q={q}&first=1&scenario=ImageBasicHover'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = re.findall(r'(https://tse\d\.mm\.bing\.net/th/id/OIP\.[^"&?]+)', html)
            seen = set()
            unique = []
            for m in matches:
                if m not in seen:
                    seen.add(m)
                    unique.append(m)
            return unique[:max_count]
    except Exception as e:
        print(f"Error searching {query}: {e}")
        return []

targets = [
    (10, 'ผัดผักรวมมิตร อกไก่ จาน wongnai'),
    (17, 'ผัดมะเขือยาว โหระพา หมูสับ ราดข้าว จาน wongnai'),
    (29, 'น้ำพริกหนุ่ม ผักลวก ไข่ต้ม wongnai'),
    (34, 'ลาบไก่สุก อีสาน wongnai'),
    (51, 'โจ๊กหมูสับ ไข่ลวก ชาม wongnai'),
    (64, 'ไข่ลวก ออนเซ็น cp 7-eleven เซเว่น'),
    (68, 'แซนวิชทูน่า โฮลวีท 7-Eleven'),
    (73, 'ซุปข้าวบาร์เลย์ เห็ดหอม ชาม'),
    (82, 'ไข่คน อาหารเช้า จาน scrambled eggs'),
    (85, 'ยำปลากระป๋อง จาน wongnai'),
    (88, 'แกงจืดตำลึง หมูบะช่อ ชาม wongnai'),
    (91, 'กล้วยน้ำว้า สุก สีเหลือง หวี'),
    (92, 'กล้วยหอมทอง สุก สีเหลือง หวี'),
    (100, 'น้ำเต้าหู้ ฟองเต้าหู้ ชาม wongnai')
]

temp_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5\fix_candidates'
os.makedirs(temp_dir, exist_ok=True)

for meal_id, q in targets:
    thumbs = search_thumbs(q, 3)
    for idx, t in enumerate(thumbs):
        fname = os.path.join(temp_dir, f'meal_{meal_id}_c{idx+1}.jpg')
        try:
            req = urllib.request.Request(t, headers={'User-Agent': headers['User-Agent']})
            with urllib.request.urlopen(req, timeout=10) as r, open(fname, 'wb') as f:
                f.write(r.read())
            print(f"Saved meal {meal_id} candidate {idx+1}")
        except Exception as e:
            print(f"Failed meal {meal_id} candidate {idx+1}: {e}")

print("Done fetching candidates.")
