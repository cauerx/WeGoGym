// Módulo de Cálculo de Tonelagem e Volume Muscular
export const LBS_TO_KG = 0.45359237;

/**
 * Converte valor de peso para Quilogramas (KG)
 */
export function convertToKg(weight, unit) {
  const num = parseFloat(weight) || 0;
  return unit === 'lbs' ? num * LBS_TO_KG : num;
}

/**
 * Converte valor de peso de KG para a unidade desejada
 */
export function convertFromKg(weightInKg, targetUnit) {
  const num = parseFloat(weightInKg) || 0;
  return targetUnit === 'lbs' ? num / LBS_TO_KG : num;
}

/**
 * Calcula o volume de uma série específica em kg
 */
export function calculateSetVolume(set, unit = 'kg') {
  const weight = parseFloat(set.weight) || 0;
  const reps = parseInt(set.reps) || 0;
  const weightKg = convertToKg(weight, unit);
  return Math.round(weightKg * reps * 10) / 10;
}

/**
 * Calcula os totais de volume e métricas de um exercício
 */
export function calculateExerciseVolume(exercise) {
  const unit = exercise.unit || 'kg';
  let totalVolumeKg = 0;
  let workVolumeKg = 0;
  let warmupVolumeKg = 0;
  let completedSets = 0;

  exercise.sets.forEach((set) => {
    const vol = calculateSetVolume(set, unit);
    totalVolumeKg += vol;
    if (set.type === 'warmup') {
      warmupVolumeKg += vol;
    } else {
      workVolumeKg += vol;
    }
    if (set.completed) {
      completedSets++;
    }
  });

  return {
    totalVolumeKg: Math.round(totalVolumeKg),
    workVolumeKg: Math.round(workVolumeKg),
    warmupVolumeKg: Math.round(warmupVolumeKg),
    totalSets: exercise.sets.length,
    completedSets
  };
}

/**
 * Calcula a tonelagem geral do treino e a decomposição por grupamento muscular
 * @param {Object} workout 
 * @param {'all' | 'work_only'} filter Modo de cálculo (todas as séries ou apenas trabalho)
 */
export function calculateWorkoutTonnage(workout, filter = 'all') {
  if (!workout || !workout.exercises) {
    return {
      totalVolumeKg: 0,
      workVolumeKg: 0,
      warmupVolumeKg: 0,
      totalSets: 0,
      completedSets: 0,
      muscleBreakdown: []
    };
  }

  let totalVolumeKg = 0;
  let workVolumeKg = 0;
  let warmupVolumeKg = 0;
  let totalSets = 0;
  let completedSets = 0;

  // Mapa de volume acumulado por músculo
  const muscleMap = {};

  workout.exercises.forEach((exercise) => {
    const unit = exercise.unit || 'kg';
    const primary = exercise.primaryMuscle || 'Outros';
    const secondary = exercise.secondaryMuscle;

    exercise.sets.forEach((set) => {
      totalSets++;
      if (set.completed) completedSets++;

      const isWarmup = set.type === 'warmup';
      const vol = calculateSetVolume(set, unit);

      totalVolumeKg += vol;
      if (isWarmup) {
        warmupVolumeKg += vol;
      } else {
        workVolumeKg += vol;
      }

      // Aplica filtro se solicitado (ex: ignorar aquecimento na tonelagem muscular)
      const volumeToAttribute = filter === 'work_only' && isWarmup ? 0 : vol;

      if (volumeToAttribute > 0) {
        // Se houver músculo secundário, atribui 70% ao primário e 30% ao secundário
        if (secondary) {
          const primaryShare = volumeToAttribute * 0.7;
          const secondaryShare = volumeToAttribute * 0.3;

          muscleMap[primary] = (muscleMap[primary] || 0) + primaryShare;
          muscleMap[secondary] = (muscleMap[secondary] || 0) + secondaryShare;
        } else {
          muscleMap[primary] = (muscleMap[primary] || 0) + volumeToAttribute;
        }
      }
    });
  });

  const effectiveTotal = filter === 'work_only' ? workVolumeKg : totalVolumeKg;

  // Transformar mapa em lista ordenada com porcentagens
  const muscleBreakdown = Object.keys(muscleMap)
    .map((muscle) => {
      const vol = Math.round(muscleMap[muscle]);
      const percentage = effectiveTotal > 0 ? Math.round((vol / effectiveTotal) * 100) : 0;
      return {
        muscle,
        volumeKg: vol,
        percentage
      };
    })
    .filter((item) => item.volumeKg > 0)
    .sort((a, b) => b.volumeKg - a.volumeKg);

  return {
    totalVolumeKg: Math.round(totalVolumeKg),
    workVolumeKg: Math.round(workVolumeKg),
    warmupVolumeKg: Math.round(warmupVolumeKg),
    effectiveTotal: Math.round(effectiveTotal),
    totalSets,
    completedSets,
    progressPercentage: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
    muscleBreakdown
  };
}

/**
 * Formata números com separador de milhar brasileiro (ex: 12.450 kg)
 */
export function formatWeight(val) {
  const num = Math.round(val);
  return num.toLocaleString('pt-BR');
}
