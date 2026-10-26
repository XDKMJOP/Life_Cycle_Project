import { fallbackWeekTemplate } from './fallback';
import { removeEmojis } from './sanitize';
import type { WeekPlanTemplate } from './types';
import { z } from 'zod';

const weekPlanSchema = z.object({
  days: z.array(
    z.object({
      day: z.number().int().min(1).max(7),
      is_rest: z.boolean(),
      focus: z.string().min(1),
      workout: z.array(
        z.object({
          exercise_id: z.string(),
          name_th: z.string().optional(),
          sets: z.number().nullable().optional(),
          reps: z.union([z.string(), z.number()]).nullable().optional(),
          duration_min: z.number().nullable().optional(),
          rest_sec: z.number().nullable().optional(),
        }),
      ),
      meals: z.array(
        z.object({
          slot: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
          title: z.string().min(1),
          kcal: z.number(),
          protein_g: z.number(),
          description: z.string(),
        }),
      ),
    }),
  ).min(7).max(7),
  notes: z.string().optional(),
});

export interface PlanGenerationInput {
  name: string;
  sex: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  goal: string;
  targetKcal: number;
  mealsPerDay: number;
  freeTime: 'morning' | 'evening';
  injuries?: string | null;
}

function getCandidateModels(preferred?: string): string[] {
  const list = [
    preferred,
    process.env.GEMINI_MODEL,
    'gemini-3.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.8-flash',
  ].filter(Boolean) as string[];
  return Array.from(new Set(list));
}

export function getDeterministicCoachAdvice(
  userMessage: string,
  profile: { name: string; targetKcal: number }
): string {
  const cleanMsg = userMessage.toLowerCase().trim();

  // ทักทาย
  if (
    cleanMsg === 'สวัสดี' ||
    cleanMsg === 'สวัสดีครับ' ||
    cleanMsg === 'สวัสดีค่ะ' ||
    cleanMsg === 'หวัดดี' ||
    cleanMsg === 'hi' ||
    cleanMsg === 'hello'
  ) {
    return removeEmojis(
      `สวัสดีครับคุณ ${profile.name} วันนี้มีเรื่องอาหาร การฝึก หรือการฟื้นฟูอะไรให้ช่วยแนะนำไหมครับ`
    );
  }

  // 1. อาหาร / การคุมอาหาร / โภชนาการ
  if (
    cleanMsg.includes('อาหาร') ||
    cleanMsg.includes('คุม') ||
    cleanMsg.includes('กิน') ||
    cleanMsg.includes('โภชนาการ') ||
    cleanMsg.includes('แคลอรี่')
  ) {
    return removeEmojis(
      `สำหรับเป้าหมาย ${profile.targetKcal} kcal แนะนำ 3 ข้อง่ายๆ ครับ:\n` +
      `1. เน้นโปรตีน (อกไก่ ไข่ต้ม ปลา) 1.6-1.8g ต่อน้ำหนักตัว เพื่อรักษากล้ามเนื้อ\n` +
      `2. เลือกคาร์โบไฮเดรตเชิงซ้อน เช่น ข้าวกล้อง ข้าวโอ๊ต ในมื้อหลัก\n` +
      `3. ดื่มน้ำวันละ 2-3 ลิตร และเลี่ยงของทอด น้ำหวานครับ`
    );
  }

  // 2. เมื่อยล้า / ฟื้นฟูกล้ามเนื้อ
  if (
    cleanMsg.includes('เมื่อย') ||
    cleanMsg.includes('ล้า') ||
    cleanMsg.includes('ปวด') ||
    cleanMsg.includes('กล้ามเนื้อ') ||
    cleanMsg.includes('ฟื้นฟู') ||
    cleanMsg.includes('เจ็บ') ||
    cleanMsg.includes('พัก')
  ) {
    return removeEmojis(
      `วิธีดูแลอาการเมื่อยล้ากล้ามเนื้อ:\n` +
      `1. ยืดเหยียดเบาๆ ท่าละ 20-30 วินาที ช่วยคลายความตึง\n` +
      `2. ดื่มน้ำให้เพียงพอและนอนหลับให้ถึง 7-8 ชั่วโมง\n` +
      `3. ในวันพักให้เดินเบาๆ 15 นาที เพื่อกระตุ้นการไหลเวียนเลือดครับ`
    );
  }

  // 3. เวลา / ตาราง / ไม่ว่าง
  if (
    cleanMsg.includes('เวลา') ||
    cleanMsg.includes('ตาราง') ||
    cleanMsg.includes('ไม่ว่าง') ||
    cleanMsg.includes('งาน') ||
    cleanMsg.includes('ปรับ')
  ) {
    return removeEmojis(
      `ถ้าเวลาน้อย ปรับง่ายๆ ดังนี้ครับ:\n` +
      `1. แบ่งออกกำลังกายสั้นๆ 15 นาที หรือย้ายไปทำในวันพักถัดไป\n` +
      `2. โฟกัสคุมอาหารให้อยู่ในงบ ${profile.targetKcal} kcal ก็ยังเห็นผลลัพธ์ต่อเนื่องครับ`
    );
  }

  // 4. ท่าทาง / การฝึก
  if (
    cleanMsg.includes('ออกกำลังกาย') ||
    cleanMsg.includes('ท่า') ||
    cleanMsg.includes('ฝึก') ||
    cleanMsg.includes('เวท') ||
    cleanMsg.includes('คาร์ดิโอ')
  ) {
    return removeEmojis(
      `ข้อแนะนำในการฝึก:\n` +
      `1. โฟกัสฟอร์มท่าให้ถูกต้อง แกนกลางลำตัวตรง (แตะดูภาพสาธิต 2 สเต็ปในการ์ดท่าได้)\n` +
      `2. หายใจออกตอนออกแรง หายใจเข้าตอนผ่อนแรง\n` +
      `3. วอร์มอัพ 3-5 นาทีก่อนเริ่ม และคูลดาวน์หลังฝึกเสร็จครับ`
    );
  }

  // 5. น้ำหนัก / ลดความอ้วน
  if (cleanMsg.includes('น้ำหนัก') || cleanMsg.includes('ลด') || cleanMsg.includes('อ้วน')) {
    return removeEmojis(
      `เน้นคุมแคลอรี่ให้ใกล้เคียงเป้าหมาย ${profile.targetKcal} kcal ร่วมกับขยับร่างกายสม่ำเสมอ แนะนำชั่งน้ำหนักสัปดาห์ละ 1 ครั้งหลังตื่นนอนเพื่อติดตามผลครับ`
    );
  }

  return removeEmojis(
    `สวัสดีครับคุณ ${profile.name} ปรึกษาเรื่องอาหาร การฝึก หรือการฟื้นฟูได้เลยครับ ถามมาได้สั้นๆ เลยครับ`
  );
}

export async function generateWeekTemplate(input: PlanGenerationInput): Promise<{
  template: WeekPlanTemplate;
  usedFallback: boolean;
}> {
  const isMock = process.env.AI_MOCK === 'true' || !process.env.GEMINI_API_KEY;

  if (isMock) {
    return { template: fallbackWeekTemplate, usedFallback: false };
  }

  const prompt = `คุณคือผู้เชี่ยวชาญด้านสุขภาพสำหรับแอปพลิเคชัน Life Cycle
ข้อมูลผู้ใช้:
- ชื่อ: ${input.name}
- เพศ: ${input.sex === 'male' ? 'ชาย' : 'หญิง'}
- อายุ: ${input.age} ปี
- ส่วนสูง: ${input.heightCm} ซม., น้ำหนัก: ${input.weightKg} กก.
- เป้าหมาย: ${input.goal}
- แคลอรี่เป้าหมายต่อวัน: ${input.targetKcal} kcal
- จำนวนมื้อต่อวัน: ${input.mealsPerDay} มื้อ
- ข้อจำกัด/อาการบาดเจ็บ: ${input.injuries || 'ไม่มี'}

กฎสำคัญที่ต้องปฏิบัติตามอย่างเคร่งครัด:
1. ห้ามใช้ emoji หรือสัญลักษณ์รูปภาพใดๆ ทั้งสิ้นในข้อความ
2. สร้างแผน 7 วัน (days: 1 ถึง 7)
3. มีวันพัก (is_rest: true) อย่างน้อย 1-2 วัน
4. อาหารต้องเป็นอาหารไทยทั่วไปที่หาทานง่าย ราคาประหยัด (20-60 บาท) เช่น อาหารตามสั่ง ข้าวแกง ก๋วยเตี๋ยว เซเว่น หรือเมนูทำเองง่ายๆ ห้ามแนะนำอาหารหรูหราราคาแพง และแคลอรี่รวมแต่ละวันใกล้เคียงเป้าหมาย ${input.targetKcal} kcal
5. ตอบกลับเป็น JSON โครงสร้างตาม schema เท่านั้น โดยไม่มี markdown formatting หรือ backticks
`;

  const models = getCandidateModels(process.env.GEMINI_MODEL_PLAN);

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const sanitizedText = removeEmojis(rawText);
        const parsedJson = JSON.parse(sanitizedText);
        const validated = weekPlanSchema.parse(parsedJson);

        return { template: validated, usedFallback: false };
      } catch (err: any) {
        console.warn(`Model ${model} plan generation failed:`, err?.message || err);
      }
    }
  } catch (err) {
    console.warn('Gemini client initialization failed:', err);
  }

  console.warn('All Gemini models failed or timed out for plan generation, using fallback template');
  return { template: fallbackWeekTemplate, usedFallback: true };
}

export async function askAiCoach(
  userMessage: string,
  profile: {
    name: string;
    goal: string;
    targetKcal: number;
    weightKg: number;
    injuries?: string | null;
  },
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
): Promise<string> {
  const isMock = process.env.AI_MOCK === 'true' || !process.env.GEMINI_API_KEY;

  if (isMock) {
    return getDeterministicCoachAdvice(userMessage, profile);
  }

  const systemInstruction = `คุณคือโค้ชที่ปรึกษาด้านสุขภาพและโภชนาการประจำแอป Life Cycle
ข้อมูลผู้ใช้:
- ชื่อ: ${profile.name}
- เป้าหมาย: ${profile.goal}
- น้ำหนัก: ${profile.weightKg} กก.
- แคลอรี่เป้าหมาย: ${profile.targetKcal} kcal/วัน
- ข้อจำกัดสุขภาพ: ${profile.injuries || 'ไม่มี'}

สไตล์การตอบ (ต้องปฏิบัติตามอย่างเคร่งครัด):
1. ตอบแบบ "รวบรัด ตรงประเด็น กระชับ อ่านจบได้ในไม่กี่วินาที" ความยาวรวมไม่เกิน 2-4 บรรทัด (หรือแบ่งเป็นข้อย่อยสั้นๆ ไม่เกิน 3 ข้อ ข้อละ 1 บรรทัด) ห้ามตอบยาวเป็นเรียงความเด็ดขาด
2. หากผู้ใช้แค่ทักทาย (เช่น "สวัสดี", "hi", "หวัดดี") ให้ทักทายกลับสั้นๆ เพียง 1 ประโยค เช่น "สวัสดีครับคุณ ${profile.name} วันนี้มีเรื่องอาหารหรือการฝึกอะไรให้ช่วยแนะนำไหมครับ" (ห้ามเกริ่นยาว ห้ามทวนตัวเลขน้ำหนักหรือแคลอรี่ซ้ำซากถ้าผู้ใช้ไม่ได้ถาม)
3. เข้าประเด็นคำตอบทันที ไม่ต้องมีคำนำเยิ่นเย้อ เน้นคำแนะนำที่นำไปทำตามได้ทันที
4. ห้ามใช้ emoji หรือสัญลักษณ์รูปภาพใดๆ โดยเด็ดขาด
5. ตอบเป็นภาษาไทยสุภาพ เป็นกันเอง หากมีอาการบาดเจ็บรุนแรงให้แนะนำพบแพทย์
`;

  // Limit context history to 8 recent messages
  const recentHistory = history.slice(-8);
  const contents = [
    ...recentHistory.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: removeEmojis(m.content) }],
    })),
    {
      role: 'user',
      parts: [{ text: removeEmojis(userMessage) }],
    },
  ];

  const models = getCandidateModels(process.env.GEMINI_MODEL_CHAT);

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            maxOutputTokens: 600,
          },
        });

        if (response.text) {
          return removeEmojis(response.text.trim());
        }
      } catch (err: any) {
        console.warn(`Model ${model} chat failed:`, err?.message || err);
      }
    }
  } catch (err) {
    console.error('Gemini chat initialization error:', err);
  }

  // Graceful fallback to deterministic expert advice so user never gets broken experience
  return getDeterministicCoachAdvice(userMessage, profile);
}
