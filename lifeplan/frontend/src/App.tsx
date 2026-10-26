import { IonApp, IonContent, setupIonicReact } from '@ionic/react';
import { useEffect, useState } from 'react';
import { api, ApiError, getToken, setToken } from './lib/api';
import { ExerciseVisual } from './components/ExerciseVisual';
import { type WorkoutLocationMode, getEquipmentLabel } from './lib/exerciseModes';
import { ProgressView } from './components/ProgressView';
import { TodayView } from './components/TodayView';
import { GenderPillSelector } from './components/GenderPillSelector';
import type { RoutineData } from './components/RoutineScheduleModal';

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
  routine_type?: 'work' | 'study' | 'shift' | 'freelance' | 'flexible';
  routineType?: 'work' | 'study' | 'shift' | 'freelance' | 'flexible';
  wake_time?: string;
  wakeTime?: string;
  bed_time?: string;
  bedTime?: string;
  work_start?: string;
  workStart?: string;
  work_end?: string;
  workEnd?: string;
  workout_time?: string;
  workoutTime?: string;
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
      type: 'workout' | 'meal' | 'sleep' | 'free' | 'work' | 'study';
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
    muscle: 'ต้นขาด้านหน้าและสะโพก',
    tips: 'ย่อตัวลงเหมือนนั่งเก้าอี้ หลังตรง เข่าไม่เลยปลายเท้า',
  },
  Lunges: {
    muscle: 'ต้นขาด้านหน้าและก้น',
    tips: 'ก้าวขาไปข้างหน้า ย่อเข่า 90 องศา ลำตัวตั้งตรง',
  },
  Plank: {
    muscle: 'แกนกลางลำตัวและหน้าท้อง',
    tips: 'เกร็งหน้าท้องและสะโพกให้ขนานพื้น อย่าให้หลังแอ่น',
  },
  Push_Ups: {
    muscle: 'หน้าอก หัวไหล่ และหลังแขน',
    tips: 'เกร็งลำตัวตรง ลดอกลงเกือบแตะพื้นแล้วดันขึ้น',
  },
  Dumbbell_Row: {
    muscle: 'กล้ามเนื้อปีกและหลังส่วนบน',
    tips: 'โน้มตัวไปข้างหน้า ดึงน้ำหนักเข้าหาเอว บีบสะบัก',
  },
  Glute_Bridge: {
    muscle: 'สะโพกและหลังส่วนล่าง',
    tips: 'นอนหงาย ชันเข่า ดันส้นเท้ายกสะโพกขึ้นจนลำตัวตรง',
  },
  Jumping_Jacks: {
    muscle: 'ระบบหัวใจและหลอดเลือด (Cardio)',
    tips: 'กระโดดแยกขากว้างพร้อมยกแขนขึ้น ลงน้ำหนักนุ่มนวล',
  },
  Brisk_Walking_Jog: {
    muscle: 'ความทนทานของขาและหัวใจ',
    tips: 'ก้าวเท้าสม่ำเสมอ แกว่งแขนธรรมชาติ หายใจลึกๆ',
  },
  Mountain_Climbers: {
    muscle: 'แกนกลางลำตัวและคาร์ดิโอ',
    tips: 'เริ่มจากท่าแพลงก์ ดึงเข่าสลับเข้าหาอกอย่างต่อเนื่อง',
  },
  Side_Plank: {
    muscle: 'หน้าท้องด้านข้าง (Obliques)',
    tips: 'นอนตะแคง ยันศอกยกสะโพกขึ้น ลำตัวเป็นเส้นตรง',
  },
  Bird_Dog: {
    muscle: 'การทรงตัวและหลังแกนกลาง',
    tips: 'ท่าคลาน ยืดแขนและขาตรงข้ามพร้อมกัน สลับข้างช้าๆ',
  },
  Stretching_Flow: {
    muscle: 'ความยืดหยุ่นและการฟื้นฟู',
    tips: 'ยืดเหยียดกล้ามเนื้อช้าๆ หายใจเข้าออกลึกๆ ไม่ฝืนจนเจ็บ',
  },
  // Gym Machines & Equipment Guides
  Leg_Press: {
    muscle: 'ต้นขาด้านหน้าและสะโพก',
    tips: 'วางเท้าราบกับแป้น ถีบดันน้ำหนักขึ้น ไม่งอหรือล็อกเข่า',
  },
  Leg_Curl: {
    muscle: 'ต้นขาด้านหลัง (Hamstrings)',
    tips: 'พับเข่างัดเบาะเข้าหาก้น เกร็งค้าง 1 วิ แล้วค่อยๆ ผ่อน',
  },
  Cable_Crunch: {
    muscle: 'หน้าท้องส่วนบนและแกนกลาง',
    tips: 'คุกเข่าดึงสายเคเบิล ม้วนลำตัวลง โฟกัสเกร็งหน้าท้อง',
  },
  Chest_Press: {
    muscle: 'หน้าอก หัวไหล่ และหลังแขน',
    tips: 'นั่งหลังชิดเบาะ ดันด้ามจับไปข้างหน้า บีบกล้ามเนื้ออก',
  },
  Lat_Pulldown: {
    muscle: 'กล้ามเนื้อปีกและหลัง (Lats)',
    tips: 'ดึงบาร์ลงแตะระดับอกบน ดึงศอกลงด้านข้าง บีบสะบัก',
  },
  Shoulder_Press: {
    muscle: 'หัวไหล่รอบด้านและหลังแขน',
    tips: 'นั่งหลังตรง ดันดัมเบลขึ้นตรงเหนือศีรษะ ไม่แอ่นหลัง',
  },
  Bench_Press: {
    muscle: 'กล้ามเนื้อหน้าอกและแขน',
    tips: 'นอนราบบนเบาะ ลดบาร์ลงระดับราวนม แล้วดันขึ้นตรง',
  },
  Seated_Cable_Row: {
    muscle: 'หลังส่วนกลางและปีก',
    tips: 'นั่งหลังตรง ดึงด้ามจับเข้าหาหน้าท้อง บีบสะบักเข้าหากัน',
  },
  Treadmill: {
    muscle: 'ระบบหัวใจและกล้ามเนื้อขา',
    tips: 'ปรับความชัน 2-4% ก้าวขาสม่ำเสมอ แกว่งแขนเป็นจังหวะ',
  },
  Elliptical: {
    muscle: 'คาร์ดิโอแรงกระแทกต่ำ ขาและแขน',
    tips: 'ก้าวเป็นวงรีต่อเนื่อง ช่วยเซฟข้อต่อและหัวเข่าได้ดี',
  },
  Cable_Woodchopper: {
    muscle: 'หน้าท้องด้านข้างและแกนกลาง',
    tips: 'จับสายเคเบิล บิดลำตัวเฉียงลงหาเอว เกร็งแกนกลาง',
  },
  Hanging_Knee_Raise: {
    muscle: 'กล้ามเนื้อหน้าท้องส่วนล่าง',
    tips: 'พยุงตัวยกเข่าขึ้น 90 องศา ม้วนสะโพก โฟกัสหน้าท้องล่าง',
  },
  Stationary_Bike: {
    muscle: 'ความทนทานของขาและหัวใจ',
    tips: 'ปรับเบาะให้ขาเหยียดพอดี ปั่นรอบขาคงที่ 70-80 RPM',
  },
};

function getSavedNavigation(): { tab: 'today' | 'plan30' | 'progress' | 'coach' | 'profile'; dayNo: number } {
  const validTabs: Array<'today' | 'plan30' | 'progress' | 'coach' | 'profile'> = [
    'today',
    'plan30',
    'progress',
    'coach',
    'profile',
  ];

  let tabFromHash: any = null;
  let dayFromHash: number | null = null;

  try {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash) {
      const [path, queryString] = hash.split('?');
      if (validTabs.includes(path as any)) {
        tabFromHash = path;
      }
      if (queryString) {
        const params = new URLSearchParams(queryString);
        const d = parseInt(params.get('day') || '', 10);
        if (!isNaN(d) && d >= 1 && d <= 30) {
          dayFromHash = d;
        }
      }
    }
  } catch {}

  let savedTab = tabFromHash;
  if (!savedTab) {
    try {
      const lsTab = localStorage.getItem('life_cycle_active_tab');
      if (lsTab && validTabs.includes(lsTab as any)) {
        savedTab = lsTab;
      }
    } catch {}
  }

  let savedDay = dayFromHash;
  if (!savedDay) {
    try {
      const lsDay = localStorage.getItem('life_cycle_selected_day');
      const d = parseInt(lsDay || '', 10);
      if (!isNaN(d) && d >= 1 && d <= 30) {
        savedDay = d;
      }
    } catch {}
  }

  return {
    tab: savedTab || 'today',
    dayNo: savedDay || 1,
  };
}

export default function App() {
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'plan30' | 'progress' | 'coach' | 'profile' | 'auth'>(() => {
    return getToken() ? getSavedNavigation().tab : 'auth';
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regSex, setRegSex] = useState<'male' | 'female'>('male');
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());

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

  // Active Profile Routine State
  const [routineType, setRoutineType] = useState<'work' | 'study' | 'shift' | 'freelance' | 'flexible'>('work');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('18:00');

  // Register Questionnaire Routine & Health State
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState(21);
  const [regHeightCm, setRegHeightCm] = useState(175);
  const [regWeightKg, setRegWeightKg] = useState(85);
  const [regActivityLevel, setRegActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');
  const [regGoal, setRegGoal] = useState<'lose_weight' | 'maintain' | 'build_muscle'>('lose_weight');
  const [regMealsPerDay, setRegMealsPerDay] = useState(3);
  const [regInjuries, setRegInjuries] = useState('');
  const [regRoutineType, setRegRoutineType] = useState<'work' | 'study' | 'shift' | 'freelance' | 'flexible'>('work');
  const [regWakeTime, setRegWakeTime] = useState('07:00');
  const [regBedTime, setRegBedTime] = useState('23:00');
  const [regWorkStart, setRegWorkStart] = useState('09:00');
  const [regWorkEnd, setRegWorkEnd] = useState('18:00');
  const [regFreeTime, setRegFreeTime] = useState<'morning' | 'evening'>('evening');

  // Plan State
  const [planSummary, setPlanSummary] = useState<CurrentPlanResponse | null>(null);
  const [selectedDayNo, setSelectedDayNo] = useState<number>(() => getSavedNavigation().dayNo);
  const [dayDetail, setDayDetail] = useState<DayDetailResponse | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const navigateToTab = (
    tab: 'today' | 'plan30' | 'progress' | 'coach' | 'profile' | 'auth',
    dayNo?: number,
    replace = false
  ) => {
    setActiveTab(tab);
    if (tab !== 'auth') {
      const targetDay = dayNo ?? selectedDayNo;
      if (dayNo !== undefined && dayNo !== selectedDayNo) {
        setSelectedDayNo(targetDay);
      }
      try {
        localStorage.setItem('life_cycle_active_tab', tab);
        localStorage.setItem('life_cycle_selected_day', targetDay.toString());
        const hash = tab === 'today' ? `#today?day=${targetDay}` : `#${tab}`;
        if (window.location.hash !== hash) {
          if (replace) {
            window.history.replaceState(null, '', hash);
          } else {
            window.location.hash = hash;
          }
        }
      } catch {}
    }
  };


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

  // Global Escape Hotkey to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedExercise(null);
        setShowHistory(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    try {
      localStorage.removeItem('life_cycle_active_tab');
      localStorage.removeItem('life_cycle_selected_day');
      window.history.replaceState(null, '', '#auth');
    } catch {}
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
        if (data.routine_type || data.routineType) {
          setRoutineType((data.routine_type || data.routineType) as any);
        }
        if (data.wake_time || data.wakeTime) {
          setWakeTime(data.wake_time || data.wakeTime || '07:00');
        }
        if (data.bed_time || data.bedTime) {
          setBedTime(data.bed_time || data.bedTime || '23:00');
        }
        if (data.work_start || data.workStart) {
          setWorkStart(data.work_start || data.workStart || '09:00');
        }
        if (data.work_end || data.workEnd) {
          setWorkEnd(data.work_end || data.workEnd || '18:00');
        }
        if (data.free_time || data.freeTime) {
          setFreeTime((data.free_time || data.freeTime || 'evening') as any);
        }
      }
      await loadPlan();
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        handleLogout();
        setAuthError('เซสชันเดิมหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        return;
      }
      navigateToTab('profile');
    }
  };

  const loadPlan = async (targetDayNo?: number, targetTab?: 'today' | 'plan30' | 'progress' | 'coach' | 'profile') => {
    try {
      const res = await api<CurrentPlanResponse>('/plan/current');
      setPlanSummary(res);
      const nav = getSavedNavigation();
      const tabToSet = targetTab || nav.tab;
      const dayToLoad = targetDayNo || nav.dayNo;

      if (res.hasPlan) {
        navigateToTab(tabToSet, dayToLoad, true);
        await loadDayDetail(dayToLoad);
      } else {
        navigateToTab('today', 1, true);
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
      try {
        localStorage.setItem('life_cycle_selected_day', dayNo.toString());
        if (window.location.hash.startsWith('#today') || !window.location.hash) {
          window.history.replaceState(null, '', `#today?day=${dayNo}`);
        }
      } catch {}
    } catch (err) {
      console.error(err);
    }
  };

  // Synchronize browser history and hash navigation (Back / Forward / direct URL)
  useEffect(() => {
    const handleHashChange = () => {
      if (!getToken()) return;
      const nav = getSavedNavigation();
      setActiveTab(nav.tab);
      try {
        localStorage.setItem('life_cycle_active_tab', nav.tab);
        localStorage.setItem('life_cycle_selected_day', nav.dayNo.toString());
      } catch {}
      if (nav.dayNo !== selectedDayNo) {
        setSelectedDayNo(nav.dayNo);
        loadDayDetail(nav.dayNo);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedDayNo]);

  const handleGeneratePlan = async () => {
    setLoadingPlan(true);
    try {
      await api('/plan/generate', { method: 'POST' });
      await loadPlan(1, 'today');
      navigateToTab('today', 1);
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

  const handleShuffleMeals = async (dayNo: number, slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      const res = await api<{ ok: boolean; dayNo: number; content: DayDetailResponse['content'] }>(
        `/plan/days/${dayNo}/shuffle-meals`,
        {
          method: 'POST',
          body: JSON.stringify({ slot }),
        }
      );
      if (res && res.content) {
        setDayDetail((prev) => (prev ? { ...prev, content: res.content } : prev));
        if (planSummary?.days) {
          setPlanSummary({
            ...planSummary,
            days: planSummary.days.map((d) =>
              d.dayNo === dayNo
                ? {
                    ...d,
                    totalKcal: res.content.total_kcal,
                    totalProteinG: res.content.total_protein_g,
                  }
                : d
            ),
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสุ่มเมนูอาหาร';
      alert(msg);
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
        const finalName = regName.trim() || 'ผู้ใช้งาน';
        setSex(regSex);
        setName(finalName);
        setAge(regAge);
        setHeightCm(regHeightCm);
        setWeightKg(regWeightKg);
        setActivityLevel(regActivityLevel);
        setGoal(regGoal);
        setFreeTime(regFreeTime);
        setMealsPerDay(regMealsPerDay);
        setInjuries(regInjuries);
        setRoutineType(regRoutineType);
        setWakeTime(regWakeTime);
        setBedTime(regBedTime);
        setWorkStart(regWorkStart);
        setWorkEnd(regWorkEnd);

        try {
          await api('/profile', {
            method: 'PUT',
            body: JSON.stringify({
              name: finalName,
              sex: regSex,
              age: regAge,
              heightCm: regHeightCm,
              weightKg: regWeightKg,
              activityLevel: regActivityLevel,
              goal: regGoal,
              freeTime: regFreeTime,
              mealsPerDay: regMealsPerDay,
              injuries: regInjuries.trim() || null,
              routineType: regRoutineType,
              wakeTime: regWakeTime,
              bedTime: regBedTime,
              workStart: regWorkStart,
              workEnd: regWorkEnd,
              workoutTime: regFreeTime === 'morning' ? '07:30' : '18:30',
            }),
          });
          // Auto-generate 30-day plan tailored to user's exact meals and profile
          await api('/plan/generate', {
            method: 'POST',
          });
        } catch (setupErr) {
          console.warn('Initial profile or plan setup warning:', setupErr);
        }
      }
      await loadProfile();
      await loadPlan();
      navigateToTab('today');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
      if (msg === 'wrong email or password') {
        setAuthError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (msg === 'email already registered') {
        setAuthError('อีเมลนี้ถูกลงทะเบียนไปแล้ว กรุณาเลือกเข้าสู่ระบบ');
      } else if (msg === 'Failed to fetch' || msg.includes('Failed to fetch')) {
        setAuthError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์เปิดอยู่หรือตรวจสอบอินเทอร์เน็ต');
      } else {
        setAuthError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoutine = async (newRoutine: RoutineData) => {
    try {
      setRoutineType(newRoutine.routineType);
      setWakeTime(newRoutine.wakeTime);
      setBedTime(newRoutine.bedTime);
      setWorkStart(newRoutine.workStart);
      setWorkEnd(newRoutine.workEnd);
      setFreeTime(newRoutine.freeTime);

      await api('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          sex,
          age: Number(age),
          heightCm: Number(heightCm),
          weightKg: Number(weightKg),
          activityLevel,
          goal,
          mealsPerDay: Number(mealsPerDay),
          injuries: injuries.trim() || undefined,
          routineType: newRoutine.routineType,
          wakeTime: newRoutine.wakeTime,
          bedTime: newRoutine.bedTime,
          workStart: newRoutine.workStart,
          workEnd: newRoutine.workEnd,
          freeTime: newRoutine.freeTime,
          workoutTime: newRoutine.workoutTime,
        }),
      });

      if (selectedDayNo) {
        await loadDayDetail(selectedDayNo);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปรับเวลาชีวิต';
      alert(msg);
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
          routineType,
          wakeTime,
          bedTime,
          workStart,
          workEnd,
          workoutTime: freeTime === 'morning' ? '07:30' : '18:30',
        }),
      });
      setEnergyResult(res);
      setProfileMsg('บันทึกข้อมูลและคำนวณพลังงานสำเร็จ');
      if (!planSummary?.hasPlan) {
        await handleGeneratePlan();
      } else {
        navigateToTab('today');
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
          routineType,
          wakeTime,
          bedTime,
          workStart,
          workEnd,
          workoutTime: freeTime === 'morning' ? '07:30' : '18:30',
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
            <h1 className="brand-title">Life Cycle</h1>
            <p className="brand-subtitle">สุขภาพและฟิตเนสประจำวัน</p>
            {backendOk === false && (
              <div style={{ marginTop: '8px' }}>
                <span className="status-pill" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                  เชื่อมต่อเซิร์ฟเวอร์ไม่ได้
                </span>
              </div>
            )}
          </header>

          {/* Navigation Bar - Floating Capsule Pill Style */}
          <nav className="tab-nav">
            {!isLoggedIn ? (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
                onClick={() => navigateToTab('auth')}
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
                  onClick={() => navigateToTab('today')}
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
                  onClick={() => navigateToTab('plan30')}
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
                  onClick={() => navigateToTab('progress')}
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
                  onClick={() => navigateToTab('coach')}
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
                  onClick={() => navigateToTab('profile')}
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
                  <>
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

                    {/* Health Profile Questionnaire for Register */}
                    <div className="routine-onboarding-box" style={{ marginBottom: '16px' }}>
                      <div className="routine-onboarding-title">
                        ข้อมูลสุขภาพ & เป้าหมายของคุณ
                      </div>
                      <div className="routine-onboarding-sub">
                        กรอกข้อมูลร่างกายของคุณ เพื่อให้ระบบคำนวณแคลอรี่และจัดสรรอาหารตามจำนวนมื้อที่คุณเลือกโดยเฉพาะ
                      </div>

                      <div className="form-group" style={{ marginTop: '12px' }}>
                        <label className="form-label" htmlFor="reg-name">ชื่อของคุณ (หรือชื่อเล่น)</label>
                        <input
                          id="reg-name"
                          type="text"
                          className="glass-input"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="เช่น ภูมิ หรือ เว้นว่างได้"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="reg-age">อายุ (ปี)</label>
                        <input
                          id="reg-age"
                          type="number"
                          className="glass-input"
                          value={regAge}
                          min={12}
                          max={99}
                          onChange={(e) => setRegAge(Number(e.target.value))}
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="reg-height">ส่วนสูง (ซม.)</label>
                          <input
                            id="reg-height"
                            type="number"
                            className="glass-input"
                            value={regHeightCm}
                            min={100}
                            max={240}
                            onChange={(e) => setRegHeightCm(Number(e.target.value))}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="reg-weight">น้ำหนัก (กก.)</label>
                          <input
                            id="reg-weight"
                            type="number"
                            className="glass-input"
                            value={regWeightKg}
                            min={30}
                            max={250}
                            onChange={(e) => setRegWeightKg(Number(e.target.value))}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="reg-activity">ระดับกิจกรรมประจำวัน</label>
                        <select
                          id="reg-activity"
                          className="glass-select"
                          value={regActivityLevel}
                          onChange={(e) => setRegActivityLevel(e.target.value as any)}
                        >
                          <option value="sedentary">น้อยมาก (นั่งทำงานเป็นหลัก)</option>
                          <option value="light">เบา (ออกกำลังกาย 1-3 วัน/สัปดาห์)</option>
                          <option value="moderate">ปานกลาง (ออกกำลังกาย 3-5 วัน/สัปดาห์)</option>
                          <option value="active">หนัก (ออกกำลังกาย 6-7 วัน/สัปดาห์)</option>
                          <option value="very_active">หนักมาก (นักกีฬา / งานใช้แรงกาย)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="reg-goal">เป้าหมายสุขภาพ</label>
                        <select
                          id="reg-goal"
                          className="glass-select"
                          value={regGoal}
                          onChange={(e) => setRegGoal(e.target.value as any)}
                        >
                          <option value="lose_weight">ลดน้ำหนัก (-500 kcal)</option>
                          <option value="maintain">รักษาน้ำหนัก</option>
                          <option value="build_muscle">เพิ่มกล้ามเนื้อ (+300 kcal)</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="reg-freetime">เวลาว่างที่สะดวก</label>
                          <select
                            id="reg-freetime"
                            className="glass-select"
                            value={regFreeTime}
                            onChange={(e) => setRegFreeTime(e.target.value as 'morning' | 'evening')}
                          >
                            <option value="morning">ช่วงเช้า</option>
                            <option value="evening">ช่วงเย็น/ค่ำ</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" htmlFor="reg-meals">จำนวนมื้อต่อวัน</label>
                          <select
                            id="reg-meals"
                            className="glass-select"
                            value={regMealsPerDay}
                            onChange={(e) => setRegMealsPerDay(Number(e.target.value))}
                          >
                            <option value={2}>2 มื้อ</option>
                            <option value={3}>3 มื้อ</option>
                            <option value={4}>4 มื้อ</option>
                            <option value={5}>5 มื้อ</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="reg-injuries">ข้อจำกัด / อาการบาดเจ็บ (ถ้ามี)</label>
                        <input
                          id="reg-injuries"
                          type="text"
                          className="glass-input"
                          value={regInjuries}
                          onChange={(e) => setRegInjuries(e.target.value)}
                          placeholder="เช่น เจ็บข้อเข่า หรือ เว้นว่างได้"
                        />
                      </div>
                    </div>

                    {/* Routine Schedule Questionnaire for Register */}
                    <div className="routine-onboarding-box">
                      <div className="routine-onboarding-title">
                        จัดสรรเวลาชีวิต & ตารางประจำวัน
                      </div>
                      <div className="routine-onboarding-sub">
                        ระบุเวลาทำงาน เรียน และเวลาว่าง เพื่อให้ระบบจัดสรรเวลาอาหารและออกกำลังกายที่เหมาะกับคุณโดยเฉพาะ
                      </div>

                      {/* 1. Main Routine Type */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontWeight: 600 }}>
                          รูปแบบกิจวัตรประจำวันหลัก
                        </label>
                        <div className="routine-pill-group">
                          {[
                            { key: 'work', label: 'ทำงานประจำ' },
                            { key: 'study', label: 'เรียน / นักศึกษา' },
                            { key: 'shift', label: 'ทำงานกะ' },
                            { key: 'freelance', label: 'ฟรีแลนซ์' },
                            { key: 'flexible', label: 'เวลาอิสระ' },
                          ].map((item) => (
                            <button
                              key={item.key}
                              type="button"
                              className={`routine-pill-btn ${regRoutineType === item.key ? 'active' : ''}`}
                              onClick={() => {
                                setRegRoutineType(item.key as any);
                                if (item.key === 'study') {
                                  setRegWorkStart('08:30');
                                  setRegWorkEnd('16:00');
                                } else if (item.key === 'work') {
                                  setRegWorkStart('09:00');
                                  setRegWorkEnd('18:00');
                                } else if (item.key === 'freelance') {
                                  setRegWorkStart('10:00');
                                  setRegWorkEnd('18:00');
                                }
                              }}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. Work / Study Hours */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                        <div className="form-group">
                          <label className="form-label">
                            {regRoutineType === 'study' ? 'เวลาเริ่มเรียน' : 'เวลาเริ่มงาน'}
                          </label>
                          <input
                            type="time"
                            className="glass-input time-picker-input"
                            value={regWorkStart}
                            onChange={(e) => setRegWorkStart(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">
                            {regRoutineType === 'study' ? 'เวลาเลิกเรียน' : 'เวลาเลิกงาน'}
                          </label>
                          <input
                            type="time"
                            className="glass-input time-picker-input"
                            value={regWorkEnd}
                            onChange={(e) => setRegWorkEnd(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* 3. Sleep & Wake Hours */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                        <div className="form-group">
                          <label className="form-label">เวลาตื่นนอน</label>
                          <input
                            type="time"
                            className="glass-input time-picker-input"
                            value={regWakeTime}
                            onChange={(e) => setRegWakeTime(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">เวลาเข้านอน</label>
                          <input
                            type="time"
                            className="glass-input time-picker-input"
                            value={regBedTime}
                            onChange={(e) => setRegBedTime(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* 4. Workout Preference */}
                      <div className="form-group" style={{ marginTop: '10px' }}>
                        <label className="form-label">ช่วงเวลาที่สะดวกออกกำลังกาย</label>
                        <div className="routine-pill-group">
                          <button
                            type="button"
                            className={`routine-pill-btn ${regFreeTime === 'morning' ? 'active' : ''}`}
                            onClick={() => setRegFreeTime('morning')}
                          >
                            ช่วงเช้า (ก่อนเริ่มงาน/เรียน)
                          </button>
                          <button
                            type="button"
                            className={`routine-pill-btn ${regFreeTime === 'evening' ? 'active' : ''}`}
                            onClick={() => setRegFreeTime('evening')}
                          >
                            ช่วงเย็น/ค่ำ (หลังเลิกงาน/เรียน)
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
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
              onShuffleMeals={handleShuffleMeals}
              routineData={{
                routineType,
                wakeTime,
                bedTime,
                workStart,
                workEnd,
                freeTime,
                workoutTime: freeTime === 'morning' ? '07:30' : '18:30',
              }}
              onUpdateRoutine={handleUpdateRoutine}
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
                โปรแกรมสมดุลตามหลักวิทยาศาสตร์การกีฬา: <strong>ฝึก 5 วัน สลับวันพักฟื้นฟู 2 วันต่อสัปดาห์</strong> (แตะแต่ละวันเพื่อดูรายละเอียด)
              </div>

              {planSummary?.days && planSummary.days.length > 0 && (
                <div className="plan30-legend-row">
                  <div className="plan30-legend-item train">
                    <span className="legend-dot train" />
                    <span>วันฝึกซ้อม ({planSummary.days.filter((d) => !d.isRest).length} วัน)</span>
                  </div>
                  <div className="plan30-legend-item rest">
                    <span className="legend-dot rest" />
                    <span>วันพักฟื้นฟู ({planSummary.days.filter((d) => d.isRest).length} วัน)</span>
                  </div>
                </div>
              )}

              <div className="days-grid">
                {planSummary?.days?.map((d) => (
                  <div
                    key={d.dayNo}
                    className={`day-cell ${d.isRest ? 'rest-day' : ''} ${d.dayNo === selectedDayNo ? 'active-selected' : ''} ${d.completedAt ? 'completed' : ''}`}
                    title={`วันที่ ${d.dayNo}: ${d.focus}`}
                    onClick={() => {
                      navigateToTab('today', d.dayNo);
                      loadDayDetail(d.dayNo);
                    }}
                  >
                    <div className="day-cell-num">{d.dayNo}</div>
                    <div className="day-cell-tag">
                      {d.isRest ? 'พักฟื้นฟู' : 'ฝึก'}
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
                navigateToTab('today', dayNo);
                loadDayDetail(dayNo);
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

                {/* Routine Schedule Customization in Profile */}
                <div className="routine-onboarding-box">
                  <div className="routine-onboarding-title">
                    กำหนดเวลาชีวิต & ตารางประจำวัน
                  </div>
                  <div className="routine-onboarding-sub">
                    ปรับเปลี่ยนเวลาทำงาน เรียน ตื่นนอน และเข้านอน เพื่อให้ระบบคำนวณและจัดสรรไทม์ไลน์รายวันใหม่อัตโนมัติ
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      รูปแบบกิจวัตรประจำวันหลัก
                    </label>
                    <div className="routine-pill-group">
                      {[
                        { key: 'work', label: 'ทำงานประจำ' },
                        { key: 'study', label: 'เรียน / นักศึกษา' },
                        { key: 'shift', label: 'ทำงานกะ' },
                        { key: 'freelance', label: 'ฟรีแลนซ์' },
                        { key: 'flexible', label: 'เวลาอิสระ' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          className={`routine-pill-btn ${routineType === item.key ? 'active' : ''}`}
                          onClick={() => setRoutineType(item.key as any)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">
                        {routineType === 'study' ? 'เวลาเริ่มเรียน' : 'เวลาเริ่มงาน'}
                      </label>
                      <input
                        type="time"
                        className="glass-input time-picker-input"
                        value={workStart}
                        onChange={(e) => setWorkStart(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {routineType === 'study' ? 'เวลาเลิกเรียน' : 'เวลาเลิกงาน'}
                      </label>
                      <input
                        type="time"
                        className="glass-input time-picker-input"
                        value={workEnd}
                        onChange={(e) => setWorkEnd(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">เวลาตื่นนอน</label>
                      <input
                        type="time"
                        className="glass-input time-picker-input"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">เวลาเข้านอน</label>
                      <input
                        type="time"
                        className="glass-input time-picker-input"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>
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
                      navigateToTab('today', 1);
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
                  <div className="move-up-next">ท่าฝึก • MOVE</div>
                  <h2 className="move-exercise-title">
                    {selectedExercise.name_th || selectedExercise.exercise_id.replace(/_/g, ' ')}
                  </h2>
                  <div className="move-exercise-th">
                    {selectedExercise.exercise_id.replace(/_/g, ' ')} • {getEquipmentLabel(selectedExercise.exercise_id)}
                  </div>
                </div>

                {/* Center Graphic */}
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
                  <div className="move-sets-label">เซ็ต × จำนวนครั้ง</div>
                </div>

                {/* Next Exercise Pill Button & Sub Navigation */}
                <div>
                  <button
                    type="button"
                    className="move-next-btn"
                    onClick={handleNextExercise}
                  >
                    <span>ท่าถัดไป</span>
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
                    <span style={{ fontSize: '0.75rem', color: 'var(--sage)' }}>
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
