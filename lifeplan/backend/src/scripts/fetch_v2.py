import urllib.request
import urllib.parse
import re
import os

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'th,en-US;q=0.9,en;q=0.8'
}

def search_thumbs(query, max_count=4):
    full_q = query + ' จาน เมนู อาหาร'
    q = urllib.parse.quote(full_q)
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
    (10, 'ผัดผักรวมมิตร อกไก่'),
    (17, 'ผัดมะเขือยาว โหระพา อกไก่สับ'),
    (29, 'น้ำพริกหนุ่ม ผักลวก แคบหมู'),
    (34, 'ลาบไก่สุก ข้าวคั่ว ผักสด'),
    (51, 'โจ๊กหมูสับ ไข่ลวก ชาม'),
    (64, 'ไข่ลวก เซเว่น CP 7-eleven'),
    (68, 'แซนด์วิชทูน่า โฮลวีท 7-Eleven'),
    (73, 'ซุปข้าวโพด ข้าวบาร์เลย์'),
    (82, 'ไข่คน scrambled egg อาหารเช้า'),
    (85, 'ยำปลากระป๋อง มะนาว หอมแดง'),
    (88, 'แกงจืดตำลึง หมูสับ ชาม'),
    (100, 'น้ำเต้าหู้ทรงเครื่อง ฟองเต้าหู้ ชาม')
]

out_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5\fix_v2'
os.makedirs(out_dir, exist_ok=True)

for meal_id, q in targets:
    thumbs = search_thumbs(q, 4)
    for idx, t in enumerate(thumbs):
        fname = os.path.join(out_dir, f'meal_{meal_id}_v{idx+1}.jpg')
        try:
            req = urllib.request.Request(t, headers={'User-Agent': headers['User-Agent']})
            with urllib.request.urlopen(req, timeout=10) as r, open(fname, 'wb') as f:
                f.write(r.read())
            print(f"Meal {meal_id} v{idx+1} OK")
        except Exception as e:
            print(f"Meal {meal_id} v{idx+1} error: {e}")

print("Finished fetching v2")
