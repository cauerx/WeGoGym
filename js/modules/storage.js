// Módulo de Armazenamento Local (LocalStorage)
import { DEFAULT_WORKOUTS } from '../data/defaultWorkouts.js';

const STORAGE_KEYS = {
  WORKOUTS: 'wegogym_workouts_v1',
  ACTIVE_WORKOUT_ID: 'wegogym_active_id',
  SETTINGS: 'wegogym_settings_v1',
  HISTORY: 'wegogym_history_v1',
  SESSION_START_TIME: 'wegogym_session_start'
};

const DEFAULT_SETTINGS = {
  defaultRestTime: 90, // segundos
  autoStartTimer: true,
  soundEnabled: true,
  vibrateEnabled: true,
  notificationsEnabled: true,
  theme: 'gold'
};

export class StorageService {
  static getWorkouts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      if (!data) {
        this.saveWorkouts(DEFAULT_WORKOUTS);
        return JSON.parse(JSON.stringify(DEFAULT_WORKOUTS));
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Erro ao ler treinos:', e);
      return JSON.parse(JSON.stringify(DEFAULT_WORKOUTS));
    }
  }

  static saveWorkouts(workouts) {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (e) {
      console.error('Erro ao salvar treinos:', e);
    }
  }

  static resetToDefaultWorkouts() {
    this.saveWorkouts(DEFAULT_WORKOUTS);
    return JSON.parse(JSON.stringify(DEFAULT_WORKOUTS));
  }

  static getActiveWorkoutId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT_ID) || 'upper-1';
  }

  static setActiveWorkoutId(id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT_ID, id);
  }

  static getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Erro ao salvar configurações:', e);
    }
  }

  static getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static addHistoryEntry(entry) {
    const history = this.getHistory();
    history.unshift({
      id: 'session_' + Date.now(),
      date: new Date().toISOString(),
      ...entry
    });
    // Manter últimos 50 treinos
    if (history.length > 50) history.pop();
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Erro ao salvar histórico:', e);
    }
  }

  static clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  }

  static exportBackup() {
    const backup = {
      workouts: this.getWorkouts(),
      settings: this.getSettings(),
      history: this.getHistory(),
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backup, null, 2);
  }

  static importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.workouts) this.saveWorkouts(data.workouts);
      if (data.settings) this.saveSettings(data.settings);
      if (data.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      return true;
    } catch (e) {
      console.error('Backup inválido:', e);
      return false;
    }
  }
}
