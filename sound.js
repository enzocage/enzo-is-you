// sound.js - Web Audio API Synthesizer for "Enzo Is You" Clone

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.5;
    this.sfxVolume = 0.6;
    this.musicVolume = 0.3;
    
    this.musicPlaying = false;
    this.ambientInterval = null;
    this.activeSynthNodes = [];
    
    // Ambient Music Chords (C Major Pentatonic frequencies)
    this.chords = [
      [130.81, 196.00, 261.63, 329.63], // C major (C3, G3, C4, E4)
      [174.61, 261.63, 349.23, 440.00], // F major (F3, C4, F4, A4)
      [196.00, 293.66, 392.00, 493.88], // G major (G3, D4, G4, B4)
      [220.00, 329.63, 440.00, 523.25]  // A minor (A3, E4, A4, C5)
    ];
    this.currentChordIndex = 0;
  }

  init() {
    if (this.ctx) return;
    // Standard AudioContext initialization
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
  }

  // Setters for volume
  setSFXVolume(val) {
    this.sfxVolume = parseFloat(val);
  }

  setMusicVolume(val) {
    this.musicVolume = parseFloat(val);
    // Dynamically adjust volumes of active music oscillators
    this.activeSynthNodes.forEach(node => {
      if (node.gainNode && node.isMusic) {
        node.gainNode.gain.setValueAtTime(this.musicVolume * this.masterVolume, this.ctx.currentTime);
      }
    });
  }

  // SFX Player
  playSFX(type) {
    this.init();
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    
    const now = this.ctx.currentTime;
    const sfxVol = this.sfxVolume * this.masterVolume;
    if (sfxVol <= 0) return;

    switch (type) {
      case "move":
        this.synthMove(now, sfxVol);
        break;
      case "bump":
        this.synthBump(now, sfxVol);
        break;
      case "rule":
        this.synthRuleCreated(now, sfxVol);
        break;
      case "win":
        this.synthWin(now, sfxVol);
        break;
      case "lose":
        this.synthLose(now, sfxVol);
        break;
      case "undo":
        this.synthUndo(now, sfxVol);
        break;
    }
  }

  synthMove(time, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(350, time + 0.08);
    
    gain.gain.setValueAtTime(volume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.08);
  }

  synthUndo(time, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(350, time);
    osc.frequency.exponentialRampToValueAtTime(180, time + 0.08);
    
    gain.gain.setValueAtTime(volume * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.08);
  }

  synthBump(time, volume) {
    // Low frequency thud + brief noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(90, time);
    osc.frequency.linearRampToValueAtTime(30, time + 0.06);
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.linearRampToValueAtTime(0.01, time + 0.06);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.06);

    // Create a tiny noise burst for friction
    try {
      const bufferSize = this.ctx.sampleRate * 0.03; // 30ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 150;
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.4, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noise.start(time);
      noise.stop(time + 0.03);
    } catch (e) {
      // Fallback if buffer creation fails
    }
  }

  synthRuleCreated(time, volume) {
    // Sparkling arpeggio (C major chords)
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, index) => {
      const t = time + index * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume * 0.5, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      
      // A small high pass filter for a shiny neon bell sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 200;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  synthWin(time, volume) {
    // Celebratory rapid arpeggio + happy ending sound
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4 to C6
    notes.forEach((freq, index) => {
      const t = time + index * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = index === notes.length - 1 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume * 0.6, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.6);
    });

    // Sustained backing chord
    const chord = [261.63, 392.00, 523.25, 659.25];
    chord.forEach(freq => {
      const t = time + 0.35;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      // add a bit of vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 6; // 6 Hz
      lfoGain.gain.value = 4; // 4 Hz amplitude
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume * 0.4, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      lfo.start(t);
      osc.start(t);
      lfo.stop(t + 1.2);
      osc.stop(t + 1.2);
    });
  }

  synthLose(time, volume) {
    // Noise explosion + low pitch glide down
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.linearRampToValueAtTime(40, time + 0.3);
    
    gain.gain.setValueAtTime(volume * 0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, time);
    filter.frequency.linearRampToValueAtTime(80, time + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.3);

    // Exploding noise element
    try {
      const bufferSize = this.ctx.sampleRate * 0.35; // 350ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(volume * 0.7, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
      
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "lowpass";
      noiseFilter.frequency.setValueAtTime(600, time);
      noiseFilter.frequency.linearRampToValueAtTime(100, time + 0.35);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noise.start(time);
      noise.stop(time + 0.35);
    } catch (e) {
      // Fallback
    }
  }

  // Procedural Music System
  startMusic() {
    this.init();
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    
    // Immediately play first chord
    this.playNextAmbientChord();
    
    // Cycle chords every 7 seconds
    this.ambientInterval = setInterval(() => {
      this.playNextAmbientChord();
      // Occasional random high shimmering notes
      if (Math.random() > 0.4) {
        setTimeout(() => this.playAmbientSparkle(), Math.random() * 3000 + 1000);
      }
    }, 7000);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    
    // Fade out all active notes smoothly
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.activeSynthNodes.forEach(node => {
      if (node.gainNode) {
        try {
          node.gainNode.gain.cancelScheduledValues(now);
          node.gainNode.gain.setValueAtTime(node.gainNode.gain.value, now);
          node.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
          node.osc.stop(now + 1.6);
        } catch (e) {}
      }
    });
    this.activeSynthNodes = [];
  }

  playNextAmbientChord() {
    if (!this.musicPlaying) return;
    
    const now = this.ctx.currentTime;
    const vol = this.musicVolume * this.masterVolume;
    if (vol <= 0) return;

    const chord = this.chords[this.currentChordIndex];
    // Rotate to next chord next time
    this.currentChordIndex = (this.currentChordIndex + 1) % this.chords.length;

    chord.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = "triangle";
      osc.frequency.value = freq;
      
      // Ambient filter modulation: warm low pass filter
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(200 + index * 50, now);
      filter.frequency.linearRampToValueAtTime(450 + index * 50, now + 3);
      filter.frequency.linearRampToValueAtTime(200 + index * 50, now + 6.8);
      
      // Dynamic envelope: slow attack (2.5s) and release (2.5s)
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(vol * 0.25, now + 2.5);
      gainNode.gain.setValueAtTime(vol * 0.25, now + 4.5);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 6.9);
      
      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 7);
      
      const nodeRecord = { osc, gainNode, isMusic: true };
      this.activeSynthNodes.push(nodeRecord);
      
      // Clean up reference after note ends
      setTimeout(() => {
        const idx = this.activeSynthNodes.indexOf(nodeRecord);
        if (idx !== -1) this.activeSynthNodes.splice(idx, 1);
      }, 7200);
    });
  }

  playAmbientSparkle() {
    if (!this.musicPlaying) return;
    const now = this.ctx.currentTime;
    const vol = this.musicVolume * this.masterVolume;
    if (vol <= 0) return;

    // Pick a high pentatonic note: C5, E5, G5, A5, C6
    const highNotes = [523.25, 659.25, 783.99, 880.00, 1046.50];
    const freq = highNotes[Math.floor(Math.random() * highNotes.length)];
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const delay = this.ctx.createDelay();
    const delayGain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    
    // Shiny sound envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(vol * 0.15, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    // Add a retro delay/echo effect (e.g. feedback)
    delay.delayTime.value = 0.3; // 300ms echo
    delayGain.gain.value = 0.45; // echo feedback volume
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    // Connect echo path
    gainNode.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(delay); // loop back
    delayGain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 2.5);
    
    const nodeRecord = { osc, gainNode, isMusic: true };
    this.activeSynthNodes.push(nodeRecord);
    
    setTimeout(() => {
      const idx = this.activeSynthNodes.indexOf(nodeRecord);
      if (idx !== -1) this.activeSynthNodes.splice(idx, 1);
    }, 2800);
  }
}

// Global instance and registration
const Sound = new SoundManager();
window.Sound = Sound;
window.SoundManager = SoundManager;
