import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append(r'lifeplan/backend/src/scripts')
from test_commons import search_commons

queries = [
    ('meal_17', ['Eggplant stir fry', 'Stir fried eggplant basil', 'Phat makhuea', 'Aubergine stir fry']),
    ('meal_88', ['Pork ball soup', 'Meatball clear soup', 'Bak chor soup', 'Tom chuet']),
    ('meal_100', ['Douhua bowl', 'Tofu pudding bowl', 'Soy milk bowl', 'Fresh soymilk'])
]

for tag, qlist in queries:
    print(f"=== {tag} ===")
    for q in qlist:
        res = search_commons(q)
        for title, u in res[:3]:
            print(f"  [{q}] {title}")
            print(f"      {u}")
