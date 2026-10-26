import { describe, it, expect } from 'vitest';
import { computeTimelineState, timeToMinutes } from './timeline.util';
import { ScheduleItem } from '../../core/models';

const mockSchedule: ScheduleItem[] = [
  { start: '00:00', end: '07:00', label: 'เวลานอนหลับพักผ่อน', type: 'sleep' },
  { start: '08:00', end: '08:45', label: 'อาหารมื้อเช้า', type: 'meal' },
  { start: '12:30', end: '13:15', label: 'อาหารมื้อกลางวัน', type: 'meal' },
  { start: '17:30', end: '18:30', label: 'ออกกำลังกายประจำวัน', type: 'workout' },
  { start: '18:30', end: '19:15', label: 'อาหารมื้อเย็น', type: 'meal' },
  { start: '22:30', end: '23:00', label: 'เตรียมตัวเข้านอน', type: 'sleep' },
];

describe('computeTimelineState (UI_PLAN Section 5.5)', () => {
  it('1. ก่อนตื่น: 06:00 -> dayState = before_wake', () => {
    const res = computeTimelineState(mockSchedule, timeToMinutes('06:00'), '07:00', '23:00');
    expect(res.dayState).toBe('before_wake');
    expect(res.currentIndex).toBe(-1);
    expect(res.rows[0].kind).toBe('wake');
    expect(res.rows[0].status).toBe('upcoming');
  });

  it('2. ในกิจกรรม: 08:20 (ในมื้อเช้า 08:00-08:45) -> current activity', () => {
    const res = computeTimelineState(mockSchedule, timeToMinutes('08:20'), '07:00', '23:00');
    expect(res.dayState).toBe('active');
    expect(res.currentIndex).toBeGreaterThan(-1);
    const curr = res.rows[res.currentIndex];
    expect(curr.label).toBe('อาหารมื้อเช้า');
    expect(curr.status).toBe('current');
    expect(res.remainingMinutes).toBe(25); // 08:45 - 08:20 = 25
  });

  it('3. ในช่วงว่าง: 15:00 (ว่างระหว่าง 13:15-17:30) -> idlePointer is set', () => {
    const res = computeTimelineState(mockSchedule, timeToMinutes('15:00'), '07:00', '23:00');
    expect(res.dayState).toBe('active');
    expect(res.idlePointer).not.toBeNull();
    expect(res.idlePointer?.timeStr).toBe('15:00');
  });

  it('4. รอยต่อพอดีที่เวลาเริ่ม: 17:30 (เริ่มออกกำลังกาย)', () => {
    const res = computeTimelineState(mockSchedule, timeToMinutes('17:30'), '07:00', '23:00');
    const curr = res.rows[res.currentIndex];
    expect(curr.label).toBe('ออกกำลังกายประจำวัน');
    expect(curr.status).toBe('current');
    expect(curr.remainingMinutes).toBe(60);
  });

  it('5. รอยต่อพอดีที่เวลาสิ้นสุด: 18:30 (จบออกกำลังกาย เข้ามื้อเย็น)', () => {
    const res = computeTimelineState(mockSchedule, timeToMinutes('18:30'), '07:00', '23:00');
    const curr = res.rows[res.currentIndex];
    expect(curr.label).toBe('อาหารมื้อเย็น');
    expect(curr.status).toBe('current');
  });

  it('6. หลังเวลานอน: 23:30 -> dayState = after_bedtime', () => {
    const res = computeTimelineState(mockSchedule, timeToMinutes('23:30'), '07:00', '23:00');
    expect(res.dayState).toBe('after_bedtime');
    expect(res.rows[res.rows.length - 1].status).toBe('past');
  });

  it('7. วันที่ไม่มีกิจกรรม -> มีแถวตื่นและนอน และช่วงว่าง', () => {
    const res = computeTimelineState([], timeToMinutes('10:00'), '07:00', '23:00');
    expect(res.rows.length).toBe(3); // wake, free, bed
    expect(res.rows[0].kind).toBe('wake');
    expect(res.rows[2].kind).toBe('bed');
  });
});
