import { ScheduleItem } from '../../core/models';

export interface TimelineRow {
  id: string;
  kind: 'wake' | 'activity' | 'free' | 'bed';
  start: string;
  end: string;
  startMinutes: number;
  endMinutes: number;
  label: string;
  subLabel?: string;
  type: 'workout' | 'meal' | 'sleep' | 'free';
  status: 'past' | 'current' | 'upcoming';
  progressPercent?: number;
  remainingMinutes?: number;
}

export interface TimelineState {
  rows: TimelineRow[];
  currentIndex: number;
  nextIndex: number;
  remainingMinutes: number;
  idlePointer: {
    timeStr: string;
    timeMinutes: number;
    afterIndex: number;
  } | null;
  dayState: 'before_wake' | 'active' | 'after_bedtime';
}

export function timeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  return h * 60 + m;
}

export function minutesToTime(m: number): string {
  const norm = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const min = norm % 60;
  return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

export function computeTimelineState(
  rawSchedule: ScheduleItem[],
  nowMinutes: number,
  wakeTimeStr = '07:00',
  bedTimeStr = '23:00'
): TimelineState {
  const wakeMin = timeToMinutes(wakeTimeStr);
  const bedMin = timeToMinutes(bedTimeStr);

  // 1. Filter core activity items (meal and workout) between wake and bed
  const activityItems = (rawSchedule || [])
    .filter((it) => it.type === 'meal' || it.type === 'workout')
    .sort((a, b) => a.start.localeCompare(b.start));

  const rows: TimelineRow[] = [];

  // Top Wake row
  rows.push({
    id: 'row-wake',
    kind: 'wake',
    start: wakeTimeStr,
    end: wakeTimeStr,
    startMinutes: wakeMin,
    endMinutes: wakeMin,
    label: `ตื่น ${wakeTimeStr}`,
    type: 'sleep',
    status: nowMinutes >= wakeMin ? 'past' : 'upcoming',
  });

  let lastEndMin = wakeMin;

  // Insert activities and gaps
  activityItems.forEach((act, idx) => {
    const sMin = timeToMinutes(act.start);
    const eMin = timeToMinutes(act.end);

    // If there is a gap > 15 mins between last activity and this one
    if (sMin - lastEndMin >= 15) {
      rows.push({
        id: `gap-${idx}`,
        kind: 'free',
        start: minutesToTime(lastEndMin),
        end: minutesToTime(sMin),
        startMinutes: lastEndMin,
        endMinutes: sMin,
        label: `ว่าง ${minutesToTime(lastEndMin)}-${minutesToTime(sMin)}`,
        type: 'free',
        status: 'upcoming',
      });
    }

    rows.push({
      id: `act-${idx}`,
      kind: 'activity',
      start: act.start,
      end: act.end,
      startMinutes: sMin,
      endMinutes: eMin,
      label: act.label,
      type: act.type,
      status: 'upcoming',
    });

    lastEndMin = Math.max(lastEndMin, eMin);
  });

  // Gap between last activity and bedtime
  if (bedMin - lastEndMin >= 15) {
    rows.push({
      id: 'gap-before-bed',
      kind: 'free',
      start: minutesToTime(lastEndMin),
      end: minutesToTime(bedMin),
      startMinutes: lastEndMin,
      endMinutes: bedMin,
      label: `ว่าง ${minutesToTime(lastEndMin)}-${minutesToTime(bedMin)}`,
      type: 'free',
      status: 'upcoming',
    });
  }

  // Bottom Bedtime row
  rows.push({
    id: 'row-bed',
    kind: 'bed',
    start: bedTimeStr,
    end: bedTimeStr,
    startMinutes: bedMin,
    endMinutes: bedMin,
    label: `เข้านอน ${bedTimeStr}`,
    type: 'sleep',
    status: nowMinutes >= bedMin ? 'past' : 'upcoming',
  });

  // 2. Compute state against nowMinutes
  let dayState: 'before_wake' | 'active' | 'after_bedtime' = 'active';
  if (nowMinutes < wakeMin) {
    dayState = 'before_wake';
  } else if (nowMinutes >= bedMin) {
    dayState = 'after_bedtime';
  }

  let currentIndex = -1;
  let remainingMinutes = 0;
  let idlePointer: TimelineState['idlePointer'] = null;

  rows.forEach((row, idx) => {
    if (row.kind === 'wake') {
      row.status = nowMinutes >= row.startMinutes ? 'past' : 'upcoming';
      return;
    }
    if (row.kind === 'bed') {
      row.status = nowMinutes >= row.startMinutes ? 'past' : 'upcoming';
      return;
    }

    if (nowMinutes >= row.endMinutes) {
      row.status = 'past';
    } else if (nowMinutes >= row.startMinutes && nowMinutes < row.endMinutes) {
      row.status = 'current';
      currentIndex = idx;
      const dur = row.endMinutes - row.startMinutes;
      const elapsed = nowMinutes - row.startMinutes;
      row.progressPercent = dur > 0 ? Math.round((elapsed / dur) * 100) : 0;
      row.remainingMinutes = row.endMinutes - nowMinutes;
      remainingMinutes = row.remainingMinutes;

      if (row.kind === 'free') {
        idlePointer = {
          timeStr: minutesToTime(nowMinutes),
          timeMinutes: nowMinutes,
          afterIndex: idx,
        };
      }
    } else {
      row.status = 'upcoming';
    }
  });

  // Find next activity (only among activity/bed rows)
  let nextIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].status === 'upcoming' && (rows[i].kind === 'activity' || rows[i].kind === 'bed')) {
      nextIndex = i;
      break;
    }
  }

  return {
    rows,
    currentIndex,
    nextIndex,
    remainingMinutes,
    idlePointer,
    dayState,
  };
}
