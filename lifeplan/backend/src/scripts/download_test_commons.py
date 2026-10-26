import urllib.request
import os

headers = {
    'User-Agent': 'Mozilla/5.0 LifePlanBot/1.0 (poom@lifeplan.local)'
}

items = {
    'nam_prik_noom_1': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Nam_phrik_num.jpg/500px-Nam_phrik_num.jpg',
    'nam_prik_noom_2': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Namphrik_Num_and_Khaep_Mu.jpg/500px-Namphrik_Num_and_Khaep_Mu.jpg',
    'scrambled_eggs': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Scrambled_eggs_with_basil.jpg/500px-Scrambled_eggs_with_basil.jpg',
    'scrambled_eggs_2': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Scrambed_eggs.jpg/500px-Scrambed_eggs.jpg',
    'tuna_sandwich': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Tuna_salad_sandwich.jpg/500px-Tuna_salad_sandwich.jpg',
    'soft_boiled_egg': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Soft-boiled-egg.jpg/500px-Soft-boiled-egg.jpg',
    'soft_boiled_egg_2': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Soft_boiled_egg_cut_in_half_in_Japan_-_2024_July_9.jpeg/500px-Soft_boiled_egg_cut_in_half_in_Japan_-_2024_July_9.jpeg'
}

out_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5\test_commons'
os.makedirs(out_dir, exist_ok=True)

for name, url in items.items():
    dest = os.path.join(out_dir, f'{name}.jpg')
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp, open(dest, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {name} successfully ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        print(f"Error {name}: {e}")
