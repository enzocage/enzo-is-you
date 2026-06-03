// game.js - Core Engine and Game Loop for "Enzo Is You" Clone

class GameEngine {
  constructor() {
    this.currentLevelIndex = 0;
    this.level = null;
    this.entities = [];
    this.rules = [];
    this.propertiesMap = {};
    
    this.moveCount = 0;
    this.history = []; // Undo stack
    this.maxHistory = 100;
    this.levelCompleted = false;
    
    // Grid settings
    this.cols = 15;
    this.rows = 11;
    this.showGrid = true;
    
    // Mode settings
    this.isEditorMode = false;
    this.isPlaytesting = false;
    
    // Swipe gestures state
    this.touchStartX = 0;
    this.touchStartY = 0;
  }

  init() {
    // Canvas bindings
    const canvas = document.getElementById("gameCanvas");
    const bgCanvas = document.getElementById("bgCanvas");
    
    Renderer.init(canvas, bgCanvas);
    
    // Initialize first level
    this.loadLevel(0);
    
    // Setup event listeners
    this.setupInput();
    this.setupUI();
    
    // Start game rendering loop
    this.loop();
  }

  // CORE LOOP
  loop() {
    // 1. Draw game board
    Renderer.draw(
      this.entities, 
      this.rules, 
      this.cols, 
      this.rows, 
      this.showGrid, 
      this.isEditorMode
    );
    
    // 2. Draw background particles
    Renderer.drawBackground();
    
    // Continuous loop
    requestAnimationFrame(() => this.loop());
  }

  // LEVEL MANAGEMENT
  loadLevel(index, customData = null) {
    this.levelCompleted = false;
    this.moveCount = 0;
    this.history = [];
    
    // Set UI counts
    document.getElementById("moveCount").textContent = "0";
    document.getElementById("undoCount").textContent = "0";
    document.getElementById("victoryModal").classList.add("hide");
    
    // Close mobile drawers
    const sidebar = document.querySelector(".sidebar");
    const editorSidebar = document.getElementById("editorPanel");
    const backdrop = document.getElementById("drawerBackdrop");
    if (sidebar) sidebar.classList.remove("open");
    if (editorSidebar) editorSidebar.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");
    
    if (customData) {
      this.level = customData;
      this.currentLevelIndex = -1;
      document.getElementById("levelNum").textContent = "CUSTOM";
      document.getElementById("levelName").textContent = customData.name || "Custom Sandbox";
      document.getElementById("levelHint").textContent = customData.hint || "Playtest your custom creation!";
    } else {
      this.currentLevelIndex = index;
      this.level = DEFAULT_LEVELS[index];
      document.getElementById("levelNum").textContent = `${index + 1} / ${DEFAULT_LEVELS.length}`;
      document.getElementById("levelName").textContent = this.level.name;
      document.getElementById("levelHint").textContent = this.level.hint || "";
    }

    // Sync mobile HUD values
    const nameStr = customData ? (customData.name || "Custom Sandbox") : this.level.name;
    document.getElementById("hudLevelName").textContent = nameStr;
    document.getElementById("hudMovesCount").textContent = "Moves: 0";

    this.cols = this.level.width;
    this.rows = this.level.height;
    
    // Deep copy initial entities
    this.entities = this.level.entities.map(e => ({
      id: e.id || `ent_${Math.random().toString(36).substr(2, 9)}`,
      type: e.type,
      name: e.name,
      x: e.x,
      y: e.y,
      value: e.value,
      dir: e.dir !== undefined ? e.dir : 1 // default facing right
    }));

    // Reset layout sizes
    Renderer.resize();
    
    // Evaluate initial rules
    this.evaluateRules(true); 
    
    // Clear animations on load
    this.entities.forEach(ent => delete ent.anim);
  }

  restartLevel() {
    if (this.currentLevelIndex === -1 && this.isPlaytesting) {
      // Re-load the editor playtest sandbox
      this.loadLevel(-1, Editor.getPlaytestData());
    } else {
      this.loadLevel(this.currentLevelIndex);
    }
    Sound.playSFX("undo");
  }

  // INPUT & CONTROLS
  setupInput() {
    // Keyboard inputs
    window.addEventListener("keydown", (e) => {
      if (this.levelCompleted) return;
      
      // If typing in textarea or editor inputs, skip key commands
      if (document.activeElement.tagName === "TEXTAREA" || document.activeElement.tagName === "INPUT") {
        return;
      }

      let dx = 0;
      let dy = 0;
      
      switch (e.key) {
        // Movement commands
        case "ArrowUp":
        case "w":
        case "W":
          dy = -1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dx = 1;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dy = 1;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dx = -1;
          break;
        
        // Action commands
        case "z":
        case "Z":
          this.undo();
          break;
        case "r":
        case "R":
          this.restartLevel();
          break;
        
        case "Escape":
          if (this.isPlaytesting) {
            Editor.exitPlaytest();
          }
          break;
        default:
          return; // Skip other keys
      }
      
      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        this.takeTurn(dx, dy);
      }
    });

    // Touch Screen Input Support (Swipes + Center-Relative Quadrant Taps)
    const canvas = document.getElementById("gameCanvas");
    canvas.addEventListener("touchstart", (e) => {
      if (this.levelCompleted) return;
      if (this.isEditorMode && !this.isPlaytesting) return; // handled by editor paint
      
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.touchHasMoved = false;
      }
    }, { passive: true });

    canvas.addEventListener("touchmove", (e) => {
      if (this.levelCompleted) return;
      if (this.isEditorMode && !this.isPlaytesting) return;
      
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - this.touchStartX;
        const dy = e.touches[0].clientY - this.touchStartY;
        if (Math.sqrt(dx*dx + dy*dy) > 15) {
          this.touchHasMoved = true;
        }
      }
    }, { passive: true });

    canvas.addEventListener("touchend", (e) => {
      if (this.levelCompleted) return;
      if (this.isEditorMode && !this.isPlaytesting) return;
      
      if (e.changedTouches.length === 1) {
        const dt = Date.now() - this.touchStartTime;
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        
        if (this.touchHasMoved) {
          // Swipe detection
          const threshold = 30;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > threshold) {
              this.takeTurn(dx > 0 ? 1 : -1, 0);
            }
          } else {
            if (Math.abs(dy) > threshold) {
              this.takeTurn(0, dy > 0 ? 1 : -1);
            }
          }
        } else if (dt < 300) {
          // Tap quadrant detection (Center-Relative Invisible D-Pad)
          const rect = canvas.getBoundingClientRect();
          const tapX = e.changedTouches[0].clientX - rect.left;
          const tapY = e.changedTouches[0].clientY - rect.top;
          
          const cX = rect.width / 2;
          const cY = rect.height / 2;
          
          const relX = tapX - cX;
          const relY = tapY - cY;
          
          let turnDx = 0;
          let turnDy = 0;
          if (Math.abs(relX) > Math.abs(relY)) {
            turnDx = relX > 0 ? 1 : -1;
          } else {
            turnDy = relY > 0 ? 1 : -1;
          }
          this.takeTurn(turnDx, turnDy);
        }
      }
    }, { passive: true });
  }

  // RULE ENGINE
  evaluateRules(isInitPhase = false) {
    // 1. Reset properties map (Words are implicitly PUSH)
    this.propertiesMap = {
      enzo: new Set(), keke: new Set(), wall: new Set(), rock: new Set(),
      flag: new Set(), water: new Set(), lava: new Set(), grass: new Set(),
      key: new Set(), door: new Set(), skull: new Set(), love: new Set(),
      text: new Set(["PUSH"])
    };
    
    this.rules = [];
    const wordEntities = this.entities.filter(e => e.type === "word");

    // Helper to find a word at coordinates
    const getWordAt = (x, y) => wordEntities.find(w => w.x === x && w.y === y);

    // 2. Scan board for rules (Horizontal & Vertical)
    wordEntities.forEach(w => {
      const val = w.value;
      if (this.isNoun(val)) {
        // Check horizontal rule: Noun IS (Property/Noun)
        const nextH1 = getWordAt(w.x + 1, w.y);
        const nextH2 = getWordAt(w.x + 2, w.y);
        if (nextH1 && nextH1.value === "IS" && nextH2) {
          this.rules.push({
            subject: val,
            predicate: nextH2.value,
            words: [w, nextH1, nextH2]
          });
        }

        // Check vertical rule: Noun IS (Property/Noun)
        const nextV1 = getWordAt(w.x, w.y + 1);
        const nextV2 = getWordAt(w.x, w.y + 2);
        if (nextV1 && nextV1.value === "IS" && nextV2) {
          this.rules.push({
            subject: val,
            predicate: nextV2.value,
            words: [w, nextV1, nextV2]
          });
        }
      }
    });

    // 3. Process Noun-to-Noun transformations (e.g. ROCK IS ENZO)
    let transformationsOccurred = false;
    
    // Cap transformations loop to 5 cycles to prevent infinite loops (e.g., A IS B & B IS A)
    for (let cycle = 0; cycle < 5; cycle++) {
      let cycleTransformed = false;
      
      this.rules.forEach(rule => {
        const sub = rule.subject.toLowerCase();
        const pred = rule.predicate.toLowerCase();
        
        // If it's a noun transformation rule (and not self transformation like ENZO IS ENZO)
        if (this.isNoun(rule.predicate) && sub !== pred) {
          // Find all non-word objects of this subject type
          this.entities.forEach(ent => {
            if (ent.type !== "word" && ent.name === sub) {
              ent.name = pred;
              cycleTransformed = true;
              transformationsOccurred = true;
              
              // Transformation visual effect (small puff)
              if (!isInitPhase) {
                Renderer.emitExplosion(ent.x, ent.y, "#ffffff");
              }
            }
          });
        }
      });
      
      if (!cycleTransformed) break;
    }

    if (transformationsOccurred && !isInitPhase) {
      Sound.playSFX("rule");
    }

    // 4. Update properties mapping based on parsed rules
    this.rules.forEach(rule => {
      const sub = rule.subject.toLowerCase();
      const pred = rule.predicate.toUpperCase();
      
      if (!this.isNoun(pred) && this.propertiesMap[sub]) {
        this.propertiesMap[sub].add(pred);
      }
    });

    // 5. Update HTML rules panel listing
    this.updateRulesUI();
  }

  isNoun(word) {
    return ["ENZO", "KEKE", "WALL", "ROCK", "FLAG", "WATER", "LAVA", "GRASS", "KEY", "DOOR", "SKULL", "LOVE"].includes(word);
  }

  hasProperty(entity, propName) {
    if (entity.type === "word") {
      return propName === "PUSH"; // words are implicitly PUSH
    }
    const name = entity.name.toLowerCase();
    return this.propertiesMap[name] && this.propertiesMap[name].has(propName);
  }

  // MOVEMENT TURN
  takeTurn(dx, dy) {
    // If anything is currently animating slide, ignore input to make steps look clean
    if (this.entities.some(e => e.anim)) return;

    // 1. Check if there are active YOU entities
    const youEntities = this.entities.filter(e => this.hasProperty(e, "YOU"));
    if (youEntities.length === 0) return;

    // 2. Snapshot current state for Undo History
    this.pushToHistory();

    let anyMoved = false;
    const movingSet = new Set();
    const facingUpdates = [];

    // Helper to calculate push chains
    const checkPushChain = (x, y, dx, dy) => {
      let chain = [];
      let cx = x + dx;
      let cy = y + dy;

      while (true) {
        // Grid limit boundary acts as implicit STOP
        if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) {
          return null; // Blocked
        }

        const cellEntities = this.entities.filter(e => e.x === cx && e.y === cy);
        if (cellEntities.length === 0) {
          break; // Empty slot, chain is free!
        }

        // If any item is STOP and NOT PUSH, the chain is blocked
        const hasStop = cellEntities.some(e => this.hasProperty(e, "STOP"));
        const hasPush = cellEntities.some(e => this.hasProperty(e, "PUSH"));

        if (hasStop && !hasPush) {
          return null; // Blocked by solid Wall
        }

        if (hasPush) {
          // Add all pushable elements in cell to the push chain
          cellEntities.filter(e => this.hasProperty(e, "PUSH")).forEach(e => {
            if (!chain.includes(e)) chain.push(e);
          });
          cx += dx;
          cy += dy;
        } else {
          break; // Overlaying item is passable (like grass), chain is free!
        }
      }
      return chain;
    };

    // Evaluate movements for each independent YOU entity
    youEntities.forEach(you => {
      // First update facing direction (0=UP, 1=RIGHT, 2=DOWN, 3=LEFT)
      let targetDir = 1;
      if (dx === 0 && dy === -1) targetDir = 0;
      if (dx === 1 && dy === 0) targetDir = 1;
      if (dx === 0 && dy === 1) targetDir = 2;
      if (dx === -1 && dy === 0) targetDir = 3;
      
      facingUpdates.push({ ent: you, dir: targetDir });

      const chain = checkPushChain(you.x, you.y, dx, dy);
      if (chain !== null) {
        // Chain can move! Add YOU and all pushed elements to moving set
        movingSet.add(you);
        chain.forEach(e => movingSet.add(e));
        anyMoved = true;
      } else {
        // Blocked! Add bump animation to player
        you.anim = {
          startX: you.x,
          startY: you.y,
          dx: dx,
          dy: dy,
          startTime: Date.now(),
          duration: 120,
          type: "bump"
        };
      }
    });

    // Update facing directions (eyes lock into direction even if movement is blocked)
    facingUpdates.forEach(u => u.ent.dir = u.dir);

    if (anyMoved) {
      // 3. Slide all moving objects to their target positions
      movingSet.forEach(ent => {
        // Trigger dust particles trailing behind characters
        if (ent.name === "enzo" || ent.name === "keke") {
          Renderer.emitDust(ent.x, ent.y, dx, dy);
        }
        
        ent.anim = {
          startX: ent.x,
          startY: ent.y,
          targetX: ent.x + dx,
          targetY: ent.y + dy,
          startTime: Date.now(),
          duration: 150,
          type: "slide"
        };

        ent.x += dx;
        ent.y += dy;
      });

      this.moveCount++;
      document.getElementById("moveCount").textContent = this.moveCount;
      document.getElementById("hudMovesCount").textContent = "Moves: " + this.moveCount;
      Sound.playSFX("move");
      
      // 4. Resolve interactions (overlaps, wins, sink deaths)
      setTimeout(() => {
        this.resolveInteractions();
        this.evaluateRules();
        this.checkWinConditions();
      }, 150); // wait for sliding interpolation to hit targets
    } else {
      // Plays a hollow block thump sound on bumps + shake screen
      Sound.playSFX("bump");
      Renderer.triggerShake(4);
    }
  }

  // INTERACTION OVERLAPS SOLVER
  resolveInteractions() {
    const toDestroy = new Set();
    const cellsMap = {};

    // Group entities by coordinate grid cells
    this.entities.forEach(ent => {
      const key = `${ent.x},${ent.y}`;
      if (!cellsMap[key]) cellsMap[key] = [];
      cellsMap[key].push(ent);
    });

    Object.keys(cellsMap).forEach(key => {
      const cellEnts = cellsMap[key];
      if (cellEnts.length <= 1) return;

      const [cx, cy] = key.split(",").map(Number);

      // --- SINK INTERACTION ---
      // If any entity has SINK, destroy it and ALL other entities in cell
      const sinkEnt = cellEnts.find(e => this.hasProperty(e, "SINK"));
      if (sinkEnt) {
        cellEnts.forEach(e => toDestroy.add(e));
        Renderer.emitSplash(cx, cy, "#00b4db");
        Sound.playSFX("lose");
        return; // Cells is wiped out, ignore other checks
      }

      // --- OPEN & SHUT INTERACTION ---
      // If OPEN and SHUT overlap, destroy both
      const openEnt = cellEnts.find(e => this.hasProperty(e, "OPEN"));
      const shutEnt = cellEnts.find(e => this.hasProperty(e, "SHUT"));
      if (openEnt && shutEnt) {
        toDestroy.add(openEnt);
        toDestroy.add(shutEnt);
        Renderer.emitExplosion(cx, cy, "#e9c46a");
        Sound.playSFX("lose");
      }

      // --- HOT & MELT INTERACTION ---
      // If MELT overlaps HOT, destroy MELT
      const hotEnt = cellEnts.find(e => this.hasProperty(e, "HOT"));
      if (hotEnt) {
        cellEnts.forEach(e => {
          if (this.hasProperty(e, "MELT")) {
            toDestroy.add(e);
            Renderer.emitExplosion(cx, cy, "#ff3300");
            Sound.playSFX("lose");
          }
        });
      }

      // --- DEFEAT INTERACTION ---
      // If YOU overlaps DEFEAT, destroy YOU
      const defeatEnt = cellEnts.find(e => this.hasProperty(e, "DEFEAT"));
      if (defeatEnt) {
        cellEnts.forEach(e => {
          if (this.hasProperty(e, "YOU")) {
            toDestroy.add(e);
            Renderer.emitExplosion(cx, cy, "#ff0000");
            Sound.playSFX("lose");
            Renderer.triggerShake(12); // Big shake on death
          }
        });
      }
    });

    // Wipe destroyed objects out of grid array
    if (toDestroy.size > 0) {
      this.entities = this.entities.filter(e => !toDestroy.has(e));
    }
  }

  // WIN CHECK
  checkWinConditions() {
    // If YOU overlaps WIN, level cleared!
    const youEnts = this.entities.filter(e => this.hasProperty(e, "YOU"));
    const winEnts = this.entities.filter(e => this.hasProperty(e, "WIN"));

    let won = false;
    youEnts.forEach(you => {
      winEnts.forEach(win => {
        if (you.x === win.x && you.y === win.y) {
          won = true;
        }
      });
    });

    if (won && !this.levelCompleted) {
      this.levelCompleted = true;
      Sound.playSFX("win");
      
      // Save progression in LocalStorage
      if (this.currentLevelIndex !== -1) {
        localStorage.setItem(`level_${this.currentLevelIndex}_cleared`, "true");
      }

      // Shoot celebratory fireworks
      let fireworkCount = 0;
      const fireworkTimer = setInterval(() => {
        Renderer.emitVictoryFireworks();
        fireworkCount++;
        if (fireworkCount >= 6) clearInterval(fireworkTimer);
      }, 250);

      // Trigger Victory popup Modal after brief delay
      setTimeout(() => {
        document.getElementById("victoryMoves").textContent = this.moveCount;
        document.getElementById("victoryModal").classList.remove("hide");
      }, 1000);
    }
  }

  // UNDO & REDO
  pushToHistory() {
    // Clone state
    const state = {
      entities: this.entities.map(e => ({
        id: e.id,
        type: e.type,
        name: e.name,
        x: e.x,
        y: e.y,
        value: e.value,
        dir: e.dir
      })),
      moveCount: this.moveCount
    };

    this.history.push(state);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    document.getElementById("undoCount").textContent = this.history.length;
  }

  undo() {
    if (this.history.length === 0) return;

    // Pop state from history
    const prevState = this.history.pop();
    this.moveCount = prevState.moveCount;
    document.getElementById("moveCount").textContent = this.moveCount;
    document.getElementById("hudMovesCount").textContent = "Moves: " + this.moveCount;
    document.getElementById("undoCount").textContent = this.history.length;

    // Slide entities backwards to make undo look gorgeous
    prevState.entities.forEach(oldEnt => {
      const current = this.entities.find(e => e.id === oldEnt.id);
      if (current) {
        // If entity coordinates changed, slide them back
        if (current.x !== oldEnt.x || current.y !== oldEnt.y) {
          current.anim = {
            startX: current.x,
            startY: current.y,
            targetX: oldEnt.x,
            targetY: oldEnt.y,
            startTime: Date.now(),
            duration: 120,
            type: "slide"
          };
        }
        current.x = oldEnt.x;
        current.y = oldEnt.y;
        current.name = oldEnt.name;
        current.dir = oldEnt.dir;
      } else {
        // If entity was destroyed, respawn it with a reverse puff
        const newEnt = { ...oldEnt };
        this.entities.push(newEnt);
        Renderer.emitExplosion(newEnt.x, newEnt.y, "#9999ff");
      }
    });

    // Remove any newly spawned entities that didn't exist in previous state
    const prevIds = prevState.entities.map(e => e.id);
    this.entities = this.entities.filter(e => prevIds.includes(e.id));

    this.evaluateRules();
    Sound.playSFX("undo");
  }

  // UI UPDATE DYNAMICS
  updateRulesUI() {
    const rulesList = document.getElementById("activeRulesList");
    rulesList.innerHTML = "";
    
    this.rules.forEach(rule => {
      const badge = document.createElement("div");
      badge.className = "rule-badge highlight";
      badge.textContent = `${rule.subject} IS ${rule.predicate}`;
      
      // Match badge neon color to rule predicate
      const pred = rule.predicate;
      if (pred === "YOU") badge.style.borderColor = "var(--glow-cyan)";
      if (pred === "WIN") badge.style.borderColor = "var(--glow-yellow)";
      if (pred === "STOP") badge.style.borderColor = "#c5c5d0";
      if (pred === "PUSH") badge.style.borderColor = "var(--glow-orange)";
      if (pred === "DEFEAT") badge.style.borderColor = "var(--glow-pink)";
      if (pred === "SINK") badge.style.borderColor = "#0083b0";
      if (pred === "MELT") badge.style.borderColor = "#ffcc00";
      if (pred === "HOT") badge.style.borderColor = "var(--glow-pink)";
      if (pred === "OPEN") badge.style.borderColor = "#e9c46a";
      if (pred === "SHUT") badge.style.borderColor = "#b5838d";

      rulesList.appendChild(badge);
    });

    if (this.rules.length === 0) {
      const badge = document.createElement("div");
      badge.className = "rule-badge";
      badge.style.color = "var(--text-muted)";
      badge.style.borderColor = "var(--border-glass)";
      badge.textContent = "NO RULES ACTIVE";
      rulesList.appendChild(badge);
    }
  }

  setupUI() {
    // Graphic Style Theme Select
    const themeSelect = document.getElementById("themeSelect");
    themeSelect.addEventListener("change", (e) => {
      Renderer.setStyle(e.target.value);
      Sound.playSFX("rule");
    });

    // ColourLovers Color Palette Select
    const paletteSelect = document.getElementById("paletteSelect");
    if (paletteSelect) {
      paletteSelect.addEventListener("change", (e) => {
        Renderer.setColorScheme(e.target.value);
        Sound.playSFX("rule");
      });
    }

    // Navigation Action Buttons
    document.getElementById("btnUndo").addEventListener("click", () => this.undo());
    document.getElementById("btnRestart").addEventListener("click", () => this.restartLevel());

    // Mobile Drawer HUD bindings
    const sidebar = document.querySelector(".sidebar");
    const editorSidebar = document.getElementById("editorPanel");
    const backdrop = document.getElementById("drawerBackdrop");

    const toggleSidebar = (forceClose = false) => {
      if (!sidebar) return;
      const isOpen = sidebar.classList.contains("open");
      if (isOpen || forceClose) {
        sidebar.classList.remove("open");
        backdrop.classList.remove("active");
      } else {
        sidebar.classList.add("open");
        editorSidebar.classList.remove("open"); // close editor drawer if open
        backdrop.classList.add("active");
      }
      Renderer.resize();
    };

    const toggleEditorSidebar = (forceClose = false) => {
      if (!editorSidebar) return;
      const isOpen = editorSidebar.classList.contains("open");
      if (isOpen || forceClose) {
        editorSidebar.classList.remove("open");
        backdrop.classList.remove("active");
      } else {
        editorSidebar.classList.add("open");
        sidebar.classList.remove("open"); // close settings drawer if open
        backdrop.classList.add("active");
      }
      Renderer.resize();
    };

    const closeAllDrawers = () => {
      if (sidebar) sidebar.classList.remove("open");
      if (editorSidebar) editorSidebar.classList.remove("open");
      if (backdrop) backdrop.classList.remove("active");
      Renderer.resize();
    };

    document.getElementById("btnMobileMenu").addEventListener("click", () => toggleSidebar());
    document.getElementById("btnCloseSidebar").addEventListener("click", () => toggleSidebar(true));
    document.getElementById("btnCloseEditorPanel").addEventListener("click", () => toggleEditorSidebar(true));
    backdrop.addEventListener("click", () => closeAllDrawers());
    
    // Bind mobile HUD actions
    document.getElementById("btnMobileUndo").addEventListener("click", () => this.undo());
    document.getElementById("btnMobileRestart").addEventListener("click", () => this.restartLevel());

    // Category Select change
    document.getElementById("categorySelect").addEventListener("change", () => {
      this.populateLevelSelectGrid();
    });
    
    // Level Select Modal Toggles
    const levelModal = document.getElementById("levelModal");
    document.getElementById("btnLevelSelect").addEventListener("click", () => {
      this.populateLevelSelectGrid();
      levelModal.classList.remove("hide");
    });
    document.getElementById("btnCloseLevelModal").addEventListener("click", () => {
      levelModal.classList.add("hide");
    });
    
    // Modal tabs click selectors
    const tabBuiltIn = document.getElementById("tabBuiltIn");
    const tabCustom = document.getElementById("tabCustom");
    
    tabBuiltIn.addEventListener("click", () => {
      tabBuiltIn.classList.add("active");
      tabCustom.classList.remove("active");
      this.populateLevelSelectGrid();
    });
    
    tabCustom.addEventListener("click", () => {
      tabCustom.classList.add("active");
      tabBuiltIn.classList.remove("active");
      this.populateLevelSelectGrid();
    });

    // Sound Controls
    const musicSlider = document.getElementById("musicVolSlider");
    const sfxSlider = document.getElementById("sfxVolSlider");
    const muteMusicBtn = document.getElementById("btnMuteMusic");
    const muteSFXBtn = document.getElementById("btnMuteSFX");

    musicSlider.addEventListener("input", (e) => {
      Sound.setMusicVolume(e.target.value);
      if (e.target.value > 0) {
        Sound.startMusic();
        muteMusicBtn.textContent = "🔊";
      } else {
        Sound.stopMusic();
        muteMusicBtn.textContent = "🔇";
      }
    });

    sfxSlider.addEventListener("input", (e) => {
      Sound.setSFXVolume(e.target.value);
      muteSFXBtn.textContent = e.target.value > 0 ? "🔊" : "🔇";
    });

    muteMusicBtn.addEventListener("click", () => {
      if (Sound.musicPlaying) {
        Sound.stopMusic();
        musicSlider.value = 0;
        muteMusicBtn.textContent = "🔇";
      } else {
        musicSlider.value = 0.3;
        Sound.setMusicVolume(0.3);
        Sound.startMusic();
        muteMusicBtn.textContent = "🔊";
      }
    });

    muteSFXBtn.addEventListener("click", () => {
      if (Sound.sfxVolume > 0) {
        Sound.setSFXVolume(0);
        sfxSlider.value = 0;
        muteSFXBtn.textContent = "🔇";
      } else {
        Sound.setSFXVolume(0.6);
        sfxSlider.value = 0.6;
        muteSFXBtn.textContent = "🔊";
      }
    });

    // Toggle Grid Lines checkbox
    const chkGrid = document.getElementById("chkGridLines");
    chkGrid.addEventListener("change", (e) => {
      this.showGrid = e.target.checked;
    });

    // Victory popup Navigation
    document.getElementById("btnNextLevel").addEventListener("click", () => {
      if (this.currentLevelIndex !== -1 && this.currentLevelIndex < DEFAULT_LEVELS.length - 1) {
        this.loadLevel(this.currentLevelIndex + 1);
      } else {
        // Go back to level select or first level
        document.getElementById("victoryModal").classList.add("hide");
        levelModal.classList.remove("hide");
        this.populateLevelSelectGrid();
      }
    });
    
    document.getElementById("btnVictoryLevelSelect").addEventListener("click", () => {
      document.getElementById("victoryModal").classList.add("hide");
      levelModal.classList.remove("hide");
      this.populateLevelSelectGrid();
    });

    // Set slider initial positions
    musicSlider.value = Sound.musicVolume;
    sfxSlider.value = Sound.sfxVolume;

    // Start background music automatically on first interaction
    window.addEventListener("click", () => {
      if (Sound.musicVolume > 0 && !Sound.musicPlaying) {
        Sound.startMusic();
      }
    }, { once: true });
  }

  populateLevelSelectGrid() {
    const grid = document.getElementById("levelsGrid");
    grid.innerHTML = "";

    const activeTab = document.querySelector(".level-tabs .active").id;
    const categorySelect = document.getElementById("categorySelect");
    const categoryWrapper = document.getElementById("categoryFilterWrapper");

    if (activeTab === "tabBuiltIn") {
      categoryWrapper.style.display = "flex"; // show category filter on built-in tab
      const selectedCategory = categorySelect.value;

      DEFAULT_LEVELS.forEach((level, idx) => {
        // Filter by category
        if (selectedCategory !== "all" && level.category !== selectedCategory) {
          return;
        }

        const card = document.createElement("div");
        card.className = "level-card";
        
        const cleared = localStorage.getItem(`level_${idx}_cleared`) === "true";
        if (cleared) card.classList.add("completed");

        card.innerHTML = `
          <div class="level-card-num">LEVEL ${idx + 1}</div>
          <div class="level-card-name">${level.name}</div>
        `;
        
        card.addEventListener("click", () => {
          document.getElementById("levelModal").classList.add("hide");
          // Deactivate editor mode if active
          if (this.isEditorMode) {
            Editor.toggleMode();
          }
          this.loadLevel(idx);
        });
        
        grid.appendChild(card);
      });
    } else {
      categoryWrapper.style.display = "none"; // hide filter on custom levels tab
      // Custom Levels in LocalStorage
      const customLevels = JSON.parse(localStorage.getItem("custom_levels") || "[]");
      if (customLevels.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 3; text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 20px;">
          You haven't saved any custom levels yet. Create one in the Level Editor!
        </div>`;
      } else {
        customLevels.forEach((level, idx) => {
          const card = document.createElement("div");
          card.className = "level-card";
          card.innerHTML = `
            <div class="level-card-num">SAVED #${idx + 1}</div>
            <div class="level-card-name">${level.name || "Custom Level"}</div>
          `;
          
          card.addEventListener("click", () => {
            document.getElementById("levelModal").classList.add("hide");
            if (this.isEditorMode) {
              Editor.toggleMode();
            }
            this.loadLevel(-1, level);
          });
          
          grid.appendChild(card);
        });
      }
    }
  }
}

// Global instance and load binding
const Game = new GameEngine();
window.Game = Game; // Register globally
window.addEventListener("load", () => Game.init());
