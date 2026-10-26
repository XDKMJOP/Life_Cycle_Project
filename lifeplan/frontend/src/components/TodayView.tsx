import { useState, useEffect, useMemo, useRef } from 'react';
import type { WorkoutLocationMode } from '../lib/exerciseModes';
import { getWorkoutForMode, getEquipmentLabel } from '../lib/exerciseModes';
import { BUDGET_THAI_MEALS } from '../lib/budgetMealsData';
import { BudgetMealsModal } from './BudgetMealsModal';
import { RoutineScheduleModal, type RoutineData } from './RoutineScheduleModal';
import {
  isNotificationsEnabled,
  setNotificationsEnabled,
  scheduleRoutineNotifications,
  cancelAllRoutineNotifications,
  sendTestNotificationNow,
} from '../lib/notifications';

export interface ExerciseItem {
  exercise_id: string;
  name_th?: string;
  sets?: number | null;
  reps?: string | number | null;
  duration_min?: number | null;
  rest_sec?: number | null;
}

export interface DayDetailContent {
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
    image?: string;
    price_thb?: number;
    source?: string;
    boosters?: string[];
  }>;
  schedule: Array<{
    start: string;
    end: string;
    label: string;
    type: 'workout' | 'meal' | 'sleep' | 'free' | 'work' | 'study';
  }>;
  total_kcal?: number;
  total_protein_g?: number;
}

export interface DayDetailResponse {
  id: number;
  dayNo: number;
  completedAt: string | null;
  content: DayDetailContent;
}

export interface CurrentPlanResponse {
  hasPlan: boolean;
  planId?: number;
  startDate?: string;
  days?: Array<{
    id: number;
    dayNo: number;
    focus: string;
    isRest: boolean;
    totalKcal?: number;
    totalProteinG?: number;
    burnedKcal?: number;
    completedAt?: string | null;
  }>;
}

export interface TodayViewProps {
  dayDetail: DayDetailResponse | null;
  selectedDayNo: number;
  planSummary: CurrentPlanResponse | null;
  energyResult: { bmr: number; tdee: number; targetKcal: number } | null;
  loadingPlan: boolean;
  onGeneratePlan: () => void;
  onToggleComplete: (dayNo: number) => void;
  onSelectExercise: (exercise: ExerciseItem, allExercises?: ExerciseItem[]) => void;
  getModeForDay: (dayNo: number) => WorkoutLocationMode;
  setModeForDay: (dayNo: number, mode: WorkoutLocationMode) => void;
  userName?: string;
  onShuffleMeals?: (dayNo: number, slot?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => Promise<void>;
  routineData?: RoutineData;
  onUpdateRoutine?: (data: RoutineData) => Promise<void>;
}

export function TodayView({
  dayDetail,
  selectedDayNo,
  planSummary,
  energyResult,
  loadingPlan,
  onGeneratePlan,
  onToggleComplete,
  onSelectExercise,
  getModeForDay,
  setModeForDay,
  userName = 'คุณ',
  onShuffleMeals,
  routineData,
  onUpdateRoutine,
}: TodayViewProps) {
  const currentDayNo = dayDetail?.dayNo || selectedDayNo;
  const currentMode = getModeForDay(currentDayNo);
  const workouts = getWorkoutForMode(dayDetail?.content, currentMode);
  const meals = dayDetail?.content.meals || [];
  const schedule = dayDetail?.content.schedule || [];

  // 100 Budget Thai Meals Modal State
  const [showMealsModal, setShowMealsModal] = useState(false);
  const [shufflingSlot, setShufflingSlot] = useState<string | null>(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => isNotificationsEnabled());
  const [notifStatusMsg, setNotifStatusMsg] = useState('');

  // Auto-schedule routine notifications whenever daily schedule is loaded or updated
  useEffect(() => {
    if (schedule && schedule.length > 0 && notifEnabled) {
      scheduleRoutineNotifications(schedule).catch(() => {});
    }
  }, [schedule, notifEnabled]);

  // Fallback resolve meal metadata (photo, price, source)
  const resolvedMeals = useMemo(() => {
    return meals.map((m, index) => {
      // 1. Direct match with BUDGET_THAI_MEALS
      let match = BUDGET_THAI_MEALS.find(
        (b) =>
          b.name_th === m.title ||
          (m.title && b.name_th.includes(m.title)) ||
          (m.title && m.title.includes(b.name_th))
      );

      // 2. Keyword fuzzy matching if no direct match
      if (!match && m.title) {
        const title = m.title.toLowerCase();
        if (title.includes('กะเพรา')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('กะเพรา'));
        } else if (title.includes('ข้าวต้ม') || title.includes('โจ๊ก')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('ข้าวต้ม') || b.name_th.includes('โจ๊ก'));
        } else if (title.includes('ปลา') || title.includes('ปลากะพง')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('ปลา'));
        } else if (title.includes('สุกี้')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('สุกี้'));
        } else if (title.includes('ก๋วยเตี๋ยว') || title.includes('เกาเหลา')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('เกาเหลา') || b.name_th.includes('ก๋วยเตี๋ยว'));
        } else if (title.includes('ไก่') || title.includes('อกไก่')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('ไก่'));
        } else if (title.includes('ไข่') || title.includes('ไข่ต้ม')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('ไข่'));
        } else if (title.includes('แกง')) {
          match = BUDGET_THAI_MEALS.find((b) => b.name_th.includes('แกง'));
        }
      }

      // 3. Slot-based fallback
      if (!match) {
        const slotMeals = BUDGET_THAI_MEALS.filter((b) => b.slot === m.slot);
        if (slotMeals.length > 0) {
          match = slotMeals[index % slotMeals.length];
        } else {
          match = BUDGET_THAI_MEALS[index % BUDGET_THAI_MEALS.length];
        }
      }

      const safeImage = m.image || match?.image || `/meals/meal_${(index % 100) + 1}.jpg`;
      const safePrice = m.price_thb || match?.price_thb || 45;
      const safeSource = m.source || match?.source || 'ร้านอาหารตามสั่งทั่วไป';

      return {
        ...m,
        image: safeImage,
        price_thb: safePrice,
        source: safeSource,
      };
    });
  }, [meals]);

  // Active section filter for today: 'all' | 'workout' | 'meal' | 'schedule' | 'water'
  const [activeSection, setActiveSection] = useState<'all' | 'workout' | 'meal' | 'schedule' | 'water'>('all');

  // Interactive Checklist states saved in localStorage per day
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`life_cycle_day_${currentDayNo}_workouts`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`life_cycle_day_${currentDayNo}_meals`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`life_cycle_day_${currentDayNo}_water`);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  // Keep state synced when switching day
  useEffect(() => {
    try {
      const savedW = localStorage.getItem(`life_cycle_day_${currentDayNo}_workouts`);
      setCompletedWorkouts(savedW ? JSON.parse(savedW) : {});
      const savedM = localStorage.getItem(`life_cycle_day_${currentDayNo}_meals`);
      setCompletedMeals(savedM ? JSON.parse(savedM) : {});
      const savedWater = localStorage.getItem(`life_cycle_day_${currentDayNo}_water`);
      setWaterGlasses(savedWater ? parseInt(savedWater, 10) || 0 : 0);
    } catch {
      // ignore
    }
  }, [currentDayNo]);

  // Real-time Clock State (synchronizes with real-world time)
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [scheduleViewMode, setScheduleViewMode] = useState<'all' | 'now_and_next'>('all');

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const parseTimeToMinutes = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const formatDurationMins = (mins: number): string => {
    if (mins <= 0) return 'ไม่กี่นาที';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h} ชม. ${m} นาที`;
    if (h > 0) return `${h} ชม.`;
    return `${m} นาที`;
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Find active and next slots based on real time
  const activeSlot = useMemo(() => {
    return schedule.find((item) => {
      const s = parseTimeToMinutes(item.start);
      const e = parseTimeToMinutes(item.end);
      return s <= e
        ? currentMinutes >= s && currentMinutes < e
        : currentMinutes >= s || currentMinutes < e;
    });
  }, [schedule, currentMinutes]);

  const nextSlot = useMemo(() => {
    return schedule.find((item) => {
      const s = parseTimeToMinutes(item.start);
      return s > currentMinutes;
    });
  }, [schedule, currentMinutes]);

  const toggleWorkoutDone = (exerciseId: string) => {
    setCompletedWorkouts((prev) => {
      const next = { ...prev, [exerciseId]: !prev[exerciseId] };
      try {
        localStorage.setItem(`life_cycle_day_${currentDayNo}_workouts`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleMealDone = (mealIndex: number) => {
    const key = `meal_${mealIndex}`;
    setCompletedMeals((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(`life_cycle_day_${currentDayNo}_meals`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleWaterClick = (glassIndex: number) => {
    // If clicking on current number, toggle it back by one, otherwise set to clicked index + 1
    const newCount = glassIndex + 1 === waterGlasses ? glassIndex : glassIndex + 1;
    setWaterGlasses(newCount);
    try {
      localStorage.setItem(`life_cycle_day_${currentDayNo}_water`, newCount.toString());
    } catch {
      // ignore
    }
  };

  const handleQuickLogAll = () => {
    const nextWorkouts: Record<string, boolean> = {};
    if (workouts) {
      workouts.forEach((w) => {
        nextWorkouts[w.exercise_id] = true;
      });
    }
    setCompletedWorkouts(nextWorkouts);
    try {
      localStorage.setItem(`life_cycle_day_${currentDayNo}_workouts`, JSON.stringify(nextWorkouts));
    } catch {
      // ignore
    }

    const nextMeals: Record<string, boolean> = {};
    meals.forEach((_, idx) => {
      nextMeals[`meal_${idx}`] = true;
    });
    setCompletedMeals(nextMeals);
    try {
      localStorage.setItem(`life_cycle_day_${currentDayNo}_meals`, JSON.stringify(nextMeals));
    } catch {
      // ignore
    }

    setWaterGlasses(8);
    try {
      localStorage.setItem(`life_cycle_day_${currentDayNo}_water`, '8');
    } catch {
      // ignore
    }

    if (!dayDetail?.completedAt) {
      onToggleComplete(currentDayNo);
    }
  };

  // Rest Timer State
  const [activeTimerExercise, setActiveTimerExercise] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerInitial, setTimerInitial] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  const startRestTimer = (exerciseId: string, durationSec: number = 60) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setActiveTimerExercise(exerciseId);
    setTimerInitial(durationSec);
    setTimerSeconds(durationSec);
    setIsTimerRunning(true);
  };

  const pauseRestTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeRestTimer = () => {
    if (timerSeconds > 0) {
      setIsTimerRunning(true);
    }
  };

  const stopRestTimer = () => {
    setIsTimerRunning(false);
    setActiveTimerExercise(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            // Play gentle web audio chime
            try {
              const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
              osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
              gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.6);
            } catch {
              // audio not allowed without user gesture
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, timerSeconds]);

  // Overall Completion Calculation for the day
  const totalTasks = (workouts ? workouts.length : 0) + meals.length + (waterGlasses >= 8 ? 1 : 0);
  const doneTasks = useMemo(() => {
    let count = 0;
    if (workouts) {
      workouts.forEach((w) => {
        if (completedWorkouts[w.exercise_id]) count++;
      });
    }
    meals.forEach((_, idx) => {
      if (completedMeals[`meal_${idx}`]) count++;
    });
    if (waterGlasses >= 8) count++;
    return count;
  }, [workouts, completedWorkouts, meals, completedMeals, waterGlasses]);

  const completionPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : (dayDetail?.completedAt ? 100 : 0);

  // SVG circular gauge properties
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  if (!planSummary?.hasPlan) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div className="glass-card-header" style={{ justifyContent: 'center', fontSize: '1.25rem' }}>
          <span>เริ่มต้นวางแผนสุขภาพ 30 วัน</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.7', margin: '14px 0 20px' }}>
          ระบบพร้อมประมวลผลแผนอาหารและตารางการออกกำลังกาย 30 วันที่ตรงกับความต้องการและค่าพลังงานของคุณ ({userName})
        </p>
        <button
          type="button"
          className="btn-primary"
          style={{ maxWidth: '320px', margin: '0 auto' }}
          onClick={onGeneratePlan}
          disabled={loadingPlan}
        >
          {loadingPlan ? 'กำลังจัดสรรตาราง 30 วัน...' : 'สร้างแผน 30 วันของคุณทันที'}
        </button>
      </div>
    );
  }

  return (
    <div className="today-dashboard-container">
      {/* 1. HERO SUMMARY CARD (CLEAN, INTERACTIVE & DIGESTIBLE) */}
      <div className={`glass-card today-hero-card ${dayDetail?.completedAt ? 'day-completed-card' : ''}`}>
        <div className="today-hero-top">
          <div className="today-hero-title-group">
            <div className="today-day-badge">
              <span>วันที่ {currentDayNo} / 30</span>
              {dayDetail?.content.is_rest && <span className="today-mini-pill rest">วันพักฟื้นฟู</span>}
              {dayDetail?.completedAt && <span className="today-mini-pill done">บันทึกสำเร็จ</span>}
            </div>
            <h2 className="today-focus-title">
              {dayDetail?.content.focus || 'กิจกรรมดูแลสุขภาพประจำวัน'}
            </h2>
            <div className="today-streak-badge">
              <span className="streak-dot" />
              <span>
                {dayDetail?.content.is_rest
                  ? `เป้าหมายวันนี้: พักซ่อมแซมกล้ามเนื้อ • ${meals.length} มื้อ • ดื่มน้ำ 8 แก้ว`
                  : `เป้าหมายวันนี้: ${workouts?.length || 0} ท่า • ${meals.length} มื้อ`}
              </span>
            </div>
          </div>

          {/* Interactive Progress Ring Widget */}
          <div className="today-progress-gauge">
            <svg className="progress-ring-svg" width="94" height="94">
              <circle
                className="progress-ring-bg"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="7"
                fill="transparent"
                r={radius}
                cx="47"
                cy="47"
              />
              <circle
                className="progress-ring-fill"
                stroke={dayDetail?.completedAt || completionPercent === 100 ? '#4ade80' : 'var(--sage-strong)'}
                strokeWidth="7"
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="47"
                cy="47"
              />
            </svg>
            <div className="gauge-center-text">
              <span className="gauge-percent">{dayDetail?.completedAt ? 100 : completionPercent}%</span>
              <span className="gauge-label">{doneTasks}/{totalTasks} เสร็จ</span>
            </div>
          </div>
        </div>

        {/* Quick At-A-Glance Metric Chips */}
        <div className="today-metric-bar">
          <div
            className="today-metric-chip"
            title={
              energyResult?.targetKcal
                ? `แผนอาหารวันนี้ ${dayDetail?.content.total_kcal || 0} kcal (เป้าหมายคำนวณ ${energyResult.targetKcal} kcal)`
                : undefined
            }
          >
            <span className="metric-chip-label">
              พลังงาน {energyResult?.targetKcal ? `(เป้า ${energyResult.targetKcal})` : ''}
            </span>
            <span className="metric-chip-value">
              {dayDetail?.content.total_kcal || energyResult?.targetKcal || 2000} kcal
            </span>
          </div>
          <div
            className="today-metric-chip"
            title="โปรตีนรวมจากมื้ออาหารวันนี้ตามเป้าหมายรักษากล้ามเนื้อ"
          >
            <span className="metric-chip-label">โปรตีน</span>
            <span className="metric-chip-value">
              {Math.round(dayDetail?.content.total_protein_g || 70)} กรัม
            </span>
          </div>
          <div className="today-metric-chip" onClick={() => setActiveSection('water')} style={{ cursor: 'pointer' }}>
            <span className="metric-chip-label">ดื่มน้ำ</span>
            <span className="metric-chip-value" style={{ color: waterGlasses >= 8 ? '#86efac' : 'inherit' }}>
              {waterGlasses}/8 แก้ว
            </span>
          </div>
        </div>

        {/* Main Day Status Toggle & Quick All Row */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            type="button"
            className={`today-main-toggle-btn ${dayDetail?.completedAt ? 'is-completed' : ''}`}
            style={{ flex: 1, margin: 0 }}
            onClick={() => onToggleComplete(currentDayNo)}
          >
            {dayDetail?.completedAt ? (
              <>
                <span className="check-icon-circle">✓</span>
                <span>ทำเสร็จสมบูรณ์แล้ว</span>
              </>
            ) : (
              <>
                <span className="check-icon-circle empty" />
                <span>บันทึกความสำเร็จวันนี้</span>
              </>
            )}
          </button>
          {!dayDetail?.completedAt && completionPercent < 100 && (
            <button
              type="button"
              className="today-quick-all-btn"
              onClick={handleQuickLogAll}
              title="บันทึกว่าทำเสร็จครบทุกรายการในคลิกเดียว"
            >
              เสร็จทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORY FILTER TABS */}
      <div className="today-section-tabs">
        <button
          type="button"
          className={`section-tab-btn ${activeSection === 'all' ? 'active' : ''}`}
          onClick={() => setActiveSection('all')}
        >
          ภาพรวม
        </button>
        <button
          type="button"
          className={`section-tab-btn ${activeSection === 'workout' ? 'active' : ''}`}
          onClick={() => setActiveSection('workout')}
        >
          {dayDetail?.content.is_rest ? 'การฟื้นฟู (วันพัก)' : `ออกกำลังกาย (${workouts?.length || 0})`}
        </button>
        <button
          type="button"
          className={`section-tab-btn ${activeSection === 'meal' ? 'active' : ''}`}
          onClick={() => setActiveSection('meal')}
        >
          อาหาร ({meals.length})
        </button>
        <button
          type="button"
          className={`section-tab-btn ${activeSection === 'water' ? 'active' : ''}`}
          onClick={() => setActiveSection('water')}
        >
          ดื่มน้ำ ({waterGlasses}/8)
        </button>
        <button
          type="button"
          className={`section-tab-btn ${activeSection === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveSection('schedule')}
        >
          ตารางเวลา
        </button>
      </div>

      {/* 3. WORKOUT / RECOVERY SECTION */}
      {(activeSection === 'all' || activeSection === 'workout') && (
        <div className="today-content-section">
          {!dayDetail?.content.is_rest && workouts && workouts.length > 0 ? (
            <>
              {/* Mode Switcher Banner */}
              <div className="workout-mode-bar">
                <div className="workout-mode-info">
                  <span className="workout-mode-tag">สถานที่ฝึก</span>
                  <span className="workout-mode-subtext">
                    {currentMode === 'gym' ? 'อุปกรณ์ฟิตเนส' : 'บอดี้เวท ไม่ใช้อุปกรณ์'}
                  </span>
                </div>
                <div className="workout-mode-pill-toggle">
                  <button
                    type="button"
                    className={`mode-pill-btn ${currentMode === 'home' ? 'active' : ''}`}
                    onClick={() => setModeForDay(currentDayNo, 'home')}
                  >
                    ที่บ้าน
                  </button>
                  <button
                    type="button"
                    className={`mode-pill-btn ${currentMode === 'gym' ? 'active' : ''}`}
                    onClick={() => setModeForDay(currentDayNo, 'gym')}
                  >
                    ฟิตเนส
                  </button>
                </div>
              </div>

              <div className="section-header-row">
                <h3 className="section-title">รายการออกกำลังกาย</h3>
                <span className="section-counter">
                  {workouts?.filter((w) => completedWorkouts[w.exercise_id]).length || 0} / {workouts?.length || 0} ท่า
                </span>
              </div>

              {/* Rest Timer Active Floating/Inline Banner */}
              {activeTimerExercise && (
                <div className="rest-timer-card">
                  <div className="rest-timer-header">
                    <span className="timer-title">พักระหว่างเซ็ต</span>
                    <button type="button" className="timer-close-btn" onClick={stopRestTimer}>
                      ปิด
                    </button>
                  </div>
                  <div className="rest-timer-display">
                    <span className="timer-seconds-big">{timerSeconds}</span>
                    <span className="timer-unit">วินาที</span>
                  </div>
                  <div className="timer-progress-track">
                    <div
                      className="timer-progress-bar"
                      style={{ width: `${(timerSeconds / (timerInitial || 60)) * 100}%` }}
                    />
                  </div>
                  <div className="timer-actions">
                    {isTimerRunning ? (
                      <button type="button" className="timer-btn pause" onClick={pauseRestTimer}>
                        หยุดชั่วคราว
                      </button>
                    ) : (
                      <button type="button" className="timer-btn resume" onClick={resumeRestTimer}>
                        {timerSeconds === 0 ? 'เริ่มใหม่' : 'นับต่อ'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="timer-btn reset"
                      onClick={() => startRestTimer(activeTimerExercise, timerInitial)}
                    >
                      เริ่มใหม่ ({timerInitial}s)
                    </button>
                  </div>
                </div>
              )}

              {workouts.map((w, idx) => {
                const isChecked = !!completedWorkouts[w.exercise_id];
                const restTime = w.rest_sec || 60;
                return (
                  <div
                    key={idx}
                    className={`exercise-interactive-card ${isChecked ? 'is-checked' : ''}`}
                  >
                    <div className="exercise-card-left" onClick={() => toggleWorkoutDone(w.exercise_id)}>
                      <div className={`exercise-checkbox ${isChecked ? 'checked' : ''}`}>
                        {isChecked ? '✓' : ''}
                      </div>
                    </div>

                    <div className="exercise-card-body">
                      <div className="exercise-card-main-row">
                        <div className="exercise-title-group" onClick={() => onSelectExercise(w, workouts || [])}>
                          <h4 className={`exercise-name ${isChecked ? 'text-done' : ''}`}>
                            {w.name_th || w.exercise_id}
                          </h4>
                          <span className="exercise-equipment-tag">
                            {getEquipmentLabel(w.exercise_id)}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn-view-demo"
                          onClick={() => onSelectExercise(w, workouts || [])}
                          title="แตะเพื่อดูท่าออกกำลังกาย MOVE"
                        >
                          ดูท่า MOVE
                        </button>
                      </div>

                      {/* Parameter Chips */}
                      <div className="exercise-param-chips">
                        {w.sets && (
                          <span className="param-chip">
                            <strong>{w.sets}</strong> เซ็ต
                          </span>
                        )}
                        {w.reps && (
                          <span className="param-chip">
                            <strong>{w.reps}</strong> ครั้ง
                          </span>
                        )}
                        {w.duration_min && (
                          <span className="param-chip">
                            <strong>{w.duration_min}</strong> นาที
                          </span>
                        )}
                        <button
                          type="button"
                          className={`param-chip timer-trigger-chip ${activeTimerExercise === w.exercise_id ? 'active' : ''}`}
                          onClick={() => startRestTimer(w.exercise_id, restTime)}
                        >
                          พัก {restTime}s (จับเวลา)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="rest-day-card">
              <div className="rest-day-badge-top">REST & RECOVERY DAY</div>
              <h4>วันพักผ่อนและฟื้นฟูซ่อมแซมกล้ามเนื้อ</h4>
              <p>
                วันนี้ไม่มีตารางฝึกเวทหรือคาร์ดิโอหนัก เพื่อให้เส้นใยกล้ามเนื้อและระบบประสาทได้ซ่อมแซมตัวเองอย่างสมบูรณ์ (ใช้เวลาฟื้นตัว 24–48 ชม.)
              </p>
              <div className="rest-day-checklist">
                <div className="rest-day-tip-item">
                  <span className="rest-tip-num">1</span>
                  <div className="rest-tip-text">
                    <strong>ยืดเหยียดเบาๆ (Active Stretching 10–15 นาที)</strong>
                    <span>ช่วยกระตุ้นการไหลเวียนเลือดและลดอาการปวดตึงกล้ามเนื้อ (DOMS)</span>
                  </div>
                </div>
                <div className="rest-day-tip-item">
                  <span className="rest-tip-num">2</span>
                  <div className="rest-tip-text">
                    <strong>ทานโปรตีนและดื่มน้ำให้ครบตามเป้าหมาย</strong>
                    <span>ร่างกายใช้โปรตีนในวันพักเพื่อสร้างและกระชับกล้ามเนื้อให้แข็งแรงขึ้น</span>
                  </div>
                </div>
                <div className="rest-day-tip-item">
                  <span className="rest-tip-num">3</span>
                  <div className="rest-tip-text">
                    <strong>นอนหลับพักผ่อนให้ได้ 7–8 ชั่วโมง</strong>
                    <span>โกรทฮอร์โมน (Growth Hormone) จะหลั่งสูงสุดขณะหลับลึกเพื่อซ่อมแซมร่างกาย</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. MEAL SECTION */}
      {(activeSection === 'all' || activeSection === 'meal') && (
        <div className="today-content-section">
          <div className="section-header-row">
            <div>
              <h3 className="section-title">มื้ออาหารแนะนำ</h3>
              <span className="section-counter">
                {resolvedMeals.filter((_, idx) => completedMeals[`meal_${idx}`]).length} / {resolvedMeals.length} มื้อ
                {dayDetail?.content.total_kcal ? (
                  <> · รวม {dayDetail.content.total_kcal} kcal{energyResult?.targetKcal ? ` (เป้าหมาย ${energyResult.targetKcal} kcal)` : ''}</>
                ) : null}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {onShuffleMeals && (
                <button
                  type="button"
                  className="today-shuffle-all-btn"
                  onClick={async () => {
                    if (shufflingSlot) return;
                    setShufflingSlot('all');
                    try {
                      await onShuffleMeals(currentDayNo);
                      setCompletedMeals({});
                      try {
                        localStorage.removeItem(`life_cycle_meals_day_${currentDayNo}`);
                      } catch {}
                    } finally {
                      setShufflingSlot(null);
                    }
                  }}
                  disabled={!!shufflingSlot}
                  title="สุ่มเปลี่ยนรายการอาหารของวันนี้ใหม่ทั้งหมด"
                >
                  <svg
                    className={shufflingSlot === 'all' ? 'spin' : ''}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  <span>{shufflingSlot === 'all' ? 'กำลังสุ่ม...' : 'สุ่มเมนูวันนี้'}</span>
                </button>
              )}
              <button
                type="button"
                className="view-100-meals-btn"
                onClick={() => setShowMealsModal(true)}
                title="เปิดดูคลัง 100 เมนูราคาประหยัด"
              >
                100 เมนูประหยัด
              </button>
            </div>
          </div>

          {resolvedMeals.map((m, idx) => {
            const isMealDone = !!completedMeals[`meal_${idx}`];
            let slotTitle = 'มื้ออาหาร';
            if (resolvedMeals.length === 2) {
              slotTitle = idx === 0 ? 'มื้อที่ 1 (สาย/เที่ยง)' : 'มื้อที่ 2 (เย็น)';
            } else if (resolvedMeals.length === 5) {
              const titles5 = ['มื้อเช้า', 'ของว่างสาย', 'มื้อกลางวัน', 'ของว่างบ่าย', 'มื้อเย็น'];
              slotTitle = titles5[idx] || (m.slot === 'breakfast' ? 'มื้อเช้า' : m.slot === 'lunch' ? 'มื้อกลางวัน' : m.slot === 'dinner' ? 'มื้อเย็น' : 'ของว่าง');
            } else if (resolvedMeals.length === 4) {
              const titles4 = ['มื้อเช้า', 'มื้อกลางวัน', 'ของว่างบ่าย', 'มื้อเย็น'];
              slotTitle = titles4[idx] || (m.slot === 'breakfast' ? 'มื้อเช้า' : m.slot === 'lunch' ? 'มื้อกลางวัน' : m.slot === 'dinner' ? 'มื้อเย็น' : 'ของว่าง');
            } else {
              slotTitle =
                m.slot === 'breakfast'
                  ? 'มื้อเช้า'
                  : m.slot === 'lunch'
                  ? 'มื้อกลางวัน'
                  : m.slot === 'dinner'
                  ? 'มื้อเย็น'
                  : 'ของว่าง';
            }

            // Extract clean dish name and boosters list if concatenated in legacy format
            let dishName = m.title;
            let boostersList = m.boosters || [];
            if (dishName.includes('(+')) {
              const match = dishName.match(/^(.*?)\s*\(\+\s*(.*?)\)$/);
              if (match) {
                dishName = match[1].trim();
                if (boostersList.length === 0) {
                  boostersList = match[2].split('+').map((s) => s.trim());
                }
              }
            }

            // Extract pure culinary tip without redundant price/source prefix or boilerplate suffix
            let cleanTip = m.description || '';
            if (cleanTip.includes(' - ')) {
              cleanTip = cleanTip.split(' - ').slice(1).join(' - ');
            }
            if (cleanTip.includes(' | เสริมด้วย')) {
              cleanTip = cleanTip.split(' | เสริมด้วย')[0];
            }

            return (
              <div key={idx} className={`meal-interactive-card ${isMealDone ? 'is-checked' : ''}`}>
                <div
                  className="meal-card-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMealDone(idx);
                  }}
                  title="แตะเพื่อติ๊กบันทึกว่าทานแล้ว"
                >
                  <div className={`exercise-checkbox ${isMealDone ? 'checked' : ''}`}>
                    {isMealDone ? '✓' : ''}
                  </div>
                </div>

                <div
                  className="meal-card-thumb-wrap"
                  onClick={() => setShowMealsModal(true)}
                  title="คลิกเพื่อดูคลัง 100 เมนูราคาประหยัด"
                >
                  <img
                    src={m.image || '/meals/meal_1.jpg'}
                    alt={dishName}
                    className="meal-card-thumb"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('meal_1.jpg')) {
                        target.src = '/meals/meal_1.jpg';
                      }
                    }}
                  />
                </div>

                <div className="meal-card-body">
                  <div className="meal-header-row">
                    <div className="meal-title-group">
                      <div className="meal-top-meta">
                        <span className="meal-slot-label">{slotTitle}</span>
                        {m.source && <span className="meal-source-pill">{m.source}</span>}
                        {onShuffleMeals && (
                          <button
                            type="button"
                            className="meal-shuffle-btn"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (shufflingSlot) return;
                              setShufflingSlot(m.slot);
                              try {
                                await onShuffleMeals(currentDayNo, m.slot);
                                setCompletedMeals((prev) => {
                                  const next = { ...prev };
                                  delete next[`meal_${idx}`];
                                  try {
                                    localStorage.setItem(`life_cycle_meals_day_${currentDayNo}`, JSON.stringify(next));
                                  } catch {}
                                  return next;
                                });
                              } finally {
                                setShufflingSlot(null);
                              }
                            }}
                            disabled={!!shufflingSlot}
                            title={`สุ่มเปลี่ยนเฉพาะ${slotTitle}นี้ใหม่`}
                          >
                            <svg
                              className={shufflingSlot === m.slot ? 'spin' : ''}
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                            </svg>
                            <span>{shufflingSlot === m.slot ? 'กำลังสุ่ม...' : 'สุ่มใหม่'}</span>
                          </button>
                        )}
                      </div>
                      <h4 className={`meal-dish-name ${isMealDone ? 'text-done' : ''}`}>{dishName}</h4>
                    </div>
                    <div className="meal-badges">
                      {m.price_thb && <span className="meal-price-badge">~{m.price_thb} บาท</span>}
                      <span className="meal-kcal-badge">{m.kcal} kcal</span>
                      <span className="meal-protein-badge">P {m.protein_g}g</span>
                    </div>
                  </div>

                  {boostersList.length > 0 && (
                    <div className="meal-boosters-row">
                      {boostersList.map((b, bIdx) => (
                        <span key={bIdx} className="meal-booster-chip">
                          + {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {cleanTip && (
                    <p className="meal-card-desc">
                      <span className="meal-tip-prefix">เคล็ดลับ:</span> {cleanTip}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. WATER TRACKER WIDGET */}
      {(activeSection === 'all' || activeSection === 'water') && (
        <div className="today-content-section">
          <div className="water-tracker-card">
            <div className="water-header">
              <div>
                <h3 className="water-title">ดื่มน้ำประจำวัน</h3>
                <p className="water-subtitle">เป้าหมาย 8 แก้ว (2,000 มล.)</p>
              </div>
              <span className={`water-status-pill ${waterGlasses >= 8 ? 'done' : ''}`}>
                {waterGlasses >= 8 ? 'ครบเป้าหมายแล้ว' : `${waterGlasses * 250} / 2,000 มล.`}
              </span>
            </div>

            {/* 8 Interactive Water Glasses */}
            <div className="water-glasses-row">
              {Array.from({ length: 8 }).map((_, i) => {
                const isFilled = i < waterGlasses;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`water-cup-btn ${isFilled ? 'filled' : ''}`}
                    onClick={() => handleWaterClick(i)}
                    title={`แก้วที่ ${i + 1} (250 มล.)`}
                  >
                    <span className="cup-icon-shape">
                      <span className="cup-liquid" />
                    </span>
                    <span className="cup-number">{i + 1}</span>
                  </button>
                );
              })}
            </div>
            <div className="water-footer-tip">
              <span>แตะแก้วเพื่อบันทึก หรือแตะซ้ำเพื่อลดจำนวน</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. SCHEDULE SECTION (REAL-TIME ADAPTIVE) */}
      {(activeSection === 'all' || activeSection === 'schedule') && schedule.length > 0 && (
        <div className="today-content-section">
          <div className="section-header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="section-title">ตารางกิจวัตร (เวลาจริง)</h3>
              <span className="section-counter">{schedule.length} ช่วงเวลา</span>
            </div>
            {onUpdateRoutine && (
              <button
                type="button"
                className="schedule-routine-btn"
                onClick={() => setShowRoutineModal(true)}
              >
                ปรับเวลาชีวิต
              </button>
            )}
          </div>

          {/* Notification Controls Bar */}
          <div className="schedule-notification-bar">
            <div className="notification-status-info">
              <span className={`notif-dot ${notifEnabled ? 'active' : ''}`} />
              <span className="notif-label">
                แจ้งเตือนบนมือถือ: <strong>{notifEnabled ? 'เปิดใช้งานตามเวลาจริง' : 'ปิดอยู่'}</strong>
              </span>
            </div>
            <div className="notification-actions">
              <button
                type="button"
                className="btn-notif-action"
                onClick={async () => {
                  const next = !notifEnabled;
                  setNotifEnabled(next);
                  setNotificationsEnabled(next);
                  if (next) {
                    const res = await scheduleRoutineNotifications(schedule);
                    if (res.success) {
                      setNotifStatusMsg(`ตั้งแจ้งเตือนตารางเวลา ${res.count} ช่วงเวลาเรียบร้อยแล้ว`);
                    } else {
                      setNotifStatusMsg('กรุณาอนุญาตสิทธิ์การแจ้งเตือนบนอุปกรณ์');
                    }
                  } else {
                    await cancelAllRoutineNotifications();
                    setNotifStatusMsg('ปิดการแจ้งเตือนตารางเวลาแล้ว');
                  }
                  setTimeout(() => setNotifStatusMsg(''), 4000);
                }}
              >
                {notifEnabled ? 'ปิดแจ้งเตือน' : 'เปิดแจ้งเตือน'}
              </button>
              <button
                type="button"
                className="btn-notif-action test"
                onClick={async () => {
                  setNotifStatusMsg('กำลังส่งการแจ้งเตือนทดสอบ...');
                  const ok = await sendTestNotificationNow();
                  if (ok) {
                    setNotifStatusMsg('ส่งการแจ้งเตือนทดสอบแล้ว ตรวจสอบที่แถบแจ้งเตือนด้านบน');
                  } else {
                    setNotifStatusMsg('ไม่สามารถส่งได้ กรุณาอนุญาตสิทธิ์แจ้งเตือนบนเครื่อง');
                  }
                  setTimeout(() => setNotifStatusMsg(''), 4000);
                }}
              >
                ทดสอบแจ้งเตือน
              </button>
            </div>
          </div>
          {notifStatusMsg && (
            <div className="notif-toast-msg">{notifStatusMsg}</div>
          )}

          {/* Real-time Clock & Summary Card */}
          <div className="schedule-live-header-card">
            <div className="schedule-live-top-row">
              <div className="schedule-live-clock-badge">
                <span className="live-pulse-dot" />
                <span className="live-clock-digits">
                  เวลาจริง {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} น.
                </span>
              </div>
              <div className="schedule-mode-toggle">
                <button
                  type="button"
                  className={`schedule-mode-btn ${scheduleViewMode === 'all' ? 'active' : ''}`}
                  onClick={() => setScheduleViewMode('all')}
                >
                  ทั้งหมด ({schedule.length})
                </button>
                <button
                  type="button"
                  className={`schedule-mode-btn ${scheduleViewMode === 'now_and_next' ? 'active' : ''}`}
                  onClick={() => setScheduleViewMode('now_and_next')}
                >
                  ขณะนี้ & ถัดไป
                </button>
              </div>
            </div>

            {/* Quick Summary of Current & Next */}
            <div className="schedule-live-summary">
              {activeSlot ? (
                <div className="schedule-live-summary-item current">
                  <span className="summary-pill-label current">ขณะนี้</span>
                  <div className="summary-text-block">
                    <span className="summary-activity-name">{activeSlot.label}</span>
                    <span className="summary-time-range">{activeSlot.start} - {activeSlot.end}</span>
                  </div>
                </div>
              ) : (
                <div className="schedule-live-summary-item free">
                  <span className="summary-pill-label free">ขณะนี้</span>
                  <div className="summary-text-block">
                    <span className="summary-activity-name">ช่วงเวลาอิสระ / พักผ่อน</span>
                  </div>
                </div>
              )}

              {nextSlot && (
                <div className="schedule-live-summary-item next">
                  <span className="summary-pill-label next">ถัดไป</span>
                  <div className="summary-text-block">
                    <span className="summary-activity-name">{nextSlot.label}</span>
                    <span className="summary-time-range">
                      {nextSlot.start} น. (อีก {formatDurationMins(parseTimeToMinutes(nextSlot.start) - currentMinutes)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="routine-timeline-container">
            {schedule
              .filter((item) => {
                if (scheduleViewMode === 'now_and_next') {
                  return item === activeSlot || item === nextSlot;
                }
                return true;
              })
              .map((item, idx) => {
                const s = parseTimeToMinutes(item.start);
                const e = parseTimeToMinutes(item.end);
                const isCurrent = item === activeSlot;
                const isNext = item === nextSlot;
                const isPast = s <= e ? currentMinutes >= e : currentMinutes < s && currentMinutes >= e;

                // Progress calculation within current active slot
                let progressPercent = 0;
                let minutesRemaining = 0;
                if (isCurrent) {
                  if (s <= e) {
                    const dur = e - s;
                    const elapsed = currentMinutes - s;
                    progressPercent = dur > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / dur) * 100))) : 0;
                    minutesRemaining = e - currentMinutes;
                  } else {
                    const dur = 24 * 60 - s + e;
                    const elapsed = currentMinutes >= s ? currentMinutes - s : 24 * 60 - s + currentMinutes;
                    progressPercent = dur > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / dur) * 100))) : 0;
                    minutesRemaining = currentMinutes >= s ? 24 * 60 - currentMinutes + e : e - currentMinutes;
                  }
                }

                return (
                  <div
                    key={idx}
                    className={`routine-timeline-card ${item.type} ${isCurrent ? 'is-current' : ''} ${isNext ? 'is-next' : ''} ${isPast ? 'is-past' : ''}`}
                  >
                    <div className="routine-time-box">
                      <span className="time-range">{item.start} - {item.end}</span>
                      <span className="type-badge">
                        {item.type === 'workout'
                          ? 'ออกกำลังกาย'
                          : item.type === 'meal'
                          ? 'มื้ออาหาร'
                          : item.type === 'sleep'
                          ? 'พักผ่อน'
                          : item.type === 'work'
                          ? 'ทำงาน'
                          : item.type === 'study'
                          ? 'เรียน'
                          : 'เวลาว่าง'}
                      </span>
                    </div>

                    <div className="routine-desc-box">
                      <div className="routine-desc-top-row">
                        <span className="routine-label">{item.label}</span>
                        {isCurrent && (
                          <span className="schedule-status-badge current">
                            <span className="pulse-dot" /> ขณะนี้ (เหลือ {formatDurationMins(minutesRemaining)})
                          </span>
                        )}
                        {isNext && (
                          <span className="schedule-status-badge next">
                            ถัดไป (ในอีก {formatDurationMins(s - currentMinutes)})
                          </span>
                        )}
                        {isPast && (
                          <span className="schedule-status-badge past">
                            ผ่านไปแล้ว
                          </span>
                        )}
                      </div>

                      {/* Live Progress Bar for active slot */}
                      {isCurrent && (
                        <div className="current-slot-progress-wrapper">
                          <div className="current-slot-progress-track">
                            <div className="current-slot-progress-bar" style={{ width: `${progressPercent}%` }} />
                          </div>
                          <span className="current-slot-progress-text">{progressPercent}% ของช่วงเวลานี้</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 6. 100 BUDGET THAI MEALS BROWSER MODAL */}
      <BudgetMealsModal
        isOpen={showMealsModal}
        onClose={() => setShowMealsModal(false)}
      />

      {/* 7. ROUTINE SCHEDULE ADJUSTMENT MODAL */}
      <RoutineScheduleModal
        isOpen={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        currentRoutine={routineData}
        onSave={async (data) => {
          if (onUpdateRoutine) {
            await onUpdateRoutine(data);
          }
        }}
      />
    </div>
  );
}
