// Módulo de Cronômetro de Descanso (Rest Timer) com Áudio para iOS Safari
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
      // Remove os ouvintes após o primeiro toque
      ['touchstart', 'touchend', 'click'].forEach((event) => {
        window.removeEventListener(event, unlockAudio, { capture: true });
      });
    };

    ['touchstart', 'touchend', 'click'].forEach((event) => {
      window.addEventListener(event, unlockAudio, { capture: true, once: true });
    });
  }

  /**
   * Toca sinal sonoro agradável e nítido sintetizado (Zero dependência de MP3)
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

      // Primeiro tom (880 Hz - Nota A5)
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Segundo tom harmônico mais agudo (1318.5 Hz - Nota E6)
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.18);
      gain2.gain.setValueAtTime(0.35, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.65);
    } catch (err) {
      console.warn('Erro ao tocar áudio sintetizado:', err);
    }

    // Tenta vibração se o dispositivo suportar
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 400]);
      } catch (e) {}
    }
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
        this.playAlertSound();
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
        this.playAlertSound();
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
