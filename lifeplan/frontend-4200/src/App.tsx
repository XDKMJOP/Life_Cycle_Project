import { IonApp, IonContent, setupIonicReact } from '@ionic/react';
import { useEffect, useState } from 'react';
import { api, ApiError, getToken, setToken } from './lib/api';
import { ExerciseVisual } from './components/ExerciseVisual';
import { type WorkoutLocationMode, getEquipmentLabel } from './lib/exerciseModes';
import { ProgressView } from './components/ProgressView';
import { TodayView } from './components/TodayView';
import { GenderPillSelector } from './components/GenderPillSelector';

setupIonicReact();

interface ProfileData {
  user_id?: number;
  name: string;
  sex: 'male' | 'female';
  age: number;
  height_cm?: number | string;
  weight_kg?: number | string;
  heightCm?: number;
  weightKg?: number;
  activity_level?: string;
  activityLevel?: string;
  goal: 'lose_weight' | 'maintain' | 'build_muscle';
  free_time?: string;
  freeTime?: 'morning' | 'evening';
  meals_per_day?: number;
  mealsPerDay?: number;
  injuries?: string | null;
  bmr?: number;
  tdee?: number;
  target_kcal?: number;
  targetKcal?: number;
}

interface PlanDaySummary {
  id: number;
  dayNo: number;
  focus: string;
  isRest: boolean;
  totalKcal?: number;
  totalProteinG?: number;
  burnedKcal?: number;
  completedAt?: string | null;
}

interface CurrentPlanResponse {
  hasPlan: boolean;
  planId?: number;
  startDate?: string;
  days?: PlanDaySummary[];
}

interface ExerciseItem {
  exercise_id: string;
  name_th?: string;
  sets?: number | null;
  reps?: string | number | null;
  duration_min?: number | null;
  rest_sec?: number | null;
}

interface DayDetailResponse {
  id: number;
  dayNo: number;
  completedAt: string | null;
  content: {
    day_no: number;
    focus: string;
    is_rest: boolean;
    workout: ExerciseItem[];
    workout_home?: ExerciseItem[];
    workout_gym?: ExerciseItem[];
    meals: Array<{
      slot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      title: string;
      kcal: number;
      protein_g: number;
      description: string;
    }>;
    schedule: Array<{
      start: string;
      end: string;
      label: string;
      type: 'workout' | 'meal' | 'sleep' | 'free';
    }>;
    total_kcal?: number;
    total_protein_g?: number;
  };
}

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string | null;
}

function formatChatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (isToday) return `วันนี้ ${timeStr}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `เมื่อวาน ${timeStr}`;
  return `${d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ${timeStr}`;
}


const EXERCISE_GUIDES: Record<string, { muscle: string; tips: string }> = {
  Bodyweight_Squat: {
    muscle: 'ต้นขาด้านหน้าและกล้ามเนื้อสะโพก',
    tips: 'ยืนแยกเท้ากว้างเท่าหัวไหล่ เปิดปลายเท้าเล็กน้อย ย่อตัวลงเหมือนนั่งเก้าอี้โดยรักษาแนวกระดูกสันหลังให้ตรงและไม่ให้หัวเข่าเลยปลายเท้า',
  },
  Lunges: {
    muscle: 'ต้นขาด้านหน้า ก้น และการทรงตัว',
    tips: 'ก้าวขาไปข้างหน้าหนึ่งก้าว ย่อตัวลงจนเข่าทำมุม 90 องศา ลำตัวตั้งตรง เกร็งหน้าท้องเพื่อช่วยรักษาการทรงตัว',
  },
  Plank: {
    muscle: 'กล้ามเนื้อแกนกลางลำตัวและหน้าท้อง',
    tips: 'วางข้อศอกระนาบกับพื้น เกร็งกล้ามเนื้อหน้าท้องและสะโพกให้เป็นแนวเส้นตรงขนานกับพื้น อย่าให้หลังแอ่นหรือก้นโด่งเกินไป หายใจสม่ำเสมอ',
  },
  Push_Ups: {
    muscle: 'กล้ามเนื้อหน้าอก หัวไหล่ และแขนด้านหลัง',
    tips: 'วางฝ่ามือกว้างกว่าหัวไหล่เล็กน้อย ลำตัวเหยียดตรง เกร็งลำตัวขณะลดตัวลงจนหน้าอกเกือบแตะพื้น แล้วออกแรงดันตัวกลับขึ้นมา',
  },
  Dumbbell_Row: {
    muscle: 'กล้ามเนื้อปีกและหลังส่วนบน',
    tips: 'โน้มตัวไปข้างหน้าเล็กน้อย หลังตรง ดึงดัมเบลหรือยางยืดเข้าหาลำตัวโดยเน้นการบีบสะบักเข้าหากัน',
  },
  Glute_Bridge: {
    muscle: 'กล้ามเนื้อสะโพกและหลังส่วนล่าง',
    tips: 'นอนหงาย ชันเข่าขึ้นทั้งสองข้าง ออกแรงดันส้นเท้าเพื่อยกสะโพกขึ้นจนแนวลำตัวเป็นเส้นตรง ค้างไว้ 1-2 วินาทีแล้วค่อยๆ ลดลง',
  },
  Jumping_Jacks: {
    muscle: 'ระบบหัวใจและหลอดเลือด (Cardio)',
    tips: 'กระโดดแยกขากว้างพร้อมยกแขนขึ้นเหนือศีรษะ แล้วกระโดดกลับสู่ท่าเริ่มต้นอย่างนุ่มนวลเพื่อลดแรงกระแทกที่ข้อต่อ',
  },
  Brisk_Walking_Jog: {
    muscle: 'ความทนทานของกล้ามเนื้อขาและหัวใจ',
    tips: 'ก้าวเดินด้วยความเร็วสม่ำเสมอ แกว่งแขนอย่างเป็นธรรมชาติ หายใจเข้าออกลึกๆ เพื่อช่วยการเผาผลาญออกซิเจน',
  },
  Mountain_Climbers: {
    muscle: 'กล้ามเนื้อแกนกลางลำตัวและคาร์ดิโอ',
    tips: 'เริ่มจากท่าแพลงก์แขนตึง ดึงเข่าสลับเข้าหาหน้าอกอย่างต่อเนื่อง รักษาแนวสะโพกให้นิ่ง ไม่ยกสะโพกสูงเกินไป',
  },
  Side_Plank: {
    muscle: 'กล้ามเนื้อหน้าท้องด้านข้าง (Obliques)',
    tips: 'นอนตะแคง ใช้ข้อศอกข้างหนึ่งยันพื้น ยกสะโพกขึ้นจนลำตัวเป็นเส้นตรง เกร็งลำตัวค้างไว้ หายใจสม่ำเสมอ',
  },
  Bird_Dog: {
    muscle: 'การทรงตัวและกล้ามเนื้อหลังแกนกลาง',
    tips: 'ตั้งท่าคลาน ยืดแขนข้างหนึ่งไปข้างหน้าพร้อมเหยียดขาข้างตรงข้ามไปด้านหลัง ค้างไว้ 2 วินาทีแล้วสลับข้างอย่างช้าๆ',
  },
  Stretching_Flow: {
    muscle: 'ความยืดหยุ่นและการฟื้นฟูของกล้ามเนื้อทุกส่วน',
    tips: 'ยืดเหยียดกล้ามเนื้อมัดใหญ่ เช่น ต้นขา หลัง น่อง อย่างช้าๆ หายใจเข้าออกลึกๆ ไม่กระตุกหรือออกแรงฝืนจนเจ็บปวด',
  },
  // Gym Machines & Equipment Guides
  Leg_Press: {
    muscle: 'ต้นขาด้านหน้า สะโพก และต้นขาด้านหลัง',
    tips: 'นั่งหลังชิดเบาะ วางฝ่าเท้าราบกับแป้น ออกแรงถีบแป้นดันน้ำหนักขึ้น ไม่งอหรือล็อกข้อเข่าตึงจนเกินไป หายใจออกจังหวะถีบ',
  },
  Leg_Curl: {
    muscle: 'กล้ามเนื้อต้นขาด้านหลัง (Hamstrings)',
    tips: 'ปรับเบาะรองให้อยู่ระดับเหนือข้อเท้าเล็กน้อย ออกแรงพับเข่างัดเบาะเข้าหาก้น เกร็งค้างไว้ 1 วินาทีแล้วค่อยๆ ผ่อนกลับ',
  },
  Cable_Crunch: {
    muscle: 'กล้ามเนื้อหน้าท้องส่วนบนและแกนกลาง',
    tips: 'คุกเข่าจับเชือกเคเบิลระดับข้างใบหู ม้วนลำตัวดึงข้อศอกลงหาพื้น โฟกัสที่การเกร็งหน้าท้อง ไม่ใช้สะโพกโยกตัว',
  },
  Chest_Press: {
    muscle: 'กล้ามเนื้อหน้าอก หัวไหล่ด้านหน้า และหลังแขน',
    tips: 'นั่งหลังแนบชิดพนักพิง ปรับระดับมือจับให้อยู่ระดับราวนม ออกแรงดันด้ามจับไปข้างหน้าจนแขนตึงพอดี บีบอก',
  },
  Lat_Pulldown: {
    muscle: 'กล้ามเนื้อปีกและหลังส่วนบน (Lats)',
    tips: 'นั่งขัดเข่าใต้เบาะรอง มือจับบาร์กว้างกว่าหัวไหล่ ดึงบาร์ลงมาแตะระดับอกบน ดึงศอกลงด้านข้าง บีบสะบักหลัง',
  },
  Shoulder_Press: {
    muscle: 'กล้ามเนื้อหัวไหล่รอบด้านและหลังแขน',
    tips: 'นั่งหลังตรง ถือดัมเบลระดับใบหู ดันดัมเบลขึ้นตรงเหนือศีรษะ ไม่แอ่นหลัง หายใจออกขณะดันขึ้น',
  },
  Bench_Press: {
    muscle: 'กล้ามเนื้อหน้าอก แกนกลาง และแขน',
    tips: 'นอนราบบนเบาะ วางเท้าราบกับพื้น ลดบาร์ลงระดับราวนมอย่างช้าๆ แล้วดันขึ้นตรง หายใจออกจังหวะดัน',
  },
  Seated_Cable_Row: {
    muscle: 'กล้ามเนื้อหลังส่วนกลางและปีก',
    tips: 'นั่งยันเท้ากับที่พัก แขนเหยียดจับด้ามจับ หลังตรง ดึงด้ามจับเข้าหาหน้าท้อง บีบสะบักเข้าหากัน',
  },
  Treadmill: {
    muscle: 'ระบบหัวใจและหลอดเลือด กล้ามเนื้อขา',
    tips: 'ปรับความชัน 2-4% เพื่อลดแรงกระแทกที่เข่า ก้าวขาอย่างสม่ำเสมอ แกว่งแขนตามธรรมชาติ ดื่มน้ำจิบเรื่อยๆ',
  },
  Elliptical: {
    muscle: 'คาร์ดิโอแรงกระแทกต่ำ ขาและแขน',
    tips: 'ยืนบนแป้นเหยียบ จับแกนเคลื่อนที่ ก้าวเป็นวงรีอย่างต่อเนื่อง ช่วยปกป้องข้อต่อและหัวเข่าได้ดีเยี่ยม',
  },
  Cable_Woodchopper: {
    muscle: 'กล้ามเนื้อหน้าท้องด้านข้างและแกนกลาง',
    tips: 'ยืนแยกเท้ากว้างเท่าไหล่ จับมือจับเคเบิลด้านบน บิดลำตัวดึงเฉียงลงหาเอวตรงข้าม เกร็งแกนกลางตลอดการเคลื่อนไหว',
  },
  Hanging_Knee_Raise: {
    muscle: 'กล้ามเนื้อหน้าท้องส่วนล่าง',
    tips: 'ใช้ข้อศอกพยุงตัวบนเบาะพนักแขน ยกเข่าขึ้นระดับ 90 องศา ม้วนสะโพกขึ้นเล็กน้อยเพื่อกระตุ้นหน้าท้องส่วนล่าง',
  },
  Stationary_Bike: {
    muscle: 'ความทนทานของหัวใจ กล้ามเนื้อขาและข้อเท้า',
    tips: 'ปรับระดับอานให้ขาเหยียดเกือบตรงขณะบันไดปั่นอยู่จุดต่ำสุด ปั่นด้วยรอบขาคงที่ 70-80 RPM หายใจสม่ำเสมอ',
  },
};

export default function App() {
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'plan30' | 'progress' | 'coach' | 'profile' | 'auth'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regSex, setRegSex] = useState<'male' | 'female'>('male');
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Profile Form State
  const [name, setName] = useState('ผู้ใช้งาน');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [goal, setGoal] = useState<'lose_weight' | 'maintain' | 'build_muscle'>('lose_weight');
  const [freeTime, setFreeTime] = useState<'morning' | 'evening'>('evening');
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [injuries, setInjuries] = useState('');
  const [energyResult, setEnergyResult] = useState<{ bmr: number; tdee: number; targetKcal: number } | null>(null);
  const [profileMsg, setProfileMsg] = useState('');

  // Plan State
  const [planSummary, setPlanSummary] = useState<CurrentPlanResponse | null>(null);
  const [selectedDayNo, setSelectedDayNo] = useState<number>(1);
  const [dayDetail, setDayDetail] = useState<DayDetailResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Workout Location Mode State (Home vs Gym) per day
  const [modeByDay, setModeByDay] = useState<Record<number, WorkoutLocationMode>>(() => {
    try {
      const saved = localStorage.getItem('life_cycle_modes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getModeForDay = (dayNo: number): WorkoutLocationMode => {
    return modeByDay[dayNo] || 'home';
  };

  const setModeForDay = (dayNo: number, mode: WorkoutLocationMode) => {
    setModeByDay((prev) => {
      const next = { ...prev, [dayNo]: mode };
      try {
        localStorage.setItem('life_cycle_modes', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Exercise Detail Modal State
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [currentWorkoutList, setCurrentWorkoutList] = useState<ExerciseItem[]>([]);

  const handleNextExercise = () => {
    if (!selectedExercise || currentWorkoutList.length === 0) return;
    const currentIndex = currentWorkoutList.findIndex(
      (ex) => ex.exercise_id === selectedExercise.exercise_id
    );
    if (currentIndex >= 0 && currentIndex < currentWorkoutList.length - 1) {
      setSelectedExercise(currentWorkoutList[currentIndex + 1]);
    } else if (currentWorkoutList.length > 0) {
      setSelectedExercise(currentWorkoutList[0]);
    }
  };

  const handlePrevExercise = () => {
    if (!selectedExercise || currentWorkoutList.length === 0) return;
    const currentIndex = currentWorkoutList.findIndex(
      (ex) => ex.exercise_id === selectedExercise.exercise_id
    );
    if (currentIndex > 0) {
      setSelectedExercise(currentWorkoutList[currentIndex - 1]);
    } else if (currentWorkoutList.length > 0) {
      setSelectedExercise(currentWorkoutList[currentWorkoutList.length - 1]);
    }
  };

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setPlanSummary(null);
    setDayDetail(null);
    setSelectedExercise(null);
    setChatMessages([]);
    setChatSessions([]);
    setCurrentSessionId(null);
    setShowHistory(false);
    setActiveTab('auth');
    setEmail('');
    setPassword('');
  };

  const loadProfile = async () => {
    try {
      const data = await api<ProfileData>('/profile');
      if (data) {
        setName(data.name || 'ผู้ใช้งาน');
        setSex(data.sex || 'male');
        setAge(Number(data.age) || 25);
        setHeightCm(Number(data.height_cm ?? data.heightCm) || 175);
        setWeightKg(Number(data.weight_kg ?? data.weightKg) || 70);
        setGoal(data.goal || 'lose_weight');
        if (data.bmr && data.tdee && (data.target_kcal ?? data.targetKcal)) {
          setEnergyResult({
            bmr: data.bmr,
            tdee: data.tdee,
            targetKcal: data.target_kcal ?? data.targetKcal ?? 0,
          });
        }
      }
      await loadPlan();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        handleLogout();
        setAuthError('เซสชันเดิมหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        return;
      }
      setActiveTab('profile');
    }
  };

  const loadPlan = async () => {
    try {
      const res = await api<CurrentPlanResponse>('/plan/current');
      setPlanSummary(res);
      if (res.hasPlan) {
        setActiveTab('today');
        await loadDayDetail(1);
      } else {
        setActiveTab('today');
      }
    } catch {
      // no plan yet
    }
  };

  const loadDayDetail = async (dayNo: number) => {
    try {
      const res = await api<DayDetailResponse>(`/plan/days/${dayNo}`);
      setDayDetail(res);
      setSelectedDayNo(dayNo);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      await api('/plan/generate', { method: 'POST' });
      await loadPlan();
      await loadDayDetail(1);
      setActiveTab('today');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างแผน';
      alert(msg);
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleToggleComplete = async (dayNo: number) => {
    try {
      const res = await api<{ ok: boolean; completedAt: string | null }>(`/plan/days/${dayNo}/complete`, {
        method: 'PATCH',
      });
      if (dayDetail && dayDetail.dayNo === dayNo) {
        setDayDetail({ ...dayDetail, completedAt: res.completedAt });
      }
      if (planSummary?.days) {
        setPlanSummary({
          ...planSummary,
          days: planSummary.days.map((d) =>
            d.dayNo === dayNo ? { ...d, completedAt: res.completedAt } : d,
          ),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadChatSessions = async () => {
    try {
      const res = await api<{ sessions: ChatSession[] }>('/chat/sessions');
      const list = res.sessions || [];
      setChatSessions(list);
      return list;
    } catch {
      return [];
    }
  };

  const loadChatHistory = async (targetSessionId?: number | null) => {
    try {
      const query = targetSessionId ? `?sessionId=${targetSessionId}` : '';
      const res = await api<{ sessionId: number | null; messages: ChatMessage[] }>(`/chat/history${query}`);
      if (res.sessionId) {
        setCurrentSessionId(res.sessionId);
      }
      if (res.messages && res.messages.length > 0) {
        setChatMessages(res.messages);
      } else {
        setChatMessages([
          {
            role: 'assistant',
            content: `สวัสดีครับคุณ ${name} มีเรื่องอาหารหรือการฝึกอะไรให้ช่วยแนะนำ ถามได้เลยครับ`,
          },
        ]);
      }
    } catch {
      // ignore
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setShowHistory(false);
    setChatMessages([
      {
        role: 'assistant',
        content: `สวัสดีครับคุณ ${name} เริ่มต้นบทสนทนาใหม่ได้เลยครับ มีเรื่องอาหารหรือการฝึกอะไร ถามได้ทันทีครับ`,
      },
    ]);
  };

  const handleSelectSession = async (sessionId: number) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
    await loadChatHistory(sessionId);
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm('คุณต้องการลบประวัติการสนทนานี้หรือไม่?')) return;
    try {
      await api(`/chat/sessions/${sessionId}`, { method: 'DELETE' });
      const updated = await loadChatSessions();
      if (currentSessionId === sessionId) {
        if (updated.length > 0) {
          await handleSelectSession(updated[0].id);
        } else {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('คุณต้องการลบประวัติการสนทนาทั้งหมดหรือไม่? ข้อมูลจะถูกลบถาวร')) return;
    try {
      await api('/chat/history', { method: 'DELETE' });
      setChatSessions([]);
      handleNewChat();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputMsg).trim();
    if (!text || sendingChat) return;

    const userBubble: ChatMessage = { role: 'user', content: text };
    setChatMessages((prev) => [...prev, userBubble]);
    if (!customText) setInputMsg('');
    setSendingChat(true);

    try {
      const res = await api<{ reply: string; sessionId?: number }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, sessionId: currentSessionId }),
      });
      setChatMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.sessionId && res.sessionId !== currentSessionId) {
        setCurrentSessionId(res.sessionId);
      }
      await loadChatSessions();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อ AI ได้';
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `ขออภัยครับ: ${msg}` },
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  // Initialization
  useEffect(() => {
    api<{ ok: boolean }>('/health')
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false));

    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      loadProfile();
    } else {
      setIsLoggedIn(false);
      setActiveTab('auth');
    }

    const onUnauthorized = () => {
      handleLogout();
      setAuthError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (activeTab === 'coach' && isLoggedIn) {
      loadChatSessions().then((sessions) => {
        if (sessions.length > 0 && !currentSessionId) {
          handleSelectSession(sessions[0].id);
        } else if (!currentSessionId) {
          loadChatHistory();
        }
      });
    }
  }, [activeTab, isLoggedIn]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api<{ token: string; userId: number }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      setIsLoggedIn(true);
      if (authMode === 'register') {
        setSex(regSex);
        try {
          await api('/profile', {
            method: 'PUT',
            body: JSON.stringify({
              name: 'ผู้ใช้งาน',
              sex: regSex,
              age: 25,
              heightCm: 175,
              weightKg: 70,
              activityLevel: 'moderate',
              goal: 'lose_weight',
              freeTime: 'evening',
              mealsPerDay: 3,
            }),
          });
        } catch {
          // ignore initial profile error
        }
      }
      await loadProfile();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      if (msg === 'wrong email or password') {
        setAuthError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (msg === 'email already registered') {
        setAuthError('อีเมลนี้ถูกลงทะเบียนไปแล้ว กรุณาเลือกเข้าสู่ระบบ');
      } else {
        setAuthError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setProfileMsg('');
    setLoading(true);
    try {
      const res = await api<{ bmr: number; tdee: number; targetKcal: number }>('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          sex,
          age: Number(age),
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          activityLevel,
          goal,
          freeTime,
          mealsPerDay: Number(mealsPerDay),
          injuries: injuries.trim() || undefined,
        }),
      });
      setEnergyResult(res);
      setProfileMsg('บันทึกข้อมูลและคำนวณพลังงานสำเร็จ');
      if (!planSummary?.hasPlan) {
        await handleGeneratePlan();
      } else {
        setActiveTab('today');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        handleLogout();
        setAuthError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        return;
      }
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึก';
      setProfileMsg(`เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenderChangeConfirm = async (newSex: 'male' | 'female') => {
    setSex(newSex);
    setLoading(true);
    setProfileMsg('');
    try {
      const res = await api<{ bmr: number; tdee: number; targetKcal: number }>('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          sex: newSex,
          age: Number(age),
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          activityLevel,
          goal,
          freeTime,
          mealsPerDay: Number(mealsPerDay),
          injuries: injuries.trim() || undefined,
        }),
      });
      setEnergyResult(res);
      // Auto-regenerate 30-day plan with 50 exercises for the newly selected sex
      await api('/plan/generate', { method: 'POST' });
      await loadPlan();
      await loadDayDetail(1);
      setProfileMsg(`เปลี่ยนเป็นเพศ${newSex === 'male' ? 'ชาย' : 'หญิง'} และสร้างแผนท่าฝึกใหม่ 50 ท่าเรียบร้อยแล้ว`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเปลี่ยนเพศ';
      setProfileMsg(`เกิดข้อผิดพลาด: ${msg}`);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const completedDaysCount = planSummary?.days?.filter((d) => d.completedAt).length || 0;

  return (
    <IonApp>
      <IonContent>
        <div className="app-container">
          <header className="brand-header">
            <div className="brand-badge-tag">
              <span className={`status-dot ${backendOk ? 'online' : 'checking'}`} />
              <span>HEALTH & FITNESS OS</span>
            </div>
            <h1 className="brand-title">Life Cycle</h1>
            <p className="brand-subtitle">ระบบจัดตารางชีวิตและเป้าหมายสุขภาพประจำวัน</p>
          </header>

          {/* Navigation Bar - Floating Capsule Pill Style */}
          <nav className="tab-nav">
            {!isLoggedIn ? (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
                onClick={() => setActiveTab('auth')}
              >
                <span className="tab-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </span>
                <span className="tab-label">เข้าสู่ระบบ</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
                  onClick={() => setActiveTab('today')}
                  title="วันนี้"
                >
                  <span className="tab-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 20v-9.5z" />
                      <path d="M9 21v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6" />
                    </svg>
                  </span>
                  <span className="tab-label">วันนี้</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'plan30' ? 'active' : ''}`}
                  onClick={() => setActiveTab('plan30')}
                  title="แผน 30 วัน"
                >
                  <span className="tab-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </span>
                  <span className="tab-label">แผน 30 วัน</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
                  onClick={() => setActiveTab('progress')}
                  title="ความคืบหน้า"
                >
                  <span className="tab-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                      <line x1="3" y1="20" x2="21" y2="20" />
                    </svg>
                  </span>
                  <span className="tab-label">ความคืบหน้า</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'coach' ? 'active' : ''}`}
                  onClick={() => setActiveTab('coach')}
                  title="ที่ปรึกษา AI"
                >
                  <span className="tab-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                    </svg>
                  </span>
                  <span className="tab-label">ที่ปรึกษา AI</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                  title="โปรไฟล์"
                >
                  <span className="tab-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
                    </svg>
                  </span>
                  <span className="tab-label">โปรไฟล์</span>
                </button>
              </>
            )}
          </nav>

          {/* TAB: AUTH */}
          {!isLoggedIn ? (
            <div className="glass-card">
              <div className="glass-card-header">
                <span>{authMode === 'login' ? 'เข้าสู่ระบบ Life Cycle' : 'สมัครสมาชิกใหม่'}</span>
              </div>

              <form onSubmit={handleAuth}>
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-email">อีเมล</label>
                  <input
                    id="auth-email"
                    type="email"
                    className="glass-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@lifecycle.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="auth-password">รหัสผ่าน</label>
                  <input
                    id="auth-password"
                    type="password"
                    className="glass-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    required
                  />
                </div>

                {authMode === 'register' && (
                  <div className="form-group" style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                      เลือกเพศของคุณ (สำหรับกำหนดโปรแกรมออกกำลังกาย 30 วัน)
                    </label>
                    <GenderPillSelector
                      value={regSex}
                      onChange={(newSex) => setRegSex(newSex)}
                      requireConfirmation={false}
                    />
                  </div>
                )}

                {authError && <div className="danger-text">{authError}</div>}

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'กำลังดำเนินการ...' : authMode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthError('');
                    }}
                  >
                    {authMode === 'login' ? 'ยังไม่มีบัญชี? สมัครที่นี่' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
                  </button>
                </div>
              </form>
            </div>
          ) : activeTab === 'today' ? (
            /* TAB: TODAY */
            <TodayView
              dayDetail={dayDetail}
              selectedDayNo={selectedDayNo}
              planSummary={planSummary}
              energyResult={energyResult}
              loadingPlan={loadingPlan}
              onGeneratePlan={handleGeneratePlan}
              onToggleComplete={handleToggleComplete}
              onSelectExercise={(exercise, allExercises) => {
                setSelectedExercise(exercise);
                setCurrentWorkoutList(allExercises && allExercises.length > 0 ? allExercises : [exercise]);
              }}
              getModeForDay={getModeForDay}
              setModeForDay={setModeForDay}
              userName={name}
            />
          ) : activeTab === 'plan30' ? (
            /* TAB: 30-DAY PLAN */
            <div className="glass-card">
              <div className="glass-card-header">
                <span>แผนสุขภาพ 30 วัน</span>
                <span className={`status-pill ${completedDaysCount > 0 ? 'completed' : ''}`}>
                  สำเร็จ {completedDaysCount}/30 วัน
                </span>
              </div>

              <div className="info-banner">
                เลือกแตะที่แต่ละวันเพื่อดูตารางมื้ออาหาร ท่าออกกำลังกาย และช่วงเวลาของวันนั้นๆ
              </div>

              <div className="days-grid">
                {planSummary?.days?.map((d) => (
                  <div
                    key={d.dayNo}
                    className={`day-cell ${d.dayNo === selectedDayNo ? 'active-selected' : ''} ${d.completedAt ? 'completed' : ''}`}
                    onClick={() => {
                      loadDayDetail(d.dayNo);
                      setActiveTab('today');
                    }}
                  >
                    <div className="day-cell-num">{d.dayNo}</div>
                    <div className="day-cell-tag">
                      {d.isRest ? 'พัก' : 'ฝึก'}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleGeneratePlan}
                  disabled={loadingPlan}
                >
                  {loadingPlan ? 'กำลังสร้างแผนใหม่...' : 'สร้างแผน 30 วันใหม่ทั้งหมด'}
                </button>
              </div>
            </div>
          ) : activeTab === 'progress' ? (
            /* TAB: PROGRESS & DAILY CALORIE BURN GRAPH */
            <ProgressView
              days={planSummary?.days || []}
              targetDailyKcal={energyResult?.targetKcal || 2000}
              onSelectDay={(dayNo) => {
                loadDayDetail(dayNo);
                setActiveTab('today');
              }}
              onToggleComplete={(dayNo) => {
                handleToggleComplete(dayNo);
              }}
            />
          ) : activeTab === 'coach' ? (
            /* TAB: AI COACH */
            <div className="glass-card">
              <div className="glass-card-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>โค้ชที่ปรึกษาด้านสุขภาพ</span>
                  <span className="status-pill" style={{ opacity: 0.85 }}>{name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    className="chat-header-btn new-chat"
                    onClick={handleNewChat}
                    title="เริ่มการสนทนาใหม่"
                  >
                    + แชทใหม่
                  </button>
                  <button
                    type="button"
                    className={`chat-header-btn history-toggle ${showHistory ? 'active' : ''}`}
                    onClick={() => setShowHistory((prev) => !prev)}
                    title="ดูประวัติการสนทนา"
                  >
                    ประวัติ ({chatSessions.length})
                  </button>
                </div>
              </div>

              {/* Chat History Drawer / Dropdown */}
              {showHistory && (
                <div className="chat-history-panel">
                  <div className="chat-history-panel-header">
                    <span className="chat-history-heading">ประวัติการสนทนา ({chatSessions.length})</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {chatSessions.length > 0 && (
                        <button
                          type="button"
                          className="chat-mini-action-btn danger"
                          onClick={handleClearAllHistory}
                          title="ลบประวัติการสนทนาทั้งหมด"
                        >
                          ล้างทั้งหมด
                        </button>
                      )}
                      <button
                        type="button"
                        className="chat-mini-action-btn"
                        onClick={() => setShowHistory(false)}
                      >
                        ปิด
                      </button>
                    </div>
                  </div>

                  <div className="chat-sessions-list">
                    {chatSessions.length === 0 ? (
                      <div className="chat-history-empty">ยังไม่มีประวัติการสนทนา</div>
                    ) : (
                      chatSessions.map((s) => (
                        <div
                          key={s.id}
                          className={`chat-session-card ${s.id === currentSessionId ? 'selected' : ''}`}
                          onClick={() => handleSelectSession(s.id)}
                        >
                          <div className="chat-session-main">
                            <div className="chat-session-title">{s.title}</div>
                            {s.lastMessage && (
                              <div className="chat-session-preview">{s.lastMessage}</div>
                            )}
                            <div className="chat-session-time">{formatChatDate(s.updatedAt || s.createdAt)}</div>
                          </div>
                          <button
                            type="button"
                            className="chat-session-del-btn"
                            title="ลบการสนทนานี้"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(s.id);
                            }}
                          >
                            ลบ
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Current Active Session Bar */}
              <div className="chat-current-bar">
                <div className="chat-current-info">
                  <span className="chat-current-label">บทสนทนา:</span>
                  <span className="chat-current-title">
                    {currentSessionId
                      ? chatSessions.find((s) => s.id === currentSessionId)?.title || 'กำลังสนทนา'
                      : 'การสนทนาใหม่'}
                  </span>
                </div>
                {currentSessionId && (
                  <button
                    type="button"
                    className="chat-del-active-btn"
                    onClick={() => handleDeleteSession(currentSessionId)}
                    title="ลบการสนทนาปัจจุบันนี้"
                  >
                    ลบแชทนี้
                  </button>
                )}
              </div>

              {/* Quick Prompts */}
              {chatMessages.length <= 1 && (
                <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '10px', paddingBottom: '4px' }}>
                  <button
                    type="button"
                    className="status-pill"
                    style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.08)' }}
                    onClick={() => handleSendMessage('แนะนำการคุมอาหารตามเป้าหมายของผม')}
                  >
                    แนะนำการคุมอาหาร
                  </button>
                  <button
                    type="button"
                    className="status-pill"
                    style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.08)' }}
                    onClick={() => handleSendMessage('อาการเมื่อยล้ากล้ามเนื้อควรดูแลอย่างไร')}
                  >
                    การฟื้นฟูกล้ามเนื้อ
                  </button>
                  <button
                    type="button"
                    className="status-pill"
                    style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.08)' }}
                    onClick={() => handleSendMessage('ถ้าไม่มีเวลาควรปรับตารางอย่างไร')}
                  >
                    การปรับตารางเวลา
                  </button>
                </div>
              )}

              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.role}`}>
                      {msg.content}
                    </div>
                  ))}
                  {sendingChat && (
                    <div className="chat-bubble assistant" style={{ fontStyle: 'italic', opacity: 0.7 }}>
                      โค้ชกำลังพิมพ์คำแนะนำ...
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="chat-input-row"
                >
                  <input
                    type="text"
                    className="chat-input"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="สอบถามเรื่องอาหาร การฝึก หรือการฟื้นฟู..."
                  />
                  <button type="submit" className="chat-send-btn" disabled={sendingChat || !inputMsg.trim()}>
                    ส่ง
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* TAB: PROFILE */
            <div className="glass-card">
              <div className="glass-card-header">
                <span>ข้อมูลสุขภาพและไลฟ์สไตล์</span>
                <span className="status-pill">{name}</span>
              </div>

              {energyResult && (
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-num">{energyResult.bmr}</div>
                    <div className="stat-label">BMR (kcal)</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{energyResult.tdee}</div>
                    <div className="stat-label">TDEE (kcal)</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-num">{energyResult.targetKcal}</div>
                    <div className="stat-label">เป้าหมาย (kcal)</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label" htmlFor="prof-name">ชื่อเล่น</label>
                  <input
                    id="prof-name"
                    type="text"
                    className="glass-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Gender Selection Section matching Picture 1 Pill Design */}
                <div className="form-group" style={{ marginBottom: '18px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', textAlign: 'center', display: 'block', marginBottom: '8px' }}>
                    เพศสำหรับกำหนดโปรแกรมออกกำลังกาย 30 วัน
                  </label>
                  <GenderPillSelector
                    value={sex}
                    onChange={(newSex) => setSex(newSex)}
                    requireConfirmation={true}
                    onConfirmChange={handleGenderChangeConfirm}
                    disabled={loading || loadingPlan}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-age">อายุ (ปี)</label>
                    <input
                      id="prof-age"
                      type="number"
                      className="glass-input"
                      value={age}
                      min={18}
                      max={90}
                      onChange={(e) => setAge(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-height">ส่วนสูง (ซม.)</label>
                    <input
                      id="prof-height"
                      type="number"
                      className="glass-input"
                      value={heightCm}
                      min={100}
                      max={240}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-weight">น้ำหนัก (กก.)</label>
                    <input
                      id="prof-weight"
                      type="number"
                      className="glass-input"
                      value={weightKg}
                      min={30}
                      max={250}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-activity">ระดับกิจกรรมประจำวัน</label>
                  <select
                    id="prof-activity"
                    className="glass-select"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as any)}
                  >
                    <option value="sedentary">น้อยมาก (นั่งทำงานเป็นหลัก)</option>
                    <option value="light">เบา (ออกกำลังกาย 1-3 วัน/สัปดาห์)</option>
                    <option value="moderate">ปานกลาง (ออกกำลังกาย 3-5 วัน/สัปดาห์)</option>
                    <option value="active">หนัก (ออกกำลังกาย 6-7 วัน/สัปดาห์)</option>
                    <option value="very_active">หนักมาก (นักกีฬา / งานใช้แรงกาย)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-goal">เป้าหมายสุขภาพ</label>
                  <select
                    id="prof-goal"
                    className="glass-select"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                  >
                    <option value="lose_weight">ลดน้ำหนัก (-500 kcal)</option>
                    <option value="maintain">รักษาน้ำหนัก</option>
                    <option value="build_muscle">เพิ่มกล้ามเนื้อ (+300 kcal)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-freetime">เวลาว่างที่สะดวก</label>
                    <select
                      id="prof-freetime"
                      className="glass-select"
                      value={freeTime}
                      onChange={(e) => setFreeTime(e.target.value as 'morning' | 'evening')}
                    >
                      <option value="morning">ช่วงเช้า</option>
                      <option value="evening">ช่วงเย็น/ค่ำ</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-meals">จำนวนมื้อต่อวัน</label>
                    <select
                      id="prof-meals"
                      className="glass-select"
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(Number(e.target.value))}
                    >
                      <option value={2}>2 มื้อ</option>
                      <option value={3}>3 มื้อ</option>
                      <option value={4}>4 มื้อ</option>
                      <option value={5}>5 มื้อ</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prof-injuries">ข้อจำกัด / อาการบาดเจ็บ (ถ้ามี)</label>
                  <input
                    id="prof-injuries"
                    type="text"
                    className="glass-input"
                    value={injuries}
                    onChange={(e) => setInjuries(e.target.value)}
                    placeholder="เช่น เจ็บข้อเข่า หรือ เว้นว่างได้"
                  />
                </div>

                {profileMsg && (
                  <div style={{ margin: '10px 0', fontSize: '0.9rem', color: 'var(--sage)' }}>
                    {profileMsg}
                  </div>
                )}

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'กำลังบันทึก...' : 'คำนวณและบันทึกข้อมูล'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={async () => {
                      await handleSaveProfile();
                      await handleGeneratePlan();
                      setActiveTab('today');
                    }}
                    disabled={loading || loadingPlan}
                    style={{ borderColor: 'rgba(204, 255, 0, 0.4)', color: '#ccff00', fontWeight: 600 }}
                  >
                    {loadingPlan ? 'กำลังสร้างแผน 30 วันใหม่...' : `บันทึกและสร้างแผน 30 วันใหม่ (${sex === 'male' ? 'โปรแกรมชาย 50 ท่า' : 'โปรแกรมหญิง 50 ท่า'})`}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleLogout}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active Workout Modal (MOVE UI Matching User Screenshot) */}
          {selectedExercise && (
            <div className="modal-overlay" onClick={() => setSelectedExercise(null)}>
              <div className="move-workout-card" onClick={(e) => e.stopPropagation()}>
                {/* Top Header Row */}
                <div className="move-header-top">
                  <span className="move-logo-text">MOVE</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="move-badge-strength">
                      {(() => {
                        const currentIdx = currentWorkoutList.findIndex(
                          (ex) => ex.exercise_id === selectedExercise.exercise_id
                        );
                        const numStr = (currentIdx >= 0 ? currentIdx + 1 : 1).toString().padStart(2, '0');
                        const isGym = getEquipmentLabel(selectedExercise.exercise_id).includes('ยิม');
                        return `${isGym ? 'STRENGTH' : 'BODYWEIGHT'} / ${numStr}`;
                      })()}
                    </span>
                    <button
                      type="button"
                      className="move-close-btn"
                      onClick={() => setSelectedExercise(null)}
                      aria-label="Close"
                      title="ปิดหน้าต่าง"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Subtitle & Exercise Name */}
                <div className="move-title-block">
                  <div className="move-up-next">UP NEXT</div>
                  <h2 className="move-exercise-title">
                    {selectedExercise.name_th || selectedExercise.exercise_id.replace(/_/g, ' ')}
                  </h2>
                  <div className="move-exercise-th">
                    {selectedExercise.exercise_id.replace(/_/g, ' ')} • {getEquipmentLabel(selectedExercise.exercise_id)}
                  </div>
                </div>

                {/* Center Graphic: Character in Neon Lime Top, Charcoal Tights, Neon Shoes */}
                <div className="move-anim-stage">
                  <ExerciseVisual
                    exerciseId={selectedExercise.exercise_id}
                    name_en={selectedExercise.exercise_id}
                    animated={true}
                    gender={sex}
                  />
                </div>

                {/* Sets & Reps */}
                <div className="move-stats-block">
                  <div className="move-sets-number">
                    {selectedExercise.sets || 3} × {selectedExercise.reps || (selectedExercise.duration_min ? `${selectedExercise.duration_min} น.` : 12)}
                  </div>
                  <div className="move-sets-label">SETS / REPS</div>
                </div>

                {/* Next Exercise Pill Button & Sub Navigation */}
                <div>
                  <button
                    type="button"
                    className="move-next-btn"
                    onClick={handleNextExercise}
                  >
                    <span>NEXT EXERCISE</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>→</span>
                  </button>

                  <div className="move-nav-subrow">
                    <button
                      type="button"
                      className="move-prev-btn"
                      onClick={handlePrevExercise}
                    >
                      ← ท่าก่อนหน้า
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {EXERCISE_GUIDES[selectedExercise.exercise_id]?.muscle || 'กล้ามเนื้อรวม'}
                    </span>
                    <button
                      type="button"
                      className="move-prev-btn"
                      onClick={() => setSelectedExercise(null)}
                    >
                      เสร็จสิ้น
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonApp>
  );
}
