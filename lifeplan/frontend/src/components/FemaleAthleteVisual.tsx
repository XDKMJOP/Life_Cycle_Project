import React from 'react';

export type FemalePoseCategory =
  | 'squat'
  | 'lunge'
  | 'donkey_kick'
  | 'fire_hydrant'
  | 'glute_thrust'
  | 'press'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'row'
  | 'bird_dog'
  | 'plank'
  | 'crunch'
  | 'cardio'
  | 'machine';

export function getFemalePoseCategory(exerciseId: string): FemalePoseCategory {
  const id = exerciseId.toLowerCase();

  if (id.includes('squat')) return 'squat';
  if (id.includes('lunge') || id.includes('step_up')) return 'lunge';
  if (id.includes('donkey_kick') || id.includes('kickback')) return 'donkey_kick';
  if (
    id.includes('fire_hydrant') ||
    id.includes('clamshell') ||
    id.includes('abductor') ||
    id.includes('adductor') ||
    id.includes('side_leg_raise') ||
    id.includes('lateral_walk')
  ) {
    return 'fire_hydrant';
  }
  if (id.includes('hip_thrust') || id.includes('glute_bridge') || id.includes('frog_pump')) {
    return 'glute_thrust';
  }
  if (id.includes('chest_press') || id.includes('push_up') || id.includes('pushup')) {
    return 'press';
  }
  if (id.includes('shoulder') || id.includes('lateral_raise') || id.includes('face_pull')) {
    return 'shoulders';
  }
  if (id.includes('bicep') || id.includes('curl')) return 'biceps';
  if (id.includes('tricep')) return 'triceps';
  if (id.includes('row') || id.includes('pulldown')) return 'row';
  if (id.includes('bird_dog') || id.includes('superman')) return 'bird_dog';
  if (id.includes('plank')) return 'plank';
  if (
    id.includes('crunch') ||
    id.includes('twist') ||
    id.includes('dead_bug') ||
    id.includes('flutter') ||
    id.includes('scissor') ||
    id.includes('leg_raise')
  ) {
    return 'crunch';
  }
  if (id.includes('swing') || id.includes('hop') || id.includes('butt_kick') || id.includes('cardio') || id.includes('jumping')) {
    return 'cardio';
  }
  if (id.includes('leg_press') || id.includes('leg_curl') || id.includes('wall_sit')) {
    return 'machine';
  }

  return 'squat';
}

interface FemaleAthleteVisualProps {
  exerciseId: string;
  name_en?: string;
  category?: FemalePoseCategory;
}

export const FemaleAthleteVisual: React.FC<FemaleAthleteVisualProps> = ({
  exerciseId,
  name_en: _name_en,
  category: forcedCategory,
}) => {
  const category = forcedCategory || getFemalePoseCategory(exerciseId);

  return (
    <div className="female-athlete-card">
      <style>{`
        .female-athlete-card {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        .female-athlete-svg {
          width: 100%;
          height: 100%;
          max-width: 250px;
          max-height: 250px;
          display: block;
        }

        /* Biomechanical Animation Loops */
        @keyframes female-squat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(28px); }
        }
        @keyframes female-squat-legs {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.72); }
        }
        @keyframes female-lunge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(24px); }
        }
        @keyframes female-kick {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-34deg); }
        }
        @keyframes female-hydrant {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-24deg); }
        }
        @keyframes female-thrust {
          0%, 100% { transform: translateY(18px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes female-press {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-24px); }
        }
        @keyframes female-shoulders {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-26px); }
        }
        @keyframes female-curl {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-68deg); }
        }
        @keyframes female-cardio {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-14px) rotate(-2deg); }
          75% { transform: translateY(-14px) rotate(2deg); }
        }
        @keyframes muscle-pulse {
          0%, 100% { fill-opacity: 0.75; filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.4)); }
          50% { fill-opacity: 0.98; filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.85)); }
        }

        .anim-f-squat {
          animation: female-squat 2.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .anim-f-squat-legs {
          animation: female-squat-legs 2.2s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .anim-f-lunge {
          animation: female-lunge 2.4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .anim-f-kick {
          animation: female-kick 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 155px 125px;
        }
        .anim-f-hydrant {
          animation: female-hydrant 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-origin: 155px 125px;
        }
        .anim-f-thrust {
          animation: female-thrust 2.4s ease-in-out infinite;
          transform-origin: 110px 145px;
        }
        .anim-f-press {
          animation: female-press 2.2s ease-in-out infinite;
          transform-origin: center;
        }
        .anim-f-shoulders {
          animation: female-shoulders 2.2s ease-in-out infinite;
          transform-origin: center;
        }
        .anim-f-curl {
          animation: female-curl 2.2s ease-in-out infinite;
          transform-origin: 115px 105px;
        }
        .anim-f-cardio {
          animation: female-cardio 1.4s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .highlight-muscle {
          fill: #ef4444;
          animation: muscle-pulse 2.2s ease-in-out infinite;
        }
      `}</style>

      <svg className="female-athlete-svg" viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Anatomical Shading for Athletic Female Form */}
          <linearGradient id="fSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fae0d4" />
            <stop offset="100%" stopColor="#f3c4b2" />
          </linearGradient>
          <linearGradient id="fTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2c2c34" />
            <stop offset="100%" stopColor="#1e1e24" />
          </linearGradient>
          <linearGradient id="fTights" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#1f2937" />
          </linearGradient>
          <linearGradient id="fHair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a2e2b" />
            <stop offset="100%" stopColor="#1f1816" />
          </linearGradient>
          <linearGradient id="fMetal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {/* Studio Floor Line */}
        <line x1="30" y1="178" x2="250" y2="178" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />

        {/* ========================================================
            POSE 1: SQUAT (Goblet Squat, Sumo Squat, Machine)
            ======================================================== */}
        {(category === 'squat' || category === 'machine') && (
          <g className="anim-f-squat">
            {/* Dumbbell held at chest */}
            <g transform="translate(130, 84)">
              <rect x="-14" y="-3" width="28" height="6" rx="2" fill="url(#fMetal)" />
              <rect x="-18" y="-7" width="6" height="14" rx="2" fill="#475569" />
              <rect x="12" y="-7" width="6" height="14" rx="2" fill="#475569" />
            </g>

            {/* Ponytail */}
            <path d="M142 42 C158 36, 172 45, 176 60 C174 62, 162 55, 142 48 Z" fill="url(#fHair)" />
            <circle cx="142" cy="44" r="3.5" fill="#f43f5e" />

            {/* Head & Neck */}
            <circle cx="130" cy="45" r="14" fill="url(#fSkin)" stroke="#334155" strokeWidth="1" />
            <path d="M127 58 L127 68 L133 68 L133 58 Z" fill="url(#fSkin)" />

            {/* Sports Bra */}
            <path d="M120 68 C118 78, 118 90, 122 92 C126 94, 134 94, 138 92 C142 90, 142 78, 140 68 Z" fill="url(#fTop)" stroke="#111827" strokeWidth="1" />
            <path d="M125 68 L126 76 M135 68 L134 76" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Slender Arms holding weight */}
            <path d="M119 72 C114 80, 114 90, 126 88" stroke="url(#fSkin)" strokeWidth="6" strokeLinecap="round" />
            <path d="M141 72 C146 80, 146 90, 134 88" stroke="url(#fSkin)" strokeWidth="6" strokeLinecap="round" />

            {/* Waist */}
            <path d="M123 92 L124 99 L136 99 L137 92 Z" fill="url(#fSkin)" />

            {/* Athletic Tights with Muscle Activation */}
            <g className="anim-f-squat-legs">
              {/* Pelvis & Glutes with Highlighted Red Muscle */}
              <path d="M120 99 C118 108, 119 116, 123 118 C127 120, 133 120, 137 118 C141 116, 142 108, 140 99 Z" fill="url(#fTights)" />
              {/* Highlighted Glute Activation */}
              <path className="highlight-muscle" d="M122 105 C124 112, 126 116, 127 118 C128 116, 128 110, 126 105 Z" />
              <path className="highlight-muscle" d="M138 105 C136 112, 134 116, 133 118 C132 116, 132 110, 134 105 Z" />

              {/* Legs */}
              <path d="M123 117 C116 130, 114 148, 117 165" stroke="url(#fTights)" strokeWidth="9" strokeLinecap="round" />
              <path d="M137 117 C144 130, 146 148, 143 165" stroke="url(#fTights)" strokeWidth="9" strokeLinecap="round" />

              {/* Highlighted Quad Muscles */}
              <path className="highlight-muscle" d="M117 126 C115 136, 115 146, 116 150 C118 146, 119 136, 119 126 Z" />
              <path className="highlight-muscle" d="M143 126 C145 136, 145 146, 144 150 C142 146, 141 136, 141 126 Z" />

              {/* Athletic Shoes */}
              <rect x="110" y="165" width="13" height="8" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <rect x="109" y="171" width="15" height="3" rx="1.5" fill="#f43f5e" />
              <rect x="137" y="165" width="13" height="8" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <rect x="136" y="171" width="15" height="3" rx="1.5" fill="#f43f5e" />
            </g>
          </g>
        )}

        {/* ========================================================
            POSE 2: LUNGE (Walking, Curtsy, Reverse, Step-Up)
            ======================================================== */}
        {category === 'lunge' && (
          <g className="anim-f-lunge">
            <path d="M136 38 C148 30, 162 38, 168 50 C166 52, 154 46, 136 43 Z" fill="url(#fHair)" />
            <circle cx="136" cy="40" r="3.5" fill="#f43f5e" />

            <circle cx="126" cy="42" r="13" fill="url(#fSkin)" stroke="#334155" strokeWidth="1" />
            <path d="M123 54 L123 62 L129 62 L129 54 Z" fill="url(#fSkin)" />

            <path d="M118 62 C116 70, 117 80, 120 83 C124 85, 130 85, 134 83 C137 80, 138 70, 136 62 Z" fill="url(#fTop)" stroke="#111827" strokeWidth="1" />

            {/* Hands at hips holding dumbbells */}
            <path d="M117 66 C110 74, 110 82, 118 84" stroke="url(#fSkin)" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M137 66 C144 74, 144 82, 136 84" stroke="url(#fSkin)" strokeWidth="5.5" strokeLinecap="round" />

            <path d="M120 83 L121 89 L133 89 L134 83 Z" fill="url(#fSkin)" />
            <path d="M118 89 C115 98, 117 106, 122 108 C126 110, 132 110, 135 107 C138 105, 139 98, 136 89 Z" fill="url(#fTights)" />

            {/* Front & Back Lunge Legs */}
            <path d="M124 107 C122 122, 130 134, 130 152" stroke="url(#fTights)" strokeWidth="8.5" strokeLinecap="round" />
            <path d="M133 107 C146 122, 156 136, 168 152" stroke="url(#fTights)" strokeWidth="8" strokeLinecap="round" />

            {/* Highlighted Front Glute & Quad */}
            <circle className="highlight-muscle" cx="122" cy="112" r="4.5" />
            <path className="highlight-muscle" d="M124 122 C126 130, 128 136, 128 140 C126 136, 124 130, 124 122 Z" />

            <rect x="124" y="152" width="13" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            <rect x="123" y="157" width="15" height="3" rx="1.5" fill="#f43f5e" />
            <rect x="166" y="148" width="12" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            <rect x="165" y="153" width="14" height="3" rx="1.5" fill="#f43f5e" />
          </g>
        )}

        {/* ========================================================
            POSE 3: QUADRUPED (Donkey Kicks, Fire Hydrants)
            ======================================================== */}
        {(category === 'donkey_kick' || category === 'fire_hydrant') && (
          <g>
            <path d="M84 76 C76 68, 64 74, 58 84 C62 84, 72 80, 84 80 Z" fill="url(#fHair)" />
            <circle cx="86" cy="78" r="3" fill="#f43f5e" />
            <circle cx="94" cy="84" r="12" fill="url(#fSkin)" stroke="#334155" strokeWidth="1" />

            <path d="M104 88 C116 86, 138 86, 150 92 C148 99, 130 99, 108 97 Z" fill="url(#fTop)" stroke="#111827" strokeWidth="1" />

            <path d="M108 92 L105 132" stroke="url(#fSkin)" strokeWidth="6" strokeLinecap="round" />
            <path d="M116 92 L113 132" stroke="url(#fSkin)" strokeWidth="5" strokeLinecap="round" />
            <rect x="100" y="132" width="18" height="5" rx="2" fill="url(#fSkin)" />

            <path d="M140 90 C154 88, 166 94, 168 106 C166 114, 154 116, 142 108 Z" fill="url(#fTights)" />

            {/* Base Knee on Floor */}
            <path d="M148 106 L145 136" stroke="url(#fTights)" strokeWidth="8" strokeLinecap="round" />

            {/* Active Kicking Leg with Glute Highlight */}
            <g className={category === 'donkey_kick' ? 'anim-f-kick' : 'anim-f-hydrant'}>
              <path d="M164 104 C178 98, 192 102, 194 116" stroke="url(#fTights)" strokeWidth="8" strokeLinecap="round" />
              {/* Highlighted Target Glute Maximus */}
              <circle className="highlight-muscle" cx="166" cy="102" r="6" />

              <rect x="190" y="114" width="12" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <rect x="189" y="119" width="14" height="2.5" rx="1" fill="#f43f5e" />
            </g>
          </g>
        )}

        {/* ========================================================
            POSE 4: HIP THRUST / GLUTE BRIDGE
            ======================================================== */}
        {category === 'glute_thrust' && (
          <g>
            {/* Supporting Gym Bench */}
            <rect x="52" y="100" width="45" height="35" rx="4" fill="#64748b" />
            <rect x="50" y="96" width="49" height="7" rx="3" fill="#1e293b" />

            {/* Head on Bench */}
            <circle cx="82" cy="90" r="12" fill="url(#fSkin)" stroke="#334155" strokeWidth="1" />
            <path d="M86 86 C96 82, 104 88, 108 98 Z" fill="url(#fHair)" />

            <g className="anim-f-thrust">
              <path d="M92 98 C104 102, 122 105, 134 108 C132 116, 114 114, 98 108 Z" fill="url(#fTop)" stroke="#111827" strokeWidth="1" />
              <path d="M128 107 C142 109, 156 114, 158 126 C152 134, 138 132, 126 120 Z" fill="url(#fTights)" />

              {/* Highlighted Glute Peak */}
              <circle className="highlight-muscle" cx="146" cy="116" r="6.5" />

              <path d="M154 124 C164 135, 168 146, 168 162" stroke="url(#fTights)" strokeWidth="8.5" strokeLinecap="round" />

              {/* Barbell across hips */}
              <g transform="translate(142, 112)">
                <rect x="-18" y="-3" width="36" height="6" rx="2" fill="url(#fMetal)" />
                <rect x="-24" y="-8" width="7" height="16" rx="2" fill="#ef4444" />
                <rect x="17" y="-8" width="7" height="16" rx="2" fill="#ef4444" />
              </g>

              <rect x="162" y="162" width="14" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <rect x="161" y="167" width="16" height="3" rx="1.5" fill="#f43f5e" />
            </g>
          </g>
        )}

        {/* ========================================================
            POSE 5: PRESS (Incline Dumbbell Press, Push-up)
            ======================================================== */}
        {category === 'press' && (
          <g>
            <line x1="80" y1="140" x2="160" y2="85" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />

            <circle cx="160" cy="80" r="12" fill="url(#fSkin)" stroke="#334155" strokeWidth="1" />
            <path d="M166 74 C176 72, 184 80, 186 90 Z" fill="url(#fHair)" />

            <path d="M152 88 L126 106 L120 114 L146 96 Z" fill="url(#fTop)" stroke="#111827" strokeWidth="1" />
            {/* Highlighted Chest Muscle */}
            <circle className="highlight-muscle" cx="138" cy="98" r="5" />

            <path d="M124 107 L102 122 L98 132 L120 116 Z" fill="url(#fTights)" />
            <path d="M102 124 L96 156" stroke="url(#fTights)" strokeWidth="8" strokeLinecap="round" />
            <rect x="90" y="154" width="14" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />

            <g className="anim-f-press">
              <path d="M142 92 L146 64" stroke="url(#fSkin)" strokeWidth="6" strokeLinecap="round" />
              <g transform="translate(146, 60)">
                <rect x="-10" y="-3" width="20" height="6" rx="2" fill="url(#fMetal)" />
                <rect x="-14" y="-6" width="5" height="12" rx="2" fill="#ef4444" />
                <rect x="9" y="-6" width="5" height="12" rx="2" fill="#ef4444" />
              </g>
            </g>
          </g>
        )}

        {/* ========================================================
            POSE 6: SHOULDERS & ARMS (Shoulder Press, Curls, Lat Pull)
            ======================================================== */}
        {(category === 'shoulders' || category === 'biceps' || category === 'triceps' || category === 'row') && (
          <g>
            <circle cx="140" cy="45" r="14" fill="url(#fSkin)" stroke="#334155" strokeWidth="1" />
            <path d="M152 42 C168 36, 180 46, 184 60 C180 62, 170 54, 152 48 Z" fill="url(#fHair)" />
            <circle cx="152" cy="44" r="3.5" fill="#f43f5e" />

            <path d="M130 68 C128 78, 128 90, 132 92 C136 94, 144 94, 148 92 C152 90, 152 78, 150 68 Z" fill="url(#fTop)" stroke="#111827" strokeWidth="1" />

            {/* Highlighted Shoulders/Biceps */}
            <circle className="highlight-muscle" cx="127" cy="72" r="4.5" />
            <circle className="highlight-muscle" cx="153" cy="72" r="4.5" />

            <g className={category === 'biceps' ? 'anim-f-curl' : 'anim-f-shoulders'}>
              <path d="M129 72 C120 76, 114 84, 114 96" stroke="url(#fSkin)" strokeWidth="6" strokeLinecap="round" />
              <path d="M151 72 C160 76, 166 84, 166 96" stroke="url(#fSkin)" strokeWidth="6" strokeLinecap="round" />

              <g transform="translate(114, 96)">
                <rect x="-8" y="-3" width="16" height="6" rx="2" fill="url(#fMetal)" />
                <rect x="-12" y="-6" width="5" height="12" rx="2" fill="#ef4444" />
                <rect x="7" y="-6" width="5" height="12" rx="2" fill="#ef4444" />
              </g>
              <g transform="translate(166, 96)">
                <rect x="-8" y="-3" width="16" height="6" rx="2" fill="url(#fMetal)" />
                <rect x="-12" y="-6" width="5" height="12" rx="2" fill="#ef4444" />
                <rect x="7" y="-6" width="5" height="12" rx="2" fill="#ef4444" />
              </g>
            </g>

            <path d="M130 99 C128 108, 129 116, 133 118 C137 120, 143 120, 147 118 C151 116, 152 108, 150 99 Z" fill="url(#fTights)" />
            <path d="M133 118 L131 165" stroke="url(#fTights)" strokeWidth="8.5" strokeLinecap="round" />
            <path d="M147 118 L149 165" stroke="url(#fTights)" strokeWidth="8.5" strokeLinecap="round" />

            <rect x="124" y="165" width="13" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            <rect x="123" y="170" width="15" height="3" rx="1.5" fill="#f43f5e" />
            <rect x="145" y="165" width="13" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            <rect x="144" y="170" width="15" height="3" rx="1.5" fill="#f43f5e" />
          </g>
        )}

        {/* ========================================================
            POSE 7: CARDIO / DYNAMIC (Kettlebell Swing, Skater Hops)
            ======================================================== */}
        {(category === 'cardio' || category === 'bird_dog' || category === 'crunch' || category === 'plank') && (
          <g className="anim-f-cardio">
            <path d="M146 36 C162 26, 178 34, 184 48 C180 50, 168 44, 146 41 Z" fill="url(#fHair)" />
            <circle cx="146" cy="38" r="3.5" fill="#f43f5e" />

            <circle cx="136" cy="42" r="13" fill="url(#fSkin)" stroke="#334155" strokeWidth="1" />
            <path d="M128 62 C125 72, 126 82, 130 84 C134 86, 142 86, 146 84 C149 82, 150 72, 147 62 Z" fill="url(#fTop)" stroke="#111827" strokeWidth="1" />

            {/* Highlighted Abs Core Target */}
            <circle className="highlight-muscle" cx="137" cy="74" r="5" />

            <path d="M127 66 C116 74, 114 86, 124 94" stroke="url(#fSkin)" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M147 66 C158 74, 160 86, 150 94" stroke="url(#fSkin)" strokeWidth="5.5" strokeLinecap="round" />

            <path d="M128 84 C125 94, 126 102, 132 104 C136 106, 144 106, 147 103 C150 101, 151 94, 147 84 Z" fill="url(#fTights)" />
            <path d="M132 104 C126 116, 124 136, 134 154" stroke="url(#fTights)" strokeWidth="8" strokeLinecap="round" />
            <path d="M146 104 C158 116, 162 130, 158 142" stroke="url(#fTights)" strokeWidth="8" strokeLinecap="round" />

            <rect x="128" y="154" width="13" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            <rect x="127" y="159" width="15" height="3" rx="1.5" fill="#f43f5e" />
            <rect x="154" y="140" width="12" height="7" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
            <rect x="153" y="145" width="14" height="2.5" rx="1" fill="#f43f5e" />
          </g>
        )}
      </svg>
    </div>
  );
};
export default FemaleAthleteVisual;
