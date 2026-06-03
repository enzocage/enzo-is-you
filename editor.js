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
}

// Global instance
const Editor = new LevelEditor();
window.Editor = Editor; // Register globally
window.addEventListener("load", () => Editor.init());
