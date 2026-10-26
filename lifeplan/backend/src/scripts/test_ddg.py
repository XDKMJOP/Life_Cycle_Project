import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import urllib.parse
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
}

def search_ddg_images(query):
    url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')

    m = re.search(r'vqd=([0-9-]+)', html)
    if not m:
        m = re.search(r'vqd="([0-9-]+)"', html)
    if not m:
        m = re.search(r'vqd=([a-zA-Z0-9_-]+)', html)
    if not m:
        print("VQD not found")
        return []
        
    vqd = m.group(1)
    iurl = f"https://duckduckgo.com/i.js?l=th-th&o=json&q={urllib.parse.quote(query)}&vqd={vqd}"
    ireq = urllib.request.Request(iurl, headers=headers)
    with urllib.request.urlopen(ireq) as iresp:
        data = json.loads(iresp.read().decode('utf-8'))
        return data.get('results', [])

if __name__ == '__main__':
    res = search_ddg_images("น้ำพริกหนุ่ม แคบหมู")
    print(f"Found {len(res)} results")
    for r in res[:5]:
        print(r.get('title'))
        print(r.get('image'))
