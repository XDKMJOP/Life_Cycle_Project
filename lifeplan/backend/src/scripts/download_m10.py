import urllib.request

headers = {'User-Agent': 'LifePlanBot/1.0 (poom@lifeplan.local)'}

urls = {
    'm10_thai_phat_phak': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/%E0%B8%9C%E0%B8%B1%E0%B8%94%E0%B8%9C%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B8%A7%E0%B8%A1%E0%B8%A1%E0%B8%B4%E0%B8%95%E0%B8%A3_Stir-fried_mixed_vegetables_%289306903082%29.jpg/500px-%E0%B8%9C%E0%B8%B1%E0%B8%94%E0%B8%9C%E0%B8%B1%E0%B8%81%E0%B8%A3%E0%B8%A7%E0%B8%A1%E0%B8%A1%E0%B8%B4%E0%B8%95%E0%B8%A3_Stir-fried_mixed_vegetables_%289306903082%29.jpg',
    'm10_stir_fried_veg': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Stir_fried_mixed_vegetables.jpg/500px-Stir_fried_mixed_vegetables.jpg'
}

for name, u in urls.items():
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req) as resp, open(f'C:/Users/poom/.gemini/antigravity/brain/50794592-a95f-40f1-b032-fbf1deb5e2c5/test_commons/{name}.jpg', 'wb') as f:
        f.write(resp.read())
    print(f"Downloaded {name}")
