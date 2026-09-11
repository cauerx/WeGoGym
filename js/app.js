// WeGoGym — Orquestrador Principal da Aplicação
import { StorageService } from './modules/storage.js';
import { RestTimer } from './modules/timer.js';
import { UIManager } from './modules/ui.js';
import { calculateWorkoutTonnage, formatWeight } from './modules/tonnage.js';

class App {
  constructor() {
    this.workouts = StorageService.getWorkouts();
    this.settings = StorageService.getSettings();
    this.activeWorkoutId = StorageService.getActiveWorkoutId();
    this.ui = new UIManager(this);

    // Inicializa o Cronômetro de Descanso com callbacks reativos
    this.timer = new RestTimer({
      defaultDuration: this.settings.defaultRestTime || 90,
      onTick: (state) => this.ui.updateTimerBar(state),
      onStateChange: (state) => this.ui.updateTimerBar(state),
      onComplete: (state) => {
        this.ui.updateTimerBar(state);
        this.ui.triggerScreenFlash();
      }
    });

    this.init();
  }

  init() {
    // Registrar Service Worker para funcionamento 100% offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => console.log('WeGoGym SW registrado:', reg.scope))
        .catch((err) => console.warn('WeGoGym SW erro:', err));
    }

    // Inicialização da UI e renderização inicial
    this.render();
    this.setupGlobalEventListeners();
    this.checkIosBannerState();
  }

  /**
   * Obtém o treino atualmente ativo
   */
  getActiveWorkout() {
    return this.workouts.find((w) => w.id === this.activeWorkoutId) || this.workouts[0];
  }

  /**
   * Renderiza a interface de acordo com a aba ativa
   */
  render() {
    this.ui.renderWorkoutTabs(this.workouts, this.activeWorkoutId);

    const workoutActions = document.getElementById('workoutActions');

    if (this.activeWorkoutId === 'history') {
      if (workoutActions) workoutActions.style.display = 'none';
      const history = StorageService.getHistory();
      this.ui.renderHistory(history);
    } else {
      if (workoutActions) workoutActions.style.display = 'flex';
      const currentWorkout = this.getActiveWorkout();
      this.ui.renderTonnageSummary(currentWorkout);
      this.ui.renderWorkoutExercises(currentWorkout);
    }
  }

  /**
   * Seleciona uma aba de treino ou histórico
   */
  selectWorkout(workoutId) {
    this.activeWorkoutId = workoutId;
    StorageService.setActiveWorkoutId(workoutId);
    this.render();
  }

  /**
   * Alterna tipo de série entre Trabalho e Aquecimento
   */
  toggleSetType(exerciseIndex, setIndex) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    const set = workout.exercises[exerciseIndex].sets[setIndex];
    if (set) {
      set.type = set.type === 'warmup' ? 'work' : 'warmup';
      this.saveAndRefresh();
    }
  }

  /**
   * Altera a unidade de um exercício específico entre KG e LBS
   */
  changeExerciseUnit(exerciseIndex, targetUnit) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    workout.exercises[exerciseIndex].unit = targetUnit;
    this.saveAndRefresh();
  }

  /**
   * Atualiza a carga de uma série
   */
  updateSetWeight(exerciseIndex, setIndex, newWeight) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    const set = workout.exercises[exerciseIndex].sets[setIndex];
    if (set) {
      set.weight = parseFloat(newWeight) || 0;
      this.saveAndRefresh(false);
    }
  }

  /**
   * Atualiza repetições de uma série
   */
  updateSetReps(exerciseIndex, setIndex, newReps) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    const set = workout.exercises[exerciseIndex].sets[setIndex];
    if (set) {
      set.reps = parseInt(newReps, 10) || 0;
      this.saveAndRefresh(false);
    }
  }

  /**
   * Marca / desmarca série como concluída e dispara timer de descanso
   */
  toggleSetComplete(exerciseIndex, setIndex) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    const set = workout.exercises[exerciseIndex].sets[setIndex];
    if (!set) return;

    set.completed = !set.completed;
    this.saveAndRefresh();

    // Se concluiu a série e o timer automático estiver ativo, inicia o descanso!
    if (set.completed && this.settings.autoStartTimer) {
      this.timer.start(this.settings.defaultRestTime || 90);
    }
  }

  /**
   * Adiciona nova série ao exercício
   */
  addSetToExercise(exerciseIndex) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    const sets = workout.exercises[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];

    sets.push({
      type: 'work',
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 10,
      completed: false
    });

    this.saveAndRefresh();
  }

  /**
   * Remove uma série do exercício
   */
  deleteSetFromExercise(exerciseIndex, setIndex) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    const sets = workout.exercises[exerciseIndex].sets;
    if (sets.length <= 1) {
      alert('O exercício precisa ter pelo menos 1 série.');
      return;
    }

    sets.splice(setIndex, 1);
    this.saveAndRefresh();
  }

  /**
   * Substitui um exercício por outro da biblioteca ou customizado
   */
  swapExercise(exerciseIndex, newExerciseData) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    const currentEx = workout.exercises[exerciseIndex];
    const existingSets = currentEx.sets.map((s) => ({ ...s, completed: false }));

    workout.exercises[exerciseIndex] = {
      id: newExerciseData.id,
      name: newExerciseData.name,
      primaryMuscle: newExerciseData.primaryMuscle,
      secondaryMuscle: newExerciseData.secondaryMuscle || null,
      unit: newExerciseData.defaultUnit || currentEx.unit || 'kg',
      sets: existingSets.length > 0 ? existingSets : [
        { type: 'work', weight: 20, reps: 10, completed: false },
        { type: 'work', weight: 20, reps: 10, completed: false },
        { type: 'work', weight: 20, reps: 10, completed: false }
      ]
    };

    this.saveAndRefresh();
  }

  /**
   * Adiciona um novo exercício ao final do treino atual
   */
  addExerciseToCurrentWorkout(exerciseData) {
    const workout = this.getActiveWorkout();
    if (!workout) return;

    workout.exercises.push({
      id: exerciseData.id,
      name: exerciseData.name,
      primaryMuscle: exerciseData.primaryMuscle,
      secondaryMuscle: exerciseData.secondaryMuscle || null,
      unit: exerciseData.defaultUnit || 'kg',
      sets: [
        { type: 'warmup', weight: 15, reps: 10, completed: false },
        { type: 'work', weight: 25, reps: 10, completed: false },
        { type: 'work', weight: 25, reps: 10, completed: false }
      ]
    });

    this.saveAndRefresh();
  }

  /**
   * Remove um exercício do treino atual
   */
  deleteExercise(exerciseIndex) {
    const workout = this.getActiveWorkout();
    if (!workout || !workout.exercises[exerciseIndex]) return;

    if (confirm(`Remover "${workout.exercises[exerciseIndex].name}" do treino?`)) {
      workout.exercises.splice(exerciseIndex, 1);
      this.saveAndRefresh();
    }
  }

  /**
   * Salva os dados no LocalStorage e atualiza a UI
   */
  saveAndRefresh(fullRerender = true) {
    StorageService.saveWorkouts(this.workouts);
    if (fullRerender) {
      this.render();
    } else {
      // Atualiza apenas o sumário de tonelagem sem recriar os campos de input
      const currentWorkout = this.getActiveWorkout();
      this.ui.renderTonnageSummary(currentWorkout);
    }
  }

  /**
   * Finaliza o treino, exibe o resumo comemorativo e salva no histórico
   */
  finishWorkout() {
    const workout = this.getActiveWorkout();
    if (!workout) return;

    const metrics = calculateWorkoutTonnage(workout, 'all');

    if (metrics.completedSets === 0) {
      if (!confirm('Você ainda não marcou nenhuma série como concluída. Deseja finalizar mesmo assim?')) {
        return;
      }
    }

    // Salvar no histórico
    StorageService.addHistoryEntry({
      workoutId: workout.id,
      workoutName: workout.name,
      totalVolumeKg: metrics.totalVolumeKg,
      workVolumeKg: metrics.workVolumeKg,
      completedSets: metrics.completedSets,
      totalSets: metrics.totalSets,
      muscleBreakdown: metrics.muscleBreakdown
    });

    // Exibir modal de comemoração com estatísticas
    this.openWorkoutSummaryModal(workout, metrics);

    // Reseta as marcações de 'completed' para a próxima sessão
    workout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        s.completed = false;
      });
    });
    this.saveAndRefresh();
  }

  openWorkoutSummaryModal(workout, metrics) {
    const modal = document.getElementById('workoutSummaryModal');
    const content = document.getElementById('summaryModalContent');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="font-size: 0.9rem; color: var(--text-secondary);">${workout.name} concluído com sucesso!</div>
        <div style="font-size: 2.5rem; font-weight: 800; color: #ffffff; margin: 8px 0;">
          ${formatWeight(metrics.totalVolumeKg)} <span style="font-size: 1.2rem; color: var(--accent-yellow);">kg</span>
        </div>
        <div style="font-size: 0.85rem; color: var(--accent-yellow); font-weight: 700;">
          Tonelagem Total Movimentada
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #0e1119; padding: 14px; border-radius: 14px; border: 1px solid var(--border-subtle);">
        <div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">SÉRIES REALIZADAS</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: #ffffff;">${metrics.completedSets} de ${metrics.totalSets}</div>
        </div>
        <div>
          <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">VOLUME DE TRABALHO</div>
          <div style="font-size: 1.2rem; font-weight: 800; color: var(--accent-yellow);">${formatWeight(metrics.workVolumeKg)} kg</div>
        </div>
      </div>

      <div style="background: #0e1119; padding: 14px; border-radius: 14px; border: 1px solid var(--border-subtle);">
        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
          Grupamentos Mais Solicitados
        </div>
        ${metrics.muscleBreakdown
          .slice(0, 5)
          .map(
            (m) => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 0.85rem;">
            <span style="font-weight: 600;">${m.muscle}</span>
            <span style="color: var(--accent-yellow); font-weight: 700;">${formatWeight(m.volumeKg)} kg (${m.percentage}%)</span>
          </div>
        `
          )
          .join('')}
      </div>

      <button id="btnFinishSummaryConfirm" class="btn-finish-workout" style="margin-top: 10px;">
        Excelente! Fechar Resumo
      </button>
    `;

    modal.classList.add('active');

    document.getElementById('btnFinishSummaryConfirm')?.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  clearHistory() {
    StorageService.clearHistory();
    this.render();
  }

  resetToDefaultWorkouts() {
    if (confirm('Restaurar todos os treinos para o padrão inicial (Upper 1, Lower, Upper 2)? Todas as alterações serão redefinidas.')) {
      this.workouts = StorageService.resetToDefaultWorkouts();
      this.render();
      alert('Treinos restaurados com sucesso!');
    }
  }

  /**
   * Configuração de ouvintes de eventos globais
   */
  setupGlobalEventListeners() {
    // Botão Adicionar Exercício
    document.getElementById('btnAddExerciseBtn')?.addEventListener('click', () => {
      this.ui.openSwapExerciseModal(null);
    });

    // Botão Finalizar Treino
    document.getElementById('btnFinishWorkout')?.addEventListener('click', () => {
      this.finishWorkout();
    });

    // Modal de Troca / Seleção de Exercício: Fechamento e Busca
    document.getElementById('btnCloseExerciseModal')?.addEventListener('click', () => {
      this.ui.closeExerciseModal();
    });

    document.getElementById('exerciseModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'exerciseModal') this.ui.closeExerciseModal();
    });

    const searchInput = document.getElementById('exerciseSearchInput');
    searchInput?.addEventListener('input', (e) => {
      this.ui.searchQuery = e.target.value;
      this.ui.renderExerciseOptionsList();
    });

    // Controles da Barra Flutuante de Timer de Descanso
    document.getElementById('btnTimerToggle')?.addEventListener('click', () => {
      if (this.timer.isRunning) {
        this.timer.pause();
      } else {
        this.timer.resume();
      }
    });

    document.getElementById('btnTimerMinus15')?.addEventListener('click', () => {
      this.timer.adjustTime(-15);
    });

    document.getElementById('btnTimerPlus15')?.addEventListener('click', () => {
      this.timer.adjustTime(15);
    });

    document.getElementById('btnTimerClose')?.addEventListener('click', () => {
      this.timer.stop();
      document.getElementById('floatingTimerBar')?.classList.add('hidden');
    });

    // Modal de Configurações
    document.getElementById('btnOpenSettings')?.addEventListener('click', () => {
      this.openSettingsModal();
    });

    document.getElementById('btnCloseSettingsModal')?.addEventListener('click', () => {
      document.getElementById('settingsModal')?.classList.remove('active');
    });

    document.getElementById('settingsModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'settingsModal') {
        document.getElementById('settingsModal')?.classList.remove('active');
      }
    });

    // Modal iOS Guide
    document.getElementById('btnOpenIosGuide')?.addEventListener('click', () => {
      document.getElementById('iosGuideModal')?.classList.add('active');
    });

    document.getElementById('btnCloseIosGuideModal')?.addEventListener('click', () => {
      document.getElementById('iosGuideModal')?.classList.remove('active');
    });

    document.getElementById('btnConfirmIosGuide')?.addEventListener('click', () => {
      document.getElementById('iosGuideModal')?.classList.remove('active');
    });

    document.getElementById('iosGuideModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'iosGuideModal') {
        document.getElementById('iosGuideModal')?.classList.remove('active');
      }
    });

    // Modal Resumo Conclusão
    document.getElementById('btnCloseSummaryModal')?.addEventListener('click', () => {
      document.getElementById('workoutSummaryModal')?.classList.remove('active');
    });

    // Ativação e Teste de Notificações & Vibração
    document.getElementById('btnEnableNotifications')?.addEventListener('click', async () => {
      await RestTimer.requestNotificationPermission();
      this.updateNotificationUIState();
    });

    document.getElementById('btnTestNotification')?.addEventListener('click', async () => {
      const status = RestTimer.getNotificationStatus();
      if (status !== 'granted') {
        const res = await RestTimer.requestNotificationPermission();
        this.updateNotificationUIState();
        if (res !== 'granted') {
          alert('Por favor, autorize as notificações para que o aviso no celular funcione!');
          return;
        }
      }
      this.timer.triggerAllAlerts();
      this.ui.triggerScreenFlash();
    });

    // Banner iOS Dismiss
    document.getElementById('btnDismissIosBanner')?.addEventListener('click', () => {
      document.getElementById('iosInstallBanner')?.remove();
      localStorage.setItem('wegogym_dismiss_ios_banner', 'true');
    });
  }

  updateNotificationUIState() {
    const badge = document.getElementById('notifStatusBadge');
    const btn = document.getElementById('btnEnableNotifications');
    if (!badge || !btn) return;

    const status = RestTimer.getNotificationStatus();
    if (status === 'granted') {
      badge.innerText = 'Ativado ✅';
      badge.style.color = '#fde047';
      badge.style.background = 'rgba(250, 204, 21, 0.2)';
      btn.innerText = 'Permitido';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    } else if (status === 'denied') {
      badge.innerText = 'Bloqueado ⚠️';
      badge.style.color = '#f87171';
      badge.style.background = 'rgba(239, 68, 68, 0.15)';
      btn.innerText = 'Bloqueado';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    } else if (status === 'unsupported') {
      badge.innerText = 'Indisponível';
      badge.style.color = '#94a3b8';
      badge.style.background = 'rgba(255, 255, 255, 0.1)';
      btn.innerText = 'N/A';
      btn.disabled = true;
    } else {
      badge.innerText = 'Pendente 🔔';
      badge.style.color = '#fbbf24';
      badge.style.background = 'rgba(245, 158, 11, 0.15)';
      btn.innerText = 'Ativar';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }

  checkIosBannerState() {
    if (localStorage.getItem('wegogym_dismiss_ios_banner') === 'true') {
      document.getElementById('iosInstallBanner')?.remove();
    }
  }

  openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;

    this.updateNotificationUIState();

    const customInput = document.getElementById('customRestTimeInput');
    const autoStartCheck = document.getElementById('autoStartTimerCheck');

    if (customInput) customInput.value = this.settings.defaultRestTime || 90;
    if (autoStartCheck) autoStartCheck.checked = !!this.settings.autoStartTimer;

    // Presets rápidos
    const presetButtons = modal.querySelectorAll('.timer-preset-btn');
    presetButtons.forEach((btn) => {
      const time = parseInt(btn.getAttribute('data-time'), 10);
      btn.classList.toggle('active', time === this.settings.defaultRestTime);

      btn.onclick = () => {
        presetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (customInput) customInput.value = time;
        this.updateRestTimeSetting(time);
      };
    });

    customInput.onchange = () => {
      const val = parseInt(customInput.value, 10);
      if (val >= 5) {
        presetButtons.forEach((b) => b.classList.remove('active'));
        this.updateRestTimeSetting(val);
      }
    };

    autoStartCheck.onchange = () => {
      this.settings.autoStartTimer = autoStartCheck.checked;
      StorageService.saveSettings(this.settings);
    };

    // Testar som
    document.getElementById('btnTestSound').onclick = () => {
      this.timer.playAlertSound();
    };

    // Reset de treinos
    document.getElementById('btnResetWorkouts').onclick = () => {
      this.resetToDefaultWorkouts();
      modal.classList.remove('active');
    };

    // Export / Import Backup
    document.getElementById('btnExportData').onclick = () => {
      const data = StorageService.exportBackup();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wegogym_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const fileInput = document.getElementById('importFileInput');
    document.getElementById('btnImportData').onclick = () => {
      fileInput?.click();
    };

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const ok = StorageService.importBackup(event.target.result);
        if (ok) {
          this.workouts = StorageService.getWorkouts();
          this.settings = StorageService.getSettings();
          this.render();
          alert('Backup restaurado com sucesso!');
          modal.classList.remove('active');
        } else {
          alert('Erro ao importar backup. Arquivo inválido.');
        }
      };
      reader.readAsText(file);
    };

    modal.classList.add('active');
  }

  updateRestTimeSetting(seconds) {
    this.settings.defaultRestTime = seconds;
    this.timer.setDefaultDuration(seconds);
    StorageService.saveSettings(this.settings);
  }
}

// Inicializa o App assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.weGoGymApp = new App();
});
