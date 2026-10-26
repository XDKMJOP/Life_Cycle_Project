import { useMemo, useState } from 'react';

export interface PlanDayProgress {
  id: number;
  dayNo: number;
  focus: string;
  isRest: boolean;
  totalKcal?: number;
  totalProteinG?: number;
  burnedKcal?: number;
  completedAt?: string | null;
}

export interface ProgressViewProps {
  days: PlanDayProgress[];
  targetDailyKcal?: number;
  onSelectDay: (dayNo: number) => void;
  onToggleComplete: (dayNo: number) => void;
}

export function ProgressView({
  days,
  targetDailyKcal = 2000,
  onSelectDay,
  onToggleComplete,
}: ProgressViewProps) {
  const [selectedDayNo, setSelectedDayNo] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'week'>('all');
  const [chartType, setChartType] = useState<'bars' | 'trend'>('bars');

  // Completed days
  const completedDays = useMemo(() => {
    return days.filter((d) => d.completedAt !== null && d.completedAt !== undefined);
  }, [days]);

  // Total Burned Calories from completed days
  const totalBurnedKcal = useMemo(() => {
    return completedDays.reduce((sum, d) => sum + (d.burnedKcal || 300), 0);
  }, [completedDays]);

  // Total Planned Burn across all 30 days
  const totalPlanBurnKcal = useMemo(() => {
    return days.reduce((sum, d) => sum + (d.burnedKcal || 300), 0);
  }, [days]);

  // Completion percentage
  const totalDaysCount = days.length || 30;
  const completionPercent = totalDaysCount > 0
    ? Math.round((completedDays.length / totalDaysCount) * 100)
    : 0;

  // Estimated fat loss in grams (approx 7,700 kcal = 1 kg fat)
  const fatGramsBurned = Math.round((totalBurnedKcal / 7700) * 1000);

  // Average daily burn per active completed day
  const avgBurnPerDay = completedDays.length > 0
    ? Math.round(totalBurnedKcal / completedDays.length)
    : 0;

  // Streak calculation (consecutive completed days from day 1)
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (const d of days) {
      if (d.completedAt) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [days]);

  // Filtered days for graph display
  const displayedDays = useMemo(() => {
    if (filterMode === 'completed') {
      return completedDays.length > 0 ? completedDays : days.slice(0, 7);
    }
    if (filterMode === 'week') {
      // Find current active week or first 7 days
      return days.slice(0, 7);
    }
    return days;
  }, [days, completedDays, filterMode]);

  // Max burned kcal for bar height scaling (default ceiling 500)
  const maxBurnValue = useMemo(() => {
    const maxVal = Math.max(...days.map((d) => d.burnedKcal || 300), 500);
    return Math.ceil(maxVal / 100) * 100;
  }, [days]);

  // Selected day object
  const activeSelectedDay = useMemo(() => {
    return days.find((d) => d.dayNo === selectedDayNo) || days[0] || null;
  }, [days, selectedDayNo]);

  return (
    <div className="progress-container">
      {/* 1. Main Cumulative Calorie & Health Stat Card */}
      <div className="glass-card stat-summary-card">
        <div className="glass-card-header">
          <span>สถิติการเผาผลาญและความคืบหน้า</span>
          <span className="status-pill completed">
            สำเร็จ {completedDays.length}/{totalDaysCount} วัน ({completionPercent}%)
          </span>
        </div>

        {/* Big Metric Display */}
        <div className="burn-hero-box">
          <div className="burn-hero-label">แคลอรี่โดยรวมที่ถูกเบิร์นไปแล้ว</div>
          <div className="burn-hero-number">
            {totalBurnedKcal.toLocaleString()}
            <span className="burn-hero-unit"> kcal</span>
          </div>
          <div className="burn-hero-sub">
            เป้าหมายแผน 30 วัน: {totalPlanBurnKcal.toLocaleString()} kcal (ทำได้แล้ว {completionPercent}%)
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(2, completionPercent))}%` }}
            />
          </div>
        </div>

        {/* 4-Box Key Stats Grid */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '16px' }}>
          <div className="stat-box">
            <div className="stat-num">~{fatGramsBurned} กรัม</div>
            <div className="stat-label">เทียบเท่าการลดไขมันสะสม</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{currentStreak} วัน</div>
            <div className="stat-label">ความต่อเนื่อง (Streak)</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{avgBurnPerDay > 0 ? `${avgBurnPerDay} kcal` : '-'}</div>
            <div className="stat-label">เฉลี่ยต่อวันที่ออกกำลังกาย</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{totalDaysCount - completedDays.length} วัน</div>
            <div className="stat-label">วันที่เหลือตามเป้าหมาย</div>
          </div>
        </div>
      </div>

      {/* 2. Daily Calorie Graph Section */}
      <div className="glass-card">
        <div className="glass-card-header" style={{ marginBottom: '8px' }}>
          <span>กราฟการเผาผลาญรายวัน</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`status-pill ${chartType === 'bars' ? 'completed' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setChartType('bars')}
            >
              กราฟแท่งรายวัน
            </button>
            <button
              type="button"
              className={`status-pill ${chartType === 'trend' ? 'completed' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setChartType('trend')}
            >
              กราฟเส้นสะสม
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="graph-filter-tabs">
          <button
            type="button"
            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            30 วันทั้งหมด
          </button>
          <button
            type="button"
            className={`filter-btn ${filterMode === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterMode('completed')}
          >
            เฉพาะวันที่ทำเสร็จ ({completedDays.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterMode === 'week' ? 'active' : ''}`}
            onClick={() => setFilterMode('week')}
          >
            7 วันแรก
          </button>
        </div>

        <div className="chart-wrapper">
          {chartType === 'bars' ? (
            /* Bar Chart SVG */
            <div className="svg-chart-container">
              <svg viewBox={`0 0 ${displayedDays.length * 36 + 60} 220`} className="responsive-chart-svg">
                {/* Horizontal Guide Lines */}
                <line x1="45" y1="30" x2={displayedDays.length * 36 + 50} y2="30" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                <text x="40" y="34" fill="rgba(234, 241, 228, 0.5)" fontSize="10" textAnchor="end">{maxBurnValue}</text>

                <line x1="45" y1="100" x2={displayedDays.length * 36 + 50} y2="100" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                <text x="40" y="104" fill="rgba(234, 241, 228, 0.5)" fontSize="10" textAnchor="end">{Math.round(maxBurnValue / 2)}</text>

                <line x1="45" y1="170" x2={displayedDays.length * 36 + 50} y2="170" stroke="rgba(255, 255, 255, 0.15)" />
                <text x="40" y="174" fill="rgba(234, 241, 228, 0.5)" fontSize="10" textAnchor="end">0</text>

                {/* Bars for each day */}
                {displayedDays.map((d, index) => {
                  const x = 55 + index * 36;
                  const burn = d.burnedKcal || 300;
                  const barHeight = Math.max(12, (burn / maxBurnValue) * 140);
                  const y = 170 - barHeight;
                  const isCompleted = Boolean(d.completedAt);
                  const isSelected = d.dayNo === selectedDayNo;

                  return (
                    <g
                      key={d.dayNo}
                      className="chart-bar-group"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedDayNo(d.dayNo)}
                    >
                      {/* Bar Background / Planned outline */}
                      <rect
                        x={x}
                        y={y}
                        width="24"
                        height={barHeight}
                        rx="6"
                        fill={isCompleted ? 'url(#barGradientCompleted)' : 'rgba(255, 255, 255, 0.06)'}
                        stroke={isSelected ? '#ffffff' : isCompleted ? '#22c55e' : 'rgba(255, 255, 255, 0.18)'}
                        strokeWidth={isSelected ? '2.5' : isCompleted ? '2.5' : '1'}
                      />

                      {/* Cap glow for completed bar */}
                      {isCompleted && (
                        <circle cx={x + 12} cy={y + 5} r="3.5" fill="#22c55e" stroke="#ffffff" strokeWidth="1.2" />
                      )}

                      {/* Day Label on X Axis */}
                      <text
                        x={x + 12}
                        y="192"
                        fill={isSelected ? '#ffffff' : isCompleted ? '#86efac' : 'rgba(234, 241, 228, 0.45)'}
                        fontSize="11"
                        textAnchor="middle"
                        fontWeight={isSelected || isCompleted ? 'bold' : 'normal'}
                      >
                        {d.dayNo}
                      </text>

                      {/* Value label on top of bar */}
                      <text
                        x={x + 12}
                        y={y - 6}
                        fill={isCompleted ? '#86efac' : 'rgba(234, 241, 228, 0.4)'}
                        fontSize="10"
                        fontWeight={isCompleted ? 'bold' : 'normal'}
                        textAnchor="middle"
                      >
                        {burn}
                      </text>
                    </g>
                  );
                })}

                {/* Gradients */}
                <defs>
                  <linearGradient id="barGradientCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="25%" stopColor="#166534" />
                    <stop offset="100%" stopColor="#14532d" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : (
            /* Cumulative Trend Line SVG */
            <div className="svg-chart-container">
              <svg viewBox="0 0 360 200" className="responsive-chart-svg">
                {/* Horizontal Guide Lines */}
                <line x1="40" y1="30" x2="340" y2="30" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                <text x="35" y="34" fill="rgba(234, 241, 228, 0.5)" fontSize="10" textAnchor="end">{totalPlanBurnKcal}</text>

                <line x1="40" y1="95" x2="340" y2="95" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                <text x="35" y="99" fill="rgba(234, 241, 228, 0.5)" fontSize="10" textAnchor="end">{Math.round(totalPlanBurnKcal / 2)}</text>

                <line x1="40" y1="160" x2="340" y2="160" stroke="rgba(255, 255, 255, 0.15)" />
                <text x="35" y="164" fill="rgba(234, 241, 228, 0.5)" fontSize="10" textAnchor="end">0</text>

                {/* Target Linear Projection Path */}
                <line x1="45" y1="160" x2="335" y2="30" stroke="rgba(168, 195, 160, 0.3)" strokeWidth="2" strokeDasharray="4 4" />

                {/* Actual Cumulative Burn Points */}
                {(() => {
                  let accum = 0;
                  const points: Array<{ x: number; y: number; val: number; dayNo: number }> = [];
                  points.push({ x: 45, y: 160, val: 0, dayNo: 0 });

                  for (let i = 0; i < Math.min(days.length, 30); i++) {
                    const d = days[i];
                    if (d.completedAt) {
                      accum += d.burnedKcal || 300;
                      const x = 45 + ((i + 1) / 30) * 290;
                      const y = 160 - (accum / Math.max(totalPlanBurnKcal, 1)) * 130;
                      points.push({ x, y, val: accum, dayNo: d.dayNo });
                    }
                  }

                  if (points.length <= 1) {
                    return (
                      <text x="180" y="100" fill="rgba(234, 241, 228, 0.5)" fontSize="12" textAnchor="middle">
                        บันทึกความคืบหน้ากิจกรรมวันแรก เพื่อเริ่มแสดงเส้นกราฟสะสม
                      </text>
                    );
                  }

                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaD = `${pathD} L ${points[points.length - 1].x} 160 L 45 160 Z`;

                  return (
                    <>
                      <path d={areaD} fill="rgba(20, 83, 45, 0.45)" />
                      <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                      {points.slice(1).map((p) => (
                        <circle key={p.dayNo} cx={p.x} cy={p.y} r="4.5" fill="#22c55e" stroke="#0d2819" strokeWidth="2" />
                      ))}
                    </>
                  );
                })()}

                <text x="50" y="180" fill="rgba(234, 241, 228, 0.5)" fontSize="10">วันเริ่มต้น</text>
                <text x="335" y="180" fill="rgba(234, 241, 228, 0.5)" fontSize="10" textAnchor="end">สิ้นสุด 30 วัน</text>
              </svg>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#14532d', border: '1.5px solid #22c55e' }} />
            <span style={{ color: '#86efac', fontWeight: 600 }}>เบิร์นสำเร็จแล้ว</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px dashed rgba(255, 255, 255, 0.3)', background: 'rgba(255, 255, 255, 0.05)' }} />
            <span>ประมาณการตามแผน</span>
          </div>
        </div>
      </div>

      {/* 3. Selected Day Inspector & Quick Action Card */}
      {activeSelectedDay && (
        <div className={`glass-card day-inspector-card ${activeSelectedDay.completedAt ? 'day-completed-card' : ''}`}>
          <div className="glass-card-header">
            <span>รายละเอียดวันที่ {activeSelectedDay.dayNo}</span>
            <span className={`status-pill ${activeSelectedDay.completedAt ? 'completed' : ''}`}>
              {activeSelectedDay.completedAt ? 'ทำเสร็จสิ้นแล้ว' : 'ยังไม่ได้บันทึก'}
            </span>
          </div>

          {activeSelectedDay.completedAt && (
            <div className="completed-day-banner">
              <span>ความคืบหน้าของวันนี้: บันทึกสำเร็จแล้ว</span>
              <span className="status-pill completed" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                เสร็จสมบูรณ์
              </span>
            </div>
          )}

          <h3 style={{ margin: '0 0 10px', color: activeSelectedDay.completedAt ? '#86efac' : 'var(--sage-strong)', fontSize: '1.15rem' }}>
            {activeSelectedDay.focus}
          </h3>

          <div className="stats-grid" style={{ margin: '10px 0 16px' }}>
            <div className="stat-box">
              <div className="stat-num">{activeSelectedDay.burnedKcal || 320}</div>
              <div className="stat-label">แคลอรี่ที่เบิร์น (kcal)</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{activeSelectedDay.totalKcal || targetDailyKcal}</div>
              <div className="stat-label">มื้ออาหารตามแผน (kcal)</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{activeSelectedDay.isRest ? 'วันพัก' : 'ฝึกซ้อม'}</div>
              <div className="stat-label">รูปแบบกิจกรรม</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={activeSelectedDay.completedAt ? 'btn-completed-toggle' : 'btn-primary'}
              style={{ flex: 1 }}
              onClick={() => onToggleComplete(activeSelectedDay.dayNo)}
            >
              {activeSelectedDay.completedAt ? 'ทำเสร็จสิ้นแล้ว (แตะเพื่อยกเลิก)' : 'ส่งความคืบหน้า (บันทึกว่าทำเสร็จ)'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ width: 'auto', padding: '0 16px' }}
              onClick={() => onSelectDay(activeSelectedDay.dayNo)}
            >
              ดูตารางวันนี้
            </button>
          </div>
        </div>
      )}

      {/* 4. Chronological Completion Activity Feed */}
      <div className="glass-card">
        <div className="glass-card-header">
          <span>ประวัติการทำกิจกรรมสำเร็จ</span>
          <span className={`status-pill ${completedDays.length > 0 ? 'completed' : ''}`}>
            {completedDays.length} รายการ
          </span>
        </div>

        {completedDays.length > 0 ? (
          <div className="history-list">
            {completedDays
              .slice()
              .reverse()
              .map((d) => (
                <div
                  key={d.dayNo}
                  className="item-card clickable-card history-completed-item"
                  onClick={() => onSelectDay(d.dayNo)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#86efac' }}>
                      วันที่ {d.dayNo}: {d.focus}
                    </div>
                    <span className="status-pill completed" style={{ fontSize: '0.75rem' }}>
                      +{d.burnedKcal || 320} kcal
                    </span>
                  </div>
                  <div className="item-card-desc" style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{d.isRest ? 'การฟื้นฟูร่างกาย' : 'การฝึกซ้อมและคุมอาหาร'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(234, 241, 228, 0.45)' }}>
                      {d.completedAt ? new Date(d.completedAt).toLocaleDateString('th-TH') : 'บันทึกแล้ว'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ยังไม่มีรายการที่บันทึกว่าทำเสร็จ
            <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'rgba(234, 241, 228, 0.4)' }}>
              สามารถกดบันทึกความคืบหน้าของแต่ละวันได้ที่แท็บ วันนี้
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
