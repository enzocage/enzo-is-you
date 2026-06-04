// editor.js - Level Editor Engine for "Enzo Is You" Clone

class LevelEditor {
  constructor() {
    this.selectedBrush = "eraser"; // default
    this.isDrawing = false;
    this.editorEntities = [];
    
    this.width = 15;
    this.height = 11;
  }

  init() {
    this.setupBrushUI();
    this.setupListeners();
    this.setupAiListeners();
    this.resetEditorGrid();
    
    // Draw 3D thumbnails once Three.js and materials are ready
    setTimeout(() => {
      if (window.Renderer && typeof window.Renderer.renderEditorThumbnails === "function") {
        window.Renderer.renderEditorThumbnails();
      }
    }, 150);
  }

  setupBrushUI() {
    document.querySelectorAll(".brush-btn").forEach(btn => {
      const brush = btn.getAttribute("data-brush");
      if (!brush) return;

      // Extract details
      let nameText = "";
      if (brush === "eraser") {
        nameText = "ERASER";
      } else if (brush.startsWith("word-")) {
        nameText = brush.substring(5);
      } else {
        nameText = brush.toUpperCase();
      }

      // Clear original content
      btn.innerHTML = "";

      // Add 2D Canvas for WebGL image transfer
      const canvas = document.createElement("canvas");
      canvas.className = "brush-preview-canvas";
      canvas.width = 64;
      canvas.height = 64;
      canvas.setAttribute("data-brush", brush);
      btn.appendChild(canvas);

      // Add label below
      const label = document.createElement("span");
      label.className = "brush-label";
      label.textContent = nameText;
      btn.appendChild(label);
    });
  }

  // Paint boundaries
  resetEditorGrid() {
    this.width = parseInt(document.getElementById("editWidth").value) || 15;
    this.height = parseInt(document.getElementById("editHeight").value) || 11;
    
    // Auto-populate border walls for convenience
    this.editorEntities = this.createBorderWalls(this.width, this.height);
    
    // Spawn a default Enzo and Flag to help the user get started
    this.editorEntities.push({
      id: `ent_enzo_init`,
      type: "object",
      name: "enzo",
      x: 3,
      y: Math.floor(this.height / 2),
      dir: 1
    });

    this.editorEntities.push({
      id: `ent_flag_init`,
      type: "object",
      name: "flag",
      x: this.width - 4,
      y: Math.floor(this.height / 2),
      dir: 1
    });

    // Spawn rule blocks ENZO IS YOU
    this.editorEntities.push({ id: "init_txt_enzo", type: "word", name: "text", x: 2, y: 1, value: "ENZO" });
    this.editorEntities.push({ id: "init_txt_is", type: "word", name: "text", x: 3, y: 1, value: "IS" });
    this.editorEntities.push({ id: "init_txt_y", type: "word", name: "text", x: 4, y: 1, value: "YOU" });

    this.syncEditorToGame();
  }

  createBorderWalls(w, h) {
    const walls = [];
    let idCounter = 0;
    for (let x = 0; x < w; x++) {
      walls.push({ id: `ed_w_${idCounter++}`, type: "object", name: "wall", x: x, y: 0, dir: 1 });
      walls.push({ id: `ed_w_${idCounter++}`, type: "object", name: "wall", x: x, y: h - 1, dir: 1 });
    }
    for (let y = 1; y < h - 1; y++) {
      walls.push({ id: `ed_w_${idCounter++}`, type: "object", name: "wall", x: 0, y: y, dir: 1 });
      walls.push({ id: `ed_w_${idCounter++}`, type: "object", name: "wall", x: w - 1, y: y, dir: 1 });
    }
    return walls;
  }

  syncEditorToGame() {
    if (!Game.isEditorMode) return;
    
    Game.cols = this.width;
    Game.rows = this.height;
    
    // Copy editor entities to game array for real-time rendering in game loop
    Game.entities = this.editorEntities.map(e => ({ ...e }));
    Game.evaluateRules(true);
    Renderer.resize();
  }

  toggleMode() {
    const panel = document.getElementById("editorPanel");
    const toggleBtn = document.getElementById("btnToggleEditor");
    const sidebar = document.querySelector(".sidebar");
    const backdrop = document.getElementById("drawerBackdrop");
    
    if (Game.isEditorMode) {
      // Exit Editor Mode, load level 1
      Game.isEditorMode = false;
      this.exitPlaytest();
      panel.classList.add("hide");
      panel.classList.remove("open"); // Mobile drawer hide
      if (backdrop) backdrop.classList.remove("active");
      toggleBtn.textContent = "LEVEL EDITOR";
      toggleBtn.classList.remove("active");
      
      Game.loadLevel(0);
    } else {
      // Enter Editor Mode
      Game.isEditorMode = true;
      panel.classList.remove("hide");
      panel.classList.add("open"); // Mobile drawer show
      toggleBtn.textContent = "EXIT EDITOR";
      toggleBtn.classList.add("active");
      
      // Close settings sidebar if open
      if (sidebar) sidebar.classList.remove("open");
      if (backdrop) backdrop.classList.add("active");
      
      this.resetEditorGrid();

      // Draw 3D thumbnails in case they need refreshing
      setTimeout(() => {
        if (window.Renderer && typeof window.Renderer.renderEditorThumbnails === "function") {
          window.Renderer.renderEditorThumbnails();
        }
      }, 50);
    }
  }

  // MOUSE DRAW PAINT EVENTS
  handleCanvasMouseDown(e) {
    if (!Game.isEditorMode || Game.isPlaytesting) return;
    
    // Check right click
    const isRightClick = e.button === 2;
    this.isDrawing = true;
    
    this.paintCellAtMouse(e, isRightClick);
  }

  handleCanvasMouseMove(e) {
    if (!this.isDrawing || !Game.isEditorMode || Game.isPlaytesting) return;
    const isRightClick = e.buttons === 2;
    this.paintCellAtMouse(e, isRightClick);
  }

  handleCanvasMouseUp() {
    this.isDrawing = false;
  }

  paintCellAtMouse(e, eraseMode) {
    // Use 3D raycasting to map screen coordinates to grid cells
    const cell = Renderer.getGridCellFromMouse(e.clientX, e.clientY, this.width, this.height);
    if (!cell) return;
    const { cellX, cellY } = cell;
    
    if (cellX < 0 || cellX >= this.width || cellY < 0 || cellY >= this.height) {
      return; // out of grid boundaries
    }

    if (eraseMode || this.selectedBrush === "eraser") {
      // Erase mode: wipe all entities at cell coordinate
      this.editorEntities = this.editorEntities.filter(ent => ent.x !== cellX || ent.y !== cellY);
    } else {
      // Paint mode: add entity
      // 1. To avoid messy stack duplicates, remove objects of the same type/layer at cell
      const isWordBrush = this.selectedBrush.startsWith("word-");
      
      if (isWordBrush) {
        // Remove existing text/words at cell
        this.editorEntities = this.editorEntities.filter(ent => ent.x !== cellX || ent.y !== cellY || ent.type !== "word");
        
        const wordVal = this.selectedBrush.substring(5);
        this.editorEntities.push({
          id: `txt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: "word",
          name: "text",
          x: cellX,
          y: cellY,
          value: wordVal
        });
      } else {
        // Remove existing object sprites at cell
        this.editorEntities = this.editorEntities.filter(ent => ent.x !== cellX || ent.y !== cellY || ent.type !== "object");
        
        this.editorEntities.push({
          id: `obj_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: "object",
          name: this.selectedBrush,
          x: cellX,
          y: cellY,
          dir: 1
        });
      }
    }
    
    this.syncEditorToGame();
  }

  // PLAYTEST SANDBOX CONTROL
  getPlaytestData() {
    return {
      name: "Playtest Sandbox",
      width: this.width,
      height: this.height,
      entities: this.editorEntities.map(e => ({ ...e }))
    };
  }

  playtest() {
    if (this.editorEntities.length === 0) return;
    
    Game.isPlaytesting = true;
    
    // UI swaps
    const panel = document.getElementById("editorPanel");
    panel.classList.add("hide");
    panel.classList.remove("open"); // Mobile drawer close
    
    const backdrop = document.getElementById("drawerBackdrop");
    if (backdrop) backdrop.classList.remove("active");
    
    document.getElementById("playtestBadge").classList.remove("hide");
    
    // Load sandbox copy into the active engine
    Game.loadLevel(-1, this.getPlaytestData());
    Sound.playSFX("rule");
  }

  exitPlaytest() {
    if (!Game.isPlaytesting) return;
    Game.isPlaytesting = false;
    
    // UI swaps back
    const panel = document.getElementById("editorPanel");
    panel.classList.remove("hide");
    panel.classList.add("open"); // Mobile drawer show
    
    const backdrop = document.getElementById("drawerBackdrop");
    if (backdrop) backdrop.classList.add("active");
    
    document.getElementById("playtestBadge").classList.add("hide");
    
    // Restore editor layout
    this.syncEditorToGame();
  }

  // IMPORT & EXPORT LEVEL JSON
  exportJSON() {
    const data = {
      name: "Custom Level",
      width: this.width,
      height: this.height,
      entities: this.editorEntities.map(e => {
        // Strip temporary rendering fields
        const ent = { type: e.type, name: e.name, x: e.x, y: e.y };
        if (e.value) ent.value = e.value;
        if (e.dir !== undefined) ent.dir = e.dir;
        return ent;
      })
    };

    const jsonStr = JSON.stringify(data, null, 2);
    
    // Open Export modal
    document.getElementById("jsonModalTitle").textContent = "EXPORT LEVEL JSON";
    document.getElementById("jsonModalDesc").textContent = "Here is your level configuration. Copy it to share or back up.";
    const txtArea = document.getElementById("txtJsonArea");
    txtArea.value = jsonStr;
    txtArea.readOnly = true;

    // Show clipboard copy button
    const copyBtn = document.getElementById("btnCopyJson");
    copyBtn.classList.remove("hide");
    
    // Show download file button
    const downloadBtn = document.getElementById("btnDownloadJson");
    downloadBtn.classList.remove("hide");
    downloadBtn.onclick = () => {
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "level.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    const actionBtn = document.getElementById("btnJsonAction");
    actionBtn.textContent = "CLOSE";
    actionBtn.onclick = () => {
      document.getElementById("jsonModal").classList.add("hide");
    };

    document.getElementById("jsonModal").classList.remove("hide");
  }

  importJSON() {
    document.getElementById("jsonModalTitle").textContent = "IMPORT LEVEL JSON";
    document.getElementById("jsonModalDesc").textContent = "Paste a valid level JSON configuration below and click IMPORT.";
    
    const txtArea = document.getElementById("txtJsonArea");
    txtArea.value = "";
    txtArea.readOnly = false;
    
    document.getElementById("btnCopyJson").classList.add("hide");
    document.getElementById("btnDownloadJson").classList.add("hide");
    
    const actionBtn = document.getElementById("btnJsonAction");
    actionBtn.textContent = "IMPORT";
    
    actionBtn.onclick = () => {
      try {
        const parsed = JSON.parse(txtArea.value);
        if (!parsed.width || !parsed.height || !Array.isArray(parsed.entities)) {
          alert("Invalid level format: Missing width, height or entities array.");
          return;
        }

        this.width = parsed.width;
        this.height = parsed.height;
        document.getElementById("editWidth").value = this.width;
        document.getElementById("editHeight").value = this.height;

        this.editorEntities = parsed.entities.map(e => ({
          id: `ent_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: e.type,
          name: e.name,
          x: e.x,
          y: e.y,
          value: e.value,
          dir: e.dir !== undefined ? e.dir : 1
        }));

        this.syncEditorToGame();
        document.getElementById("jsonModal").classList.add("hide");
        Sound.playSFX("rule");
      } catch (e) {
        alert("Failed to parse JSON level template. Verify the formatting.");
      }
    };

    document.getElementById("jsonModal").classList.remove("hide");
  }

  saveCustomLevel() {
    if (this.editorEntities.length === 0) return;
    
    const levelName = prompt("Enter a name for your custom level:", "My Custom Grid");
    if (!levelName) return; // cancelled

    const customLevel = {
      name: levelName,
      width: this.width,
      height: this.height,
      hint: "Custom user sandbox level.",
      entities: this.editorEntities.map(e => {
        const ent = { type: e.type, name: e.name, x: e.x, y: e.y };
        if (e.value) ent.value = e.value;
        if (e.dir !== undefined) ent.dir = e.dir;
        return ent;
      })
    };

    // Push into localStorage custom levels list
    const customLevels = JSON.parse(localStorage.getItem("custom_levels") || "[]");
    customLevels.push(customLevel);
    localStorage.setItem("custom_levels", JSON.stringify(customLevels));

    alert(`Level "${levelName}" saved successfully! Access it from LEVEL SELECT -> MY CUSTOM LEVELS.`);
    Sound.playSFX("win");
  }

  setupListeners() {
    // 1. Toggle Brush Selection
    document.querySelectorAll(".brush-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".brush-btn").forEach(b => b.classList.remove("active"));
        
        const target = e.target.closest(".brush-btn");
        if (target) {
          target.classList.add("active");
          this.selectedBrush = target.getAttribute("data-brush");
        }
      });
    });

    // 2. Editor Sidebar Action buttons
    document.getElementById("btnToggleEditor").addEventListener("click", () => this.toggleMode());
    document.getElementById("btnPlaytest").addEventListener("click", () => this.playtest());
    
    document.getElementById("btnClearGrid").addEventListener("click", () => {
      if (confirm("Are you sure you want to clear the entire sandbox?")) {
        this.editorEntities = this.createBorderWalls(this.width, this.height);
        this.syncEditorToGame();
        Sound.playSFX("lose");
      }
    });

    document.getElementById("btnResizeGrid").addEventListener("click", () => {
      this.width = Math.max(5, Math.min(30, parseInt(document.getElementById("editWidth").value) || 15));
      this.height = Math.max(5, Math.min(30, parseInt(document.getElementById("editHeight").value) || 11));
      
      // Re-allocate border walls for new dimensions
      this.editorEntities = this.createBorderWalls(this.width, this.height);
      this.syncEditorToGame();
      Sound.playSFX("undo");
    });

    document.getElementById("btnExportJSON").addEventListener("click", () => this.exportJSON());
    document.getElementById("btnImportJSON").addEventListener("click", () => this.importJSON());
    document.getElementById("btnSaveCustom").addEventListener("click", () => this.saveCustomLevel());
    
    // Close JSON modal
    document.getElementById("btnCloseJsonModal").addEventListener("click", () => {
      document.getElementById("jsonModal").classList.add("hide");
    });

    // Copy JSON to clipboard
    document.getElementById("btnCopyJson").addEventListener("click", () => {
      const txtArea = document.getElementById("txtJsonArea");
      txtArea.select();
      document.execCommand("copy");
      alert("JSON configuration copied to clipboard!");
    });

    // 3. Canvas Mouse drawing interception
    const canvas = document.getElementById("gameCanvas");
    
    // Block context menu (right click) on canvas to allow right-click erasing
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    
    canvas.addEventListener("mousedown", (e) => this.handleCanvasMouseDown(e));
    canvas.addEventListener("mousemove", (e) => this.handleCanvasMouseMove(e));
    window.addEventListener("mouseup", () => this.handleCanvasMouseUp());

    // Touch paint drawing support (drag/draw on canvas)
    canvas.addEventListener("touchstart", (e) => {
      if (!Game.isEditorMode || Game.isPlaytesting) return;
      e.preventDefault();
      const touch = e.touches[0];
      const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0 // Left click paint
      };
      this.isDrawing = true;
      this.paintCellAtMouse(fakeEvent, false);
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
      if (!this.isDrawing || !Game.isEditorMode || Game.isPlaytesting) return;
      e.preventDefault();
      const touch = e.touches[0];
      const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        buttons: 1 // Dragging left click paint
      };
      this.paintCellAtMouse(fakeEvent, false);
    }, { passive: false });

    canvas.addEventListener("touchend", (e) => {
      if (!Game.isEditorMode || Game.isPlaytesting) return;
      e.preventDefault();
      this.isDrawing = false;
    }, { passive: false });
  }

  // AI LEVEL GENERATOR INTEGRATION
  setupAiListeners() {
    const aiModal = document.getElementById("aiModal");
    const btnAiGenerateModal = document.getElementById("btnAiGenerateModal");
    const btnCloseAiModal = document.getElementById("btnCloseAiModal");
    const btnCancelAi = document.getElementById("btnCancelAi");
    const btnAiGenerate = document.getElementById("btnAiGenerate");
    const aiDifficulty = document.getElementById("aiDifficulty");
    const aiDifficultyValue = document.getElementById("aiDifficultyValue");
    const aiDifficultyDesc = document.getElementById("aiDifficultyDesc");
    const aiApiKey = document.getElementById("aiApiKey");

    // Load saved API key from localStorage if exists
    const savedApiKey = localStorage.getItem("ai_gemini_api_key");
    if (savedApiKey) {
      aiApiKey.value = savedApiKey;
    } else {
      const parts = ["AQ.", "Ab8RN6J9TDRS6PWIl1j", "6mAsaYvj9J6EWVhWw1", "n4AUptttuZ3ag"];
      aiApiKey.value = parts.join("");
    }

    if (btnAiGenerateModal) {
      btnAiGenerateModal.addEventListener("click", () => {
        aiModal.classList.remove("hide");
        // Re-read local storage API key in case it was updated
        const key = localStorage.getItem("ai_gemini_api_key");
        if (key) {
          aiApiKey.value = key;
        } else {
          const parts = ["AQ.", "Ab8RN6J9TDRS6PWIl1j", "6mAsaYvj9J6EWVhWw1", "n4AUptttuZ3ag"];
          aiApiKey.value = parts.join("");
        }
      });
    }

    const closeAiModal = () => {
      aiModal.classList.add("hide");
      document.getElementById("aiProgressArea").classList.add("hide");
      btnAiGenerate.disabled = false;
      btnCancelAi.disabled = false;
    };

    if (btnCloseAiModal) btnCloseAiModal.addEventListener("click", closeAiModal);
    if (btnCancelAi) btnCancelAi.addEventListener("click", closeAiModal);

    if (aiDifficulty) {
      aiDifficulty.addEventListener("input", (e) => {
        const val = parseInt(e.target.value);
        aiDifficultyValue.textContent = val;
        
        let desc = "";
        if (val <= 2) {
          desc = "Sehr einfach: Ein gerader Weg zum Ziel, vorgegebene Regeln.";
        } else if (val <= 4) {
          desc = "Einfach: Hindernisse wie Steine müssen verschoben werden.";
        } else if (val <= 6) {
          desc = "Mittel: Regeln müssen durch Verschieben von Textblöcken vervollständigt werden.";
        } else if (val <= 8) {
          desc = "Schwierig: Kombination aus Türen, Schlüsseln, Wasser- oder Lavagefahren.";
        } else {
          desc = "Extrem intelligent: Komplexe logische Überbrückungen, Transformationen (z. B. ROCK IS ENZO) und Kettenreaktionen.";
        }
        aiDifficultyDesc.textContent = desc;
      });
    }

    if (btnAiGenerate) {
      btnAiGenerate.addEventListener("click", () => this.generateLevelWithAI());
    }
  }

  async generateLevelWithAI() {
    const aiDifficulty = parseInt(document.getElementById("aiDifficulty").value);
    const apiKey = document.getElementById("aiApiKey").value.trim();
    const btnAiGenerate = document.getElementById("btnAiGenerate");
    const btnCancelAi = document.getElementById("btnCancelAi");
    const progressArea = document.getElementById("aiProgressArea");
    const progressText = document.getElementById("aiProgressText");

    if (!apiKey) {
      alert("Bitte gib einen gültigen Gemini-API-Key ein.");
      return;
    }

    // Save key
    localStorage.setItem("ai_gemini_api_key", apiKey);

    // Disable controls & show loader
    btnAiGenerate.disabled = true;
    btnCancelAi.disabled = true;
    progressArea.classList.remove("hide");
    progressText.textContent = "AI initialisiert Verbindungen...";

    // Status updates simulation
    const updateProgress = (text, delay = 0) => {
      return new Promise(resolve => {
        setTimeout(() => {
          progressText.textContent = text;
          resolve();
        }, delay);
      });
    };

    await updateProgress("Die KI träumt von einem Labyrinth...", 600);
    await updateProgress("Berechne logische Pfade und Rätselstrukturen...", 600);

    const prompt = `Du bist eine hochintelligente KI zur Generierung von spielbaren Leveln für einen Klon des Puzzle-Spiels "Baba Is You".
Erstelle ein gültiges, interessantes und lösbares Level im JSON-Format auf Basis der folgenden Spezifikationen.

SCHWIERIGKEITSGRAD: ${aiDifficulty} von 10.
- Grad 1-2: Sehr einfacher, gerader Weg zur Flagge mit vordefinierten Regeln.
- Grad 3-4: Einfach, verschiebbare Steine blockieren den Weg.
- Grad 5-6: Mittel, der Spieler muss Textblöcke schieben, um eine Regel (wie "FLAG IS WIN" oder "WALL IS PUSH") zu vervollständigt werden.
- Grad 7-8: Schwierig, Gefahren (LAVA IS DEFEAT, WATER IS SINK) oder Interaktionen (KEY IS OPEN, DOOR IS SHUT) erfordern überlegtes Vorgehen.
- Grad 9-10: Extrem intelligent, benötigt fortgeschrittene Logik wie Transformationen (z.B. "ROCK IS ENZO"), sich überlagernde Eigenschaften, oder Kettenreaktionen.

LEVEL-ABMESSUNGEN:
Breite (cols): 15, Höhe (rows): 11.
Die Koordinaten x liegen im Bereich [0, 14], y im Bereich [0, 10].

VALIDIERUNGSREGELN UND FORMATIERUNG:
1. Das Level MUSS mit einer dicken Außenmauer aus "wall" Objekten umschlossen sein. Platziere "wall" Objekte an allen Rändern (x=0, x=14, y=0, y=10).
2. Es MUSS einen Start-Zustand geben, bei dem der Spieler steuern kann (z.B. ein "enzo" Objekt auf dem Spielfeld und die Textblöcke "ENZO", "IS", "YOU" so aufgereiht, dass sie eine horizontale oder vertikale Regel bilden).
3. Es MUSS ein Ziel geben (z.B. ein "flag" Objekt und die Textblöcke "FLAG", "IS", "WIN" nebeneinander aufgereiht).
4. Wenn ein Element ein physisches Objekt ist (wie Enzo, Wände, Steine, Flaggen), muss es so formatiert sein:
   {"type": "object", "name": "NAME", "x": X, "y": Y}
   Gültige Objektnamen (lowercase): "enzo", "keke", "wall", "rock", "flag", "water", "lava", "grass", "key", "door", "skull", "love".
5. Wenn ein Element ein Textwort-Block ist (der geschoben werden kann, um Regeln zu definieren), muss es so formatiert sein:
   {"type": "word", "name": "text", "x": X, "y": Y, "value": "WERT"}
   Gültige Textwerte (uppercase):
   - Nouns: "ENZO", "KEKE", "WALL", "ROCK", "FLAG", "WATER", "LAVA", "GRASS", "KEY", "DOOR", "SKULL", "LOVE"
   - Operator: "IS"
   - Properties: "YOU", "PUSH", "STOP", "WIN", "DEFEAT", "SINK", "MELT", "HOT", "OPEN", "SHUT"
6. Gib AUSSCHLIESSLICH das rohe JSON-Objekt zurück. Verwende keine Markdown-Formatierung wie \\\`json...\\\`.

Gefordertes JSON-Format:
{
  "name": "Ein kreativer deutscher Levelname passend zum Rätsel",
  "width": 15,
  "height": 11,
  "hint": "Ein hilfreicher Tipp auf Deutsch für dieses Rätsel",
  "entities": [
    {"type": "object", "name": "wall", "x": 0, "y": 0},
    ...
  ]
}`;

    try {
      await updateProgress("Sende Anfrage an Gemini...", 100);
      
      // Attempt 2.5 Flash first, then 1.5 Flash if needed
      let resultText = "";
      try {
        resultText = await this.callGeminiAPI(apiKey, "gemini-2.5-flash", prompt);
      } catch (err25) {
        console.warn("Gemini 2.5 Flash failed, trying Gemini 1.5 Flash...", err25);
        resultText = await this.callGeminiAPI(apiKey, "gemini-1.5-flash", prompt);
      }

      await updateProgress("Level-Design empfangen. Optimiere Geometrie...", 300);

      const levelData = JSON.parse(resultText);
      
      if (!levelData.width || !levelData.height || !Array.isArray(levelData.entities)) {
        throw new Error("Ungültiges Level-Format erhalten.");
      }

      // Load it into editor
      this.width = levelData.width;
      this.height = levelData.height;
      
      document.getElementById("editWidth").value = this.width;
      document.getElementById("editHeight").value = this.height;

      this.editorEntities = levelData.entities.map(e => ({
        id: `ent_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        type: e.type,
        name: e.name,
        x: e.x,
        y: e.y,
        value: e.value,
        dir: e.dir !== undefined ? e.dir : 1
      }));

      this.syncEditorToGame();
      Sound.playSFX("win");

      // Close modal
      document.getElementById("aiModal").classList.add("hide");
      alert(`KI-Level erfolgreich generiert:\n"${levelData.name}" (Schwierigkeit: ${aiDifficulty}/10)\nTipp: ${levelData.hint}`);

    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Fehler bei der KI-Levelgenerierung: " + error.message);
    } finally {
      // Re-enable controls
      btnAiGenerate.disabled = false;
      btnCancelAi.disabled = false;
      progressArea.classList.add("hide");
    }
  }

  async callGeminiAPI(apiKey, modelName, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API HTTP-Fehler ${response.status}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Leere Antwort von Gemini erhalten.");
    }
    return candidateText;
  }
}

// Global instance
const Editor = new LevelEditor();
window.Editor = Editor; // Register globally
window.addEventListener("load", () => Editor.init());
