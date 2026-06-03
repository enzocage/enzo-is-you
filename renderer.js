// renderer.js - HTML5 Canvas Rendering Engine with 10 Graphic Styles for "Enzo Is You" Clone

class CanvasRenderer {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.bgCanvas = null;
    this.bgCtx = null;
    
    this.cellWidth = 0;
    this.cellHeight = 0;
    this.gridOffsetX = 0;
    this.gridOffsetY = 0;
    
    this.particles = [];
    this.bgParticles = [];
    
    this.currentStyle = "neon"; // default
    
    // Screenshake state
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.shakeX = 0;
    this.shakeY = 0;

    // Styles Configuration
    this.stylesConfig = {
      neon: {
        bgMain: "#04040a",
        gridLine: "rgba(0, 243, 255, 0.04)",
        glowColor: "#00f3ff",
        textColor: "#ffffff",
        wordBorders: { noun: "#ff7f27", operator: "#ff007f", property: "#39ff14", default: "#ffffff" }
      },
      retro: {
        bgMain: "#111111",
        gridLine: "rgba(255, 255, 255, 0.03)",
        glowColor: "transparent",
        textColor: "#ffffff",
        wordBorders: { noun: "#ff5555", operator: "#ff55ff", property: "#55ff55", default: "#ffffff" }
      },
      chalk: {
        bgMain: "#163020", // chalkboard green
        gridLine: "rgba(255, 255, 255, 0.06)",
        glowColor: "rgba(255, 255, 255, 0.1)",
        textColor: "rgba(255, 255, 255, 0.95)",
        wordBorders: { noun: "rgba(255, 200, 100, 0.7)", operator: "rgba(255, 100, 150, 0.7)", property: "rgba(100, 255, 150, 0.7)", default: "rgba(255, 255, 255, 0.7)" }
      },
      blueprint: {
        bgMain: "#0a2240", // blueprint blue
        gridLine: "rgba(255, 255, 255, 0.12)",
        glowColor: "#ffffff",
        textColor: "#ffffff",
        wordBorders: { noun: "#8ac9ff", operator: "#ff8ae9", property: "#8affae", default: "#ffffff" }
      },
      gameboy: {
        bgMain: "#8bac0f", // light olive green
        gridLine: "rgba(48, 98, 48, 0.15)",
        glowColor: "transparent",
        textColor: "#0f380f",
        wordBorders: { noun: "#306230", operator: "#306230", property: "#306230", default: "#306230" }
      },
      paper: {
        bgMain: "#e0dcd3", // cardboard grey-white
        gridLine: "rgba(0, 0, 0, 0.05)",
        glowColor: "rgba(0,0,0,0.15)",
        textColor: "#2c2c2c",
        wordBorders: { noun: "#e76f51", operator: "#f4a261", property: "#2a9d8f", default: "#264653" }
      },
      candy: {
        bgMain: "#fff0f5", // lavender blush
        gridLine: "rgba(255, 105, 180, 0.08)",
        glowColor: "#ff69b4",
        textColor: "#4a0e2e",
        wordBorders: { noun: "#ff6b6b", operator: "#f06292", property: "#4db6ac", default: "#ba68c8" }
      },
      matrix: {
        bgMain: "#000000",
        gridLine: "rgba(0, 255, 70, 0.03)",
        glowColor: "#00ff46",
        textColor: "#00ff46",
        wordBorders: { noun: "#00ff46", operator: "#00ff46", property: "#00ff46", default: "#00ff46" }
      },
      minimal: {
        bgMain: "#f8f9fa",
        gridLine: "rgba(0, 0, 0, 0.03)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#f08c00", operator: "#d6336c", property: "#37b24d", default: "#495057" }
      },
      watercolor: {
        bgMain: "#f4f1de", // watercolor paper
        gridLine: "rgba(61, 64, 91, 0.04)",
        glowColor: "rgba(61, 64, 91, 0.15)",
        textColor: "#3d405b",
        wordBorders: { noun: "#e07a5f", operator: "#f4f1de", property: "#81b29a", default: "#3d405b" }
      },
      material: {
        bgMain: "#f5f5f5",
        gridLine: "rgba(0, 0, 0, 0.04)",
        glowColor: "transparent",
        textColor: "#212121",
        wordBorders: { noun: "#1a73e8", operator: "#e91e63", property: "#0f9d58", default: "#757575" }
      },
      materialDark: {
        bgMain: "#121212",
        gridLine: "rgba(255, 255, 255, 0.05)",
        glowColor: "rgba(0, 243, 255, 0.1)",
        textColor: "#e0e0e0",
        wordBorders: { noun: "#8ab4f8", operator: "#ff8bcb", property: "#81c995", default: "#9aa0a6" }
      },
      nordic: {
        bgMain: "#eceff4",
        gridLine: "rgba(76, 86, 106, 0.06)",
        glowColor: "transparent",
        textColor: "#2e3440",
        wordBorders: { noun: "#5e81ac", operator: "#bf616a", property: "#a3be8c", default: "#4c566a" }
      },
      solarizedLight: {
        bgMain: "#fdf6e3",
        gridLine: "rgba(88, 110, 117, 0.06)",
        glowColor: "transparent",
        textColor: "#586e75",
        wordBorders: { noun: "#268bd2", operator: "#d33682", property: "#859900", default: "#586e75" }
      },
      solarizedDark: {
        bgMain: "#002b36",
        gridLine: "rgba(147, 161, 161, 0.05)",
        glowColor: "transparent",
        textColor: "#93a1a1",
        wordBorders: { noun: "#268bd2", operator: "#d33682", property: "#859900", default: "#93a1a1" }
      },
      brutalist: {
        bgMain: "#ffde7d",
        gridLine: "rgba(0, 0, 0, 0.1)",
        glowColor: "transparent",
        textColor: "#000000",
        wordBorders: { noun: "#3867d6", operator: "#eb3b5a", property: "#20bf6b", default: "#000000" }
      },
      cyberLight: {
        bgMain: "#ffffff",
        gridLine: "rgba(0, 243, 255, 0.08)",
        glowColor: "transparent",
        textColor: "#000000",
        wordBorders: { noun: "#ff007f", operator: "#00f3ff", property: "#39ff14", default: "#000000" }
      },
      forest: {
        bgMain: "#e8f5e9",
        gridLine: "rgba(46, 125, 50, 0.05)",
        glowColor: "transparent",
        textColor: "#1b5e20",
        wordBorders: { noun: "#2e7d32", operator: "#c62828", property: "#ef6c00", default: "#4e342e" }
      },
      sand: {
        bgMain: "#efebe9",
        gridLine: "rgba(141, 110, 99, 0.08)",
        glowColor: "transparent",
        textColor: "#3e2723",
        wordBorders: { noun: "#d84315", operator: "#8d6e63", property: "#558b2f", default: "#3e2723" }
      },
      pastel: {
        bgMain: "#faf5ff",
        gridLine: "rgba(147, 51, 234, 0.04)",
        glowColor: "transparent",
        textColor: "#3b0764",
        wordBorders: { noun: "#f472b6", operator: "#a78bfa", property: "#4ade80", default: "#6b7280" }
      },
      m3Lavender: {
        bgMain: "#f8f2ff",
        gridLine: "rgba(103, 80, 164, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#6750a4", operator: "#9c27b0", property: "#3b7a57", default: "#7d5260" },
        entityColors: {
          enzo: "#6750a4", keke: "#e040fb", wall: "#b0a2c7", rock: "#8c7b9e",
          flag: "#ffd54f", water: "#90caf9", lava: "#ff8a80", grass: "#a5d6a7",
          key: "#ffb74d", door: "#d1c4e9", skull: "#90a4ae", love: "#f06292"
        }
      },
      m3Mint: {
        bgMain: "#f0fbf6",
        gridLine: "rgba(0, 106, 106, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#006a6a", operator: "#4a6363", property: "#bf4a2f", default: "#5c6350" },
        entityColors: {
          enzo: "#006a6a", keke: "#34c759", wall: "#a3b899", rock: "#7b8e72",
          flag: "#f57c00", water: "#80deea", lava: "#ffab91", grass: "#c8e6c9",
          key: "#fff59d", door: "#b2dfdb", skull: "#b0bec5", love: "#ff8a80"
        }
      },
      m3Coral: {
        bgMain: "#fff8f6",
        gridLine: "rgba(191, 74, 47, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#bf4a2f", operator: "#77574e", property: "#006874", default: "#795548" },
        entityColors: {
          enzo: "#bf4a2f", keke: "#ff7043", wall: "#d7ccc8", rock: "#a1887f",
          flag: "#fbc02d", water: "#4fc3f7", lava: "#ff3d00", grass: "#81c784",
          key: "#ffe082", door: "#ffccbc", skull: "#cfd8dc", love: "#e91e63"
        }
      },
      m3Sky: {
        bgMain: "#f5f9ff",
        gridLine: "rgba(0, 97, 164, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#0061a4", operator: "#535f70", property: "#b00020", default: "#4a148c" },
        entityColors: {
          enzo: "#0061a4", keke: "#29b6f6", wall: "#b0bec5", rock: "#78909c",
          flag: "#ffb300", water: "#81d4fa", lava: "#ef5350", grass: "#9ccc65",
          key: "#ffd54f", door: "#bbdefb", skull: "#b0bec5", love: "#f06292"
        }
      },
      m3Lemon: {
        bgMain: "#fffdf0",
        gridLine: "rgba(105, 95, 0, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#695f00", operator: "#645f41", property: "#00796b", default: "#e65100" },
        entityColors: {
          enzo: "#695f00", keke: "#ffd600", wall: "#e0d8b0", rock: "#b8b08d",
          flag: "#e65100", water: "#26c6da", lava: "#ff3d00", grass: "#80deea",
          key: "#ff6f00", door: "#fff59d", skull: "#cfd8dc", love: "#e91e63"
        }
      },
      m3Rose: {
        bgMain: "#fff5f7",
        gridLine: "rgba(200, 50, 100, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#b81d56", operator: "#8c4d63", property: "#006c8f", default: "#526066" },
        entityColors: {
          enzo: "#b81d56", keke: "#ff4081", wall: "#e8c4d0", rock: "#b89ba6",
          flag: "#ffb74d", water: "#80deea", lava: "#ff8a80", grass: "#a5d6a7",
          key: "#ffd54f", door: "#f8bbd0", skull: "#cfd8dc", love: "#ff1744"
        }
      },
      m3Emerald: {
        bgMain: "#f2fbf4",
        gridLine: "rgba(12, 115, 66, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#0c7342", operator: "#4e6556", property: "#bf360c", default: "#3e2723" },
        entityColors: {
          enzo: "#0c7342", keke: "#00e676", wall: "#a5d6a7", rock: "#81c784",
          flag: "#ffd54f", water: "#80deea", lava: "#ff5722", grass: "#c8e6c9",
          key: "#ffe082", door: "#c8e6c9", skull: "#cfd8dc", love: "#e91e63"
        }
      },
      m3Clay: {
        bgMain: "#fbf6f2",
        gridLine: "rgba(161, 85, 45, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#a1552d", operator: "#795548", property: "#2e7d32", default: "#5d4037" },
        entityColors: {
          enzo: "#a1552d", keke: "#ff8a65", wall: "#d7ccc8", rock: "#a1887f",
          flag: "#fbc02d", water: "#80deea", lava: "#d84315", grass: "#a5d6a7",
          key: "#ffe082", door: "#ffccbc", skull: "#b0bec5", love: "#e91e63"
        }
      },
      m3Charcoal: {
        bgMain: "#1c1b1f",
        gridLine: "rgba(230, 225, 230, 0.05)",
        glowColor: "transparent",
        textColor: "#e3e3e3",
        wordBorders: { noun: "#d0bcff", operator: "#ccc2dc", property: "#efb8c8", default: "#cac4d0" },
        entityColors: {
          enzo: "#d0bcff", keke: "#ff4081", wall: "#49454f", rock: "#625b71",
          flag: "#ffd54f", water: "#80deea", lava: "#ff8a80", grass: "#a5d6a7",
          key: "#ffe082", door: "#e8def8", skull: "#cfd8dc", love: "#efb8c8"
        }
      },
      m3Warm: {
        bgMain: "#fffbf4",
        gridLine: "rgba(141, 110, 99, 0.05)",
        glowColor: "transparent",
        textColor: "#212529",
        wordBorders: { noun: "#8d6e63", operator: "#a1887f", property: "#ff8f00", default: "#4e342e" },
        entityColors: {
          enzo: "#8d6e63", keke: "#ffb300", wall: "#e0d4c8", rock: "#b8a898",
          flag: "#ff8f00", water: "#4fc3f7", lava: "#f4511e", grass: "#9ccc65",
          key: "#ffe082", door: "#d7ccc8", skull: "#cfd8dc", love: "#e91e63"
        }
      }
    };

    this.currentColorScheme = "default";
    this.colorSchemes = {
      giantGoldfish: ["#69d2e7", "#a7dbd8", "#e0e4cc", "#f38630", "#fa6900"],
      melancholy: ["#fe4365", "#fc9d9a", "#f9cdad", "#c8c8a9", "#83af9b"],
      thoughtProvoking: ["#ecd078", "#d95b43", "#c02942", "#542437", "#53777a"],
      cheerUpEmo: ["#556270", "#4ecdc4", "#c7f464", "#ff6b6b", "#c44d58"],
      vintageCardigan: ["#774f38", "#e08e79", "#f1d4af", "#ece5ce", "#c5e0dc"],
      moorishGarden: ["#e8ddcb", "#cdb380", "#036564", "#033649", "#031634"],
      couplesQuarrel: ["#490a3d", "#bd1550", "#e97f02", "#f8ca00", "#8a9b0f"],
      freshCutDay: ["#594f4f", "#547980", "#45ada8", "#9de0ad", "#e5fcc2"],
      oceanFive: ["#00a0b0", "#6a4a3c", "#cc333f", "#eb6841", "#edc951"],
      cliviaCardigan: ["#e94e77", "#d68189", "#c6a49a", "#c6e5d9", "#f4ead5"],
      aDreamInColor: ["#3fb8af", "#7fc7af", "#dad8a7", "#ff9e9d", "#ff3d7f"],
      quietCry: ["#d9ceb2", "#948c75", "#d5ded9", "#7a6a53", "#99b2b7"],
      weddingSpells: ["#ffffff", "#cbe86b", "#f2e9e1", "#1c140d", "#cbe86b"],
      curiosityKilled: ["#efffcd", "#dce9be", "#555152", "#2e2633", "#99173c"],
      businessOfSilence: ["#343838", "#005f6b", "#008c9e", "#00b4cc", "#00dffc"],
      sweetLullaby: ["#413e4a", "#73626e", "#b38184", "#f0b49e", "#f7e4be"],
      daydreaming: ["#ff4e50", "#fc913a", "#f9d423", "#ede574", "#e1f5c4"],
      littleMonster: ["#99b898", "#fecea8", "#ff847c", "#e84a5f", "#2a363b"],
      fadingStar: ["#655643", "#80bca3", "#f6f7bd", "#e6ac27", "#bf4d28"],
      citrusSalad: ["#00a8c6", "#40c0cb", "#f9f2e7", "#aee239", "#8fbe00"]
    };

    this.wordColors = {
      noun: "#ff7f27",
      operator: "#ff007f",
      property: "#39ff14",
      default: "#ffffff"
    };

    this.entityColors = {
      enzo: "#ffffff",
      keke: "#ff6600",
      wall: "#4a4e69",
      rock: "#a5a58d",
      flag: "#ffd700",
      water: "#00b4db",
      lava: "#ff3300",
      grass: "#2ec4b6",
      key: "#e9c46a",
      door: "#b5838d",
      skull: "#e5e5e5",
      love: "#ff007f"
    };
  }

  init(gameCanvas, backgroundCanvas) {
    this.canvas = gameCanvas;
    this.ctx = gameCanvas.getContext("2d");
    this.bgCanvas = backgroundCanvas;
    this.bgCtx = backgroundCanvas.getContext("2d");
    
    this.resize();
    window.addEventListener("resize", () => this.resize());
    
    this.initBgParticles();
  }

  setStyle(styleName) {
    if (this.stylesConfig[styleName]) {
      this.currentStyle = styleName;
      this.initBgParticles(); // Re-seed particles for the theme
    }
  }

  setColorScheme(schemeName) {
    if (schemeName === "default" || this.colorSchemes[schemeName]) {
      this.currentColorScheme = schemeName;
    }
  }

  isMaterialStyle(styleName) {
    return styleName.startsWith("m3") || 
           ["material", "materialDark", "forest", "sand", "minimal", "nordic", "solarizedLight", "solarizedDark", "cyberLight", "pastel"].includes(styleName);
  }

  resize() {
    if (!this.canvas) return;

    const wrapper = this.canvas.parentElement;
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = rect.width;
    const height = rect.height;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.ctx.scale(dpr, dpr);

    if (this.bgCanvas) {
      this.bgCanvas.width = window.innerWidth * dpr;
      this.bgCanvas.height = window.innerHeight * dpr;
      this.bgCanvas.style.width = window.innerWidth + "px";
      this.bgCanvas.style.height = window.innerHeight + "px";
      this.bgCtx.scale(dpr, dpr);
    }
  }

  triggerShake(intensity = 8) {
    this.shakeIntensity = intensity;
  }

  updateShake() {
    if (this.shakeIntensity > 0.1) {
      this.shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }
  }

  getWordPhase(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 100) / 100;
  }

  // CORE DRAW FUNCTION
  draw(entities, rules, cols, rows, showGrid, isEditorMode) {
    if (!this.ctx) return;
    
    this.updateShake();
    this.updateParticles();

    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    // Clear Canvas
    this.ctx.clearRect(0, 0, w, h);
    
    this.ctx.save();
    this.ctx.translate(this.shakeX, this.shakeY);

    const padding = 20;
    const availableW = w - padding * 2;
    const availableH = h - padding * 2;
    
    const sizeByW = availableW / cols;
    const sizeByH = availableH / rows;
    const cellSize = Math.min(sizeByW, sizeByH);
    
    this.cellWidth = cellSize;
    this.cellHeight = cellSize;
    this.gridOffsetX = (w - (cols * cellSize)) / 2;
    this.gridOffsetY = (h - (rows * cellSize)) / 2;

    const style = this.stylesConfig[this.currentStyle];

    // 1. Draw grid board background
    this.ctx.fillStyle = style.bgMain;
    this.ctx.fillRect(this.gridOffsetX, this.gridOffsetY, cols * cellSize, rows * cellSize);

    // Watercolor background overlay texture
    if (this.currentStyle === "watercolor") {
      this.drawWatercolorTexture(cols, rows, cellSize);
    }

    // 2. Draw Grid Lines
    if (showGrid) {
      this.ctx.strokeStyle = style.gridLine;
      this.ctx.lineWidth = this.currentStyle === "blueprint" ? 1.5 : 1;
      
      // Blueprint grid has subdivisions
      if (this.currentStyle === "blueprint") {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        for (let x = 0; x < cols * 4; x++) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.gridOffsetX + x * (cellSize / 4), this.gridOffsetY);
          this.ctx.lineTo(this.gridOffsetX + x * (cellSize / 4), this.gridOffsetY + rows * cellSize);
          this.ctx.stroke();
        }
        for (let y = 0; y < rows * 4; y++) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.gridOffsetX, this.gridOffsetY + y * (cellSize / 4));
          this.ctx.lineTo(this.gridOffsetX + cols * cellSize, this.gridOffsetY + y * (cellSize / 4));
          this.ctx.stroke();
        }
      }

      this.ctx.strokeStyle = style.gridLine;
      for (let x = 0; x <= cols; x++) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.gridOffsetX + x * cellSize, this.gridOffsetY);
        this.ctx.lineTo(this.gridOffsetX + x * cellSize, this.gridOffsetY + rows * cellSize);
        this.ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.gridOffsetX, this.gridOffsetY + y * cellSize);
        this.ctx.lineTo(this.gridOffsetX + cols * cellSize, this.gridOffsetY + y * cellSize);
        this.ctx.stroke();
      }
    }

    // Layered drawing order
    const renderOrder = {
      grass: 0, water: 1, lava: 2, wall: 3, rock: 4, key: 5, door: 6, skull: 7, flag: 8, keke: 9, enzo: 10, love: 11, text: 12
    };

    const sortedEntities = [...entities].sort((a, b) => {
      const orderA = renderOrder[a.name] !== undefined ? renderOrder[a.name] : 5;
      const orderB = renderOrder[b.name] !== undefined ? renderOrder[b.name] : 5;
      return orderA - orderB;
    });

    // 3. Draw Entities
    sortedEntities.forEach(ent => {
      let visualX = ent.x;
      let visualY = ent.y;
      let scaleX = 1;
      let scaleY = 1;

      if (ent.anim) {
        const elapsed = Date.now() - ent.anim.startTime;
        const p = Math.min(1, elapsed / ent.anim.duration);
        
        if (p >= 1) {
          delete ent.anim;
        } else {
          const t = p * (2 - p);
          
          if (ent.anim.type === "slide") {
            visualX = ent.anim.startX + (ent.anim.targetX - ent.anim.startX) * t;
            visualY = ent.anim.startY + (ent.anim.targetY - ent.anim.startY) * t;
            
            const dx = ent.anim.targetX - ent.anim.startX;
            const dy = ent.anim.targetY - ent.anim.startY;
            const stretch = 0.12 * Math.sin(p * Math.PI);
            
            if (dx !== 0) {
              scaleX = 1 + stretch;
              scaleY = 1 - stretch;
            } else if (dy !== 0) {
              scaleY = 1 + stretch;
              scaleX = 1 - stretch;
            }
          } else if (ent.anim.type === "bump") {
            const nudge = 0.15 * Math.sin(p * Math.PI);
            visualX = ent.x + ent.anim.dx * nudge;
            visualY = ent.y + ent.anim.dy * nudge;
            
            const squash = 0.1 * Math.sin(p * Math.PI);
            if (ent.anim.dx !== 0) {
              scaleX = 1 - squash;
              scaleY = 1 + squash;
            } else if (ent.anim.dy !== 0) {
              scaleY = 1 - squash;
              scaleX = 1 + squash;
            }
          }
        }
      }

      const drawCX = this.gridOffsetX + visualX * cellSize + cellSize / 2;
      const drawCY = this.gridOffsetY + visualY * cellSize + cellSize / 2;

      this.ctx.save();
      this.ctx.translate(drawCX, drawCY);
      this.ctx.scale(scaleX, scaleY);
      
      if (ent.type === "word") {
        const isActive = rules.some(r => r.words.some(w => w.id === ent.id));
        this.drawWord(ent, cellSize, isActive);
        
        if (isActive && Math.random() < 0.05) {
          this.emitStyleSparkle(drawCX, drawCY);
        }
      } else {
        this.drawObject(ent, cellSize);
      }
      
      this.ctx.restore();
    });

    // 4. Draw Particles on Top
    this.drawParticles();

    this.ctx.restore();
  }

  drawWatercolorTexture(cols, rows, cellSize) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(224, 122, 95, 0.015)";
    ctx.beginPath();
    ctx.arc(this.gridOffsetX + cols*cellSize*0.3, this.gridOffsetY + rows*cellSize*0.4, cols*cellSize*0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "rgba(129, 178, 154, 0.015)";
    ctx.beginPath();
    ctx.arc(this.gridOffsetX + cols*cellSize*0.7, this.gridOffsetY + rows*cellSize*0.6, cols*cellSize*0.3, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // STYLE SPARKLE BRIDGE
  emitStyleSparkle(x, y) {
    const now = Date.now();
    let col = "#00f3ff";
    if (this.currentStyle === "candy") col = "#ff69b4";
    if (this.currentStyle === "gameboy") col = "#306230";
    if (this.currentStyle === "chalk") col = "#ffffff";
    if (this.currentStyle === "matrix") col = "#00ff46";
    if (this.currentStyle === "minimal") col = "#37b24d";
    if (this.currentStyle === "watercolor") col = "#e07a5f";
    if (this.currentStyle === "blueprint") col = "#8ac9ff";
    if (this.currentStyle === "retro") col = "#ff55ff";
    
    this.emitSingleSparkle(x + (Math.random() - 0.5) * this.cellWidth, y + (Math.random() - 0.5) * this.cellHeight, col);
  }

  // DRAW BACKGROUND CANVAS
  drawBackground() {
    if (!this.bgCtx || !this.bgCanvas) return;
    
    const w = this.bgCanvas.width / (window.devicePixelRatio || 1);
    const h = this.bgCanvas.height / (window.devicePixelRatio || 1);
    
    // Custom background decay trail depending on theme
    if (this.currentStyle === "matrix") {
      this.bgCtx.fillStyle = "rgba(0, 0, 0, 0.08)"; // Matrix long trails
    } else if (this.currentStyle === "gameboy") {
      this.bgCtx.fillStyle = "#8bac0f"; // Static LCD
    } else if (this.currentStyle === "watercolor") {
      this.bgCtx.fillStyle = "#f4f1de"; // White watercolor wash paper
    } else if (this.currentStyle === "blueprint") {
      this.bgCtx.fillStyle = "#0a2240"; // Drafting paper
    } else if (this.currentStyle === "chalk") {
      this.bgCtx.fillStyle = "#163020"; // Chalkboard green
    } else if (this.currentStyle === "candy") {
      this.bgCtx.fillStyle = "#fff0f5"; // Lavender
    } else if (this.currentStyle === "minimal") {
      this.bgCtx.fillStyle = "#f8f9fa"; // Clean paper
    } else if (this.currentStyle === "paper") {
      this.bgCtx.fillStyle = "#e0dcd3";
    } else if (this.stylesConfig[this.currentStyle]) {
      this.bgCtx.fillStyle = this.stylesConfig[this.currentStyle].bgMain;
    } else {
      this.bgCtx.fillStyle = "rgba(7, 7, 16, 0.25)"; // Cyberpunk spaces
    }
    
    this.bgCtx.fillRect(0, 0, w, h);
    
    // Draw background grid paper for blueprint
    if (this.currentStyle === "blueprint") {
      this.drawBlueprintBackgroundLines(w, h);
    }
    
    // Update and draw background elements
    this.bgParticles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      
      // Wrapping bounds
      if (p.y > h) { p.y = 0; p.x = Math.random() * w; }
      if (p.x > w) p.x = 0;
      if (p.x < 0) p.x = w;
      
      this.bgCtx.save();
      
      if (this.currentStyle === "matrix") {
        // Matrix Code Rain glyph drops
        this.bgCtx.font = `${p.size * 1.8}px monospace`;
        this.bgCtx.fillStyle = `rgba(0, 255, 70, ${p.alpha})`;
        this.bgCtx.fillText(p.char, p.x, p.y);
        
        // Mutate falling glyph occasionally
        if (Math.random() < 0.05) {
          const glyphs = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890$#@%";
          p.char = glyphs[Math.floor(Math.random() * glyphs.length)];
        }
      } else if (this.currentStyle === "chalk") {
        // Drifting chalk dust dots
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.3})`;
        this.bgCtx.fill();
      } else if (this.currentStyle === "gameboy") {
        // Square pixels scrolling
        this.bgCtx.fillStyle = `rgba(15, 56, 15, ${p.alpha * 0.12})`;
        this.bgCtx.fillRect(p.x, p.y, p.size * 2, p.size * 2);
      } else if (this.currentStyle === "candy") {
        // Floating pastel sprinkles
        this.bgCtx.fillStyle = p.color;
        this.bgCtx.fillRect(p.x, p.y, p.size * 2.5, p.size * 1);
      } else if (this.currentStyle === "watercolor") {
        // Floating transparent paint spots
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `rgba(61, 64, 91, ${p.alpha * 0.03})`;
        this.bgCtx.fill();
      } else if (this.isMaterialStyle(this.currentStyle) || this.currentStyle === "brutalist") {
        // Clean geometric dots
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        const isDark = this.currentStyle === "materialDark" || this.currentStyle === "solarizedDark" || this.currentStyle === "m3Charcoal";
        this.bgCtx.fillStyle = isDark ? `rgba(255, 255, 255, ${p.alpha * 0.08})` : `rgba(0, 0, 0, ${p.alpha * 0.06})`;
        this.bgCtx.fill();
      } else if (this.currentStyle === "paper") {
        // Paper confetti squares
        this.bgCtx.fillStyle = p.color;
        this.bgCtx.fillRect(p.x, p.y, p.size * 3, p.size * 3);
      } else if (this.currentStyle === "blueprint") {
        // technical coordinates floating
        this.bgCtx.font = "8px monospace";
        this.bgCtx.fillStyle = "rgba(255, 255, 255, 0.08)";
        this.bgCtx.fillText(`[${Math.floor(p.x)},${Math.floor(p.y)}]`, p.x, p.y);
      } else {
        // Cyberpunk stars
        const glow = Math.sin(Date.now() / 500 + p.phase) * 0.4 + 0.6;
        this.bgCtx.beginPath();
        this.bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.bgCtx.fillStyle = `rgba(0, 243, 255, ${p.alpha * glow})`;
        this.bgCtx.shadowColor = "#00f3ff";
        this.bgCtx.shadowBlur = p.size * 3;
        this.bgCtx.fill();
      }
      
      this.bgCtx.restore();
    });
  }

  drawBlueprintBackgroundLines(w, h) {
    this.bgCtx.save();
    this.bgCtx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    this.bgCtx.lineWidth = 1;
    const spacing = 40;
    for (let x = 0; x < w; x += spacing) {
      this.bgCtx.beginPath();
      this.bgCtx.moveTo(x, 0);
      this.bgCtx.lineTo(x, h);
      this.bgCtx.stroke();
    }
    for (let y = 0; y < h; y += spacing) {
      this.bgCtx.beginPath();
      this.bgCtx.moveTo(0, y);
      this.bgCtx.lineTo(w, y);
      this.bgCtx.stroke();
    }
    this.bgCtx.restore();
  }

  initBgParticles() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.bgParticles = [];
    
    const count = this.currentStyle === "matrix" ? 80 : 35;
    const glyphs = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890$#@%";
    const colors = ["#ffb3ba", "#baffc9", "#bae1ff", "#ffffba", "#ffdfba"];

    for (let i = 0; i < count; i++) {
      this.bgParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 1,
        vy: this.currentStyle === "matrix" ? Math.random() * 2 + 1.5 : Math.random() * 0.15 + 0.05,
        vx: this.currentStyle === "matrix" ? 0 : (Math.random() - 0.5) * 0.05,
        alpha: Math.random() * 0.25 + 0.05,
        phase: Math.random() * Math.PI,
        char: glyphs[Math.floor(Math.random() * glyphs.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  // ENTITY GRAPHIC PLUGINS (CHECK DRAW STYLES)
  drawObject(ent, size) {
    const ctx = this.ctx;
    const r = size * 0.45;
    
    let fill = this.entityColors[ent.name];
    if (this.currentColorScheme !== "default" && this.colorSchemes[this.currentColorScheme]) {
      const scheme = this.colorSchemes[this.currentColorScheme];
      const mapping = {
        enzo: scheme[0],
        keke: scheme[1],
        wall: scheme[2],
        rock: scheme[3],
        flag: scheme[4],
        key: scheme[4],
        door: scheme[3],
        love: scheme[1],
        skull: scheme[2],
        grass: scheme[1],
        water: scheme[0],
        lava: scheme[2]
      };
      fill = mapping[ent.name] || fill;
    } else if (this.stylesConfig[this.currentStyle] && this.stylesConfig[this.currentStyle].entityColors && this.stylesConfig[this.currentStyle].entityColors[ent.name]) {
      fill = this.stylesConfig[this.currentStyle].entityColors[ent.name];
    }

    ctx.strokeStyle = "transparent";
    ctx.fillStyle = fill || "#ffffff";
    
    // Style override colors
    if (this.currentStyle === "gameboy") {
      // 4 shade green Gameboy overrides
      fill = ent.name === "wall" || ent.name === "skull" ? "#0f380f" : ent.name === "enzo" || ent.name === "love" ? "#c4f0c2" : "#306230";
      ctx.fillStyle = fill;
    } else if (this.currentStyle === "chalk") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
    } else if (this.currentStyle === "matrix") {
      ctx.fillStyle = "#00ff46";
      ctx.strokeStyle = "rgba(0, 255, 70, 0.3)";
    } else if (this.currentStyle === "blueprint") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1.5;
    } else if (this.isMaterialStyle(this.currentStyle)) {
      // solid clean colors, no outlines
      ctx.lineWidth = 0;
    } else if (this.currentStyle === "brutalist") {
      ctx.fillStyle = fill;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;
    } else if (this.currentStyle === "watercolor") {
      ctx.fillStyle = this.fadeColor(fill, 0.55);
      ctx.strokeStyle = this.fadeColor(fill, 0.7);
      ctx.lineWidth = 1.5;
    }

    // DRAW ROUTINES SWITCHING STYLES
    switch (ent.name) {
      case "enzo":
        this.drawEnzoSprite(ctx, r, ent.dir, fill);
        break;
      case "keke":
        this.drawKekeSprite(ctx, r, ent.dir, fill);
        break;
      case "rock":
        this.drawRockSprite(ctx, r, fill);
        break;
      case "wall":
        this.drawWallSprite(ctx, r, fill);
        break;
      case "flag":
        this.drawFlagSprite(ctx, r, fill);
        break;
      case "water":
        this.drawWaterSprite(ctx, r, fill);
        break;
      case "lava":
        this.drawLavaSprite(ctx, r, fill);
        break;
      case "grass":
        this.drawGrassSprite(ctx, r, fill);
        break;
      case "key":
        this.drawKeySprite(ctx, r, fill);
        break;
      case "door":
        this.drawDoorSprite(ctx, r, fill);
        break;
      case "skull":
        this.drawSkullSprite(ctx, r, fill);
        break;
      case "love":
        this.drawLoveSprite(ctx, r, fill);
        break;
      default:
        ctx.fillRect(-r, -r, r * 2, r * 2);
        break;
    }
  }

  // 1. ENZO DRAW
  drawEnzoSprite(ctx, r, dir, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "B", r * 1.5);
      return;
    }
    
    ctx.save();
    
    // Paper cut dropshadow
    if (this.currentStyle === "paper") {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
    }

    if (this.isMaterialStyle(this.currentStyle)) {
      // Solid minimal circle
      const isDark = this.currentStyle === "materialDark" || this.currentStyle === "solarizedDark" || this.currentStyle === "m3Charcoal";
      ctx.fillStyle = isDark ? "#eceff4" : "#ffffff";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      
      // Minimal dot eyes
      ctx.fillStyle = isDark ? "#121212" : "#212529";
      ctx.beginPath();
      const ex = dir === 1 ? 5 : dir === 3 ? -5 : 0;
      const ey = dir === 0 ? -5 : dir === 2 ? 5 : 0;
      ctx.arc(ex - 3, ey, 2.5, 0, Math.PI*2);
      ctx.arc(ex + 3, ey, 2.5, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.currentStyle === "candy") {
      // Fluffy Cotton Candy pink body
      ctx.fillStyle = "#ffb3ba";
      ctx.strokeStyle = "#ff85a1";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.15, r * 0.45, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.15, r * 0.45, 0, Math.PI * 2);
      ctx.arc(0, r * 0.3, r * 0.5, 0, Math.PI * 2);
      ctx.arc(0, -r * 0.3, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Candy stick at bottom
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.45); ctx.lineTo(0, r * 0.95);
      ctx.stroke();
    } else {
      // Normal Fluffy Cloud body
      ctx.beginPath();
      ctx.arc(-r * 0.4, -r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.arc(r * 0.4, -r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.arc(-r * 0.4, r * 0.3, r * 0.45, 0, Math.PI * 2);
      ctx.arc(r * 0.4, r * 0.3, r * 0.45, 0, Math.PI * 2);
      ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      if (this.currentStyle === "chalk" || this.currentStyle === "blueprint" || this.currentStyle === "watercolor" || this.currentStyle === "brutalist") {
        ctx.stroke();
      }
    }

    if (this.currentStyle === "blueprint") {
      // Blueprint tech lines
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-r * 1.1, 0); ctx.lineTo(r * 1.1, 0);
      ctx.moveTo(0, -r * 1.1); ctx.lineTo(0, r * 1.1);
      ctx.arc(0, 0, r * 0.95, 0, Math.PI*2);
      ctx.stroke();
    }

    // 4 legs
    if (this.currentStyle !== "candy") {
      ctx.strokeStyle = this.currentStyle === "gameboy" ? "#306230" : this.currentStyle === "chalk" ? "rgba(255,255,255,0.8)" : this.currentStyle === "blueprint" ? "#fff" : this.currentStyle === "brutalist" ? "#000000" : "#c5c5d0";
      ctx.lineWidth = this.currentStyle === "brutalist" ? 4 : 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, r * 0.65); ctx.lineTo(-r * 0.4, r * 0.85);
      ctx.moveTo(-r * 0.15, r * 0.75); ctx.lineTo(-r * 0.15, r * 0.95);
      ctx.moveTo(r * 0.15, r * 0.75); ctx.lineTo(r * 0.15, r * 0.95);
      ctx.moveTo(r * 0.4, r * 0.65); ctx.lineTo(r * 0.4, r * 0.85);
      ctx.stroke();
    }

    // Blush cheeks
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#8bac0f" : "#ffb3ba";
    ctx.beginPath();
    ctx.arc(-r * 0.4, 0, r * 0.15, 0, Math.PI * 2);
    ctx.arc(r * 0.4, 0, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eye direction
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#0f380f" : "#000000";
    ctx.beginPath();
    let eyeOffsetX = 0;
    let eyeOffsetY = 0;
    let spacingX = r * 0.22;
    
    if (dir === 0) { // UP
      eyeOffsetY = -r * 0.3;
      ctx.arc(-spacingX, eyeOffsetY, r * 0.08, 0, Math.PI * 2);
      ctx.arc(spacingX, eyeOffsetY, r * 0.08, 0, Math.PI * 2);
    } else if (dir === 1) { // RIGHT
      eyeOffsetX = r * 0.3;
      ctx.arc(eyeOffsetX, -r * 0.1, r * 0.08, 0, Math.PI * 2);
      ctx.arc(eyeOffsetX + r * 0.18, -r * 0.1, r * 0.08, 0, Math.PI * 2);
    } else if (dir === 2) { // DOWN
      eyeOffsetY = r * 0.15;
      ctx.arc(-spacingX, eyeOffsetY, r * 0.08, 0, Math.PI * 2);
      ctx.arc(spacingX, eyeOffsetY, r * 0.08, 0, Math.PI * 2);
    } else if (dir === 3) { // LEFT
      eyeOffsetX = -r * 0.3;
      ctx.arc(eyeOffsetX - r * 0.18, -r * 0.1, r * 0.08, 0, Math.PI * 2);
      ctx.arc(eyeOffsetX, -r * 0.1, r * 0.08, 0, Math.PI * 2);
    }
    ctx.fill();
    
    ctx.restore();
  }

  // 2. KEKE DRAW
  drawKekeSprite(ctx, r, dir, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "K", r * 1.5);
      return;
    }
    
    ctx.save();
    
    if (this.currentStyle === "paper") {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
    }

    if (this.isMaterialStyle(this.currentStyle)) {
      // Minimal geometric Keke (solid theme color triangle/circle combo)
      ctx.fillStyle = color || "#ff6600";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      
      // Ears (2 triangles)
      ctx.beginPath();
      ctx.moveTo(-r*0.6, -r*0.3); ctx.lineTo(-r*0.5, -r*0.8); ctx.lineTo(-r*0.1, -r*0.5);
      ctx.moveTo(r*0.6, -r*0.3); ctx.lineTo(r*0.5, -r*0.8); ctx.lineTo(r*0.1, -r*0.5);
      ctx.fill();
      
      ctx.restore();
      return;
    }

    // Fox Ears
    ctx.beginPath();
    ctx.moveTo(-r * 0.65, -r * 0.25);
    ctx.lineTo(-r * 0.5, -r * 0.8);
    ctx.lineTo(-r * 0.2, -r * 0.4);
    ctx.moveTo(r * 0.65, -r * 0.25);
    ctx.lineTo(r * 0.5, -r * 0.8);
    ctx.lineTo(r * 0.2, -r * 0.4);
    ctx.fill();
    if (this.currentStyle === "chalk" || this.currentStyle === "blueprint" || this.currentStyle === "watercolor" || this.currentStyle === "brutalist") {
      ctx.stroke();
    }

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    if (this.currentStyle === "chalk" || this.currentStyle === "blueprint" || this.currentStyle === "watercolor" || this.currentStyle === "brutalist") {
      ctx.stroke();
    }

    // White Chest fluff
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#8bac0f" : "#ffffff";
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    if (this.currentStyle === "chalk" || this.currentStyle === "blueprint" || this.currentStyle === "watercolor" || this.currentStyle === "brutalist") {
      ctx.stroke();
    }

    // Eyes
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#306230" : "#ffffff";
    ctx.beginPath();
    let leftEyeX = -r * 0.25;
    let rightEyeX = r * 0.25;
    let eyeY = -r * 0.05;
    
    if (dir === 1) { // Right
      leftEyeX = r * 0.05;
      rightEyeX = r * 0.45;
    } else if (dir === 3) { // Left
      leftEyeX = -r * 0.45;
      rightEyeX = -r * 0.05;
    } else if (dir === 0) { // Up
      eyeY = -r * 0.25;
    } else if (dir === 2) { // Down
      eyeY = r * 0.15;
    }

    ctx.arc(leftEyeX, eyeY, r * 0.12, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, r * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#0f380f" : "#000000";
    ctx.beginPath();
    ctx.arc(leftEyeX + (dir === 1 ? 2 : dir === 3 ? -2 : 0), eyeY, r * 0.06, 0, Math.PI * 2);
    ctx.arc(rightEyeX + (dir === 1 ? 2 : dir === 3 ? -2 : 0), eyeY, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // 3. ROCK DRAW
  drawRockSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "R", r * 1.5);
      return;
    }
    
    ctx.save();
    
    if (this.currentStyle === "paper") {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
    }

    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = color || "#888888";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.currentStyle === "candy") {
      // Gummy candy rock (purple translucent)
      ctx.fillStyle = "rgba(186, 104, 200, 0.85)";
      ctx.strokeStyle = "#8e24aa";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Sugar glow lines
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(-r*0.2, -r*0.2, r*0.4, Math.PI, Math.PI*1.5);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Rocky octagon path
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, -r * 0.7);
    ctx.lineTo(r * 0.5, -r * 0.8);
    ctx.lineTo(r * 0.9, -r * 0.2);
    ctx.lineTo(r * 0.75, r * 0.7);
    ctx.lineTo(-r * 0.25, r * 0.85);
    ctx.lineTo(-r * 0.85, r * 0.4);
    ctx.lineTo(-r * 0.9, -r * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // inner cracks
    if (this.currentStyle !== "gameboy") {
      ctx.strokeStyle = this.currentStyle === "chalk" ? "rgba(255,255,255,0.4)" : this.currentStyle === "blueprint" ? "rgba(255,255,255,0.3)" : "#7c7c68";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.35);
      ctx.lineTo(0, -r * 0.1);
      ctx.lineTo(-r * 0.25, r * 0.3);
      ctx.moveTo(r * 0.3, -r * 0.2);
      ctx.lineTo(r * 0.1, r * 0.2);
      ctx.lineTo(r * 0.4, r * 0.4);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // 4. WALL DRAW
  drawWallSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "█", r * 1.5);
      return;
    }
    
    ctx.save();
    
    if (this.currentStyle === "paper") {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
    }

    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = color || "#343a40";
      ctx.beginPath();
      ctx.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, r * 0.25);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.currentStyle === "candy") {
      // Chocolate bar wall segment
      ctx.fillStyle = "#5c3d2e";
      ctx.strokeStyle = "#382015";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, 4);
      ctx.fill();
      ctx.stroke();
      
      // Chocolate block divisions
      ctx.fillStyle = "#4a3024";
      ctx.fillRect(-r*0.65, -r*0.65, r*0.5, r*0.5);
      ctx.fillRect(r*0.15, -r*0.65, r*0.5, r*0.5);
      ctx.fillRect(-r*0.65, r*0.15, r*0.5, r*0.5);
      ctx.fillRect(r*0.15, r*0.15, r*0.5, r*0.5);
      ctx.restore();
      return;
    }

    ctx.beginPath();
    ctx.roundRect(-r * 0.9, -r * 0.9, r * 1.8, r * 1.8, r * 0.35);
    ctx.fill();
    ctx.stroke();

    // Neon glowing core wire, or chalk sketch brick border
    if (this.currentStyle === "neon") {
      ctx.strokeStyle = "rgba(100, 200, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-r * 0.65, -r * 0.65, r * 1.3, r * 1.3, r * 0.25);
      ctx.stroke();
    } else if (this.currentStyle === "blueprint") {
      // crosslines (draft lines)
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.moveTo(-r * 0.9, -r * 0.9); ctx.lineTo(r * 0.9, r * 0.9);
      ctx.moveTo(-r * 0.9, r * 0.9); ctx.lineTo(r * 0.9, -r * 0.9);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // 5. FLAG DRAW
  drawFlagSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "F", r * 1.5);
      return;
    }
    
    ctx.save();
    
    if (this.currentStyle === "paper") {
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
    }

    if (this.isMaterialStyle(this.currentStyle)) {
      // Solid flat minimal flag
      const isDark = this.currentStyle === "m3Charcoal" || this.currentStyle === "materialDark";
      ctx.strokeStyle = isDark ? "#e3e3e3" : "#495057";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r*0.2, r*0.75); ctx.lineTo(-r*0.2, -r*0.75);
      ctx.stroke();
      
      ctx.fillStyle = color || "#fcc419";
      ctx.beginPath();
      ctx.moveTo(-r*0.2, -r*0.75); ctx.lineTo(r*0.55, -r*0.45); ctx.lineTo(-r*0.2, -r*0.15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.currentStyle === "candy") {
      // Swirl Lollipop flag
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, r*0.85); ctx.lineTo(0, -r*0.2);
      ctx.stroke();
      
      // Lollipop candy round
      const pulse = Math.sin(Date.now() / 150) * 0.05 + 1;
      ctx.scale(pulse, pulse);
      
      ctx.fillStyle = "#ff3366";
      ctx.beginPath();
      ctx.arc(0, -r*0.2, r*0.5, 0, Math.PI*2);
      ctx.fill();
      
      // Spiral white line
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -r*0.2, r*0.3, 0, Math.PI, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -r*0.2, r*0.15, Math.PI, 0, false);
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Pole
    ctx.strokeStyle = this.currentStyle === "gameboy" ? "#306230" : this.currentStyle === "chalk" ? "rgba(255,255,255,0.8)" : this.currentStyle === "blueprint" ? "#fff" : "#c5c5d0";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.85);
    ctx.lineTo(-r * 0.3, -r * 0.8);
    ctx.stroke();

    // Stand base
    ctx.beginPath();
    ctx.moveTo(-r * 0.6, r * 0.85);
    ctx.lineTo(0, r * 0.85);
    ctx.stroke();

    // Flag fabric
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#0f380f" : this.currentStyle === "chalk" ? "rgba(255,255,255,0.15)" : "#ffcc00";
    ctx.strokeStyle = this.currentStyle === "gameboy" ? "#306230" : this.currentStyle === "chalk" ? "rgba(255,255,255,0.8)" : "#cc9900";
    ctx.lineWidth = 2;

    const wave = Math.sin(Date.now() / 120) * r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.7);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.6 + wave, r * 0.7, -r * 0.45);
    ctx.lineTo(r * 0.7, -r * 0.05);
    ctx.quadraticCurveTo(r * 0.1, -r * 0.2 + wave, -r * 0.3, -r * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  // 6. WATER DRAW
  drawWaterSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "~", r * 1.5);
      return;
    }
    
    ctx.save();
    
    const wave1 = Math.sin(Date.now() / 200) * r * 0.12;
    const wave2 = Math.cos(Date.now() / 250) * r * 0.12;

    ctx.beginPath();
    ctx.moveTo(-r, r);
    ctx.lineTo(-r, -r * 0.25 + wave1);
    ctx.quadraticCurveTo(-r * 0.5, -r * 0.5 + wave2, 0, -r * 0.25 + wave1);
    ctx.quadraticCurveTo(r * 0.5, -r * 0.5 + wave2, r, -r * 0.25 + wave1);
    ctx.lineTo(r, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // inner water ripples
    if (!this.isMaterialStyle(this.currentStyle) && this.currentStyle !== "gameboy") {
      ctx.strokeStyle = this.currentStyle === "chalk" ? "rgba(255,255,255,0.3)" : "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, r * 0.3 + wave2 * 0.5);
      ctx.quadraticCurveTo(-r * 0.3, r * 0.1, 0, r * 0.3);
      ctx.moveTo(r * 0.1, r * 0.4 + wave1 * 0.5);
      ctx.quadraticCurveTo(r * 0.45, r * 0.2, r * 0.7, r * 0.4);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // 7. LAVA DRAW
  drawLavaSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "*", r * 1.5);
      return;
    }
    
    ctx.save();

    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = color || "#ff3300";
      ctx.beginPath();
      ctx.roundRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7, r * 0.25);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (this.currentStyle === "candy") {
      // Strawberry jam lava (bright pink red jelly)
      ctx.fillStyle = "rgba(233, 30, 99, 0.8)";
      ctx.strokeStyle = "#c2185b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-r*0.85, -r*0.85, r*1.7, r*1.7, 6);
      ctx.fill();
      ctx.stroke();
      
      // Bubbling white cream drops
      const pb = Math.sin(Date.now() / 200) * 0.1 + 0.9;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-r*0.3, -r*0.3, r*0.12*pb, 0, Math.PI*2);
      ctx.arc(r*0.4, r*0.4, r*0.08*pb, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    ctx.roundRect(-r * 0.95, -r * 0.95, r * 1.9, r * 1.9, r * 0.25);
    ctx.fill();
    if (this.currentStyle === "chalk" || this.currentStyle === "blueprint" || this.currentStyle === "watercolor") {
      ctx.stroke();
    }

    // Bubbles
    if (this.currentStyle !== "gameboy" && this.currentStyle !== "blueprint") {
      const p1 = Math.sin(Date.now() / 150) * 0.1 + 0.9;
      const p2 = Math.cos(Date.now() / 180) * 0.1 + 0.9;
      
      ctx.fillStyle = this.currentStyle === "watercolor" ? "rgba(244, 241, 222, 0.4)" : "#ff6600";
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.35 * p1, 0, Math.PI * 2);
      ctx.arc(r * 0.4, r * 0.4, r * 0.25 * p2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.currentStyle === "watercolor" ? "#f4f1de" : "#ffcc00";
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.35, r * 0.12 * p1, 0, Math.PI * 2);
      ctx.arc(r * 0.38, r * 0.38, r * 0.08 * p2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.currentStyle === "blueprint") {
      // Warning diagonal hatches
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r*0.8, -r*0.8); ctx.lineTo(r*0.8, r*0.8);
      ctx.moveTo(-r*0.4, -r*0.8); ctx.lineTo(r*0.8, r*0.4);
      ctx.moveTo(-r*0.8, -r*0.4); ctx.lineTo(r*0.4, r*0.8);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // 8. GRASS DRAW
  drawGrassSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "w", r * 1.5);
      return;
    }
    
    ctx.save();
    
    const sway = Math.sin(Date.now() / 240) * 0.25;
    ctx.translate(0, r * 0.7);

    // Flat minimal draws green block
    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = color || "#37b24d";
      ctx.beginPath();
      ctx.moveTo(-r*0.5, 0); ctx.lineTo(-r*0.2 + sway*4, -r*1.1); ctx.lineTo(0, 0);
      ctx.lineTo(r*0.2 + sway*4, -r*1.3); ctx.lineTo(r*0.5, 0);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";

    // 3 grass blades
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, 0);
    ctx.quadraticCurveTo(-r * 0.45 + sway * 8, -r * 0.8, -r * 0.5 + sway * 15, -r * 1.25);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(sway * 5, -r, sway * 12, -r * 1.5);
    ctx.moveTo(r * 0.4, 0);
    ctx.quadraticCurveTo(r * 0.45 + sway * 8, -r * 0.7, r * 0.5 + sway * 15, -r * 1.2);
    ctx.stroke();
    
    ctx.restore();
  }

  // 9. KEY DRAW
  drawKeySprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "K", r * 1.5);
      return;
    }
    
    ctx.save();
    ctx.rotate(-Math.PI / 4);

    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = color || "#fcc419";
      ctx.beginPath();
      ctx.arc(-r*0.4, 0, r*0.32, 0, Math.PI*2);
      ctx.rect(0, -r*0.08, r*0.85, r*0.16);
      ctx.rect(r*0.45, r*0.08, r*0.18, r*0.25);
      ctx.rect(r*0.7, r*0.08, r*0.18, r*0.25);
      ctx.fill();
      // Hole inside head
      ctx.fillStyle = this.stylesConfig[this.currentStyle].bgMain;
      ctx.beginPath();
      ctx.arc(-r*0.4, 0, r*0.12, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Key ring
    ctx.beginPath();
    ctx.arc(-r * 0.4, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hole
    ctx.fillStyle = this.currentStyle === "chalk" ? "rgba(22, 48, 32, 1)" : this.currentStyle === "blueprint" ? "#0a2240" : this.currentStyle === "gameboy" ? "#8bac0f" : this.currentStyle === "watercolor" ? "#f4f1de" : "#030308";
    ctx.beginPath();
    ctx.arc(-r * 0.4, 0, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Shaft
    ctx.fillStyle = this.currentStyle === "chalk" ? "rgba(255,255,255,0.15)" : this.currentStyle === "blueprint" ? "rgba(255,255,255,0.08)" : color;
    ctx.beginPath();
    ctx.rect(0, -r * 0.09, r * 1.1, r * 0.18);
    ctx.fill();
    ctx.stroke();

    // Teeth
    ctx.beginPath();
    ctx.rect(r * 0.65, r * 0.08, r * 0.2, r * 0.35);
    ctx.rect(r * 0.95, r * 0.08, r * 0.2, r * 0.35);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // 10. DOOR DRAW
  drawDoorSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "D", r * 1.5);
      return;
    }
    
    ctx.save();

    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = color || "#868e96";
      ctx.beginPath();
      ctx.moveTo(-r*0.7, r*0.85); ctx.lineTo(-r*0.7, -r*0.35);
      ctx.arc(0, -r*0.35, r*0.7, Math.PI, 0, false);
      ctx.lineTo(r*0.7, r*0.85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // Door frame arch
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.95);
    ctx.lineTo(-r * 0.8, -r * 0.35);
    ctx.quadraticCurveTo(0, -r * 1.1, r * 0.8, -r * 0.35);
    ctx.lineTo(r * 0.8, r * 0.95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // keyhole details
    ctx.strokeStyle = this.currentStyle === "gameboy" ? "#306230" : "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.15);
    ctx.lineTo(0, r * 0.25);
    ctx.stroke();
    
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#306230" : "rgba(0, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // 11. SKULL DRAW
  drawSkullSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "☠", r * 1.5);
      return;
    }
    
    ctx.save();

    if (this.isMaterialStyle(this.currentStyle)) {
      // Solid geometric minimal skull
      ctx.fillStyle = color || "#e9ecef";
      ctx.beginPath();
      ctx.arc(0, -r*0.1, r*0.65, 0, Math.PI*2);
      ctx.roundRect(-r*0.35, r*0.15, r*0.7, r*0.65, 4);
      ctx.fill();
      
      // Eyes colored with background
      ctx.fillStyle = this.stylesConfig[this.currentStyle].bgMain;
      ctx.beginPath();
      ctx.arc(-r*0.22, -r*0.1, r*0.16, 0, Math.PI*2);
      ctx.arc(r*0.22, -r*0.1, r*0.16, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      return;
    }

    // Dome head
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.65, Math.PI, 0); 
    ctx.lineTo(r * 0.65, r * 0.2);
    ctx.lineTo(r * 0.35, r * 0.7); 
    ctx.lineTo(-r * 0.35, r * 0.7); 
    ctx.lineTo(-r * 0.65, r * 0.2); 
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Teeth
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, r * 0.4); ctx.lineTo(-r * 0.15, r * 0.7);
    ctx.moveTo(0, r * 0.35); ctx.lineTo(0, r * 0.7);
    ctx.moveTo(r * 0.15, r * 0.4); ctx.lineTo(r * 0.15, r * 0.7);
    ctx.stroke();

    // Hollow eye sockets
    ctx.fillStyle = this.currentStyle === "gameboy" ? "#0f380f" : this.currentStyle === "chalk" ? "rgba(22, 48, 32, 1)" : this.currentStyle === "blueprint" ? "#0a2240" : "#111118";
    ctx.beginPath();
    ctx.arc(-r * 0.25, -r * 0.1, r * 0.18, 0, Math.PI * 2);
    ctx.arc(r * 0.25, -r * 0.1, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Red pupil glow
    if (this.currentStyle !== "gameboy" && this.currentStyle !== "blueprint") {
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.1, 3, 0, Math.PI * 2);
      ctx.arc(r * 0.25, -r * 0.1, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  // 12. HEART LOVE DRAW
  drawLoveSprite(ctx, r, color) {
    if (this.currentStyle === "matrix") {
      this.drawASCII(ctx, "♥", r * 1.5);
      return;
    }
    
    ctx.save();
    
    const pulse = 1 + 0.12 * Math.sin(Date.now() / 150);
    ctx.scale(pulse, pulse);

    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = color || "#e64980";
      ctx.beginPath();
      ctx.moveTo(0, r * 0.45);
      ctx.bezierCurveTo(-r * 0.8, -r * 0.2, -r * 0.8, -r * 0.8, -r * 0.35, -r * 0.8);
      ctx.bezierCurveTo(-r * 0.1, -r * 0.8, 0, -r * 0.4, 0, -r * 0.3);
      ctx.bezierCurveTo(0, -r * 0.4, r * 0.1, -r * 0.8, r * 0.35, -r * 0.8);
      ctx.bezierCurveTo(r * 0.8, -r * 0.8, r * 0.8, -r * 0.2, 0, r * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      return;
    }

    // Standard vector heart path
    ctx.beginPath();
    ctx.moveTo(0, r * 0.4);
    ctx.bezierCurveTo(-r * 0.8, -r * 0.3, -r * 0.9, -r * 0.9, -r * 0.4, -r * 0.9);
    ctx.bezierCurveTo(-r * 0.1, -r * 0.9, 0, -r * 0.4, 0, -r * 0.3);
    ctx.bezierCurveTo(0, -r * 0.4, r * 0.1, -r * 0.9, r * 0.4, -r * 0.9);
    ctx.bezierCurveTo(r * 0.9, -r * 0.9, r * 0.8, -r * 0.3, 0, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  // helper to draw letters on Matrix display
  drawASCII(ctx, char, fontSize) {
    ctx.font = `bold ${fontSize}px 'Press Start 2P', monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#00ff46";
    // shadow glow
    ctx.shadowColor = "#00ff46";
    ctx.shadowBlur = 10;
    ctx.fillText(char, 0, 0);
    ctx.shadowBlur = 0;
  }

  // WORD RENDERING
  drawWord(ent, size, isActive) {
    const ctx = this.ctx;
    const padding = size * 0.08;
    const boxW = size - padding * 2;
    const boxH = size - padding * 2;

    const wordVal = ent.value;
    const wordType = this.getWordType(wordVal);
    const themeColor = this.stylesConfig[this.currentStyle].wordBorders[wordType] || this.stylesConfig[this.currentStyle].textColor;

    const phase = this.getWordPhase(ent.id);
    const tX = Math.sin(Date.now() / 90 + phase * 10) * 1.2;
    const tY = Math.cos(Date.now() / 80 + phase * 7) * 1.2;
    ctx.translate(tX, tY);

    if (this.currentStyle === "matrix") {
      // Raw terminal green characters
      ctx.font = `bold ${Math.floor(size * 0.20)}px 'Press Start 2P', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isActive ? "#ffffff" : "#00ff46";
      if (isActive) {
        ctx.shadowColor = "#00ff46";
        ctx.shadowBlur = 12;
      }
      
      // Ensure it stays safely within the cell bounds
      const maxMatrixTextWidth = size * 0.75;
      const measuredWidth = ctx.measureText(wordVal).width;
      ctx.save();
      if (measuredWidth > maxMatrixTextWidth) {
        const scaleFactor = maxMatrixTextWidth / measuredWidth;
        ctx.scale(scaleFactor, scaleFactor);
      }
      ctx.fillText(wordVal, 0, 1);
      ctx.restore();
      
      ctx.shadowBlur = 0;
      return;
    }

    if (this.currentStyle === "paper") {
      ctx.shadowColor = "rgba(0,0,0,0.15)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;
    } else if (isActive && this.currentStyle === "neon") {
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 12;
    }

    // Text box drawing
    if (this.currentStyle === "gameboy") {
      ctx.fillStyle = isActive ? "#306230" : "#8bac0f";
      ctx.strokeStyle = "#306230";
      ctx.lineWidth = 2.5;
    } else if (this.isMaterialStyle(this.currentStyle)) {
      ctx.fillStyle = this.fadeColor(themeColor, 0.09);
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = isActive ? 2.5 : 1.5;
    } else if (this.currentStyle === "chalk") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.strokeStyle = isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1.8;
    } else {
      ctx.fillStyle = "rgba(10, 10, 20, 0.88)";
      ctx.strokeStyle = isActive ? themeColor : this.fadeColor(themeColor, 0.4);
      ctx.lineWidth = isActive ? 3.5 : 2;
    }

    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, this.currentStyle === "retro" ? 0 : 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw text inside
    ctx.font = `bold ${Math.floor(size * 0.21)}px 'Orbitron', sans-serif`;
    if (this.isMaterialStyle(this.currentStyle)) {
      ctx.font = `bold ${Math.floor(size * 0.20)}px 'Outfit', sans-serif`;
      const isDark = this.currentStyle === "materialDark" || this.currentStyle === "m3Charcoal";
      ctx.fillStyle = isDark ? "#e3e3e3" : "#212529";
    } else if (this.currentStyle === "gameboy") {
      ctx.font = `bold ${Math.floor(size * 0.15)}px 'Press Start 2P', monospace`;
      ctx.fillStyle = isActive ? "#8bac0f" : "#0f380f";
    } else if (this.currentStyle === "retro") {
      ctx.font = `${Math.floor(size * 0.135)}px 'Press Start 2P', monospace`;
      ctx.fillStyle = "#ffffff";
    } else if (this.currentStyle === "minimal") {
      ctx.fillStyle = "#212529";
    } else if (this.currentStyle === "chalk") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    } else {
      ctx.fillStyle = isActive ? "#ffffff" : "#c5c5d0";
    }
    
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Safety check: ensure text never touches or overflows the box borders
    const maxTextWidth = boxW * 0.80; // 80% of box width leaves 10% safety margin on each side
    const measuredWidth = ctx.measureText(wordVal).width;

    ctx.save();
    if (measuredWidth > maxTextWidth) {
      const scaleFactor = maxTextWidth / measuredWidth;
      ctx.scale(scaleFactor, scaleFactor);
    }
    ctx.fillText(wordVal, 0, 1);
    ctx.restore();
  }

  getWordType(word) {
    const nouns = ["ENZO", "KEKE", "WALL", "ROCK", "FLAG", "WATER", "LAVA", "GRASS", "KEY", "DOOR", "SKULL", "LOVE"];
    const operators = ["IS", "AND", "ON", "HAS"];
    if (nouns.includes(word)) return "noun";
    if (operators.includes(word)) return "operator";
    return "property";
  }

  fadeColor(hex, alpha) {
    let r = 255, g = 255, b = 255;
    if (hex.startsWith("#")) {
      if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      } else if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      }
    } else if (hex.startsWith("rgba")) {
      return hex; // already formatted
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // PARTICLE SYSTEMS
  emitSingleSparkle(x, y, color) {
    // Branch particle shapes based on active style
    let shape = "circle";
    let vy = -Math.random() * 1.0 - 0.5;
    
    if (this.currentStyle === "retro" || this.currentStyle === "gameboy") {
      shape = "square";
    }
    
    this.particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: vy,
      size: Math.random() * 2.5 + 1.2,
      color: color,
      alpha: 1,
      life: Math.random() * 30 + 20,
      maxLife: 50,
      type: "sparkle",
      shape: shape
    });
  }

  emitDust(gridX, gridY, dx, dy) {
    const cX = this.gridOffsetX + gridX * this.cellWidth + this.cellWidth / 2;
    const cY = this.gridOffsetY + gridY * this.cellHeight + this.cellHeight / 2;
    
    const count = 6;
    let col = "rgba(150, 150, 160, 0.4)";
    let shape = "circle";
    
    if (this.currentStyle === "chalk") {
      col = "rgba(255, 255, 255, 0.5)"; // chalk powder
    } else if (this.currentStyle === "gameboy") {
      col = "rgba(48, 98, 48, 0.4)";
      shape = "square";
    } else if (this.currentStyle === "matrix") {
      col = "rgba(0, 255, 70, 0.4)";
    }
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: cX + (Math.random() - 0.5) * 15,
        y: cY + (Math.random() - 0.5) * 15,
        vx: -dx * (Math.random() * 1.5 + 0.5) + (Math.random() - 0.5) * 0.8,
        vy: -dy * (Math.random() * 1.5 + 0.5) + (Math.random() - 0.5) * 0.8,
        size: Math.random() * 3 + 1.5,
        color: col,
        alpha: 0.6,
        life: 15 + Math.random() * 10,
        maxLife: 25,
        type: "dust",
        shape: shape
      });
    }
  }

  emitRuleSparkles(gridX, gridY, color) {
    const cX = this.gridOffsetX + gridX * this.cellWidth + this.cellWidth / 2;
    const cY = this.gridOffsetY + gridY * this.cellHeight + this.cellHeight / 2;
    
    const count = this.currentStyle === "matrix" ? 25 : 15;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x: cX,
        y: cY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: Math.random() * 4 + 1.5,
        color: color,
        alpha: 1,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        type: "sparkle",
        shape: (this.currentStyle === "retro" || this.currentStyle === "gameboy") ? "square" : "circle"
      });
    }
  }

  emitSplash(gridX, gridY, color = "#00b4db") {
    const cX = this.gridOffsetX + gridX * this.cellWidth + this.cellWidth / 2;
    const cY = this.gridOffsetY + gridY * this.cellHeight + this.cellHeight / 2;
    
    if (this.currentStyle === "gameboy") color = "#0f380f";
    
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: cX,
        y: cY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: Math.random() * 3.5 + 1.5,
        color: color,
        alpha: 1,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        type: "splash",
        shape: (this.currentStyle === "retro" || this.currentStyle === "gameboy") ? "square" : "circle"
      });
    }
  }

  emitExplosion(gridX, gridY, color = "#ff4400") {
    const cX = this.gridOffsetX + gridX * this.cellWidth + this.cellWidth / 2;
    const cY = this.gridOffsetY + gridY * this.cellHeight + this.cellHeight / 2;
    
    if (this.currentStyle === "gameboy") color = "#0f380f";
    if (this.currentStyle === "matrix") color = "#00ff46";
    if (this.currentStyle === "chalk") color = "#ffffff";

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      this.particles.push({
        x: cX,
        y: cY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        color: color,
        alpha: 1,
        life: 25 + Math.random() * 20,
        maxLife: 45,
        type: "explosion",
        shape: (this.currentStyle === "retro" || this.currentStyle === "gameboy") ? "square" : "circle"
      });
    }
  }

  emitVictoryFireworks() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    
    let c1 = "#ffd700";
    let c2 = "#00f3ff";
    if (this.currentStyle === "gameboy") { c1 = "#306230"; c2 = "#0f380f"; }
    
    this.particles.push({
      x: w * 0.25 + (Math.random() - 0.5) * 50,
      y: h,
      vx: (Math.random() * 1.5 + 0.5),
      vy: -(Math.random() * 6 + 10),
      size: 4,
      color: c1,
      alpha: 1,
      life: 50,
      maxLife: 50,
      type: "rocket"
    });
    this.particles.push({
      x: w * 0.75 + (Math.random() - 0.5) * 50,
      y: h,
      vx: -(Math.random() * 1.5 + 0.5),
      vy: -(Math.random() * 6 + 10),
      size: 4,
      color: c2,
      alpha: 1,
      life: 50,
      maxLife: 50,
      type: "rocket"
    });
  }

  triggerFireworkBurst(x, y, color) {
    let colors = [color, "#ff007f", "#39ff14", "#ffaa00", "#ffffff"];
    if (this.currentStyle === "gameboy") {
      colors = ["#306230", "#0f380f", "#8bac0f", "#9bbc0f"];
    }
    const col = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 1,
        color: col,
        alpha: 1,
        life: 40 + Math.random() * 30,
        maxLife: 70,
        type: "sparkle",
        shape: (this.currentStyle === "retro" || this.currentStyle === "gameboy") ? "square" : "circle"
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
      
      if (p.type === "rocket") {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        if (Math.random() < 0.3) {
          this.emitSingleSparkle(p.x, p.y, p.color);
        }
        if (p.life <= 0 || p.vy >= 0) {
          this.triggerFireworkBurst(p.x, p.y, p.color);
          this.particles.splice(i, 1);
        }
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        if (p.type === "sparkle") {
          p.vy += 0.03;
        } else if (p.type === "dust") {
          p.vy *= 0.94;
        } else {
          p.vy += 0.08;
        }
        
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    ctx.save();
    
    this.particles.forEach(p => {
      ctx.beginPath();
      
      const pColor = this.fadeColor(p.color, p.alpha);
      
      // Select particle draw shape
      if (p.shape === "square") {
        ctx.fillStyle = pColor;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else {
        // Circle shape
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        if (p.type === "sparkle" && this.currentStyle === "neon") {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = p.size * 3;
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = pColor;
        }
        ctx.fill();
      }
    });
    
    ctx.restore();
  }
}

// Global instance
const Renderer = new CanvasRenderer();
window.Renderer = Renderer;
