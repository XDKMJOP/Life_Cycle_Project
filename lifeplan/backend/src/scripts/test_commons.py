import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import urllib.parse
import json

headers = {
    'User-Agent': 'LifePlanThaiDiet/1.0 (https://lifeplan.local; poom@lifeplan.local)'
}

def search_commons(term):
    params = urllib.parse.urlencode({
        'action': 'query',
        'list': 'search',
        'srsearch': f"{term} filetype:bitmap",
        'srnamespace': '6',
        'srlimit': '5',
        'format': 'json'
    })
    url = f"https://commons.wikimedia.org/w/api.php?{params}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data.get('query', {}).get('search', [])
            titles = [it['title'] for it in items]
            
            # Now get image urls
            if not titles:
                return []
            info_params = urllib.parse.urlencode({
                'action': 'query',
                'titles': '|'.join(titles),
                'prop': 'imageinfo',
                'iiprop': 'url',
                'iiurlwidth': '500',
                'format': 'json'
            })
            info_url = f"https://commons.wikimedia.org/w/api.php?{info_params}"
            req2 = urllib.request.Request(info_url, headers=headers)
            with urllib.request.urlopen(req2) as resp2:
                data2 = json.loads(resp2.read().decode('utf-8'))
                pages = data2.get('query', {}).get('pages', {})
                res = []
                for p in pages.values():
                    ii = p.get('imageinfo', [])
                    if ii:
                        res.append((p.get('title'), ii[0].get('thumburl') or ii[0].get('url')))
                return res
    except Exception as e:
        print(f"Error: {e}")
        return []

terms = [
    'Nam phrik num',
    'Scrambled eggs',
    'Tuna salad sandwich',
    'Soft-boiled egg',
    'Soy milk',
    'Thai eggplant stir fry'
]

for t in terms:
    print(f"=== {t} ===")
    results = search_commons(t)
    for title, u in results:
        print(f"  {title}")
        print(f"    {u}")
