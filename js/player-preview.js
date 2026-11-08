/**
 * ==============================================================================
 * SURMIO MUSIC PLAYER - INTERACTIVE IN-PAGE AUDIO & PREVIEW ENGINE
 * ==============================================================================
 * 
 * Provides an interactive Web Audio API synthesizer, real-time waveform visualizer,
 * track switcher, synced lyrics animator, interactive 10-band equalizer, and
 * local audio file playback capability.
 * ==============================================================================
 */

class SurmioAudioEngine {
  constructor() {
    this.isPlaying = false;
    this.currentTrackIndex = 0;
    this.currentTime = 0;
    this.duration = 222; // 3m 42s default
    this.tracks = window.SURMIO_CONFIG ? window.SURMIO_CONFIG.demoTracks : [];
    this.isLocalFile = false;
    
    // Web Audio API state
    this.audioCtx = null;
    this.synthInterval = null;
    this.analyser = null;
    this.dataArray = null;
    this.animFrameId = null;

    // Real audio element & filter chain for local user files
    this.audioElement = new Audio();
    this.audioSourceNode = null;
    this.filterNodes = [];

    // Equalizer frequencies & initial gains
    this.frequencies = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    this.frequencyLabels = ["31 Hz", "63 Hz", "125 Hz", "250 Hz", "500 Hz", "1 kHz", "2 kHz", "4 kHz", "8 kHz", "16 kHz"];
    this.eqGains = [4.5, 6.0, 2.5, 0.0, -1.5, 0.0, 1.8, 3.5, 5.2, 3.0];

    this.initDOM();
    this.bindEvents();
    this.loadTrack(0);
    this.renderEqualizerSliders();
    this.initVisualizer();
  }

  initDOM() {
    this.playBtn = document.getElementById("playerPlayBtn");
    this.prevBtn = document.getElementById("playerPrevBtn");
    this.nextBtn = document.getElementById("playerNextBtn");
    this.progressTrack = document.getElementById("playerProgressTrack");
    this.progressFill = document.getElementById("playerProgressFill");
    this.progressThumb = document.getElementById("playerProgressThumb");
    this.currentTimeEl = document.getElementById("playerCurrentTime");
    this.totalDurationEl = document.getElementById("playerTotalDuration");
    
    this.artworkBox = document.getElementById("playerArtworkBox");
    this.artworkImg = document.getElementById("playerArtworkImg");
    this.formatBadge = document.getElementById("playerFormatBadge");
    this.titleEl = document.getElementById("playerTitle");
    this.artistEl = document.getElementById("playerArtist");
    
    this.lyricsContainer = document.getElementById("playerLyricsContainer");
    this.canvas = document.getElementById("visualizerCanvas");
    if (this.canvas) {
      this.canvasCtx = this.canvas.getContext("2d");
    }

    // Local file input & drop zone
    this.fileInput = document.getElementById("localAudioFileInput");
    this.uploadBtn = document.getElementById("uploadLocalAudioBtn");
    this.dropZone = document.getElementById("previewDropZone");
  }

  bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener("click", () => this.togglePlay());
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", () => this.prevTrack());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", () => this.nextTrack());
    }

    if (this.progressTrack) {
      this.progressTrack.addEventListener("click", (e) => {
        const rect = this.progressTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.currentTime = ratio * this.duration;
        if (this.isLocalFile && this.audioElement) {
          this.audioElement.currentTime = this.currentTime;
        }
        this.updateProgressUI();
        this.updateLyricsUI();
      });
    }

    // Local file picker
    if (this.uploadBtn && this.fileInput) {
      this.uploadBtn.addEventListener("click", () => {
        this.fileInput.click();
      });

      this.fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          this.loadUserLocalAudioFile(file);
        }
      });
    }

    // Drag and Drop Audio File
    if (this.dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.remove('drag-over');
        });
      });

      this.dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file && (file.type.startsWith('audio/') || /\.(mp3|flac|wav|ogg|aac|m4a|opus)$/i.test(file.name))) {
          this.loadUserLocalAudioFile(file);
        } else if (file) {
          if (window.surmioShowToast) {
            window.surmioShowToast("Please drop an audio file (FLAC, MP3, WAV, etc.)", "error");
          }
        }
      });
    }

    // Tab buttons in preview section
    const tabBtns = document.querySelectorAll(".preview-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const targetTab = btn.getAttribute("data-tab");
        tabBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll(".preview-tab-content").forEach(content => {
          content.classList.remove("active");
        });

        const activeContent = document.getElementById(`tabContent-${targetTab}`);
        if (activeContent) {
          activeContent.classList.add("active");
        }
      });
    });

    // Preset Equalizer buttons
    const presetBtns = document.querySelectorAll(".preset-pill");
    presetBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        presetBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const preset = btn.getAttribute("data-preset");
        this.applyPreset(preset);
      });
    });

    // Audio element lifecycle events
    this.audioElement.addEventListener("ended", () => {
      this.pause();
      this.currentTime = 0;
      this.updateProgressUI();
    });

    this.audioElement.addEventListener("timeupdate", () => {
      if (this.isLocalFile) {
        this.currentTime = this.audioElement.currentTime;
        this.updateProgressUI();
      }
    });
  }

  loadTrack(index) {
    if (!this.tracks || this.tracks.length === 0) return;
    this.isLocalFile = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }

    this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
    const track = this.tracks[this.currentTrackIndex];

    if (this.artworkImg) this.artworkImg.src = track.cover;
    if (this.titleEl) this.titleEl.textContent = track.title;
    if (this.artistEl) this.artistEl.textContent = `${track.artist} • ${track.album}`;
    if (this.formatBadge) this.formatBadge.innerHTML = `<span>●</span> ${track.format} (${track.bitrate})`;
    if (this.totalDurationEl) this.totalDurationEl.textContent = track.duration;

    this.duration = this.parseDuration(track.duration);
    this.currentTime = 0;
    this.updateProgressUI();
    this.updateLyricsUI();

    document.querySelectorAll(".demo-track-pill").forEach((pill, idx) => {
      pill.classList.toggle("active", idx === this.currentTrackIndex);
    });
  }

  loadUserLocalAudioFile(file) {
    this.initAudioContext();
    this.isLocalFile = true;
    this.stopSynth();

    const objectUrl = URL.createObjectURL(file);
    this.audioElement.src = objectUrl;

    const baseName = file.name.replace(/\.[^/.]+$/, "");
    if (this.titleEl) this.titleEl.textContent = baseName;
    if (this.artistEl) this.artistEl.textContent = `Local File • ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    if (this.formatBadge) this.formatBadge.innerHTML = `<span>●</span> ${file.type || "Local Audio"} • 32-bit DAC Pipe`;
    if (this.artworkImg) this.artworkImg.src = "assets/images/album-aurora.svg";

    if (this.lyricsContainer) {
      this.lyricsContainer.innerHTML = `
        <div class="lyrics-line previous">📁 Playing Your Local File</div>
        <div class="lyrics-line active">"${baseName}"</div>
        <div class="lyrics-line next">Tweak the 10-band equalizer sliders to hear hardware DSP in action!</div>
      `;
    }

    this.setupAudioGraph();

    this.audioElement.onloadedmetadata = () => {
      this.duration = this.audioElement.duration || 180;
      if (this.totalDurationEl) {
        this.totalDurationEl.textContent = this.formatTime(this.duration);
      }
      this.play();
    };

    if (window.surmioShowToast) {
      window.surmioShowToast(`Loaded local file: ${file.name}`, "success");
    }
  }

  setupAudioGraph() {
    this.initAudioContext();
    if (!this.audioSourceNode) {
      try {
        this.audioSourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
        
        this.filterNodes = [];
        let prevNode = this.audioSourceNode;

        this.frequencies.forEach((freq, idx) => {
          const filter = this.audioCtx.createBiquadFilter();
          filter.type = idx === 0 ? "lowshelf" : idx === this.frequencies.length - 1 ? "highshelf" : "peaking";
          filter.frequency.value = freq;
          filter.Q.value = 1.4;
          filter.gain.value = this.eqGains[idx];

          prevNode.connect(filter);
          prevNode = filter;
          this.filterNodes.push(filter);
        });

        prevNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      } catch (err) {
        console.warn("Audio node graph initialization:", err);
      }
    }
  }

  parseDuration(durationStr) {
    const parts = durationStr.split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.initAudioContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.isPlaying = true;
    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" rx="2"/>
          <rect x="14" y="4" width="4" height="16" rx="2"/>
        </svg>
      `;
      this.playBtn.title = "Pause Audio";
    }

    if (this.artworkBox) {
      this.artworkBox.classList.add("playing");
    }

    if (this.isLocalFile) {
      this.audioElement.play();
    } else {
      this.startSynth();

      if (this.playbackInterval) clearInterval(this.playbackInterval);
      this.playbackInterval = setInterval(() => {
        this.currentTime += 0.5;
        if (this.currentTime >= this.duration) {
          this.nextTrack();
        }
        this.updateProgressUI();
        this.updateLyricsUI();
      }, 500);
    }

    if (window.surmioShowToast && !this.isLocalFile) {
      window.surmioShowToast(`Now Playing: ${this.tracks[this.currentTrackIndex].title}`, "success");
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.playBtn) {
      this.playBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      `;
      this.playBtn.title = "Play Audio";
    }

    if (this.artworkBox) {
      this.artworkBox.classList.remove("playing");
    }

    if (this.isLocalFile) {
      this.audioElement.pause();
    } else {
      this.stopSynth();
      if (this.playbackInterval) {
        clearInterval(this.playbackInterval);
        this.playbackInterval = null;
      }
    }
  }

  prevTrack() {
    if (this.isLocalFile) {
      this.audioElement.currentTime = 0;
      return;
    }
    this.loadTrack(this.currentTrackIndex - 1);
    if (this.isPlaying) this.play();
  }

  nextTrack() {
    if (this.isLocalFile) {
      this.audioElement.currentTime = 0;
      return;
    }
    this.loadTrack(this.currentTrackIndex + 1);
    if (this.isPlaying) this.play();
  }

  updateProgressUI() {
    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(this.currentTime);
    }
    const percent = Math.min(100, (this.currentTime / this.duration) * 100);
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }
    if (this.progressThumb) {
      this.progressThumb.style.left = `${percent}%`;
    }
  }

  updateLyricsUI() {
    if (!this.lyricsContainer || this.isLocalFile) return;
    const track = this.tracks[this.currentTrackIndex];
    if (!track || !track.lyrics) return;

    let activeIndex = 0;
    for (let i = 0; i < track.lyrics.length; i++) {
      if (this.currentTime >= track.lyrics[i].time) {
        activeIndex = i;
      }
    }

    const prevLine = track.lyrics[activeIndex - 1] ? track.lyrics[activeIndex - 1].text : "";
    const currentLine = track.lyrics[activeIndex] ? track.lyrics[activeIndex].text : "...";
    const nextLine = track.lyrics[activeIndex + 1] ? track.lyrics[activeIndex + 1].text : "";

    this.lyricsContainer.innerHTML = `
      <div class="lyrics-line previous">${prevLine}</div>
      <div class="lyrics-line active">"${currentLine}"</div>
      <div class="lyrics-line next">${nextLine}</div>
    `;
  }

  /* -------------------------------------------------------------
     WEB AUDIO SYNTHESIZER
     ------------------------------------------------------------- */
  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
  }

  startSynth() {
    this.initAudioContext();
    const chordPitches = [
      [130.81, 196.00, 261.63, 311.13, 392.00],
      [116.54, 174.61, 233.08, 293.66, 349.23],
      [103.83, 155.56, 207.65, 261.63, 311.13],
      [98.00, 146.83, 196.00, 246.94, 293.66]
    ];

    let chordIndex = 0;
    this.playChord(chordPitches[chordIndex]);

    this.synthInterval = setInterval(() => {
      if (!this.isPlaying || this.isLocalFile) return;
      chordIndex = (chordIndex + 1) % chordPitches.length;
      this.playChord(chordPitches[chordIndex]);
    }, 3500);
  }

  playChord(frequencies) {
    if (!this.audioCtx || this.audioCtx.state !== "running") return;
    const now = this.audioCtx.currentTime;

    frequencies.forEach((freq, idx) => {
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = idx === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800 + idx * 250, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.04 / frequencies.length, now + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

      osc.connect(filter);
      filter.connect(gainNode);

      if (this.analyser) {
        gainNode.connect(this.analyser);
      }
      gainNode.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 3.5);
    });
  }

  stopSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  /* -------------------------------------------------------------
     AUDIO VISUALIZER CANVAS (Neon sound wave bars)
     ------------------------------------------------------------- */
  initVisualizer() {
    if (!this.canvas || !this.canvasCtx) return;
    
    this.canvas.width = this.canvas.offsetWidth * 2 || 640;
    this.canvas.height = 180;

    const barCount = 42;
    const bars = [];
    for (let i = 0; i < barCount; i++) {
      bars.push({
        height: 10 + Math.random() * 20,
        targetHeight: 15,
        speed: 0.12 + Math.random() * 0.15
      });
    }

    const draw = () => {
      this.animFrameId = requestAnimationFrame(draw);
      const ctx = this.canvasCtx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (this.analyser && this.dataArray && this.isPlaying) {
        this.analyser.getByteFrequencyData(this.dataArray);
      }

      const barWidth = (w / barCount) * 0.65;
      const gap = (w / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        const bar = bars[i];

        if (this.isPlaying) {
          if (this.analyser && this.dataArray && this.dataArray.length > 0) {
            const dataIdx = Math.floor((i / barCount) * (this.dataArray.length / 2));
            const rawVal = this.dataArray[dataIdx] || 0;
            bar.targetHeight = (rawVal / 255) * (h * 0.85) + 6;
          } else {
            if (Math.random() > 0.6) {
              const bell = Math.sin((i / barCount) * Math.PI);
              bar.targetHeight = (20 + Math.random() * 110) * bell + (Math.random() * 15);
            }
          }
        } else {
          bar.targetHeight = 8 + Math.sin(Date.now() * 0.003 + i * 0.3) * 6;
        }

        bar.height += (bar.targetHeight - bar.height) * bar.speed;

        const x = i * (barWidth + gap) + gap / 2;
        const y = h - bar.height;

        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, "#8B5CF6");
        grad.addColorStop(0.6, "#3B82F6");
        grad.addColorStop(1, "#06B6D4");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, bar.height, [4, 4, 0, 0]);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x + barWidth / 2, y - 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
  }

  /* -------------------------------------------------------------
     EQUALIZER SLIDERS & PRESETS
     ------------------------------------------------------------- */
  renderEqualizerSliders() {
    const container = document.getElementById("eqSlidersContainer");
    if (!container) return;

    container.innerHTML = "";
    this.frequencyLabels.forEach((freqLabel, idx) => {
      const col = document.createElement("div");
      col.className = "eq-col";
      col.innerHTML = `
        <span class="gain-val" id="eqGainLabel-${idx}">${this.eqGains[idx] > 0 ? '+' : ''}${this.eqGains[idx].toFixed(1)} dB</span>
        <input type="range" class="vertical-slider eq-slider-input" min="-12" max="12" step="0.5" value="${this.eqGains[idx]}" data-band="${idx}">
        <span class="freq-label">${freqLabel}</span>
      `;
      container.appendChild(col);
    });

    container.querySelectorAll("input[type=range]").forEach(slider => {
      slider.addEventListener("input", (e) => {
        const band = parseInt(slider.getAttribute("data-band"), 10);
        const val = parseFloat(slider.value);
        this.eqGains[band] = val;

        if (this.filterNodes[band]) {
          this.filterNodes[band].gain.value = val;
        }

        const label = document.getElementById(`eqGainLabel-${band}`);
        if (label) {
          label.textContent = `${val > 0 ? '+' : ''}${val.toFixed(1)} dB`;
        }
      });
    });
  }

  applyPreset(presetName) {
    const presets = {
      audiophile: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
      bass: [7.5, 6.0, 4.0, 1.5, 0.0, -1.0, 0.0, 1.5, 2.5, 3.0],
      vocal: [-2.0, -1.0, 0.0, 2.5, 4.5, 4.0, 3.0, 1.5, 0.5, 0.0],
      electronic: [6.5, 5.0, 2.0, -1.5, -2.0, 1.0, 3.5, 5.0, 6.0, 6.5],
      rock: [4.5, 3.0, -1.0, -2.5, -0.5, 2.0, 4.0, 4.5, 4.0, 3.5]
    };

    const targetGains = presets[presetName] || presets.audiophile;
    this.eqGains = [...targetGains];

    this.eqGains.forEach((gain, idx) => {
      const slider = document.querySelector(`input[data-band="${idx}"]`);
      if (slider) slider.value = gain;
      if (this.filterNodes[idx]) {
        this.filterNodes[idx].gain.value = gain;
      }
      const label = document.getElementById(`eqGainLabel-${idx}`);
      if (label) {
        label.textContent = `${gain > 0 ? '+' : ''}${gain.toFixed(1)} dB`;
      }
    });

    if (window.surmioShowToast) {
      window.surmioShowToast(`Applied Equalizer Preset: ${presetName.toUpperCase()}`, "info");
    }
  }
}

// Instantiate on window load
document.addEventListener("DOMContentLoaded", () => {
  window.surmioAudio = new SurmioAudioEngine();
});
