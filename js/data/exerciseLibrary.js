// Biblioteca de Exercícios com Mapeamento Anatômico e Grupamentos Musculares
export const MUSCLE_GROUPS = [
  'Todos',
  'Peitoral',
  'Costas / Dorsal',
  'Tríceps',
  'Bíceps',
  'Ombros',
  'Antebraço',
  'Quadríceps',
  'Posterior de Coxa',
  'Glúteos',
  'Adutores',
  'Panturrilha',
  'Abdômen / Core'
];

export const EXERCISE_LIBRARY = [
  // --- PEITORAL ---
  { id: 'paralela', name: 'Paralela', primaryMuscle: 'Tríceps', secondaryMuscle: 'Peitoral', defaultUnit: 'kg' },
  { id: 'pullover', name: 'Pullover', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Peitoral', defaultUnit: 'kg' },
  { id: 'supino-maquina', name: 'Supino máquina', primaryMuscle: 'Peitoral', secondaryMuscle: 'Tríceps', defaultUnit: 'kg' },
  { id: 'crucifixo-cross', name: 'Crucifixo cross', primaryMuscle: 'Peitoral', secondaryMuscle: 'Ombros', defaultUnit: 'kg' },
  { id: 'supino-reto-barra', name: 'Supino reto barra', primaryMuscle: 'Peitoral', secondaryMuscle: 'Tríceps', defaultUnit: 'kg' },
  { id: 'supino-inclinado-halteres', name: 'Supino inclinado halteres', primaryMuscle: 'Peitoral', secondaryMuscle: 'Ombros', defaultUnit: 'kg' },
  { id: 'crossover-polia-alta', name: 'Crossover polia alta', primaryMuscle: 'Peitoral', secondaryMuscle: 'Ombros', defaultUnit: 'kg' },
  { id: 'peck-deck', name: 'Peck Deck / Voador', primaryMuscle: 'Peitoral', secondaryMuscle: 'Ombros', defaultUnit: 'kg' },

  // --- COSTAS / DORSAL ---
  { id: 'remada-baixa-unilateral', name: 'Remada baixa unilateral na máquina', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Bíceps', defaultUnit: 'kg' },
  { id: 'barra-fixa', name: 'Barra', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Bíceps', defaultUnit: 'kg' },
  { id: 'puxada-alta-aberta', name: 'Puxada alta aberta (Pulley)', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Bíceps', defaultUnit: 'kg' },
  { id: 'puxada-triangulo', name: 'Puxada alta com triângulo', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Bíceps', defaultUnit: 'kg' },
  { id: 'remada-curvada-barra', name: 'Remada curvada barra', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Bíceps', defaultUnit: 'kg' },
  { id: 'remada-cavalinho', name: 'Remada cavalinho (T-bar)', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Bíceps', defaultUnit: 'kg' },
  { id: 'face-pull', name: 'Face pull polia', primaryMuscle: 'Costas / Dorsal', secondaryMuscle: 'Ombros', defaultUnit: 'kg' },

  // --- BRAÇOS: TRÍCEPS ---
  { id: 'triceps-frances-maquina', name: 'Tríceps francês máquina', primaryMuscle: 'Tríceps', secondaryMuscle: 'Ombros', defaultUnit: 'kg' },
  { id: 'triceps-corda', name: 'Tríceps corda', primaryMuscle: 'Tríceps', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'triceps-testa-w', name: 'Tríceps testa barra W', primaryMuscle: 'Tríceps', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'triceps-polia-barra-reta', name: 'Tríceps pulley barra reta', primaryMuscle: 'Tríceps', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'triceps-banco', name: 'Tríceps no banco', primaryMuscle: 'Tríceps', secondaryMuscle: 'Peitoral', defaultUnit: 'kg' },

  // --- BRAÇOS: BÍCEPS ---
  { id: 'biceps-rosca-w', name: 'Bíceps rosca W', primaryMuscle: 'Bíceps', secondaryMuscle: 'Antebraço', defaultUnit: 'kg' },
  { id: 'biceps-unilateral-polia-baixa', name: 'Bíceps unilateral polia baixa', primaryMuscle: 'Bíceps', secondaryMuscle: 'Antebraço', defaultUnit: 'kg' },
  { id: 'rosca-martelo-halteres', name: 'Rosca martelo halteres', primaryMuscle: 'Bíceps', secondaryMuscle: 'Antebraço', defaultUnit: 'kg' },
  { id: 'rosca-scott-maquina', name: 'Rosca Scott máquina', primaryMuscle: 'Bíceps', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'rosca-inclinada-halteres', name: 'Rosca inclinada halteres', primaryMuscle: 'Bíceps', secondaryMuscle: null, defaultUnit: 'kg' },

  // --- ANTEBRAÇO ---
  { id: 'antebraco-polia-alta', name: 'Antebraço polia alta', primaryMuscle: 'Antebraço', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'rosca-punho-barra', name: 'Rosca de punho barra', primaryMuscle: 'Antebraço', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'rosca-inversa-polia', name: 'Rosca inversa polia', primaryMuscle: 'Antebraço', secondaryMuscle: 'Bíceps', defaultUnit: 'kg' },

  // --- OMBROS ---
  { id: 'elevacao-lateral', name: 'Elevação lateral', primaryMuscle: 'Ombros', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'desenvolvimento-halteres', name: 'Desenvolvimento halteres', primaryMuscle: 'Ombros', secondaryMuscle: 'Tríceps', defaultUnit: 'kg' },
  { id: 'desenvolvimento-maquina', name: 'Desenvolvimento máquina', primaryMuscle: 'Ombros', secondaryMuscle: 'Tríceps', defaultUnit: 'kg' },
  { id: 'crucifixo-invertido-maquina', name: 'Crucifixo invertido máquina', primaryMuscle: 'Ombros', secondaryMuscle: 'Costas / Dorsal', defaultUnit: 'kg' },
  { id: 'elevacao-frontal-polia', name: 'Elevação frontal polia', primaryMuscle: 'Ombros', secondaryMuscle: 'Peitoral', defaultUnit: 'kg' },

  // --- PERNAS: QUADRÍCEPS ---
  { id: 'cadeira-extensora-maquina', name: 'Cadeira Extensora Máquina', primaryMuscle: 'Quadríceps', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'leg-press-45', name: 'Leg press 45', primaryMuscle: 'Quadríceps', secondaryMuscle: 'Glúteos', defaultUnit: 'kg' },
  { id: 'agachamento-hack', name: 'Agachamento Hack', primaryMuscle: 'Quadríceps', secondaryMuscle: 'Glúteos', defaultUnit: 'kg' },
  { id: 'agachamento-livre', name: 'Agachamento livre barra', primaryMuscle: 'Quadríceps', secondaryMuscle: 'Glúteos', defaultUnit: 'kg' },
  { id: 'agachamento-bulgaro', name: 'Agachamento búlgaro', primaryMuscle: 'Quadríceps', secondaryMuscle: 'Glúteos', defaultUnit: 'kg' },
  { id: 'passada-afundo', name: 'Passada / Avanço', primaryMuscle: 'Quadríceps', secondaryMuscle: 'Glúteos', defaultUnit: 'kg' },

  // --- PERNAS: POSTERIOR ---
  { id: 'cadeira-flexora-maquina', name: 'Cadeira flexora máquina', primaryMuscle: 'Posterior de Coxa', secondaryMuscle: 'Panturrilha', defaultUnit: 'kg' },
  { id: 'mesa-flexora', name: 'Mesa flexora deitada', primaryMuscle: 'Posterior de Coxa', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'stiff-halteres', name: 'Stiff com halteres', primaryMuscle: 'Posterior de Coxa', secondaryMuscle: 'Glúteos', defaultUnit: 'kg' },
  { id: 'stiff-barra', name: 'Stiff com barra', primaryMuscle: 'Posterior de Coxa', secondaryMuscle: 'Glúteos', defaultUnit: 'kg' },

  // --- GLÚTEOS & ADUTORES ---
  { id: 'elevacao-pelvica', name: 'Elevação pélvica', primaryMuscle: 'Glúteos', secondaryMuscle: 'Posterior de Coxa', defaultUnit: 'kg' },
  { id: 'cadeira-adutora', name: 'Cadeira Adutora', primaryMuscle: 'Adutores', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'cadeira-abdutora', name: 'Cadeira Abdutora', primaryMuscle: 'Glúteos', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'gluteo-cabo-coice', name: 'Glúteo no cabo (coice)', primaryMuscle: 'Glúteos', secondaryMuscle: null, defaultUnit: 'kg' },

  // --- PANTURRILHA ---
  { id: 'panturrilha', name: 'Panturrilha', primaryMuscle: 'Panturrilha', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'panturrilha-sentado', name: 'Panturrilha sentado (gêmeos)', primaryMuscle: 'Panturrilha', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'panturrilha-leg-press', name: 'Panturrilha no Leg Press', primaryMuscle: 'Panturrilha', secondaryMuscle: null, defaultUnit: 'kg' },

  // --- ABDÔMEN / CORE ---
  { id: 'crunch-polia', name: 'Abdominal crunch na polia', primaryMuscle: 'Abdômen / Core', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'elevacao-pernas-barra', name: 'Elevação de pernas na barra', primaryMuscle: 'Abdômen / Core', secondaryMuscle: null, defaultUnit: 'kg' },
  { id: 'prancha-isometrica', name: 'Prancha isométrica', primaryMuscle: 'Abdômen / Core', secondaryMuscle: null, defaultUnit: 'kg' }
];

export function findExerciseById(id) {
  return EXERCISE_LIBRARY.find((e) => e.id === id) || null;
}

export function findExercisesByMuscle(muscle) {
  if (!muscle || muscle === 'Todos') return EXERCISE_LIBRARY;
  return EXERCISE_LIBRARY.filter(
    (e) => e.primaryMuscle === muscle || e.secondaryMuscle === muscle
  );
}
