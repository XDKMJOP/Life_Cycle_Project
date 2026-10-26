const http = require('http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers,
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

const post = (p, b, t) => request('POST', p, b, t);
const put = (p, b, t) => request('PUT', p, b, t);
const get = (p, t) => request('GET', p, null, t);

async function run() {
  console.log('=== 1. TESTING MALE PROFILE & 50-EXERCISE 30-DAY PROGRAM ===');
  const maleEmail = `male_${Date.now()}@test.com`;
  const regMale = await post('/auth/register', { email: maleEmail, password: 'password123' });
  const maleToken = regMale.data.token;
  console.log('Registered male user:', maleEmail);

  const profMaleRes = await put('/profile', {
    name: 'กิตติศักดิ์',
    sex: 'male',
    age: 26,
    heightCm: 178,
    weightKg: 74,
    activityLevel: 'moderate',
    goal: 'build_muscle',
    freeTime: 'evening',
    mealsPerDay: 3,
  }, maleToken);
  console.log('Saved male profile (BMR/TDEE/Target):', profMaleRes.data);

  const genMale = await post('/plan/generate', {}, maleToken);
  console.log('Male plan generate result:', genMale.data);

  const maleEqSet = new Set();
  const maleBodySet = new Set();
  let maleRestDays = 0;

  for (let d = 1; d <= 30; d++) {
    const dayRes = await get(`/plan/days/${d}`, maleToken);
    const c = dayRes.data?.content;
    if (c.is_rest) {
      maleRestDays++;
    } else {
      (c.workout_gym || []).forEach(w => maleEqSet.add(w.exercise_id));
      (c.workout_home || []).forEach(w => maleBodySet.add(w.exercise_id));
    }
  }

  console.log(`Male Plan - Workout Days: ${30 - maleRestDays}, Rest Days: ${maleRestDays}`);
  console.log(`Male Plan - Unique Gym Equipment Exercises cycled: ${maleEqSet.size}/25`);
  console.log(`Male Plan - Unique Bodyweight Exercises cycled: ${maleBodySet.size}/25`);
  console.log('Total unique exercises across male program:', maleEqSet.size + maleBodySet.size);

  console.log('\n=== 2. TESTING FEMALE PROFILE & 50-EXERCISE 30-DAY PROGRAM ===');
  const femaleEmail = `female_${Date.now()}@test.com`;
  const regFemale = await post('/auth/register', { email: femaleEmail, password: 'password123' });
  const femaleToken = regFemale.data.token;
  console.log('Registered female user:', femaleEmail);

  const profFemaleRes = await put('/profile', {
    name: 'พิมพ์ชนก',
    sex: 'female',
    age: 24,
    heightCm: 162,
    weightKg: 52,
    activityLevel: 'light',
    goal: 'lose_weight',
    freeTime: 'morning',
    mealsPerDay: 3,
  }, femaleToken);
  console.log('Saved female profile (BMR/TDEE/Target):', profFemaleRes.data);

  const genFemale = await post('/plan/generate', {}, femaleToken);
  console.log('Female plan generate result:', genFemale.data);

  const femaleEqSet = new Set();
  const femaleBodySet = new Set();
  let femaleRestDays = 0;

  for (let d = 1; d <= 30; d++) {
    const dayRes = await get(`/plan/days/${d}`, femaleToken);
    const c = dayRes.data?.content;
    if (c.is_rest) {
      femaleRestDays++;
    } else {
      (c.workout_gym || []).forEach(w => femaleEqSet.add(w.exercise_id));
      (c.workout_home || []).forEach(w => femaleBodySet.add(w.exercise_id));
    }
  }

  console.log(`Female Plan - Workout Days: ${30 - femaleRestDays}, Rest Days: ${femaleRestDays}`);
  console.log(`Female Plan - Unique Gym Equipment Exercises cycled: ${femaleEqSet.size}/25`);
  console.log(`Female Plan - Unique Bodyweight Exercises cycled: ${femaleBodySet.size}/25`);
  console.log('Total unique exercises across female program:', femaleEqSet.size + femaleBodySet.size);

  console.log('\n=== SUMMARY VERIFICATION ===');
  const allCorrect = maleEqSet.size === 25 && maleBodySet.size === 25 &&
                     femaleEqSet.size === 25 && femaleBodySet.size === 25;
  if (allCorrect) {
    console.log('>>> ALL 100 EXERCISES (50 Male: 25 eq + 25 body / 50 Female: 25 eq + 25 body) ARE PERFECTLY DISTRIBUTED ACROSS 30 DAYS! <<<');
  } else {
    console.log('>>> Exercise count mismatch! Check sets above. <<<');
  }
}

run().catch(console.error);
