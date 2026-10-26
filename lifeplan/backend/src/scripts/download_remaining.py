import urllib.request
import os

headers = {
    'User-Agent': 'Mozilla/5.0 LifePlanBot/1.0 (poom@lifeplan.local)'
}

items = {
    'm17_pud_tofu_makhru': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/Pud_Tofu_Makhru_-_Little_Thai_Cafe.jpg/500px-Pud_Tofu_Makhru_-_Little_Thai_Cafe.jpg',
    'm17_eggplant_pork': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Chinese_Stir-Fry_Eggplant_with_Pork_at_%E4%B8%80%E4%BB%A3%E4%BD%B3%E4%BA%BA%E6%B5%B7%E9%AE%AE%E7%A2%B3%E7%83%A4_in_Taipei.jpg/500px-Chinese_Stir-Fry_Eggplant_with_Pork_at_%E4%B8%80%E4%BB%A3%E4%BD%B3%E4%BA%BA%E6%B5%B7%E9%AE%AE%E7%A2%B3%E7%83%A4_in_Taipei.jpg',
    'm88_pork_ball_soup': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Pork_Meat_Ball_Soup.jpg/500px-Pork_Meat_Ball_Soup.jpg',
    'm88_clear_soup_1': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Clear_Soup_2018-05-05_%281%29.jpg/500px-Clear_Soup_2018-05-05_%281%29.jpg',
    'm88_clear_soup_2': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Clear_Soup_2018-05-05_%282%29.jpg/500px-Clear_Soup_2018-05-05_%282%29.jpg',
    'm100_douhua': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Douhua.jpg/500px-Douhua.jpg',
    'm100_taipei_soymilk': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Taipei_breakfast_with_fresh_soymilk_20071023.jpg/500px-Taipei_breakfast_with_fresh_soymilk_20071023.jpg'
}

out_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5\test_commons_remaining'
os.makedirs(out_dir, exist_ok=True)

for name, url in items.items():
    dest = os.path.join(out_dir, f'{name}.jpg')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(dest, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {name} ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f"Error {name}: {e}")
