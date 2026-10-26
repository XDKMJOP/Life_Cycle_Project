async function testBing(query: string) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&first=1&scenario=ImageBasicHover`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'th,en-US;q=0.9,en;q=0.8',
    },
  });
  const html = await res.text();
  const murls = [...html.matchAll(/murl&quot;:&quot;(http[^&]+)&quot;/g)].map((m) => m[1]);
  const thumbs = [...html.matchAll(/(https:\/\/tse\d\.mm\.bing\.net\/th\/id\/OIP\.[^"&?]+)/g)].map((m) => m[1]);
  console.log(query, 'Found murls:', murls.length, 'thumbs:', thumbs.length);
  if (murls.length > 0) {
    console.log('Sample murl:', murls[0]);
  }
  if (thumbs.length > 0) {
    console.log('Sample thumb:', thumbs[0]);
  }
}

async function main() {
  await testBing('สุกี้น้ำ อกไก่ ผักรวม');
  await testBing('สุกี้แห้ง ทะเล จาน');
  await testBing('ข้าวไข่เจียวชะอม');
  await testBing('ต้มมะระยัดไส้หมูสับ');
}

main().catch(console.error);
