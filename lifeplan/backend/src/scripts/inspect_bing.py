import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import urllib.parse
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'th,en-US;q=0.9,en;q=0.8'
}

def inspect(q):
    url = f'https://www.bing.com/images/search?q={urllib.parse.quote(q)}&first=1&scenario=ImageBasicHover'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode('utf-8', errors='ignore')
        thumbs = re.findall(r'(https://tse\d\.mm\.bing\.net/th/id/OIP\.[^"&?]+)', html)
        seen = set()
        unique = []
        for t in thumbs:
            if t not in seen:
                seen.add(t)
                unique.append(t)
        print(f"=== Query: {q} (Found {len(unique)} thumbs) ===")
        return unique
    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == '__main__':
    thumbs = inspect('ผัดมะเขือยาว โหระพา อกไก่')
    for i, t in enumerate(thumbs[:5]):
        print(f"[{i+1}] {t}")
