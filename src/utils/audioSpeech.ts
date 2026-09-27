/**
 * Audio and Speech Synthesis Engine
 * Combines server-side Gemini TTS with browser Web Speech API fallback
 * and procedural Web Audio ambient soundtrack generator.
 */

// Procedural ambient soundtrack generator using Web Audio API
class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private intervalId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.1);
    }
  }

  public playTrack(theme: 'ambient_warmth' | 'cinematic_orchestral' | 'upbeat_lofi' | 'none') {
    this.stop();
    if (theme === 'none') return;
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    this.isPlaying = true;
    const chordsByTheme = {
      ambient_warmth: [
        [220, 277.18, 329.63, 440], // A minor / warm pad
        [174.61, 220, 261.63, 349.23], // F major
        [196, 246.94, 293.66, 392], // G major
        [164.81, 207.65, 246.94, 329.63] // E minor
      ],
      cinematic_orchestral: [
        [130.81, 196, 261.63, 311.13], // C minor dramatic
        [116.54, 174.61, 233.08, 293.66], // Bb major
        [103.83, 155.56, 207.65, 261.63], // Ab major
        [98, 146.83, 196, 246.94] // G majestic
      ],
      upbeat_lofi: [
        [261.63, 329.63, 392, 493.88], // Cmaj7
        [220, 261.63, 329.63, 392], // Am7
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [196, 246.94, 293.66, 349.23] // G7
      ]
    };

    const chordList = chordsByTheme[theme] || chordsByTheme.ambient_warmth;
    let chordIndex = 0;

    const playChord = () => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;
      
      // Stop previous
      this.oscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.oscillators = [];

      const freqs = chordList[chordIndex % chordList.length];
      chordIndex++;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const chordGain = this.ctx!.createGain();
        osc.type = theme === 'cinematic_orchestral' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        // Soft attack & release
        chordGain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
        chordGain.gain.exponentialRampToValueAtTime(0.04 / (idx + 1), this.ctx!.currentTime + 1.2);
        chordGain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 4.8);

        // Lowpass filter for smooth warmth
        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = theme === 'cinematic_orchestral' ? 600 : 450;

        osc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.gainNode!);

        osc.start();
        this.oscillators.push(osc);
      });
    };

    playChord();
    this.intervalId = window.setInterval(playChord, 5000);
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.oscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.oscillators = [];
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }
}

export const ambientMusic = new AmbientMusicEngine();

export interface SpeechPlaybackOptions {
  voiceName?: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  lang?: string; // e.g. 'hi-IN', 'es-ES', 'fr-FR', 'de-DE', 'zh-CN', 'ja-JP', 'ar-SA', 'en-US'
  rate?: number; // 0.8 - 1.3
  volume?: number;
  onProgress?: (progress: number, currentWord?: string) => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechNarrator {
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSpeaking = false;

  public async speakText(
    text: string, 
    options: SpeechPlaybackOptions = {}
  ): Promise<void> {
    this.stop();
    this.isSpeaking = true;

    // Try Gemini TTS first
    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: options.voiceName || 'Kore',
          stylePrompt: options.lang?.startsWith('hi') 
            ? 'Clear, authoritative Hindi financial documentary narrator'
            : options.lang?.startsWith('es')
            ? 'Clear, authoritative Spanish financial documentary narrator'
            : 'Clear, authoritative, engaging financial documentary voice actor'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioUrl) {
          await this.playBase64Audio(data.audioUrl, options);
          return;
        }
      }
    } catch (e) {
      console.warn('Gemini TTS server fallback to Web Speech API:', e);
    }

    // High quality Web Speech API fallback with multi-lingual voice selection
    this.speakWithWebSpeech(text, options);
  }

  private playBase64Audio(audioUrl: string, options: SpeechPlaybackOptions): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;
      audio.volume = options.volume ?? 1;

      audio.ontimeupdate = () => {
        if (options.onProgress && audio.duration) {
          options.onProgress(audio.currentTime / audio.duration);
        }
      };

      audio.onended = () => {
        this.isSpeaking = false;
        options.onProgress?.(1);
        options.onEnd?.();
        resolve();
      };

      audio.onerror = (e) => {
        console.warn('HTML5 Audio playback error, falling back to Web Speech:', e);
        this.speakWithWebSpeech(audioUrl, options);
        resolve();
      };

      audio.play().catch(() => {
        options.onEnd?.();
        resolve();
      });
    });
  }

  private speakWithWebSpeech(text: string, options: SpeechPlaybackOptions) {
    if (!('speechSynthesis' in window)) {
      options.onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.98;
    utterance.pitch = 1.0;
    utterance.volume = options.volume ?? 1;

    const targetLangCode = options.lang || 'en-US';
    utterance.lang = targetLangCode;

    // Select the best available natural voice matching target language
    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = targetLangCode.split('-')[0].toLowerCase();

    const matchingVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(targetPrefix) && 
      (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Google') || v.name.includes('Premium'))
    ) || voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    const words = text.split(/\s+/);
    let wordIndex = 0;

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const progress = Math.min(1, wordIndex / words.length);
        options.onProgress?.(progress, words[wordIndex]);
        wordIndex++;
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      options.onProgress?.(1);
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    this.isSpeaking = false;
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsSpeaking() {
    return this.isSpeaking;
  }
}

export const speechNarrator = new SpeechNarrator();
