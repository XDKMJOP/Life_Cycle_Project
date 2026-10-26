import urllib.request

headers = {'User-Agent': 'LifePlanBot/1.0 (poom@lifeplan.local)'}

urls = {
    'm34_larb_1': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Larb.jpg/500px-Larb.jpg',
    'm34_larb_2': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Day_224-_Chicken_Larb_%287947748382%29.jpg/500px-Day_224-_Chicken_Larb_%287947748382%29.jpg'
}

for name, u in urls.items():
    req = urllib.request.Request(u, headers=headers)
    with urllib.request.urlopen(req) as resp, open(f'C:/Users/poom/.gemini/antigravity/brain/50794592-a95f-40f1-b032-fbf1deb5e2c5/test_commons/{name}.jpg', 'wb') as f:
        f.write(resp.read())
    print(f"Downloaded {name}")
