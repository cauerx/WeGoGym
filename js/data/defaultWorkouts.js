// Treinos Padrão definidos pelo Usuário
export const DEFAULT_WORKOUTS = [
  {
    id: 'upper-1',
    name: 'Upper 1',
    subtitle: 'Superior: Paralela, Pullover, Remada, Braços',
    icon: 'dumbbell',
    exercises: [
      {
        id: 'paralela',
        name: 'Paralela',
        primaryMuscle: 'Tríceps',
        secondaryMuscle: 'Peitoral',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 0, reps: 10, completed: false, isBodyweight: true },
          { type: 'work', weight: 0, reps: 10, completed: false, isBodyweight: true },
          { type: 'work', weight: 0, reps: 10, completed: false, isBodyweight: true }
        ]
      },
      {
        id: 'pullover',
        name: 'Pullover',
        primaryMuscle: 'Costas / Dorsal',
        secondaryMuscle: 'Peitoral',
        unit: 'kg',
        sets: [
          { type: 'warmup', weight: 14, reps: 10, completed: false },
          { type: 'work', weight: 22, reps: 10, completed: false },
          { type: 'work', weight: 24, reps: 10, completed: false }
        ]
      },
      {
        id: 'remada-baixa-unilateral',
        name: 'Remada baixa unilateral na máquina',
        primaryMuscle: 'Costas / Dorsal',
        secondaryMuscle: 'Bíceps',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 35, reps: 10, completed: false },
          { type: 'work', weight: 35, reps: 10, completed: false },
          { type: 'work', weight: 35, reps: 10, completed: false }
        ]
      },
      {
        id: 'triceps-frances-maquina',
        name: 'Tríceps francês máquina',
        primaryMuscle: 'Tríceps',
        secondaryMuscle: 'Ombros',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 25, reps: 10, completed: false },
          { type: 'work', weight: 25, reps: 10, completed: false },
          { type: 'work', weight: 25, reps: 10, completed: false }
        ]
      },
      {
        id: 'biceps-rosca-w',
        name: 'Bíceps rosca W',
        primaryMuscle: 'Bíceps',
        secondaryMuscle: 'Antebraço',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 18, reps: 10, completed: false },
          { type: 'work', weight: 18, reps: 10, completed: false },
          { type: 'work', weight: 18, reps: 10, completed: false }
        ]
      },
      {
        id: 'antebraco-polia-alta',
        name: 'Antebraço polia alta',
        primaryMuscle: 'Antebraço',
        secondaryMuscle: null,
        unit: 'kg',
        sets: [
          { type: 'work', weight: 20, reps: 10, completed: false },
          { type: 'work', weight: 20, reps: 10, completed: false },
          { type: 'work', weight: 20, reps: 10, completed: false }
        ]
      }
    ]
  },
  {
    id: 'lower',
    name: 'Lower',
    subtitle: 'Inferior: Extensora, Flexora, Leg 45, Glúteos',
    icon: 'activity',
    exercises: [
      {
        id: 'cadeira-extensora-maquina',
        name: 'Cadeira Extensora Máquina',
        primaryMuscle: 'Quadríceps',
        secondaryMuscle: null,
        unit: 'kg',
        sets: [
          { type: 'warmup', weight: 30, reps: 10, completed: false },
          { type: 'work', weight: 55, reps: 10, completed: false },
          { type: 'work', weight: 60, reps: 10, completed: false }
        ]
      },
      {
        id: 'cadeira-flexora-maquina',
        name: 'Cadeira flexora máquina',
        primaryMuscle: 'Posterior de Coxa',
        secondaryMuscle: 'Panturrilha',
        unit: 'kg',
        sets: [
          { type: 'warmup', weight: 25, reps: 10, completed: false },
          { type: 'work', weight: 45, reps: 10, completed: false },
          { type: 'work', weight: 50, reps: 10, completed: false }
        ]
      },
      {
        id: 'leg-press-45',
        name: 'Leg press 45',
        primaryMuscle: 'Quadríceps',
        secondaryMuscle: 'Glúteos',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 140, reps: 10, completed: false },
          { type: 'work', weight: 160, reps: 10, completed: false },
          { type: 'work', weight: 180, reps: 10, completed: false }
        ]
      },
      {
        id: 'elevacao-pelvica',
        name: 'Elevação pélvica',
        primaryMuscle: 'Glúteos',
        secondaryMuscle: 'Posterior de Coxa',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 70, reps: 10, completed: false },
          { type: 'work', weight: 80, reps: 10, completed: false },
          { type: 'work', weight: 90, reps: 10, completed: false }
        ]
      },
      {
        id: 'cadeira-adutora',
        name: 'Cadeira Adutora',
        primaryMuscle: 'Adutores',
        secondaryMuscle: null,
        unit: 'kg',
        sets: [
          { type: 'work', weight: 40, reps: 10, completed: false },
          { type: 'work', weight: 45, reps: 10, completed: false },
          { type: 'work', weight: 50, reps: 10, completed: false }
        ]
      },
      {
        id: 'panturrilha',
        name: 'Panturrilha',
        primaryMuscle: 'Panturrilha',
        secondaryMuscle: null,
        unit: 'kg',
        sets: [
          { type: 'work', weight: 50, reps: 10, completed: false },
          { type: 'work', weight: 55, reps: 10, completed: false },
          { type: 'work', weight: 60, reps: 10, completed: false }
        ]
      }
    ]
  },
  {
    id: 'upper-2',
    name: 'Upper 2',
    subtitle: 'Superior: Barra, Supino, Crucifixo, Ombros & Braços',
    icon: 'flame',
    exercises: [
      {
        id: 'barra-fixa',
        name: 'Barra',
        primaryMuscle: 'Costas / Dorsal',
        secondaryMuscle: 'Bíceps',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 0, reps: 10, completed: false, isBodyweight: true },
          { type: 'work', weight: 0, reps: 10, completed: false, isBodyweight: true },
          { type: 'work', weight: 0, reps: 10, completed: false, isBodyweight: true }
        ]
      },
      {
        id: 'supino-maquina',
        name: 'Supino máquina',
        primaryMuscle: 'Peitoral',
        secondaryMuscle: 'Tríceps',
        unit: 'kg',
        sets: [
          { type: 'warmup', weight: 30, reps: 10, completed: false },
          { type: 'work', weight: 55, reps: 10, completed: false },
          { type: 'work', weight: 60, reps: 10, completed: false }
        ]
      },
      {
        id: 'crucifixo-cross',
        name: 'Crucifixo cross',
        primaryMuscle: 'Peitoral',
        secondaryMuscle: 'Ombros',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 15, reps: 10, completed: false },
          { type: 'work', weight: 15, reps: 10, completed: false },
          { type: 'work', weight: 15, reps: 10, completed: false }
        ]
      },
      {
        id: 'elevacao-lateral',
        name: 'Elevação lateral',
        primaryMuscle: 'Ombros',
        secondaryMuscle: null,
        unit: 'kg',
        sets: [
          { type: 'work', weight: 10, reps: 10, completed: false },
          { type: 'work', weight: 10, reps: 10, completed: false },
          { type: 'work', weight: 10, reps: 10, completed: false }
        ]
      },
      {
        id: 'triceps-corda',
        name: 'Tríceps corda',
        primaryMuscle: 'Tríceps',
        secondaryMuscle: null,
        unit: 'kg',
        sets: [
          { type: 'work', weight: 22, reps: 10, completed: false },
          { type: 'work', weight: 25, reps: 10, completed: false },
          { type: 'work', weight: 25, reps: 10, completed: false }
        ]
      },
      {
        id: 'biceps-unilateral-polia-baixa',
        name: 'Bíceps unilateral polia baixa',
        primaryMuscle: 'Bíceps',
        secondaryMuscle: 'Antebraço',
        unit: 'kg',
        sets: [
          { type: 'work', weight: 12, reps: 10, completed: false },
          { type: 'work', weight: 15, reps: 10, completed: false },
          { type: 'work', weight: 15, reps: 10, completed: false }
        ]
      }
    ]
  }
];
