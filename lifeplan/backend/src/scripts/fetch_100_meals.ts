import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface MealSearchSpec {
  id: number;
  name_th: string;
  name_en: string;
  terms: string[];
}

const MEAL_SPECS: MealSearchSpec[] = [
  // 1-20: อาหารตามสั่ง
  { id: 1, name_th: 'ข้าวกะเพราอกไก่ไข่ดาวน้ำ', name_en: 'Holy Basil Chicken with Egg & Rice', terms: ['Kraphao mu khai dao', 'Pad kra pao with egg', 'Phat kaphrao'] },
  { id: 2, name_th: 'ข้าวกะเพรากุ้งสดไข่ต้ม', name_en: 'Holy Basil Shrimp with Boiled Egg', terms: ['Phat kaphrao kung', 'Pad kra pao shrimp', 'Shrimp basil Thai'] },
  { id: 3, name_th: 'ข้าวผัดอกไก่ใช้น้ำมันน้อย', name_en: 'Light Chicken Fried Rice', terms: ['Fried rice with chicken', 'Khao phat kai', 'Thai fried rice'] },
  { id: 4, name_th: 'ผัดซีอิ๊วอกไก่เส้นหมี่ขาว', name_en: 'Pad See Ew Chicken', terms: ['Pad see ew', 'Phat si-io', 'Stir-fried noodles with soy sauce'] },
  { id: 5, name_th: 'สุกี้น้ำอกไก่ผักรวม', name_en: 'Thai Suki Soup with Veggies', terms: ['2019 02 Suki street food Korat 02', 'Thai suki soup', 'Sukiyaki soup'] },
  { id: 6, name_th: 'สุกี้แห้งรวมมิตรทะเลน้ำมันน้อย', name_en: 'Stir-fried Dry Suki Seafood', terms: ['Suki haeng', 'Thai dry suki', 'Stir fried glass noodle seafood'] },
  { id: 7, name_th: 'ข้าวผัดพริกแกงไก่ใส่ถั่วฝักยาว', name_en: 'Red Curry Stir-fried Chicken', terms: ['Gai Pad Prik Gaeng', 'Phat phrik khing', 'Stir fried red curry chicken'] },
  { id: 8, name_th: 'ข้าวผัดพริกเผาอกไก่', name_en: 'Chili Jam Stir-fried Chicken', terms: ['Chicken with roasted chili paste', 'Phat phrik phao', 'Thai chili paste chicken'] },
  { id: 9, name_th: 'ไก่ผัดขิงสดกับข้าวสวย', name_en: 'Stir-fried Chicken with Ginger', terms: ['Kai phat khing', 'Gai pad king', 'Chicken with ginger'] },
  { id: 10, name_th: 'ผัดผักรวมมิตรใส่เนื้ออกไก่', name_en: 'Stir-fried Mixed Vegetables Chicken', terms: ['Phat phak ruam', 'Stir fried vegetables Thai', 'Mixed vegetables stir fry'] },
  { id: 11, name_th: 'ข้าวผัดกะหล่ำปลีใส่ไข่และไก่สับ', name_en: 'Cabbage & Egg Stir-fry with Chicken', terms: ['Stir fried cabbage with egg', 'Phat kalam pli sai khai', 'Sauteed cabbage egg'] },
  { id: 12, name_th: 'ต้มยำไก่น้ำใสกับข้าวสวย', name_en: 'Clear Tom Yum Chicken Soup', terms: ['Tom yam kai', 'Tom yum gai clear', 'Tom yum soup'] },
  { id: 13, name_th: 'ข้าวราดกะเพราเต้าหู้ขาวหมูสับ', name_en: 'Holy Basil Tofu & Minced Pork', terms: ['Tofu holy basil', 'Tofu basil stir fry', 'Pad krapow tofu'] },
  { id: 14, name_th: 'ข้าวผัดกระเทียมอกไก่พริกไทยดำ', name_en: 'Garlic Black Pepper Chicken', terms: ['Kai phat krathiam', 'Garlic pepper chicken', 'Black pepper chicken'] },
  { id: 15, name_th: 'ข้าวไข่เจียวเห็ดใส่ชะอมทอดน้ำมันน้อย', name_en: 'Mushroom & Cha-om Omelet', terms: ['Khao khai chiao', 'Khai Jiao', 'FoodOmelete', 'Thai omelette'] },
  { id: 16, name_th: 'ข้าวราดคะน้าหมูชิ้นไม่ติดมัน', name_en: 'Stir-fried Chinese Kale with Pork', terms: ['Phat khana mu', 'Stir fried Chinese kale pork', 'Gai lan pork'] },
  { id: 17, name_th: 'ข้าวผัดมะเขือยาวอกไก่สับใบโหระพา', name_en: 'Stir-fried Eggplant with Chicken Basil', terms: ['Phat ma-khuea yao', 'Stir fried eggplant basil', 'Thai eggplant stir fry'] },
  { id: 18, name_th: 'ราดหน้าเส้นหมี่ขาวอกไก่คะน้า', name_en: 'Rice Noodles in Gravy with Chicken', terms: ['Rat na', 'Rad na', 'Noodles in gravy Thai'] },
  { id: 19, name_th: 'ข้าวกะเพราเนื้อสับไม่ติดมันไข่ต้ม', name_en: 'Lean Beef Basil with Boiled Egg', terms: ['Daging Pad Kra Pao', 'Phat kaphrao nuea', 'Beef basil Thai'] },
  { id: 20, name_th: 'ยำวุ้นเส้นอกไก่สับกุ้งสดน้ำยำมะนาว', name_en: 'Spicy Glass Noodle Salad', terms: ['Yam wun sen', 'Yam woon sen', 'Glass noodle salad Thai'] },

  // 21-40: ข้าวแกงและต้มจืด
  { id: 21, name_th: 'แกงจืดเต้าหู้หมูสับสาหร่าย', name_en: 'Tofu, Minced Pork & Seaweed Soup', terms: ['Tom chuet taohu mu sap', 'Tofu seaweed soup', 'Clear soup tofu'] },
  { id: 22, name_th: 'ต้มมะระยัดไส้หมูสับ', name_en: 'Stuffed Bitter Gourd Soup', terms: ['Tom mara yat sai mu sap wunsen', 'Tom mara', 'Bitter gourd stuffed soup'] },
  { id: 23, name_th: 'แกงส้มผักรวมกุ้งสด', name_en: 'Sour Curry Soup with Mixed Veggies', terms: ['Kaeng som', 'Gaeng som kung', 'Sour curry Thai'] },
  { id: 24, name_th: 'แกงเลียงผักรวมกุ้งสด', name_en: 'Herbal Vegetable Soup with Shrimp', terms: ['Kaeng liang', 'Gaeng liang', 'Thai herbal soup'] },
  { id: 25, name_th: 'ต้มฟักไก่ใส่มะนาวดอง', name_en: 'Winter Melon Chicken Soup with Lime', terms: ['Winter melon soup', 'Chicken winter melon soup', 'Tom fak'] },
  { id: 26, name_th: 'ไข่พะโล้ต้มเต้าหู้ (ไม่ทานมันหมู)', name_en: 'Braised Eggs & Tofu in Five-Spice', terms: ['Kai phalo', 'Thit kho tau', 'Braised egg tofu five spice'] },
  { id: 27, name_th: 'ต้มจับฉ่ายหมูเนื้อแดง', name_en: 'Chinese Mixed Vegetable Stew', terms: ['Tom chap chai', 'Chinese vegetable stew', 'Luohan zhai'] },
  { id: 28, name_th: 'ชุดน้ำพริกกะปิ ปลาทูทอด ผักต้มรวม', name_en: 'Shrimp Paste Dip with Mackerel', terms: ['Nam phrik kapi', 'Pla thu thot nam phrik', 'Fried mackerel chili paste'] },
  { id: 29, name_th: 'น้ำพริกหนุ่ม ไข่ต้ม ผักนึ่งแตงกวา', name_en: 'Northern Green Chili Dip with Egg', terms: ['Nam phrik num', 'Northern green chili dip', 'Nam prik noom'] },
  { id: 30, name_th: 'แกงแคไก่ใส่ผักพื้นบ้าน', name_en: 'Northern Herbal Chicken Curry', terms: ['Kaeng khae', 'Northern Thai chicken curry', 'Gaeng khae'] },
  { id: 31, name_th: 'แกงเห็ดรวมใส่ชะอมใบย่านาง', name_en: 'Isan Mixed Mushroom & Bamboo Soup', terms: ['Kaeng het', 'Isan mushroom soup', 'Thai mushroom soup'] },
  { id: 32, name_th: 'ต้มข่าไก่น้ำใสใส่หัวปลี', name_en: 'Galangal Chicken Soup with Banana Blossom', terms: ['Tom kha kai', 'Tom kha gai soup', 'Chicken galangal soup'] },
  { id: 33, name_th: 'ซุปหน่อไม้แบบอีสานไม่ใส่น้ำมัน', name_en: 'Isan Spicy Bamboo Shoot Salad', terms: ['Sup no mai', 'Isan bamboo shoot salad', 'Bamboo shoots salad'] },
  { id: 34, name_th: 'ลาบไก่สุกใส่ข้าวคั่วผักสด', name_en: 'Spicy Minced Chicken Salad (Larb)', terms: ['Larb gai', 'Larp kai', 'LaoFood LarbNeua', 'Minced chicken salad'] },
  { id: 35, name_th: 'น้ำตกอกไก่ย่างไม่เอาหนัง', name_en: 'Grilled Chicken Waterfall Salad', terms: ['Moo nam tok', 'Nam tok gai', 'Waterfall salad'] },
  { id: 36, name_th: 'ส้มตำไทยไม่หวานจัดใส่ไข่ต้ม', name_en: 'Green Papaya Salad (Som Tum)', terms: ['Som tam 1', 'Som tam', 'Papaya salad Thai'] },
  { id: 37, name_th: 'ไก่ย่างขมิ้นลอกหนังกับข้าวกล้อง', name_en: 'Turmeric Grilled Chicken (Kai Yang)', terms: ['Grilled chicken in Thailand', 'Kai yang', 'Thai grilled chicken'] },
  { id: 38, name_th: 'แกงอ่อมไก่ใส่ผักชีลาวและกะหล่ำ', name_en: 'Isan Herbal Chicken Soup with Dill', terms: ['Kaeng om', 'Gaeng om Isan', 'Dill chicken soup Thai'] },
  { id: 39, name_th: 'ปลาดุกย่างเนื้อล้วนสะเดาน้ำปลาหวานน้ำใส', name_en: 'Grilled Catfish with Neem Leaves', terms: ['Pla duk yang', 'Grilled catfish', 'Ikan lele bakar'] },
  { id: 40, name_th: 'ข้าวราดผัดฟักทองใส่ไข่', name_en: 'Stir-fried Pumpkin with Egg & Rice', terms: ['Phat fak thong', 'Stir fried pumpkin egg', 'Sauteed pumpkin'] },

  // 41-60: ก๋วยเตี๋ยวและจานเดียว
  { id: 41, name_th: 'ก๋วยเตี๋ยวน้ำใสไก่ฉีกเส้นหมี่ขาว', name_en: 'Clear Noodle Soup with Chicken', terms: ['Kuaitiao nam sai', 'Chicken noodle soup Thai', 'Clear broth noodles'] },
  { id: 42, name_th: 'เกาเหลาเลือดหมูตำลึงใบจิงจูฉ่าย', name_en: 'Clear Pork Blood & Leafy Greens Soup', terms: ['Tom lueat mu', 'Pork intestine with blood cake soup', 'Kaolao'] },
  { id: 43, name_th: 'ก๋วยเตี๋ยวต้มยำน้ำใสไก่สับ', name_en: 'Spicy Tom Yum Noodle with Chicken', terms: ['Kuaitiao tom yam', 'Tom yum noodle soup', 'Tom yum noodles'] },
  { id: 44, name_th: 'บะหมี่ผักโมโรเฮยะอกไก่ต้มซีอิ๊ว', name_en: 'Moroheiya Green Noodles Chicken', terms: ['Green noodles chicken', 'Moroheiya noodles', 'Spinach noodles'] },
  { id: 45, name_th: 'ก๋วยจั๊บน้ำใสใส่ไข่ต้มและเต้าหู้', name_en: 'Clear Pepper Broth Rolled Noodles', terms: ['Kuai chap nam sai', 'Kway chap', 'Rolled noodles pepper soup'] },
  { id: 46, name_th: 'ข้าวมันไก่ต้ม (สั่งไม่เอาหนัง)', name_en: 'Hainanese Chicken Rice', terms: ['Hainanese chicken rice', '2013 Khao man kai CM', 'Khao man gai'] },
  { id: 47, name_th: 'ข้าวหมูแดงเนื้อล้วนน้ำราดน้อย', name_en: 'Red Roasted Pork Rice', terms: ['Khao mu daeng', 'Char siu rice', 'Roasted pork rice'] },
  { id: 48, name_th: 'ข้าวหน้าเป็ดย่างลอกหนังแตงกวาดอง', name_en: 'Roast Duck Rice', terms: ['Khao na pet', 'Roast duck rice', 'Duck over rice'] },
  { id: 49, name_th: 'ข้าวต้มปลากะพงน้ำใสโรยคื่นช่าย', name_en: 'Seabass Fish Porridge', terms: ['Khao tom pla', 'Fish porridge congee', 'Fish rice soup'] },
  { id: 50, name_th: 'ข้าวต้มหมูสับกุ้งแก้วน้ำใส', name_en: 'Pork & Shrimp Rice Soup', terms: ['Khao tom goong', 'Shrimp rice soup', 'Pork rice porridge'] },
  { id: 51, name_th: 'โจ๊กหมูสับใส่ไข่ลวก (ไม่เครื่องใน)', name_en: 'Rice Congee with Minced Pork & Egg', terms: ['Chok congee', 'Century egg congee', 'Congee bowl'] },
  { id: 52, name_th: 'ขนมจีนน้ำยาป่าผักสดจัดเต็ม', name_en: 'Rice Noodles with Jungle Fish Curry', terms: ['Khanom chin nam ya', 'Rice vermicelli fish curry', 'Kanom jeen'] },
  { id: 53, name_th: 'ขนมจีนน้ำเงี้ยวใส่หมูสับเลือดไก่', name_en: 'Northern Nam Ngiao Rice Noodles', terms: ['Naam Ngiao spicy tomato soup', 'Khanom chin nam ngiao', 'Nam ngiao'] },
  { id: 54, name_th: 'เย็นตาโฟน้ำใสเส้นหมี่ขาวลูกชิ้นปลา', name_en: 'Pink Yentafo Noodle Soup', terms: ['Yen ta fo', 'Yong tau foo noodle', 'Pink noodle soup'] },
  { id: 55, name_th: 'ก๋วยเตี๋ยวเรือเนื้อตุ๋นน้ำใส (ไม่ใส่กากหมู)', name_en: 'Boat Noodle Soup with Beef', terms: ['Bowl of boat noodles', 'Kuaitiao ruea', 'Boat noodles'] },
  { id: 56, name_th: 'ผัดไทยกุ้งสดใช้น้ำมันน้อยเน้นถั่วงอก', name_en: 'Light Pad Thai with Shrimp', terms: ['Phat Thai kung Chang Khien', 'Pad thai', 'Thai stir fried noodles'] },
  { id: 57, name_th: 'ข้าวคลุกกะปิไข่ฝอยหมูหวานน้อย', name_en: 'Shrimp Paste Fried Rice with Omelet', terms: ['Khao khluk kapi', 'Shrimp paste fried rice', 'Khao kluk kapi'] },
  { id: 58, name_th: 'ข้าวผัดแหนมไข่ขาวใส่หอมใหญ่', name_en: 'Fermented Pork & Egg White Fried Rice', terms: ['Phat naem sai khai', 'Khao phat naem', 'Sour pork fried rice'] },
  { id: 59, name_th: 'ข้าวหน้าอกไก่ผัดซอสกระเทียมพริกสด', name_en: 'Spicy Garlic Chicken Rice Bowl', terms: ['Kai tod krathiam', 'Garlic chicken rice bowl', 'Spicy chicken rice'] },
  { id: 60, name_th: 'กระเพาะปลาผัดแห้งใส่ไข่และถั่วงอก', name_en: 'Stir-fried Fish Maw with Egg', terms: ['Kra-pho pla', 'Fish maw soup', 'Stir fried fish maw'] },

  // 61-80: ร้านสะดวกซื้อ 7-Eleven
  { id: 61, name_th: 'อกไก่นุ่มรสกระเทียมพริกไทย 7-Eleven', name_en: 'Tender Garlic Pepper Chicken Breast', terms: ['Steamed chicken breast fillet', 'Cooked chicken breast', 'Sous vide chicken breast'] },
  { id: 62, name_th: 'ข้าวไรซ์เบอร์รี่ผสมข้าวกล้องพร้อมทาน', name_en: 'Steamed Riceberry & Brown Rice', terms: ['Riceberry rice', 'Cooked black rice', 'Brown rice steamed'] },
  { id: 63, name_th: 'ไข่ต้มสมุนไพร CP 2 ฟอง', name_en: 'CP Boiled Eggs (Pack of 2)', terms: ['Boiled Egg - Crossection', 'Hard boiled eggs peeled', 'Boiled chicken eggs'] },
  { id: 64, name_th: 'ไข่ลวก CP 2 ฟอง พร้อมซอสเหยาะ', name_en: 'CP Soft-Boiled Onsen Eggs', terms: ['Ajitsuke tamago', 'Soft boiled egg ramen', 'Soft-boiled eggs'] },
  { id: 65, name_th: 'ไข่ตุ๋นคัพ CP รสคลาสสิก', name_en: 'CP Steamed Egg Cup', terms: ['Chawanmushi', 'Steamed egg custard', 'Kai tun'] },
  { id: 66, name_th: 'อกไก่ฉีกปรุงรสในน้ำแร่ / เกลือ', name_en: 'Shredded Seasoned Chicken Breast Cup', terms: ['Shredded chicken breast', 'Pulled chicken breast', 'Cooked shredded chicken'] },
  { id: 67, name_th: 'ปลากระป๋องแมคเคอเรลในซอสมะเขือเทศ', name_en: 'Canned Mackerel in Tomato Sauce', terms: ['Canned sardines tomato sauce', 'Sardinas en tomate', 'Canned mackerel'] },
  { id: 68, name_th: 'แซนวิชทูน่าสลัดโฮลวีต', name_en: 'Whole Wheat Tuna Salad Sandwich', terms: ['Tuna sandwich whole wheat', 'Tuna salad sandwich', 'Tuna sandwich'] },
  { id: 69, name_th: 'ข้าวกล้องกะเพราอกไก่กล่องแดง 7-Eleven', name_en: 'Ready Meal Basil Chicken Brown Rice', terms: ['Thai basil chicken bento', 'Bento box chicken rice', 'Ready meal pad krapow'] },
  { id: 70, name_th: 'ข้าวไรซ์เบอร์รี่อกไก่ย่างจิ้มแจ่ว 7-Eleven', name_en: 'Grilled Chicken with Jaew & Riceberry', terms: ['Grilled chicken rice bowl', 'Riceberry chicken bowl', 'Healthy meal prep chicken'] },
  { id: 71, name_th: 'สลัดผักรวมกับน้ำสลัดงาซีอิ๊วญี่ปุ่น', name_en: 'Mixed Garden Salad with Sesame Dressing', terms: ['Garden salad bowl', 'Mixed green salad', 'Fresh garden salad'] },
  { id: 72, name_th: 'เต้าหู้ปลาแท่งปิ้งพร้อมทาน', name_en: 'Grilled Fish Tofu Skewers', terms: ['Fish tofu grilled', 'Fish cake skewers', 'Grilled fish balls'] },
  { id: 73, name_th: 'ซุปข้าวบาร์เลย์ผสมเห็ดหอมพร้อมทาน', name_en: 'Mushroom & Barley Soup Cup', terms: ['Barley mushroom soup', 'Pearl barley soup', 'Mushroom soup bowl'] },
  { id: 74, name_th: 'นมโปรตีนสูง Dutch Mill High Protein ไม่เติมน้ำตาล', name_en: 'High Protein Milk Bottle', terms: ['Milk bottle high protein', 'Bottle of fresh milk', 'Skim milk bottle'] },
  { id: 75, name_th: 'นมถั่วเหลืองโทฟุซังสูตรไม่ใส่น้ำตาล', name_en: 'Plain Soy Milk Glass Bottle', terms: ['Soy milk bottle', 'Glass bottle soy milk', 'Fresh soymilk'] },
  { id: 76, name_th: 'นมถั่วเหลืองดีน่ากาบาหวานน้อย', name_en: 'Low Sugar Soy Milk Carton', terms: ['Soy milk box carton', 'Soymilk tetra pak', 'Soy milk package'] },
  { id: 77, name_th: 'มันหวานญี่ปุ่นเผาร้อน 7-Eleven', name_en: 'Roasted Japanese Sweet Potato', terms: ['Roasted sweet potato', 'Baked Japanese sweet potato', 'Yakiimo'] },
  { id: 78, name_th: 'ข้าวโพดหวานต้มสุกพร้อมแทะ', name_en: 'Steamed Sweet Corn on the Cob', terms: ['Sweet corn cob steamed', 'Boiled corn on the cob', 'Corn cob boiled'] },
  { id: 79, name_th: 'ถั่วแระญี่ปุ่นต้มแช่เย็น', name_en: 'Boiled Edamame Pods', terms: ['Edamame green soybeans', 'Boiled edamame pods', 'Edamame plate'] },
  { id: 80, name_th: 'โยเกิร์ตสูตรธรรมชาติไขมันต่ำ', name_en: 'Low-Fat Natural Plain Yogurt', terms: ['Plain yogurt bowl', 'Greek yogurt cup', 'Natural yogurt spoon'] },

  // 81-90: เมนูประหยัดทำเอง
  { id: 81, name_th: 'ไข่ต้ม 3 ฟองน้ำพริกผักสด', name_en: 'Three Boiled Eggs with Veggies', terms: ['Boiled eggs with cucumber', 'Hard boiled eggs halved', 'Boiled eggs plate'] },
  { id: 82, name_th: 'ไข่คนกระทะเทฟลอนไม่ใช้น้ำมันใส่ต้นหอม', name_en: 'Oil-Free Scrambled Eggs with Scallion', terms: ['Scrambled eggs scallion', 'Scrambled eggs plate', 'Creamy scrambled eggs'] },
  { id: 83, name_th: 'ไข่ดาวน้ำ 2 ฟองโปะข้าวสวยร้อนๆ', name_en: 'Two Poached Eggs over Warm Rice', terms: ['Poached eggs on rice', 'Two poached eggs bowl', 'Poached egg toast'] },
  { id: 84, name_th: 'ยำไข่ต้มยางมะตูมน้ำยำพริกมะนาว', name_en: 'Soft-Boiled Eggs Spicy Salad', terms: ['Yam khai tom', 'Spicy boiled egg salad', 'Soft boiled eggs chili'] },
  { id: 85, name_th: 'ยำปลากระป๋องบีบมะนาวใส่หอมแดง', name_en: 'Spicy Canned Fish Salad with Lime', terms: ['Spicy canned sardines salad', 'Yam pla krapong', 'Canned mackerel salad'] },
  { id: 86, name_th: 'อกไก่ต้มน้ำปลาฉีกจิ้มน้ำจิ้มซีฟู้ด', name_en: 'Boiled Chicken Breast with Dipping Sauce', terms: ['Boiled chicken dipping sauce', 'White cut chicken', 'Sliced boiled chicken'] },
  { id: 87, name_th: 'ปลานิลนึ่งซีอิ๊วใส่ผักกาดขาว', name_en: 'Steamed Tilapia with Soy Sauce', terms: ['Steamed tilapia soy sauce', 'Pla nin nueng si-io', 'Steamed whole fish'] },
  { id: 88, name_th: 'หมูบะช่อต้มน้ำซุปใสตำลึง', name_en: 'Minced Pork Balls Clear Broth', terms: ['Minced pork balls clear soup', 'Gaeng jued moo sap', 'Pork meatball soup'] },
  { id: 89, name_th: 'ยำอกไก่ต้มฉีกใส่ตะไคร้ใบสะระแหน่', name_en: 'Herbal Shredded Chicken Breast Salad', terms: ['Thai chicken herb salad', 'Yam gai shredded chicken', 'Spicy chicken mint'] },
  { id: 90, name_th: 'เต้าหู้ขาวคั่วเกลือพริกไทยกระทะแห้ง', name_en: 'Salt & Pepper Tofu Bites', terms: ['Salt and pepper tofu', 'Crispy tofu cubes', 'Pan fried tofu bites'] },

  // 91-100: อาหารว่างและผลไม้
  { id: 91, name_th: 'กล้วยน้ำว้าสุกธรรมชาติ 2 ลูก', name_en: 'Two Thai Namwa Bananas', terms: ['Pisang awak bananas', 'Thai namwa bananas', 'Small bananas bunch'] },
  { id: 92, name_th: 'กล้วยหอมทอง 1 ลูก', name_en: 'Cavendish Banana', terms: ['Cavendish banana from Maracaibo', 'Fresh ripe yellow banana', 'Single banana'] },
  { id: 93, name_th: 'ฝรั่งกิมจูสดหั่นชิ้น (ไม่จิ้มพริกเกลือหวาน)', name_en: 'Fresh Guava Slices', terms: ['Fresh guava sliced', 'Guava fruit slices', 'Sliced guava'] },
  { id: 94, name_th: 'มะละกอสุกหวานธรรมชาติ 1 กล่อง', name_en: 'Fresh Ripe Papaya Slices', terms: ['Ripe papaya sliced', 'Carica papaya fruit', 'Papaya slices plate'] },
  { id: 95, name_th: 'สับปะรดภูแลสดฉ่ำ 1 ถุง', name_en: 'Fresh Pineapple Slices', terms: ['Sliced fresh pineapple', 'Ananas comosus sliced', 'Pineapple chunks plate'] },
  { id: 96, name_th: 'แตงโมสดฉ่ำน้ำหั่นชิ้น', name_en: 'Chilled Watermelon Slices', terms: ['Slice of Watermelon from Wilson Farm', 'Fresh watermelon wedges', 'Watermelon slices plate'] },
  { id: 97, name_th: 'แอปเปิ้ลเขียวหรือแดง 1 ลูก', name_en: 'Fresh Crisp Apple', terms: ['Crisp green apple', 'Fresh red apple', 'Malus domestica fruit'] },
  { id: 98, name_th: 'เมล็ดฟักทองอบไม่ใส่เกลือ', name_en: 'Roasted Unsalted Pumpkin Seeds', terms: ['Roasted pumpkin seeds', 'Pumpkin seeds bowl', 'Pepitas unsalted'] },
  { id: 99, name_th: 'อัลมอนด์อบธรรมชาติซองเล็ก', name_en: 'Roasted Natural Almonds', terms: ['Roasted almonds bowl', 'Almonds nuts raw', 'Almond snack pack'] },
  { id: 100, name_th: 'น้ำเต้าหู้สดใส่ฟองเต้าหู้ไม่ใส่น้ำตาล', name_en: 'Fresh Soy Milk with Tofu Skin', terms: ['Fresh soy milk bowl', 'Hot soymilk tofu skin', 'Doujiang breakfast'] },
];

async function searchCommons(term: string): Promise<string | null> {
  const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=' + encodeURIComponent(term + ' filetype:bitmap') + '&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=500&format=json';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'LifePlanApp/1.0 (contact@lifeplan.local)' } });
    if (!res.ok) return null;
    const data = await res.json() as any;
    const pages = data.query?.pages;
    if (!pages) return null;
    for (const pid of Object.keys(pages)) {
      const page = pages[pid];
      const title = page.title || '';
      // Skip unwanted files (drawings, logos, maps, flags, diagrams, icons)
      const lower = title.toLowerCase();
      if (lower.includes('icon') || lower.includes('logo') || lower.includes('map') || lower.includes('flag') || lower.includes('diagram') || lower.includes('stub') || lower.includes('symbol')) {
        continue;
      }
      const thumb = page.imageinfo?.[0]?.thumburl;
      if (thumb && (thumb.startsWith('http://') || thumb.startsWith('https://'))) {
        return thumb;
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function searchWikipedia(term: string): Promise<string | null> {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=' + encodeURIComponent(term) + '&gsrlimit=3&prop=pageimages&pithumbsize=500&format=json';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'LifePlanApp/1.0 (contact@lifeplan.local)' } });
    if (!res.ok) return null;
    const data = await res.json() as any;
    const pages = data.query?.pages;
    if (!pages) return null;
    for (const pid of Object.keys(pages)) {
      const page = pages[pid];
      const src = page.thumbnail?.source;
      if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
        return src;
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'LifePlanApp/1.0 (contact@lifeplan.local)' } });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 3000) return false; // Too small or empty
    // Check if image format
    const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
    const isWebp = buffer.toString('utf8', 8, 12) === 'WEBP';
    if (!isJpeg && !isPng && !isWebp) return false;

    fs.writeFileSync(destPath, buffer);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const publicMealsDir = path.resolve(process.cwd(), '../frontend/public/meals');
  const distMealsDir = path.resolve(process.cwd(), '../frontend/dist/meals');
  if (!fs.existsSync(publicMealsDir)) fs.mkdirSync(publicMealsDir, { recursive: true });
  if (!fs.existsSync(distMealsDir)) fs.mkdirSync(distMealsDir, { recursive: true });

  console.log(`Starting distinct image downloader for ${MEAL_SPECS.length} meals...`);

  const seenHashes = new Set<string>();
  let successCount = 0;
  const missing: number[] = [];

  for (const spec of MEAL_SPECS) {
    let imgUrl: string | null = null;
    let foundTerm = '';

    for (const term of spec.terms) {
      imgUrl = await searchCommons(term);
      if (imgUrl) {
        foundTerm = term;
        break;
      }
    }

    if (!imgUrl) {
      for (const term of spec.terms) {
        imgUrl = await searchWikipedia(term);
        if (imgUrl) {
          foundTerm = term + ' (Wiki)';
          break;
        }
      }
    }

    if (imgUrl) {
      const tempPath = path.join(publicMealsDir, `meal_${spec.id}.jpg`);
      const downloaded = await downloadImage(imgUrl, tempPath);
      if (downloaded) {
        const fileBuf = fs.readFileSync(tempPath);
        const hash = crypto.createHash('md5').update(fileBuf).digest('hex');
        if (seenHashes.has(hash)) {
          console.warn(`[DUPLICATE HASH] Meal ${spec.id} (${spec.name_th}) hash duplicate with existing meal!`);
        } else {
          seenHashes.add(hash);
        }
        // Also copy to dist if dist exists
        if (fs.existsSync(distMealsDir)) {
          fs.copyFileSync(tempPath, path.join(distMealsDir, `meal_${spec.id}.jpg`));
        }
        successCount++;
        console.log(`[OK] Meal ${spec.id}: ${spec.name_th} <- ${foundTerm} (${fileBuf.length} bytes)`);
      } else {
        console.error(`[FAIL DOWNLOAD] Meal ${spec.id}: ${spec.name_th} (${imgUrl})`);
        missing.push(spec.id);
      }
    } else {
      console.error(`[NOT FOUND] Meal ${spec.id}: ${spec.name_th}`);
      missing.push(spec.id);
    }
  }

  console.log(`\nCompleted! Successfully downloaded ${successCount} / ${MEAL_SPECS.length} distinct meals.`);
  console.log(`Unique hashes count: ${seenHashes.size}`);
  if (missing.length > 0) {
    console.log(`Missing meal IDs:`, missing);
  }
}

main().catch(console.error);
