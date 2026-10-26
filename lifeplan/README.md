# Life Cycle

แอปจัดตารางชีวิตประจำวันและเป้าหมายสุขภาพ (Ionic React + Express/TypeScript + MySQL Docker + Gemini AI)

## โครงสร้างโปรเจกต์

```
Life_Cycle/
├─ docs/
│  ├─ ARCHITECTURE.th.md  # สรุปสถาปัตยกรรมระบบสำหรับนำเสนอ
│  └─ DECISIONS.md         # บันทึกการตัดสินใจเชิงเทคนิค
├─ lifeplan/
│  ├─ docker-compose.yml   # MySQL 8.4 (รัน db/init.sql อัตโนมัติครั้งแรก)
│  ├─ db/init.sql          # users, profiles, plans, plan_days, chat_messages
│  ├─ backend/             # Express + TS (พอร์ต 3000)
│  │  ├─ src/lib/          # energy.ts, expand.ts, schedule.ts, ai.ts, sanitize.ts
│  │  ├─ src/routes/       # auth, profile, plan, chat
│  │  └─ test/             # energy.test.ts, plan.test.ts (11 unit tests)
│  └─ frontend/            # Ionic React + Vite (พอร์ต 5173)
│     ├─ src/App.tsx       # Today, 30-Day Plan, AI Coach, Profile, Exercise Modal
│     └─ src/theme.css     # Glassmorphism design tokens (Dark Green)
```

## เริ่มต้นใช้งาน

```bash
# 1) เริ่มต้นฐานข้อมูล
cd lifeplan
docker compose up -d
docker compose ps

# 2) รัน Backend
cd backend
npm install
npm run dev                # http://localhost:3000/health

# 3) รัน Frontend (อีกเทอร์มินัล)
cd frontend
npm install
npm run dev                # http://localhost:5173
```

- ทดสอบบนเบราว์เซอร์: `http://localhost:5173`
- ทดสอบบนมือถือ (Wi-Fi วงเดียวกัน): เปิด `http://<IP เครื่อง>:5173`

## การทดสอบระบบ

- Backend Unit Tests: `npm test` ในโฟลเดอร์ `backend` (ผ่าน 11/11 รายการ)
- Backend Type Check: `npm run typecheck`
- Frontend Build: `npm run build` ในโฟลเดอร์ `frontend`
