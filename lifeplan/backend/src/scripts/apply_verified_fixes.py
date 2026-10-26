import os
import shutil
from PIL import Image

public_dir = r'd:\Life_Cycle\lifeplan\frontend\public\meals'
dist_dir = r'd:\Life_Cycle\lifeplan\frontend\dist\meals'

brain_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5'

replacements = {
    10: os.path.join(brain_dir, 'test_commons', 'm10_thai_phat_phak.jpg'),
    17: os.path.join(brain_dir, 'test_commons_remaining', 'm17_eggplant_pork.jpg'),
    29: os.path.join(brain_dir, 'test_commons', 'nam_prik_noom_1.jpg'),
    34: os.path.join(brain_dir, 'test_commons', 'm34_larb_1.jpg'),
    64: os.path.join(brain_dir, 'test_commons', 'soft_boiled_egg_2.jpg'),
    68: os.path.join(brain_dir, 'test_commons', 'tuna_sandwich.jpg'),
    82: os.path.join(brain_dir, 'test_commons', 'scrambled_eggs_2.jpg'),
    88: os.path.join(brain_dir, 'test_commons_remaining', 'm88_clear_soup_1.jpg'),
    91: os.path.join(brain_dir, 'fix_candidates', 'meal_91_c3.jpg'),
    92: os.path.join(brain_dir, 'fix_candidates', 'meal_91_c1.jpg'),
    100: os.path.join(brain_dir, 'test_commons_remaining', 'm100_taipei_soymilk.jpg'),
}

for meal_id, src_path in replacements.items():
    if not os.path.exists(src_path):
        print(f"Error: {src_path} does not exist!")
        continue
    
    # Save standard high quality RGB JPEG
    with Image.open(src_path) as im:
        im = im.convert('RGB')
        
        pub_target = os.path.join(public_dir, f'meal_{meal_id}.jpg')
        dist_target = os.path.join(dist_dir, f'meal_{meal_id}.jpg')
        
        im.save(pub_target, 'JPEG', quality=90)
        im.save(dist_target, 'JPEG', quality=90)
        print(f"Updated Meal {meal_id}: {pub_target}")

print("All replacements applied successfully!")
