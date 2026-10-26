import { useState, useEffect } from 'react';

export interface RoutineData {
  routineType: 'work' | 'study' | 'shift' | 'freelance' | 'flexible';
  wakeTime: string;
  bedTime: string;
  workStart: string;
  workEnd: string;
  freeTime: 'morning' | 'evening';
  workoutTime?: string;
}

interface RoutineScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoutine?: RoutineData;
  onSave: (data: RoutineData) => Promise<void>;
}

export function RoutineScheduleModal({
  isOpen,
  onClose,
  currentRoutine,
  onSave,
}: RoutineScheduleModalProps) {
  const [routineType, setRoutineType] = useState<'work' | 'study' | 'shift' | 'freelance' | 'flexible'>(
    currentRoutine?.routineType || 'work'
  );
  const [wakeTime, setWakeTime] = useState(currentRoutine?.wakeTime || '07:00');
  const [bedTime, setBedTime] = useState(currentRoutine?.bedTime || '23:00');
  const [workStart, setWorkStart] = useState(currentRoutine?.workStart || '09:00');
  const [workEnd, setWorkEnd] = useState(currentRoutine?.workEnd || '18:00');
  const [freeTime, setFreeTime] = useState<'morning' | 'evening'>(currentRoutine?.freeTime || 'evening');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentRoutine) {
      setRoutineType(currentRoutine.routineType || 'work');
      setWakeTime(currentRoutine.wakeTime || '07:00');
      setBedTime(currentRoutine.bedTime || '23:00');
      setWorkStart(currentRoutine.workStart || '09:00');
      setWorkEnd(currentRoutine.workEnd || '18:00');
      setFreeTime(currentRoutine.freeTime || 'evening');
    }
  }, [currentRoutine, isOpen]);

  // Keyboard shortcut: Escape closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const applyPreset = (preset: 'office' | 'student' | 'freelance') => {
    if (preset === 'office') {
      setRoutineType('work');
      setWakeTime('06:30');
      setWorkStart('08:30');
      setWorkEnd('17:30');
      setFreeTime('evening');
      setBedTime('23:00');
    } else if (preset === 'student') {
      setRoutineType('study');
      setWakeTime('07:00');
      setWorkStart('08:30');
      setWorkEnd('16:00');
      setFreeTime('evening');
      setBedTime('23:30');
    } else if (preset === 'freelance') {
      setRoutineType('freelance');
      setWakeTime('08:00');
      setWorkStart('10:00');
      setWorkEnd('18:00');
      setFreeTime('morning');
      setBedTime('24:00');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        routineType,
        wakeTime,
        bedTime,
        workStart,
        workEnd,
        freeTime,
        workoutTime: freeTime === 'morning' ? '07:30' : '18:30',
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="routine-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="routine-modal-header">
          <div>
            <h3 className="routine-modal-title">ปรับแต่งเวลาชีวิต & ตารางกิจวัตร</h3>
            <p className="routine-modal-subtitle">
              กำหนดเวลาทำงาน เรียน และเวลาว่าง เพื่อให้ระบบจัดสรรตารางอาหารและเวลาออกกำลังกายที่ลงตัวที่สุด
            </p>
          </div>
          <button type="button" className="routine-modal-close" onClick={onClose} aria-label="ปิด">
            ✕
          </button>
        </div>

        {/* Quick Presets */}
        <div className="routine-preset-row">
          <span className="preset-label">ตัวเลือกสำเร็จรูป:</span>
          <button type="button" className="preset-chip" onClick={() => applyPreset('office')}>
            งานออฟฟิศ (8:30-17:30)
          </button>
          <button type="button" className="preset-chip" onClick={() => applyPreset('student')}>
            นักเรียน/นักศึกษา (8:30-16:00)
          </button>
          <button type="button" className="preset-chip" onClick={() => applyPreset('freelance')}>
            ฟรีแลนซ์/ยืดหยุ่น
          </button>
        </div>

        <form onSubmit={handleSave} className="routine-modal-body">
          {/* 1. Main Routine Type */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              รูปแบบกิจวัตรหลักของคุณ
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

          {/* 2. Work / Study Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          {/* 3. Sleep & Wake Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          {/* 4. Workout Time Preference */}
          <div className="form-group">
            <label className="form-label">ช่วงเวลาที่สะดวกออกกำลังกาย</label>
            <div className="routine-pill-group">
              <button
                type="button"
                className={`routine-pill-btn ${freeTime === 'morning' ? 'active' : ''}`}
                onClick={() => setFreeTime('morning')}
              >
                ช่วงเช้า (ก่อนเริ่มงาน/เรียน)
              </button>
              <button
                type="button"
                className={`routine-pill-btn ${freeTime === 'evening' ? 'active' : ''}`}
                onClick={() => setFreeTime('evening')}
              >
                ช่วงเย็น/ค่ำ (หลังเลิกงาน/เรียน)
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="routine-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              ยกเลิก
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'กำลังจัดตารางเวลาใหม่...' : 'บันทึกและจัดตารางเวลาใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
