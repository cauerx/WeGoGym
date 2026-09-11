// Módulo de Cronômetro de Descanso (Rest Timer) com Áudio, Notificações e Vibração
export class RestTimer {
  constructor(options = {}) {
    this.duration = options.defaultDuration || 90; // segundos
    this.remaining = this.duration;
    this.isRunning = false;
    this.timerId = null;
    this.targetEndTime = null;
    this.audioContext = null;
    this.audioUnlocked = false;

    // Callbacks
    this.onTick = options.onTick || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onStateChange = options.onStateChange || (() => {});

    this._initAudioUnlock();
  }

  /**
   * Desbloqueio de áudio para iOS Safari no primeiro toque
   */
  _initAudioUnlock() {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          if (!this.audioContext) {
            this.audioContext = new AudioCtx();
          }
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
          this.audioUnlocked = true;
        }
      } catch (e) {
        console.warn('AudioContext init warning:', e);
      }
      ['touchstart', 'touchend', 'click'].forEach((event) => {
        window.removeEventListener(event, unlockAudio, { capture: true });
      });
    };

    ['touchstart', 'touchend', 'click'].forEach((event) => {
      window.addEventListener(event, unlockAudio, { capture: true, once: true });
    });
  }

  /**
   * Verifica o status atual da permissão de notificações
   */
  static getNotificationStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'granted', 'denied', 'default'
  }

  /**
   * Solicita permissão para envio de notificações do sistema
   */
  static async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificação:', err);
      return 'denied';
    }
  }

  /**
   * Envia Notificação Push / Local e dispara vibração do sistema
   */
  sendNotification(customTitle = null, customBody = null) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const title = customTitle || 'Descanso Finalizado! ⏱️';
    const options = {
      body: customBody || 'Hora da próxima série! Força total 💪',
      icon: 'icons/icon-192.png',
      badge: 'icons/favicon-32.png',
      vibrate: [300, 150, 300, 150, 500],
      tag: 'wegogym-rest-timer',
      renotify: true,
      requireInteraction: false
    };

    // Prefere usar o Service Worker para garantir suporte no iOS PWA instalado
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification(title, options);
        })
        .catch(() => {
          try {
            new Notification(title, options);
          } catch (e) {}
        });
    } else {
      try {
        new Notification(title, options);
      } catch (e) {
        console.warn('Notificação fallback erro:', e);
      }
    }
  }

  /**
   * Dispara vibração no celular (Android e navegadores com suporte a haptics)
   */
  triggerVibration() {
    if ('vibrate' in navigator) {
      try {
        // Padrão de vibração: Vibra 300ms, pausa 150ms, vibra 300ms, pausa 150ms, vibra 500ms
        navigator.vibrate([300, 150, 300, 150, 500]);
      } catch (e) {
        console.warn('Erro na vibração:', e);
      }
    }
  }

  /**
   * Toca sinal sonoro sintetizado em tom dourado/energético
   */
  playAlertSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      if (!this.audioContext) return;

      const now = this.audioContext.currentTime;

      // Nota 1 (987.77 Hz - B5)
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      gain1.gain.setValueAtTime(0.32, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Nota 2 (1318.51 Hz - E6)
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.15);
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.55);

      // Nota 3 (1760 Hz - A6) - Acorde Triunfante
      const osc3 = this.audioContext.createOscillator();
      const gain3 = this.audioContext.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1760, now + 0.3);
      gain3.gain.setValueAtTime(0.38, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc3.connect(gain3);
      gain3.connect(this.audioContext.destination);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.85);
    } catch (err) {
      console.warn('Erro ao tocar áudio sintetizado:', err);
    }
  }

  /**
   * Dispara todos os alertas de conclusão (Som + Vibração + Notificação Push)
   */
  triggerAllAlerts() {
    this.playAlertSound();
    this.triggerVibration();
    this.sendNotification();
  }

  /**
   * Inicia ou reinicia o temporizador com os segundos especificados
   */
  start(seconds = null) {
    this.stop();
    if (seconds !== null) {
      this.duration = Math.max(5, parseInt(seconds, 10) || 60);
    }
    this.remaining = this.duration;
    this.isRunning = true;
    this.targetEndTime = Date.now() + this.remaining * 1000;

    this.onStateChange(this.getState());
    this.onTick(this.getState());

    this.timerId = setInterval(() => {
      const now = Date.now();
      const diffMs = this.targetEndTime - now;
      this.remaining = Math.max(0, Math.ceil(diffMs / 1000));

      this.onTick(this.getState());

      if (this.remaining <= 0) {
        this.stop(false);
        this.triggerAllAlerts();
        this.onComplete(this.getState());
      }
    }, 250);
  }

  /**
   * Pausa o temporizador mantendo o tempo restante
   */
  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerId);
    this.timerId = null;
    this.onStateChange(this.getState());
  }

  /**
   * Retoma a contagem de onde parou
   */
  resume() {
    if (this.isRunning || this.remaining <= 0) return;
    this.isRunning = true;
    this.targetEndTime = Date.now() + this.remaining * 1000;
    this.onStateChange(this.getState());

    this.timerId = setInterval(() => {
      const now = Date.now();
      const diffMs = this.targetEndTime - now;
      this.remaining = Math.max(0, Math.ceil(diffMs / 1000));

      this.onTick(this.getState());

      if (this.remaining <= 0) {
        this.stop(false);
        this.triggerAllAlerts();
        this.onComplete(this.getState());
      }
    }, 250);
  }

  /**
   * Ajusta o tempo restante adicionando ou removendo segundos (+15s / -15s)
   */
  adjustTime(secondsDelta) {
    this.remaining = Math.max(5, this.remaining + secondsDelta);
    if (this.remaining > this.duration) {
      this.duration = this.remaining;
    }
    if (this.isRunning) {
      this.targetEndTime = Date.now() + this.remaining * 1000;
    }
    this.onTick(this.getState());
  }

  /**
   * Interrompe o cronômetro
   */
  stop(notify = true) {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
    if (notify) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * Reseta o timer para a duração configurada
   */
  reset() {
    this.stop();
    this.remaining = this.duration;
    this.onTick(this.getState());
  }

  /**
   * Define o tempo padrão
   */
  setDefaultDuration(seconds) {
    this.duration = Math.max(5, parseInt(seconds, 10) || 60);
    if (!this.isRunning) {
      this.remaining = this.duration;
      this.onTick(this.getState());
    }
  }

  /**
   * Retorna o estado atual
   */
  getState() {
    const progress = this.duration > 0 ? (this.remaining / this.duration) * 100 : 0;
    return {
      duration: this.duration,
      remaining: this.remaining,
      formattedTime: this.formatTime(this.remaining),
      isRunning: this.isRunning,
      progress
    };
  }

  /**
   * Formata segundos no formato mm:ss
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
