import { useState } from 'react';
import exerciseGifs from '../lib/exerciseGifs.json';
import { FemaleAthleteVisual } from './FemaleAthleteVisual';

export interface ExerciseVisualProps {
  exerciseId: string;
  name_en?: string;
  frame?: 0 | 1;
  animated?: boolean;
  gender?: 'male' | 'female';
}

// 50 female exercises from the female workout program
const FEMALE_EXERCISE_SET = new Set([
  'Barbell_Hip_Thrust', 'Dumbbell_Romanian_Deadlift', 'Goblet_Squat', 'Cable_Glute_Kickback',
  'Cable_Pull-Through', 'Smith_Machine_Squat', 'Leg_Press', 'Seated_Hip_Abductor',
  'Seated_Hip_Adductor', 'Dumbbell_Walking_Lunges', 'Lying_Leg_Curl', 'Dumbbell_Step-Up',
  'Lat_Pulldown', 'Seated_Cable_Row', 'Dumbbell_Single-Arm_Row', 'Shoulder_Press',
  'Dumbbell_Lateral_Raise', 'Cable_Face_Pull', 'Incline_Dumbbell_Chest_Press',
  'Dumbbell_Bicep_Curl', 'Overhead_Dumbbell_Tricep_Extension', 'Cable_Tricep_Pushdown',
  'Cable_Rope_Crunch', 'Kettlebell_Swing', 'Banded_Lateral_Walk', 'Glute_Bridge',
  'Single-Leg_Glute_Bridge', 'Single_Leg_Glute_Bridge', 'Donkey_Kicks', 'Fire_Hydrants',
  'Frog_Pumps', 'Sumo_Squat', 'Curtsy_Lunge', 'Wall_Sit', 'Reverse_Lunges', 'Clamshells',
  'Knee_Push-up', 'Incline_Push-up', 'Shoulder_Taps', 'Superman_Hold', 'Bird_Dog',
  'Plank', 'Forearm_Plank', 'Side_Plank', 'Side_Plank_Dip', 'Dead_Bug', 'Flutter_Kicks',
  'Scissor_Kicks', 'Crunches', 'Russian_Twist', 'Standing_Side_Leg_Raise', 'Skater_Hops',
  'Butt_Kicks'
]);

// Dedicated 3D female anatomical GIF assets (360x360 GymVisual original renders)
const FEMALE_3D_HIGHRES: Record<string, string> = {
  Barbell_Hip_Thrust: '3236',
  'Barbell Hip Thrust': '3236',
  Hip_Thrust: '3236',
  Dumbbell_Single_Arm_Row: '2327',
  'Dumbbell_Single-Arm_Row': '2327',
  'Dumbbell Single-Arm Row': '2327',
  Lat_Pulldown: '2800',
  'Lat Pulldown': '2800',
};

export function ExerciseVisual({ exerciseId, name_en, gender }: ExerciseVisualProps) {
  const [loadError, setLoadError] = useState(false);

  // Check if this exercise belongs to female program or user is female
  const isFemale = gender === 'female' || FEMALE_EXERCISE_SET.has(exerciseId);

  // Female mode: Render real 3D anatomical female models
  if (isFemale) {
    const femaleById = (exerciseGifs as any).femaleById || {};
    const femaleByName = (exerciseGifs as any).femaleByName || {};

    const highResId = FEMALE_3D_HIGHRES[exerciseId] || (name_en ? FEMALE_3D_HIGHRES[name_en] : undefined);

    let femaleGif = highResId
      ? `${highResId}`
      : (femaleById[exerciseId] || (name_en ? femaleByName[name_en] : undefined));

    if (!femaleGif) {
      const norm = (exerciseId || '').replace(/_/g, ' ').toLowerCase();
      for (const [key, id] of Object.entries(femaleByName)) {
        if (key.toLowerCase().includes(norm) || norm.includes(key.toLowerCase())) {
          femaleGif = id as string;
          break;
        }
      }
    }

    if (!femaleGif) {
      femaleGif = 'female_51';
    }

    // Determine the source path:
    // If high-res, /exercises/{id}.gif
    // Else /exercises/female/{id}.gif (or fallback /exercises/{id}.gif)
    const src = highResId
      ? `/exercises/${highResId}.gif`
      : `/exercises/female/${femaleGif}.gif`;

    if (loadError) {
      return (
        <div className="move-gif-stage">
          <FemaleAthleteVisual exerciseId={exerciseId} name_en={name_en} />
        </div>
      );
    }

    return (
      <div className="move-gif-stage">
        <img
          src={src}
          alt={name_en || exerciseId}
          className="move-gif-image"
          loading="eager"
          onError={() => setLoadError(true)}
        />
      </div>
    );
  }

  // Male mode: Look up GymVisual male anatomical 3D GIF
  const byId = exerciseGifs.byId as Record<string, string>;
  const byName = exerciseGifs.byName as Record<string, string>;

  let gifId: string | undefined = byId[exerciseId] || (name_en ? byName[name_en] : undefined);

  if (!gifId) {
    const norm = (exerciseId || '').replace(/_/g, ' ').toLowerCase();
    for (const [key, id] of Object.entries(byName)) {
      if (key.toLowerCase().includes(norm) || norm.includes(key.toLowerCase())) {
        gifId = id;
        break;
      }
    }
  }

  if (!gifId) {
    gifId = '0025';
  }

  const localSrc = `/exercises/${gifId}.gif`;
  const cdnSrc = `${exerciseGifs.cdnBase}${gifId}.gif`;

  return (
    <div className="move-gif-stage">
      <img
        src={loadError ? cdnSrc : localSrc}
        alt={name_en || exerciseId}
        className="move-gif-image"
        loading="eager"
        onError={() => {
          if (!loadError) setLoadError(true);
        }}
      />
    </div>
  );
}
