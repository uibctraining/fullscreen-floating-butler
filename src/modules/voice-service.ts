/**
 * 99Pages Agentic OS - Voice Service
 * ===================================
 * 
 * Continuous listening with ASR (Automatic Speech Recognition)
 * and VAD (Voice Activity Detection)
 */

export interface VoiceConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxSilenceMs: number;
  vadThreshold: number;
}

export interface VoiceCallbacks {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onVolumeChange?: (volume: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onSilence?: () => void;
  onSpeech?: () => void;
}

export class VoiceService {
  private recognition: any | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationId: number | null = null;

  private config: VoiceConfig;
  private callbacks: VoiceCallbacks;
  private isListening = false;
  private isSpeaking = false;
  private volume = 0;
  private silenceTimer: number | null = null;

  constructor(config: Partial<VoiceConfig> = {}, callbacks: VoiceCallbacks = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxSilenceMs: 15000, // 15 seconds
      vadThreshold: 0.01,
      ...config
    };
    this.callbacks = callbacks;
  }

  /**
   * Initialize speech recognition
   */
  private initRecognition(): boolean {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      this.callbacks.onError?.('Speech recognition not supported');
      return false;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;

    this.recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const transcript = last[0].transcript;
      const isFinal = last.isFinal;

      this.callbacks.onResult?.(transcript, isFinal);

      // Reset silence timer on speech
      this.resetSilenceTimer();
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.callbacks.onEnd?.();

      // Auto-restart if continuous mode
      if (this.config.continuous && this.isListening) {
        setTimeout(() => this.start(), 100);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // Ignore no-speech errors in continuous mode
        return;
      }
      this.callbacks.onError?.(event.error);
    };

    return true;
  }

  /**
   * Initialize audio analysis for VAD
   */
  private async initAudio(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      return true;
    } catch (error) {
      this.callbacks.onError?.('Failed to access microphone');
      return false;
    }
  }

  /**
   * Start volume monitoring for VAD
   */
  private startVolumeMonitoring() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length / 255;
      this.volume = average;

      // VAD detection
      if (average > this.config.vadThreshold) {
        if (!this.isSpeaking) {
          this.isSpeaking = true;
          this.callbacks.onSpeech?.();
          this.resetSilenceTimer();
        }
      } else {
        if (this.isSpeaking) {
          this.isSpeaking = false;
          this.callbacks.onSilence?.();
          this.startSilenceTimer();
        }
      }

      this.callbacks.onVolumeChange?.(this.volume);
      this.animationId = requestAnimationFrame(update);
    };

    update();
  }

  /**
   * Start silence timer
   */
  private startSilenceTimer() {
    this.silenceTimer = window.setTimeout(() => {
      // Auto-stop after max silence
      if (this.config.continuous) {
        // In continuous mode, just notify
        this.callbacks.onSilence?.();
      } else {
        this.stop();
      }
    }, this.config.maxSilenceMs);
  }

  /**
   * Reset silence timer
   */
  private resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Start listening
   */
  async start(): Promise<boolean> {
    if (this.isListening) return true;

    // Initialize audio
    const audioReady = await this.initAudio();
    if (!audioReady) return false;

    // Initialize recognition
    if (!this.initRecognition()) return false;

    // Start recognition
    try {
      this.recognition.start();
      this.startVolumeMonitoring();
      return true;
    } catch (error) {
      this.callbacks.onError?.('Failed to start recognition');
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop() {
    this.resetSilenceTimer();

    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.isListening = false;
    this.isSpeaking = false;
    this.volume = 0;
  }

  /**
   * Toggle listening
   */
  async toggle(): Promise<boolean> {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return await this.start();
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      volume: this.volume
    };
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<VoiceConfig>) {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton
export const voiceService = new VoiceService();
