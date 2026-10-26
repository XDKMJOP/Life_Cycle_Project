import fs from 'fs';
import path from 'path';

export interface BudgetThaiMeal {
  id: number;
  name_th: string;
  name_en: string;
  category: string;
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  price_thb: number;
  source: string;
  tip: string;
  query: string;
  image: string;
}

export const NEW_50_MEALS: BudgetThaiMeal[] = [
  // 101 - 110: Main dishes & High protein/energy meals
  {
    id: 101,
    name_th: "ข้าวหน้าเป็ดย่างลอกหนังแตงกวาสด",
    name_en: "Roasted Duck over Rice (Skin Trimmed)",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 540,
    protein_g: 34,
    carb_g: 65,
    fat_g: 14,
    price_thb: 65,
    source: "ร้านเป็ดย่าง / อาหารจานเดียว",
    tip: "ขอราดน้ำพะโล้น้อยลง เลือกเนื้ออกเป็ดลอกหนัง โปรตีนสูงแร่ธาตุเหล็กเพียบ",
    query: "ข้าวหน้าเป็ดย่าง จาน",
    image: "/meals/meal_101.jpg"
  },
  {
    id: 102,
    name_th: "ข้าวเนื้อสไลด์ผัดหอมใหญ่ไข่ออนเซ็น",
    name_en: "Sliced Beef Onion Stir-fry with Onsen Egg",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 580,
    protein_g: 40,
    carb_g: 60,
    fat_g: 16,
    price_thb: 75,
    source: "ร้านอาหารตามสั่ง / สตรีทฟู้ด",
    tip: "เนื้อวัวไม่ติดมันอุดมด้วยธาตุเหล็กและสังกะสี เสริมไข่ออนเซ็นดูดซึมโปรตีนเยี่ยม",
    query: "ข้าวหน้าเนื้อสไลด์ ผัดหอมใหญ่ ไข่ออนเซ็น",
    image: "/meals/meal_102.jpg"
  },
  {
    id: 103,
    name_th: "สเต็กอกไก่พริกไทยดำพร้อมมันบดผักต้ม",
    name_en: "Black Pepper Chicken Breast Steak with Mash",
    category: "เมนูประหยัดทำเอง",
    slot: "dinner",
    kcal: 490,
    protein_g: 48,
    carb_g: 45,
    fat_g: 10,
    price_thb: 60,
    source: "ร้านสเต็กริมทาง / ทำเอง",
    tip: "อกไก่หมักพริกไทยดำย่างกระทะเทฟลอน เสิร์ฟคู่มันบดแท้ไม่ใส่นมข้น ได้คาร์บเชิงซ้อนอิ่มยาว",
    query: "สเต็กอกไก่ พริกไทยดำ สลัดผัก",
    image: "/meals/meal_103.jpg"
  },
  {
    id: 104,
    name_th: "ข้าวผัดสับปะรดกุ้งสดไก่ฉีกเม็ดมะม่วง",
    name_en: "Pineapple Fried Rice with Shrimp & Chicken",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 560,
    protein_g: 36,
    carb_g: 72,
    fat_g: 12,
    price_thb: 70,
    source: "ร้านอาหารตามสั่ง",
    tip: "เอนไซม์โบรมีเลนในสับปะรดย่อยโปรตีนได้ดี เติมพลังงานเต็มที่สำหรับวันออกกำลังกายหนัก",
    query: "ข้าวผัดสับปะรด กุ้ง จาน",
    image: "/meals/meal_104.jpg"
  },
  {
    id: 105,
    name_th: "ข้าวแกงกะหรี่ไก่สไตล์ไทยใส่มันฝรั่งแครอท",
    name_en: "Thai Mild Chicken Yellow Curry with Rice",
    category: "ข้าวแกงและต้มจืด",
    slot: "lunch",
    kcal: 520,
    protein_g: 35,
    carb_g: 68,
    fat_g: 12,
    price_thb: 50,
    source: "ร้านข้าวแกงทั่วไป",
    tip: "ขมิ้นชันในผงกะหรี่ช่วยต้านการอักเสบ สั่งเน้นเนื้อไก่และแครอทลดมันแกง",
    query: "แกงกะหรี่ไก่ มันฝรั่ง ราดข้าว",
    image: "/meals/meal_105.jpg"
  },
  {
    id: 106,
    name_th: "ปลากะพงทอดน้ำปลาจานด่วนกับข้าวกล้อง",
    name_en: "Fried Seabass with Fish Sauce & Brown Rice",
    category: "อาหารตามสั่ง",
    slot: "dinner",
    kcal: 450,
    protein_g: 38,
    carb_g: 50,
    fat_g: 9,
    price_thb: 80,
    source: "ร้านอาหารตามสั่ง / สตรีทซีฟู้ด",
    tip: "เนื้อปลากะพงย่อยง่าย ไขมันต่ำ โอเมก้า 3 สูง ขอซับน้ำมันก่อนทาน",
    query: "ปลากะพงทอดน้ำปลา จาน",
    image: "/meals/meal_106.jpg"
  },
  {
    id: 107,
    name_th: "ข้าวผัดน้ำพริกลงเรือปลาทูทอดผักสด",
    name_en: "Boat Chili Paste Fried Rice with Mackerel",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 480,
    protein_g: 32,
    carb_g: 62,
    fat_g: 11,
    price_thb: 60,
    source: "ร้านอาหารไทยตามสั่ง",
    tip: "ได้โอเมก้า 3 จากปลาทูและสารสกัดจากพริกช่วยกระตุ้นระบบเผาผลาญ",
    query: "ข้าวผัดน้ำพริกลงเรือ ปลาทูทอด",
    image: "/meals/meal_107.jpg"
  },
  {
    id: 108,
    name_th: "ข้าวผัดอเมริกันอกไก่ย่างลูกเกดไข่ดาวน้ำ",
    name_en: "Healthy American Fried Rice with Roast Chicken",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 590,
    protein_g: 42,
    carb_g: 78,
    fat_g: 11,
    price_thb: 70,
    source: "ร้านอาหารตามสั่งทั่วไป",
    tip: "เปลี่ยนจากไก่ชุบแป้งทอดเป็นอกไก่ย่าง ได้คาร์โบไฮเดรตและโปรตีนสมดุลเต็มจาน",
    query: "ข้าวผัดอเมริกัน จาน",
    image: "/meals/meal_108.jpg"
  },
  {
    id: 109,
    name_th: "แกงเขียวหวานอกไก่ใส่มะเขือเปราะกับข้าวสวย",
    name_en: "Green Curry Chicken with Eggplants & Rice",
    category: "ข้าวแกงและต้มจืด",
    slot: "lunch",
    kcal: 470,
    protein_g: 33,
    carb_g: 55,
    fat_g: 13,
    price_thb: 50,
    source: "ร้านข้าวแกงทั่วไป",
    tip: "ตักเอาชิ้นอกไก่และมะเขือเปราะ เลี่ยงการราดน้ำกะทิด้านบนจนชุ่ม",
    query: "แกงเขียวหวานไก่ มะเขือเปราะ ชาม",
    image: "/meals/meal_109.jpg"
  },
  {
    id: 110,
    name_th: "พะแนงอกไก่กะทิธัญพืชข้าวกล้อง",
    name_en: "Panang Chicken Breast with Brown Rice",
    category: "ข้าวแกงและต้มจืด",
    slot: "dinner",
    kcal: 490,
    protein_g: 37,
    carb_g: 54,
    fat_g: 12,
    price_thb: 55,
    source: "ร้านข้าวแกง / ร้านอาหารคลีน",
    tip: "พริกแกงพะแนงหอมใบมะกรูด เลือกลดน้ำราดเพื่อคุมไขมันอิ่มตัว",
    query: "พะแนงไก่ ราดข้าว",
    image: "/meals/meal_110.jpg"
  },

  // 111 - 120: Noodle, Porridge, Breakfast & Comfort Meals
  {
    id: 111,
    name_th: "ก๋วยเตี๋ยวคั่วไก่น้ำมันรำข้าวน้อยใส่ไข่",
    name_en: "Stir-fried Rice Noodles with Chicken (Kua Gai)",
    category: "ก๋วยเตี๋ยวและจานเดียว",
    slot: "dinner",
    kcal: 460,
    protein_g: 30,
    carb_g: 58,
    fat_g: 12,
    price_thb: 50,
    source: "ร้านก๋วยเตี๋ยวคั่วไก่",
    tip: "สั่งคั่วแบบแห้งกรอบไม่ใส่น้ำมันเยิ้ม ผักกาดหอมสดช่วยเพิ่มไฟเบอร์",
    query: "ก๋วยเตี๋ยวคั่วไก่ จาน",
    image: "/meals/meal_111.jpg"
  },
  {
    id: 112,
    name_th: "ผัดไทยไร้เส้นกุ้งสดใส่เต้าหู้เหลืองและถั่วงอก",
    name_en: "No-Noodle Pad Thai with Shrimp & Tofu",
    category: "ก๋วยเตี๋ยวและจานเดียว",
    slot: "dinner",
    kcal: 380,
    protein_g: 31,
    carb_g: 28,
    fat_g: 14,
    price_thb: 65,
    source: "ร้านผัดไทยตามสั่ง",
    tip: "เน้นถั่วงอกกรอบและใบกุยช่าย โปรตีนสูงจากกุ้งสดและเต้าหู้เหลือง",
    query: "ผัดไทยกุ้งสด จาน",
    image: "/meals/meal_112.jpg"
  },
  {
    id: 113,
    name_th: "ยากิโซบะโฮลวีทผัดอกไก่และผักกะหล่ำ",
    name_en: "Wholewheat Yakisoba with Chicken & Veggies",
    category: "ก๋วยเตี๋ยวและจานเดียว",
    slot: "lunch",
    kcal: 440,
    protein_g: 33,
    carb_g: 58,
    fat_g: 8,
    price_thb: 60,
    source: "ร้านอาหารจานเดียว / เมนูทำเอง",
    tip: "เส้นโฮลวีทให้กากใยสูง ซอสโชยุเค็มน้อย ผัดไฟแรงหอมอร่อย",
    query: "ยากิโซบะ ไก่ จาน",
    image: "/meals/meal_113.jpg"
  },
  {
    id: 114,
    name_th: "บะหมี่หยกเป็ดย่างไม่ราดน้ำมันเจียว",
    name_en: "Jade Noodles with Roast Duck",
    category: "ก๋วยเตี๋ยวและจานเดียว",
    slot: "lunch",
    kcal: 430,
    protein_g: 28,
    carb_g: 56,
    fat_g: 10,
    price_thb: 60,
    source: "ร้านเป็ดย่างบะหมี่",
    tip: "สั่งไม่เอาน้ำมันเจียวกระเทียมและไม่เอาน้ำราดหวานจัด ทานกับกวางตุ้งลวก",
    query: "บะหมี่หยก เป็ดย่าง ชาม",
    image: "/meals/meal_114.jpg"
  },
  {
    id: 115,
    name_th: "สุกี้โรลอกไก่สับนึ่งพร้อมน้ำจิ้มสุกี้ลดโซเดียม",
    name_en: "Steamed Suki Rolls with Minced Chicken",
    category: "ก๋วยเตี๋ยวและจานเดียว",
    slot: "dinner",
    kcal: 320,
    protein_g: 36,
    carb_g: 22,
    fat_g: 7,
    price_thb: 55,
    source: "ร้านอาหารเพื่อสุขภาพ / 7-Eleven",
    tip: "ผักกาดขาวห่ออกไก่สับนึ่ง แคลอรี่ต่ำมาก อิ่มจุกไม่ต้องกลัวอ้วน",
    query: "สุกี้โรล อกไก่ ผักกาดขาว นึ่ง",
    image: "/meals/meal_115.jpg"
  },
  {
    id: 116,
    name_th: "ข้าวโอ๊ตนมถั่วเหลืองใส่กล้วยหอมและเมล็ดเจีย",
    name_en: "Warm Soy Milk Oatmeal with Banana & Chia",
    category: "เมนูประหยัดทำเอง",
    slot: "breakfast",
    kcal: 360,
    protein_g: 16,
    carb_g: 60,
    fat_g: 7,
    price_thb: 30,
    source: "ทำเองที่บ้าน / วัตถุดิบ 7-Eleven",
    tip: "เบต้ากลูแคนในข้าวโอ๊ตช่วยลดคอเลสเตอรอลและให้อิ่มท้องตลอดช่วงเช้า",
    query: "ข้าวโอ๊ต กล้วยหอม เมล็ดเจีย ชาม",
    image: "/meals/meal_116.jpg"
  },
  {
    id: 117,
    name_th: "แซนวิชอกไก่ฉีกไข่ต้มขนมปังโฮลวีท",
    name_en: "Wholewheat Shredded Chicken & Boiled Egg Sandwich",
    category: "ร้านสะดวกซื้อ 7-Eleven",
    slot: "breakfast",
    kcal: 350,
    protein_g: 27,
    carb_g: 40,
    fat_g: 8,
    price_thb: 39,
    source: "7-Eleven / ทำเอง",
    tip: "ขนมปังโฮลวีทให้พลังงานชะลอการดูดซึม จับคู่โปรตีนคู่ไข่และไก่ครบถ้วน",
    query: "แซนวิชโฮลวีท อกไก่ ไข่ต้ม",
    image: "/meals/meal_117.jpg"
  },
  {
    id: 118,
    name_th: "ขนมปังโฮลวีททาอะโวคาโดและไข่ดาวน้ำ",
    name_en: "Avocado Toast with Poached Egg",
    category: "เมนูประหยัดทำเอง",
    slot: "breakfast",
    kcal: 380,
    protein_g: 18,
    carb_g: 34,
    fat_g: 19,
    price_thb: 45,
    source: "คาเฟ่เพื่อสุขภาพ / ทำเอง",
    tip: "ไขมันดีไม่อิ่มตัวเชิงเดี่ยวจากอะโวคาโดช่วยบำรุงเซลล์ประสาทและหัวใจ",
    query: "avocado toast with poached egg",
    image: "/meals/meal_118.jpg"
  },
  {
    id: 119,
    name_th: "ไข่กระทะทรงเครื่องอกไก่สับและกุนเชียงลวก",
    name_en: "Indochina Pan Eggs with Minced Chicken",
    category: "เมนูประหยัดทำเอง",
    slot: "breakfast",
    kcal: 320,
    protein_g: 22,
    carb_g: 12,
    fat_g: 18,
    price_thb: 40,
    source: "ร้านอาหารเช้า / ทำเอง",
    tip: "ใช้กระทะหยอดน้ำมันมะพร้าวเล็กน้อย โรยพริกไทยดำช่วยอบอุ่นร่างกายยามเช้า",
    query: "ไข่กระทะ ทรงเครื่อง",
    image: "/meals/meal_119.jpg"
  },
  {
    id: 120,
    name_th: "โจ๊กข้าวกล้องอกไก่ฉีกไข่ลวกเห็ดหอม",
    name_en: "Brown Rice Congee with Shredded Chicken & Soft Egg",
    category: "เมนูประหยัดทำเอง",
    slot: "breakfast",
    kcal: 310,
    protein_g: 24,
    carb_g: 44,
    fat_g: 5,
    price_thb: 35,
    source: "ร้านโจ๊กตลาดเช้า / ทำเอง",
    tip: "ข้าวกล้องย่อยช้าให้พลังงานสม่ำเสมอ เห็ดหอมช่วยเสริมภูมิคุ้มกัน",
    query: "โจ๊กไก่ ไข่ลวก ชาม",
    image: "/meals/meal_120.jpg"
  },

  // 121 - 135: Soups, Salads, Stir-fries & High Protein Dinner
  {
    id: 121,
    name_th: "ต้มยำกุ้งน้ำใสเห็ดฟางกับข้าวกล้องร้อนๆ",
    name_en: "Clear Tom Yum Soup with Fresh Shrimp & Brown Rice",
    category: "ข้าวแกงและต้มจืด",
    slot: "dinner",
    kcal: 390,
    protein_g: 32,
    carb_g: 52,
    fat_g: 5,
    price_thb: 65,
    source: "ร้านอาหารตามสั่งทั่วไป",
    tip: "สมุนไพร ข่า ตะไคร้ ใบมะกรูด ช่วยไล่ลม ขับเหงื่อ แคลอรี่ต่ำมาก",
    query: "ต้มยำกุ้งน้ำใส ชาม",
    image: "/meals/meal_121.jpg"
  },
  {
    id: 122,
    name_th: "แกงส้มชะอมไข่กุ้งสดน้ำแกงเข้มข้น",
    name_en: "Sour Tamarind Curry with Cha-om Omelet & Shrimp",
    category: "ข้าวแกงและต้มจืด",
    slot: "dinner",
    kcal: 420,
    protein_g: 30,
    carb_g: 48,
    fat_g: 10,
    price_thb: 60,
    source: "ร้านข้าวแกงทั่วไป",
    tip: "รสเปรี้ยวจากมะขามเปียกช่วยระบบขับถ่าย ชะอมวิตามินเอสูงมาก",
    query: "แกงส้มชะอมไข่ กุ้ง ชาม",
    image: "/meals/meal_122.jpg"
  },
  {
    id: 123,
    name_th: "ลาบอกไก่ใส่เห็ดสามอย่างพร้อมผักสดถาด",
    name_en: "Spicy Minced Chicken with 3 Mushrooms & Fresh Herbs",
    category: "อาหารตามสั่ง",
    slot: "dinner",
    kcal: 340,
    protein_g: 38,
    carb_g: 22,
    fat_g: 6,
    price_thb: 50,
    source: "ร้านส้มตำลาบอีสาน",
    tip: "สั่งไม่ใส่ผงชูรสและลดเค็ม ข้าวคั่วหอมกรุ่น ทานคู่กะหล่ำปลีและแตงกวา",
    query: "ลาบไก่ ผักสด จาน",
    image: "/meals/meal_123.jpg"
  },
  {
    id: 124,
    name_th: "ยำปลาทูสมุนไพรตะไคร้ใบสะระแหน่",
    name_en: "Mackerel Herb Salad with Lemongrass & Mint",
    category: "อาหารตามสั่ง",
    slot: "dinner",
    kcal: 310,
    protein_g: 28,
    carb_g: 16,
    fat_g: 12,
    price_thb: 55,
    source: "ร้านยำ / ร้านอาหารตามสั่ง",
    tip: "ปลาทูนึ่งแกะก้างยำใส่ตะไคร้ซอย หอมแดง มะนาวแท้ ไขมันดีสูงมาก",
    query: "ยำปลาทู สมุนไพร จาน",
    image: "/meals/meal_124.jpg"
  },
  {
    id: 125,
    name_th: "สลัดอกไก่ฉีกไข่ต้มน้ำสลัดงาญี่ปุ่นซีอิ๊ว",
    name_en: "Chicken Breast & Egg Salad with Sesame Shoyu",
    category: "ร้านสะดวกซื้อ 7-Eleven",
    slot: "dinner",
    kcal: 330,
    protein_g: 32,
    carb_g: 20,
    fat_g: 11,
    price_thb: 59,
    source: "7-Eleven / CJ More",
    tip: "น้ำสลัดงาญี่ปุ่นซีอิ๊วใสแคลอรี่ต่ำกว่าน้ำสลัดครีมกว่า 3 เท่า",
    query: "สลัดอกไก่ ไข่ต้ม ชาม",
    image: "/meals/meal_125.jpg"
  },
  {
    id: 126,
    name_th: "ข้าวหน้าไก่อบยอดผักคะน้าฮ่องกง",
    name_en: "Roasted Chicken Breast with Hong Kong Kale & Rice",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 490,
    protein_g: 39,
    carb_g: 64,
    fat_g: 8,
    price_thb: 60,
    source: "ร้านอาหารจานเดียว",
    tip: "ไก่อบใช้น้ำมันน้อยกว่าไก่ทอด คะน้ากรอบแคลเซียมและไฟเบอร์แน่น",
    query: "ข้าวหน้าไก่อบ ยอดคะน้า จาน",
    image: "/meals/meal_126.jpg"
  },
  {
    id: 127,
    name_th: "ฉู่ฉี่ปลากะพงหรือปลาทูราดพริกแกงหอม",
    name_en: "Choo Chee Fish Fillet with Steamed Rice",
    category: "ข้าวแกงและต้มจืด",
    slot: "dinner",
    kcal: 460,
    protein_g: 36,
    carb_g: 50,
    fat_g: 11,
    price_thb: 60,
    source: "ร้านข้าวแกงปักษ์ใต้ / ภาคกลาง",
    tip: "ขอราดน้ำฉู่ฉี่แค่พอเคลือบเนื้อปลา โปรตีนเน้นๆ ไม่อมน้ำมัน",
    query: "ฉู่ฉี่ปลากะพง ราดข้าว",
    image: "/meals/meal_127.jpg"
  },
  {
    id: 128,
    name_th: "ต้มข่าไก่สมุนไพรใส่น้ำมะพร้าวสดข้าวสวย",
    name_en: "Coconut Herb Soup with Chicken & Rice",
    category: "ข้าวแกงและต้มจืด",
    slot: "lunch",
    kcal: 480,
    protein_g: 34,
    carb_g: 55,
    fat_g: 12,
    price_thb: 55,
    source: "ร้านข้าวแกงทั่วไป",
    tip: "ใช้น้ำมะพร้าวแท้ตัดกะทิบางส่วน รสกลมกล่อมหอมข่าสดคลายเครียด",
    query: "ต้มข่าไก่ ชาม",
    image: "/meals/meal_128.jpg"
  },
  {
    id: 129,
    name_th: "ไข่ตุ๋นหมูสับทรงเครื่องเห็ดหอมไมโครเวฟ",
    name_en: "Steamed Silky Egg with Minced Pork & Shiitake",
    category: "เมนูประหยัดทำเอง",
    slot: "dinner",
    kcal: 260,
    protein_g: 24,
    carb_g: 8,
    fat_g: 12,
    price_thb: 25,
    source: "ทำเองที่บ้าน / 7-Eleven",
    tip: "ไข่ไก่ 2 ฟองผสมน้ำซุปเห็ดหอม 1:1.5 เข้าเวฟไฟกลาง 5 นาที นุ่มละมุนลิ้น",
    query: "ไข่ตุ๋น ทรงเครื่อง ชาม",
    image: "/meals/meal_129.jpg"
  },
  {
    id: 130,
    name_th: "อกไก่ผัดเม็ดมะม่วงหิมพานต์พริกหวาน",
    name_en: "Stir-fried Chicken with Cashew Nuts & Bell Pepper",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 510,
    protein_g: 38,
    carb_g: 52,
    fat_g: 14,
    price_thb: 65,
    source: "ร้านอาหารตามสั่ง",
    tip: "เม็ดมะม่วงหิมพานต์ให้ไขมันดีไม่อิ่มตัว พริกหวานวิตามินซีสูง",
    query: "ไก่ผัดเม็ดมะม่วงหิมพานต์ จาน",
    image: "/meals/meal_130.jpg"
  },
  {
    id: 131,
    name_th: "ต้มซุปเปอร์ตีนไก่น้ำใสสมุนไพรรสแซ่บ",
    name_en: "Super Spicy Herbal Chicken Soup",
    category: "ข้าวแกงและต้มจืด",
    slot: "dinner",
    kcal: 360,
    protein_g: 28,
    carb_g: 18,
    fat_g: 14,
    price_thb: 60,
    source: "ร้านข้าวต้มรอบดึก / ตามสั่ง",
    tip: "คอลลาเจนธรรมชาติจากเอ็นไก่ น้ำซุปสมุนไพรเผ็ดร้อนเร่งการเผาผลาญ",
    query: "ต้มซุปเปอร์ตีนไก่ ชาม",
    image: "/meals/meal_131.jpg"
  },
  {
    id: 132,
    name_th: "ยำอกไก่ต้มสมุนไพรแตงกวาญี่ปุ่น",
    name_en: "Spicy Boiled Chicken Salad with Cucumber",
    category: "เมนูประหยัดทำเอง",
    slot: "dinner",
    kcal: 280,
    protein_g: 36,
    carb_g: 14,
    fat_g: 6,
    price_thb: 35,
    source: "ทำเองที่บ้าน / วัตถุดิบ 7-11",
    tip: "อกไก่ต้มฉีกคลุกมะนาว พริกขี้หนู และแตงกวากรอบ เย็นสดชื่นไม่อ้วน",
    query: "ยำอกไก่ แตงกวา จาน",
    image: "/meals/meal_132.jpg"
  },
  {
    id: 133,
    name_th: "ข้าวกล้องราดผัดถั่วงอกเต้าหู้ขาวและหมูสับ",
    name_en: "Bean Sprouts & White Tofu Stir-fry with Brown Rice",
    category: "อาหารตามสั่ง",
    slot: "lunch",
    kcal: 430,
    protein_g: 28,
    carb_g: 56,
    fat_g: 9,
    price_thb: 45,
    source: "ร้านอาหารตามสั่ง",
    tip: "เต้าหู้ขาวให้ไอโซฟลาโวนและโปรตีนพืช ถั่วงอกไฟเบอร์สูงแคลอรี่น้อย",
    query: "ผัดถั่วงอกเต้าหู้ ราดข้าว",
    image: "/meals/meal_133.jpg"
  },
  {
    id: 134,
    name_th: "ปลาซาบะย่างซีอิ๊วญี่ปุ่นเสิร์ฟคู่ข้าวสวย",
    name_en: "Grilled Saba Mackerel with Teriyaki Sauce & Rice",
    category: "อาหารตามสั่ง",
    slot: "dinner",
    kcal: 510,
    protein_g: 35,
    carb_g: 54,
    fat_g: 15,
    price_thb: 65,
    source: "ร้านอาหารญี่ปุ่นสตรีทฟู้ด / 7-11",
    tip: "ปลาซาบะอุดมด้วย EPA และ DHA บำรุงสมอง ย่างเกรียมหนังกรอบหอม",
    query: "ปลาซาบะย่างซีอิ๊ว ข้าว",
    image: "/meals/meal_134.jpg"
  },
  {
    id: 135,
    name_th: "ต้มจืดกะหล่ำปลียัดไส้อกไก่สับวุ้นเส้น",
    name_en: "Stuffed Cabbage with Minced Chicken Soup",
    category: "ข้าวแกงและต้มจืด",
    slot: "dinner",
    kcal: 290,
    protein_g: 29,
    carb_g: 26,
    fat_g: 5,
    price_thb: 45,
    source: "ร้านข้าวแกง / ทำเอง",
    tip: "กะหล่ำปลีต้มจนหวานละมุน ไส้อกไก่สับหมักพริกไทยกระเทียม อิ่มสบายท้อง",
    query: "ต้มจืดกะหล่ำปลียัดไส้ ชาม",
    image: "/meals/meal_135.jpg"
  },

  // 136 - 150: Healthy Snacks, Smoothies, Fitness Bowls & Energy Boosters
  {
    id: 136,
    name_th: "สมูทตี้กล้วยหอมเนยถั่วผสมนมถั่วเหลือง",
    name_en: "Peanut Butter Banana Protein Smoothie",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 270,
    protein_g: 15,
    carb_g: 35,
    fat_g: 9,
    price_thb: 30,
    source: "ทำเองที่บ้าน / คาเฟ่สุขภาพ",
    tip: "เนยถั่วแท้ 1 ช้อนโต๊ะ + กล้วยหอม 1 ลูก + นมถั่วเหลือง ปั่นดื่มก่อนออกกำลังกาย 1 ชม.",
    query: "peanut butter banana smoothie glass",
    image: "/meals/meal_136.jpg"
  },
  {
    id: 137,
    name_th: "โยเกิร์ตกรีกแท้ราดผลไม้เบอร์รี่สดและอัลมอนด์",
    name_en: "Greek Yogurt with Fresh Berries & Almonds",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 210,
    protein_g: 18,
    carb_g: 22,
    fat_g: 6,
    price_thb: 35,
    source: "7-Eleven / ซูเปอร์มาร์เก็ต",
    tip: "กรีกโยเกิร์ตให้โปรตีนเข้มข้นกว่าโยเกิร์ตทั่วไป 2 เท่า โปรไบโอติกส์ปรับสมดุลลำไส้",
    query: "greek yogurt berries bowl",
    image: "/meals/meal_137.jpg"
  },
  {
    id: 138,
    name_th: "มันหวานญี่ปุ่นเผาร้อนๆ 1 หัว",
    name_en: "Roasted Japanese Sweet Potato",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 180,
    protein_g: 3,
    carb_g: 42,
    fat_g: 0.5,
    price_thb: 25,
    source: "7-Eleven / ตลาดนัด",
    tip: "ดัชนีน้ำตาลต่ำ (Low GI) คาร์บเชิงซ้อนช่วยให้อิ่มทนนานและไม่กระชากน้ำตาลในเลือด",
    query: "roasted japanese sweet potato",
    image: "/meals/meal_138.jpg"
  },
  {
    id: 139,
    name_th: "ข้าวโพดหวานนึ่งสีทอง 1 ฝัก",
    name_en: "Steamed Golden Sweet Corn",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 160,
    protein_g: 5,
    carb_g: 32,
    fat_g: 2,
    price_thb: 20,
    source: "รถเข็นข้าวโพดต้ม / 7-11",
    tip: "ลูทีนและซีแซนทีนช่วยกรองแสงสีฟ้าและบำรุงสายตา กากใยอาหารสูง",
    query: "steamed sweet corn cob",
    image: "/meals/meal_139.jpg"
  },
  {
    id: 140,
    name_th: "ถั่วแระญี่ปุ่นต้มโรยเกลือทะเล 1 ซอง",
    name_en: "Boiled Edamame with Sea Salt",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 150,
    protein_g: 14,
    carb_g: 11,
    fat_g: 5,
    price_thb: 25,
    source: "7-Eleven / CJ More",
    tip: "โปรตีนพืชครบถ้วน (Complete Plant Protein) กรดอะมิโนจำเป็นครบ 9 ชนิด",
    query: "boiled edamame bowl",
    image: "/meals/meal_140.jpg"
  },
  {
    id: 141,
    name_th: "น้ำเต้าหู้ทรงเครื่องใส่ลูกเดือยและถั่วแดงไม่หวาน",
    name_en: "Unsweetened Soy Milk with Job's Tears & Red Beans",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 170,
    protein_g: 11,
    carb_g: 24,
    fat_g: 3.5,
    price_thb: 20,
    source: "ร้านน้ำเต้าหู้รถเข็น",
    tip: "ลูกเดือยและถั่วแดงเสริมใยอาหารและวิตามินบีรวม สั่งหวาน 0% ดีที่สุด",
    query: "น้ำเต้าหู้ทรงเครื่อง ชาม",
    image: "/meals/meal_141.jpg"
  },
  {
    id: 142,
    name_th: "ฟักทองญี่ปุ่นนึ่งโรยงาขาวคั่ว",
    name_en: "Steamed Japanese Pumpkin with Sesame",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 120,
    protein_g: 3,
    carb_g: 26,
    fat_g: 1.5,
    price_thb: 20,
    source: "ตลาดสด / รถเข็นผลไม้",
    tip: "เบต้าแคโรทีนสูงมาก แคลอรี่ต่ำ ทานแทนขนมหวานยามบ่ายได้ดีเยี่ยม",
    query: "ฟักทองนึ่ง ชิ้น",
    image: "/meals/meal_142.jpg"
  },
  {
    id: 143,
    name_th: "ขนมจีบอกไก่คลีนนึ่งสูตรลดโซเดียม",
    name_en: "Clean Steamed Chicken Breast Shumai",
    category: "ร้านสะดวกซื้อ 7-Eleven",
    slot: "snack",
    kcal: 180,
    protein_g: 20,
    carb_g: 16,
    fat_g: 3.5,
    price_thb: 39,
    source: "7-Eleven / ร้านคลีนฟู้ด",
    tip: "ไม่ผสมแป้งมันและมันหมู ได้โปรตีนจากอกไก่ล้วน ทานง่ายสะดวกทุกที่",
    query: "ขนมจีบไก่ นึ่ง",
    image: "/meals/meal_143.jpg"
  },
  {
    id: 144,
    name_th: "ลูกชิ้นอกไก่ย่างน้ำจิ้มมะขามเปียกลดหวาน",
    name_en: "Grilled Lean Chicken Meatballs",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 190,
    protein_g: 22,
    carb_g: 18,
    fat_g: 3,
    price_thb: 35,
    source: "ร้านลูกชิ้นปิ้ง / ทำเอง",
    tip: "เลือกแบบอกไก่ล้วนไม่ผสมแป้ง ย่างหอมๆ จิ้มน้ำจิ้มมะขามแตะเบาๆ",
    query: "ลูกชิ้นไก่ปิ้ง ไม้",
    image: "/meals/meal_144.jpg"
  },
  {
    id: 145,
    name_th: "แครกเกอร์โฮลเกรนท็อปปิ้งทูน่าในน้ำแร่",
    name_en: "Wholegrain Crackers with Tuna in Mineral Water",
    category: "เมนูประหยัดทำเอง",
    slot: "snack",
    kcal: 220,
    protein_g: 25,
    carb_g: 22,
    fat_g: 3,
    price_thb: 40,
    source: "7-Eleven / วัตถุดิบในบ้าน",
    tip: "ทูน่ากระป๋องในน้ำแร่โปรตีน 30g ไขมัน 0% วางบนแครกเกอร์โฮลเกรนกรุบกรอบ",
    query: "tuna wholegrain crackers snack",
    image: "/meals/meal_145.jpg"
  },
  {
    id: 146,
    name_th: "ผลไม้รวมสด (แตงโม แคนตาลูป ฝรั่ง) 1 กล่อง",
    name_en: "Fresh Mixed Fruit Box (Melon, Guava, Watermelon)",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 110,
    protein_g: 2,
    carb_g: 26,
    fat_g: 0.5,
    price_thb: 25,
    source: "รถเข็นผลไม้ / ซุปเปอร์",
    tip: "ฝรั่งวิตามินซีสูงกว่าส้ม 4 เท่า แตงโมช่วยเติมน้ำให้กล้ามเนื้อหลังซ้อม",
    query: "ผลไม้รวม กล่อง แตงโม ฝรั่ง",
    image: "/meals/meal_146.jpg"
  },
  {
    id: 147,
    name_th: "มิลค์เชคเวย์โปรตีนรสช็อกโกแลตใส่กล้วยหอม",
    name_en: "Chocolate Whey Banana Protein Shake",
    category: "เมนูประหยัดทำเอง",
    slot: "snack",
    kcal: 290,
    protein_g: 32,
    carb_g: 36,
    fat_g: 3.5,
    price_thb: 45,
    source: "ชงเองหลังออกกำลังกาย",
    tip: "อัตราส่วนโปรตีนต่อคาร์บ 1:1 เหมาะมากสำหรับฟื้นฟูไกลโคเจนในกล้ามเนื้อหลังเวท",
    query: "chocolate protein shake glass",
    image: "/meals/meal_147.jpg"
  },
  {
    id: 148,
    name_th: "คอตเทจชีสไขมันต่ำราดน้ำผึ้งแท้และส้มสด",
    name_en: "Low-fat Cottage Cheese with Honey & Orange",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 190,
    protein_g: 22,
    carb_g: 18,
    fat_g: 3,
    price_thb: 45,
    source: "ซุปเปอร์มาร์เก็ต / 7-Eleven",
    tip: "เคซีนโปรตีน (Casein) ย่อยช้า ค่อยๆ ปล่อยกรดอะมิโนหล่อเลี้ยงกล้ามเนื้อยาวนาน",
    query: "cottage cheese fruit bowl",
    image: "/meals/meal_148.jpg"
  },
  {
    id: 149,
    name_th: "เฉาก๊วยแท้ราดนมสดจืดพร่องมันเนย",
    name_en: "Grass Jelly in Fresh Low-fat Milk",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 140,
    protein_g: 7,
    carb_g: 20,
    fat_g: 3,
    price_thb: 25,
    source: "ร้านขนมหวาน / 7-Eleven",
    tip: "เฉาก๊วยมีสรรพคุณแก้ร้อนใน กระหายน้ำ เปลี่ยนจากน้ำเชื่อมเป็นนมสดจืดไขมันต่ำ",
    query: "เฉาก๊วย นมสด ชาม",
    image: "/meals/meal_149.jpg"
  },
  {
    id: 150,
    name_th: "ถั่วรวมอบธรรมชาติ (วอลนัท เม็ดมะม่วง อัลมอนด์)",
    name_en: "Mixed Roasted Natural Nuts (Walnut, Cashew, Almond)",
    category: "อาหารว่างและผลไม้",
    slot: "snack",
    kcal: 200,
    protein_g: 7,
    carb_g: 8,
    fat_g: 16,
    price_thb: 30,
    source: "7-Eleven / CJ More",
    tip: "กรดไขมันโอเมก้า 3 จากวอลนัทช่วยลดการอักเสบ ทาน 1 กำมือเล็กต่อวัน",
    query: "mixed nuts bowl roasted",
    image: "/meals/meal_150.jpg"
  }
];

async function getBingFoodThumb(query: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://www.bing.com/images/search?q=${encoded}&form=HDRSC2&first=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'th-TH,th;q=0.9,en;q=0.8',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const thumbs = [...html.matchAll(/(https:\/\/tse\d\.mm\.bing\.net\/th\/id\/OIP\.[^"&?]+)/g)].map((m) => m[1]);
    if (thumbs.length > 0) {
      return thumbs[0];
    }
  } catch {
    return null;
  }
  return null;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 2500) return false;
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const publicMealsDir = 'd:/Life_Cycle/lifeplan/frontend/public/meals';
  const distMealsDir = 'd:/Life_Cycle/lifeplan/frontend/dist/meals';

  if (!fs.existsSync(publicMealsDir)) fs.mkdirSync(publicMealsDir, { recursive: true });
  if (!fs.existsSync(distMealsDir)) fs.mkdirSync(distMealsDir, { recursive: true });

  console.log(`Starting to download authentic images for ${NEW_50_MEALS.length} new meals...`);

  let successCount = 0;
  for (const meal of NEW_50_MEALS) {
    const publicPath = path.join(publicMealsDir, `meal_${meal.id}.jpg`);
    const distPath = path.join(distMealsDir, `meal_${meal.id}.jpg`);

    let ok = false;
    const thumbUrl = await getBingFoodThumb(meal.query);
    if (thumbUrl) {
      ok = await downloadImage(thumbUrl, publicPath);
      if (ok) {
        fs.copyFileSync(publicPath, distPath);
        successCount++;
        console.log(`[OK] Meal ${meal.id}: ${meal.name_th}`);
      }
    }

    if (!ok) {
      // Fallback: copy from an adjacent existing meal image to ensure no 404
      const fallbackSrc = path.join(publicMealsDir, `meal_${((meal.id - 100) % 50) + 1}.jpg`);
      if (fs.existsSync(fallbackSrc)) {
        fs.copyFileSync(fallbackSrc, publicPath);
        fs.copyFileSync(fallbackSrc, distPath);
        console.log(`[FALLBACK COPY] Meal ${meal.id}: ${meal.name_th}`);
        successCount++;
      } else {
        console.error(`[FAILED] Meal ${meal.id}: ${meal.name_th}`);
      }
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nFinished: ${successCount}/${NEW_50_MEALS.length} meal images prepared in public and dist.`);
}

run().catch(console.error);
