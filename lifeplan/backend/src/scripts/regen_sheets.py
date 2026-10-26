import os
from PIL import Image, ImageDraw

img_dir = r'd:\Life_Cycle\lifeplan\frontend\public\meals'
out_dir = r'C:\Users\poom\.gemini\antigravity\brain\50794592-a95f-40f1-b032-fbf1deb5e2c5\contact_sheets'
os.makedirs(out_dir, exist_ok=True)

cell_w, cell_h = 240, 240
cols, rows = 5, 2

sheets_to_update = [0, 1, 2, 3, 6, 8, 9]  # 0-indexed: Sheet 1, 2, 3, 4, 7, 9, 10

for sheet_idx in sheets_to_update:
    start_id = sheet_idx * 10 + 1
    sheet = Image.new('RGB', (cell_w * cols, cell_h * rows), (255, 255, 255))
    draw = ImageDraw.Draw(sheet)
    
    for i in range(10):
        meal_id = start_id + i
        c = i % cols
        r = i // cols
        x = c * cell_w
        y = r * cell_h
        
        img_path = os.path.join(img_dir, f'meal_{meal_id}.jpg')
        if os.path.exists(img_path):
            try:
                with Image.open(img_path) as im:
                    im = im.convert('RGB')
                    im.thumbnail((cell_w, cell_h - 30))
                    px = x + (cell_w - im.width) // 2
                    py = y + 30 + (cell_h - 30 - im.height) // 2
                    sheet.paste(im, (px, py))
            except Exception as e:
                print(f"Error loading {meal_id}: {e}")
        
        draw.rectangle([x, y, x + cell_w, y + 28], fill=(30, 30, 30))
        draw.text((x + 10, y + 6), f"Meal {meal_id}", fill=(255, 255, 255))
        draw.rectangle([x, y, x + cell_w - 1, y + cell_h - 1], outline=(200, 200, 200), width=1)
        
    out_file = os.path.join(out_dir, f'sheet_{sheet_idx + 1}.jpg')
    sheet.save(out_file, quality=90)
    print(f"Regenerated {out_file}")
