async function searchDDG(query: string) {
  try {
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const text = await res.text();
    const vqdRegex = /vqd=([0-9-]+)/;
    const match = text.match(vqdRegex);
    if (!match) {
      console.log('No vqd match for', query);
      return [];
    }
    const vqd = match[1];
    const imgRes = await fetch(`https://duckduckgo.com/i.js?l=th-th&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const data = await imgRes.json() as any;
    return (data.results || []).slice(0, 3).map((r: any) => ({
      title: r.title,
      image: r.image,
      thumbnail: r.thumbnail,
    }));
  } catch (err: any) {
    console.error('Error:', err.message);
    return [];
  }
}

async function main() {
  const sukiHaeng = await searchDDG('สุกี้แห้ง ทะเล จาน');
  console.log('สุกี้แห้ง:', JSON.stringify(sukiHaeng, null, 2));

  const sukiNam = await searchDDG('สุกี้น้ำ ชาม');
  console.log('สุกี้น้ำ:', JSON.stringify(sukiNam, null, 2));
}

main();
