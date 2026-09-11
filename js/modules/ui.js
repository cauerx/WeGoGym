// Módulo de Interface do Usuário (UI)
import { calculateWorkoutTonnage, formatWeight } from './tonnage.js';
import { MUSCLE_GROUPS, EXERCISE_LIBRARY, findExerciseById } from '../data/exerciseLibrary.js';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.selectedMuscleFilter = 'Todos';
    this.searchQuery = '';
    this.exerciseToSwapIndex = null;
    this.currentTonnageFilter = 'all'; // 'all' ou 'work_only'
  }

  /**
   * Renderiza a barra de abas de treinos
   */
  renderWorkoutTabs(workouts, activeId) {
    const container = document.getElementById('workoutTabs');
    if (!container) return;

    let html = '';
    workouts.forEach((w) => {
      const isActive = w.id === activeId;
      html += `
        <button class="tab-btn ${isActive ? 'active' : ''}" data-workout-id="${w.id}">
          <span>${w.name}</span>
          <span class="tab-sub">${w.exercises.length} exerc.</span>
        </button>
      `;
    });

    // Aba de Histórico
    const isHistory = activeId === 'history';
    html += `
      <button class="tab-btn ${isHistory ? 'active' : ''}" data-workout-id="history">
        <span>Histórico</span>
        <span class="tab-sub">Logs</span>
      </button>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const wid = btn.getAttribute('data-workout-id');
        this.app.selectWorkout(wid);
      });
    });
  }

  /**
   * Renderiza o painel analítico de tonelagem
   */
  renderTonnageSummary(workout) {
    const container = document.getElementById('tonnageSummary');
    if (!container) return;

    if (!workout || !workout.exercises) {
      container.innerHTML = '';
      return;
    }

    const metrics = calculateWorkoutTonnage(workout, this.currentTonnageFilter);

    let muscleBarsHtml = '';
    if (metrics.muscleBreakdown.length > 0) {
      muscleBarsHtml = metrics.muscleBreakdown
        .map(
          (m) => `
          <div class="muscle-bar-item">
            <div class="muscle-bar-info">
              <span class="muscle-name">${m.muscle}</span>
              <div class="muscle-value-pct">
                <span class="muscle-vol">${formatWeight(m.volumeKg)} kg</span>
                <span class="muscle-pct">${m.percentage}%</span>
              </div>
            </div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${Math.min(100, m.percentage)}%"></div>
            </div>
          </div>
        `
        )
        .join('');
    } else {
      muscleBarsHtml = `
        <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 6px 0;">
          Insira cargas e reps para ver o cálculo de volume muscular.
        </div>
      `;
    }

    container.innerHTML = `
      <div class="tonnage-summary-card">
        <div class="summary-header">
          <div class="summary-title-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 20V10"></path>
              <path d="M12 20V4"></path>
              <path d="M6 20v-6"></path>
            </svg>
            <span class="summary-title">Volume do Treino</span>
          </div>
          <button id="toggleFilterBtn" class="filter-toggle-btn ${this.currentTonnageFilter === 'work_only' ? 'active' : ''}">
            ${this.currentTonnageFilter === 'work_only' ? 'Apenas Trabalho' : 'Todas as Séries'}
          </button>
        </div>

        <div class="summary-grid">
          <div class="stat-box">
            <span class="stat-label">Tonelagem Total</span>
            <div class="stat-value">
              <span>${formatWeight(metrics.effectiveTotal)}</span>
              <span class="stat-unit">kg</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="stat-label">Trabalho / Aquec.</span>
            <div class="stat-value" style="font-size: 1.05rem; color: var(--text-secondary);">
              <span>${formatWeight(metrics.workVolumeKg)}</span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">/ ${formatWeight(metrics.warmupVolumeKg)}</span>
            </div>
          </div>
          <div class="stat-box">
            <span class="stat-label">Séries Concluídas</span>
            <div class="stat-value" style="font-size: 1.15rem; color: var(--accent-yellow);">
              <span>${metrics.completedSets}</span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">/${metrics.totalSets}</span>
            </div>
          </div>
        </div>

        <div class="muscle-bars-section">
          <div class="muscle-bars-title">
            <span>Tonelagem por Grupamento Muscular</span>
            <span style="font-weight: 500; font-size: 0.7rem; color: var(--text-muted);">${metrics.muscleBreakdown.length} grupos</span>
          </div>
          <div class="muscle-bars-grid">
            ${muscleBarsHtml}
          </div>
        </div>
      </div>
    `;

    document.getElementById('toggleFilterBtn')?.addEventListener('click', () => {
      this.currentTonnageFilter = this.currentTonnageFilter === 'all' ? 'work_only' : 'all';
      this.renderTonnageSummary(workout);
    });
  }

  /**
   * Renderiza a lista de exercícios do treino atual
   */
  renderWorkoutExercises(workout) {
    const container = document.getElementById('workoutExercises');
    if (!container) return;

    if (!workout || !workout.exercises || workout.exercises.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          Nenhum exercício neste treino. Toque abaixo para adicionar.
        </div>
      `;
      return;
    }

    let html = '';
    workout.exercises.forEach((exercise, exIndex) => {
      const unit = exercise.unit || 'kg';

      let setsRowsHtml = '';
      exercise.sets.forEach((set, sIndex) => {
        const isWarmup = set.type === 'warmup';
        setsRowsHtml += `
          <tr class="set-row ${set.completed ? 'completed' : ''}" data-ex-index="${exIndex}" data-set-index="${sIndex}">
            <td class="set-number">${sIndex + 1}</td>
            <td class="col-type">
              <span class="set-type-badge ${isWarmup ? 'warmup' : 'work'}" data-action="toggle-set-type" data-ex-index="${exIndex}" data-set-index="${sIndex}">
                ${isWarmup ? 'Aquec.' : 'Trabalho'}
              </span>
            </td>
            <td>
              <input type="number" step="any" inputmode="decimal" class="input-field set-input-weight" 
                data-ex-index="${exIndex}" data-set-index="${sIndex}"
                value="${set.weight !== undefined ? set.weight : ''}" placeholder="0">
            </td>
            <td>
              <input type="number" step="1" inputmode="numeric" class="input-field set-input-reps" 
                data-ex-index="${exIndex}" data-set-index="${sIndex}"
                value="${set.reps !== undefined ? set.reps : 10}" placeholder="10">
            </td>
            <td>
              <button class="check-btn ${set.completed ? 'checked' : ''}" 
                data-action="toggle-complete-set" data-ex-index="${exIndex}" data-set-index="${sIndex}"
                title="Concluir série">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
            </td>
            <td>
              <button class="icon-btn" style="width: 28px; height: 28px; border: none; background: transparent; color: var(--text-muted);" 
                data-action="delete-set" data-ex-index="${exIndex}" data-set-index="${sIndex}" title="Remover série">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </td>
          </tr>
        `;
      });

      html += `
        <div class="exercise-card" data-ex-index="${exIndex}">
          <div class="exercise-header">
            <div class="exercise-title-group">
              <h3 class="exercise-name">${exercise.name}</h3>
              <div class="exercise-tags">
                <span class="badge-muscle">${exercise.primaryMuscle}</span>
                ${exercise.secondaryMuscle ? `<span class="badge-muscle" style="opacity: 0.7;">+ ${exercise.secondaryMuscle}</span>` : ''}
              </div>
            </div>
            
            <div class="exercise-controls">
              <!-- Seletor de Unidade KG / LBS por Exercício Específico -->
              <div class="unit-toggle-pill">
                <button class="unit-btn ${unit === 'kg' ? 'active' : ''}" data-action="set-unit" data-ex-index="${exIndex}" data-unit="kg">KG</button>
                <button class="unit-btn ${unit === 'lbs' ? 'active' : ''}" data-action="set-unit" data-ex-index="${exIndex}" data-unit="lbs">LBS</button>
              </div>

              <!-- Botão de Substituir Exercício -->
              <button class="exercise-swap-btn" data-action="open-swap-modal" data-ex-index="${exIndex}" title="Trocar exercício">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/>
                </svg>
              </button>
            </div>
          </div>

          <table class="sets-table">
            <thead>
              <tr>
                <th>#</th>
                <th class="col-type">Tipo</th>
                <th>Carga (${unit})</th>
                <th>Reps</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${setsRowsHtml}
            </tbody>
          </table>

          <div class="exercise-card-footer">
            <button class="card-action-btn" data-action="add-set" data-ex-index="${exIndex}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adicionar Série
            </button>

            <button class="card-action-btn delete-btn" data-action="delete-exercise" data-ex-index="${exIndex}">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Remover
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    this._attachExerciseEventListeners(container);
  }

  /**
   * Vincula ouvintes de eventos para inputs, botões de série e controles
   */
  _attachExerciseEventListeners(container) {
    // Alternar tipo de série (Aquecimento vs Trabalho)
    container.querySelectorAll('[data-action="toggle-set-type"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const exIndex = parseInt(btn.getAttribute('data-ex-index'), 10);
        const setIndex = parseInt(btn.getAttribute('data-set-index'), 10);
        this.app.toggleSetType(exIndex, setIndex);
      });
    });

    // Alternar unidade (KG vs LBS)
    container.querySelectorAll('[data-action="set-unit"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exIndex = parseInt(btn.getAttribute('data-ex-index'), 10);
        const unit = btn.getAttribute('data-unit');
        this.app.changeExerciseUnit(exIndex, unit);
      });
    });

    // Atualização de Carga e Reps
    container.querySelectorAll('.set-input-weight').forEach((input) => {
      input.addEventListener('change', (e) => {
        const exIndex = parseInt(input.getAttribute('data-ex-index'), 10);
        const setIndex = parseInt(input.getAttribute('data-set-index'), 10);
        this.app.updateSetWeight(exIndex, setIndex, input.value);
      });
    });

    container.querySelectorAll('.set-input-reps').forEach((input) => {
      input.addEventListener('change', (e) => {
        const exIndex = parseInt(input.getAttribute('data-ex-index'), 10);
        const setIndex = parseInt(input.getAttribute('data-set-index'), 10);
        this.app.updateSetReps(exIndex, setIndex, input.value);
      });
    });

    // Concluir série (Checkmark)
    container.querySelectorAll('[data-action="toggle-complete-set"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exIndex = parseInt(btn.getAttribute('data-ex-index'), 10);
        const setIndex = parseInt(btn.getAttribute('data-set-index'), 10);
        this.app.toggleSetComplete(exIndex, setIndex);
      });
    });

    // Adicionar série
    container.querySelectorAll('[data-action="add-set"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exIndex = parseInt(btn.getAttribute('data-ex-index'), 10);
        this.app.addSetToExercise(exIndex);
      });
    });

    // Remover série
    container.querySelectorAll('[data-action="delete-set"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exIndex = parseInt(btn.getAttribute('data-ex-index'), 10);
        const setIndex = parseInt(btn.getAttribute('data-set-index'), 10);
        this.app.deleteSetFromExercise(exIndex, setIndex);
      });
    });

    // Abrir modal de substituição de exercício
    container.querySelectorAll('[data-action="open-swap-modal"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exIndex = parseInt(btn.getAttribute('data-ex-index'), 10);
        this.openSwapExerciseModal(exIndex);
      });
    });

    // Remover exercício
    container.querySelectorAll('[data-action="delete-exercise"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const exIndex = parseInt(btn.getAttribute('data-ex-index'), 10);
        this.app.deleteExercise(exIndex);
      });
    });
  }

  /**
   * Abre modal para trocar ou adicionar exercício
   */
  openSwapExerciseModal(exerciseIndex = null) {
    this.exerciseToSwapIndex = exerciseIndex;
    const modal = document.getElementById('exerciseModal');
    const modalTitle = document.getElementById('exerciseModalTitle');
    if (!modal) return;

    if (modalTitle) {
      modalTitle.innerText = exerciseIndex !== null ? 'Trocar Exercício' : 'Adicionar Exercício';
    }

    this.renderMuscleFilterChips();
    this.renderExerciseOptionsList();

    modal.classList.add('active');
  }

  closeExerciseModal() {
    const modal = document.getElementById('exerciseModal');
    if (modal) modal.classList.remove('active');
    this.exerciseToSwapIndex = null;
  }

  renderMuscleFilterChips() {
    const container = document.getElementById('muscleFilterChips');
    if (!container) return;

    let html = '';
    MUSCLE_GROUPS.forEach((m) => {
      const isActive = m === this.selectedMuscleFilter;
      html += `
        <button class="muscle-chip ${isActive ? 'active' : ''}" data-muscle="${m}">
          ${m}
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.muscle-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        this.selectedMuscleFilter = chip.getAttribute('data-muscle');
        this.renderMuscleFilterChips();
        this.renderExerciseOptionsList();
      });
    });
  }

  renderExerciseOptionsList() {
    const container = document.getElementById('exerciseOptionsList');
    if (!container) return;

    const query = (this.searchQuery || '').toLowerCase().trim();
    const muscle = this.selectedMuscleFilter;

    let list = EXERCISE_LIBRARY;
    if (muscle && muscle !== 'Todos') {
      list = list.filter((e) => e.primaryMuscle === muscle || e.secondaryMuscle === muscle);
    }
    if (query) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.primaryMuscle.toLowerCase().includes(query) ||
          (e.secondaryMuscle && e.secondaryMuscle.toLowerCase().includes(query))
      );
    }

    let html = '';
    if (list.length === 0) {
      html = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted);">
          Nenhum exercício encontrado.
          <div style="margin-top: 10px;">
            <button id="btnCreateCustomExercise" class="card-action-btn" style="margin: 0 auto; color: var(--accent-yellow);">
              + Criar exercício com o nome "${query}"
            </button>
          </div>
        </div>
      `;
    } else {
      list.forEach((ex) => {
        html += `
          <div class="exercise-option-item" data-exercise-id="${ex.id}">
            <div class="opt-info">
              <span class="opt-name">${ex.name}</span>
              <span class="opt-muscle">${ex.primaryMuscle} ${ex.secondaryMuscle ? `• ${ex.secondaryMuscle}` : ''}</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        `;
      });
    }

    container.innerHTML = html;

    container.querySelectorAll('.exercise-option-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-exercise-id');
        const exerciseData = findExerciseById(id);
        if (exerciseData) {
          if (this.exerciseToSwapIndex !== null) {
            this.app.swapExercise(this.exerciseToSwapIndex, exerciseData);
          } else {
            this.app.addExerciseToCurrentWorkout(exerciseData);
          }
          this.closeExerciseModal();
        }
      });
    });

    document.getElementById('btnCreateCustomExercise')?.addEventListener('click', () => {
      const customName = query || 'Novo Exercício';
      const newEx = {
        id: 'custom-' + Date.now(),
        name: customName.charAt(0).toUpperCase() + customName.slice(1),
        primaryMuscle: muscle !== 'Todos' ? muscle : 'Personalizado',
        secondaryMuscle: null,
        defaultUnit: 'kg'
      };
      if (this.exerciseToSwapIndex !== null) {
        this.app.swapExercise(this.exerciseToSwapIndex, newEx);
      } else {
        this.app.addExerciseToCurrentWorkout(newEx);
      }
      this.closeExerciseModal();
    });
  }

  /**
   * Atualiza a barra flutuante do cronômetro de descanso
   */
  updateTimerBar(state) {
    const bar = document.getElementById('floatingTimerBar');
    const digits = document.getElementById('timerDigits');
    const ring = document.getElementById('timerProgressRing');
    const playIcon = document.getElementById('timerPlayIcon');
    const pauseIcon = document.getElementById('timerPauseIcon');

    if (!bar) return;

    if (state.remaining <= 0 && !state.isRunning) {
      // Estado de conclusão
      bar.classList.add('completed-pulse');
      if (digits) digits.innerText = '00:00';
      if (ring) ring.style.strokeDashoffset = '0';
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      return;
    }

    bar.classList.remove('completed-pulse');
    bar.classList.remove('hidden');

    if (digits) digits.innerText = state.formattedTime;

    // Cálculo do anel de progresso (circunferência = 2 * PI * r = 2 * PI * 18 ≈ 113.1)
    if (ring) {
      const circumference = 113.1;
      const offset = circumference - (state.progress / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }

    if (playIcon && pauseIcon) {
      if (state.isRunning) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    }
  }

  /**
   * Dispara efeito visual de flash na tela quando o tempo acaba
   */
  triggerScreenFlash() {
    const flash = document.getElementById('screenFlash');
    if (flash) {
      flash.classList.add('active');
      setTimeout(() => {
        flash.classList.remove('active');
      }, 500);
    }
  }

  /**
   * Renderiza a tela de histórico
   */
  renderHistory(history) {
    const container = document.getElementById('workoutExercises');
    const summaryContainer = document.getElementById('tonnageSummary');
    if (!container) return;

    if (summaryContainer) summaryContainer.innerHTML = '';

    if (!history || history.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px auto; opacity: 0.5;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <h3 style="color: var(--text-primary); margin-bottom: 6px;">Nenhum treino registrado</h3>
          <p style="font-size: 0.85rem;">Conclua seus treinos para acompanhar o progresso e a evolução da tonelagem aqui.</p>
        </div>
      `;
      return;
    }

    let html = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="font-size: 1.1rem; font-weight: 800;">Histórico de Sessões</h2>
        <button id="btnClearHistory" class="card-action-btn delete-btn" style="font-size: 0.75rem;">Limpar Histórico</button>
      </div>
    `;

    history.forEach((session) => {
      const dateStr = new Date(session.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      html += `
        <div class="exercise-card" style="margin-bottom: 12px;">
          <div class="exercise-header" style="margin-bottom: 8px;">
            <div>
              <h3 class="exercise-name">${session.workoutName || 'Treino'}</h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 1.1rem; font-weight: 800; color: var(--accent-yellow);">${formatWeight(session.totalVolumeKg || 0)} kg</span>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${session.completedSets || 0} séries feitas</div>
            </div>
          </div>
          ${
            session.muscleBreakdown && session.muscleBreakdown.length > 0
              ? `
            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;">
              ${session.muscleBreakdown
                .slice(0, 4)
                .map(
                  (m) => `
                <span class="badge-muscle" style="font-size: 0.68rem;">${m.muscle}: ${formatWeight(m.volumeKg)}kg</span>
              `
                )
                .join('')}
            </div>
          `
              : ''
          }
        </div>
      `;
    });

    container.innerHTML = html;

    document.getElementById('btnClearHistory')?.addEventListener('click', () => {
      if (confirm('Deseja realmente apagar o histórico de treinos salvos?')) {
        this.app.clearHistory();
      }
    });
  }
}
