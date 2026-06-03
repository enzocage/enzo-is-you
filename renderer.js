// renderer.js - High-End Three.js WebGL Rendering Engine for "Enzo Is You" Neon Clone

class ThreeRenderer {
  constructor() {
    this.canvas = null;
    this.bgCanvas = null; // Unused, Three.js renders to the main canvas
    
    // Core Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // Grid sizes
    this.currentCols = 0;
    this.currentRows = 0;
    this.currentShowGrid = true;
    
    // Scene objects tracking
    this.meshMap = new Map(); // id -> wrapper {mesh, targetPosition, targetScale, idHash, entName, ...}
    this.floorMeshes = [];
    
    // Background layers
    this.starfields = [];
    this.nebulae = [];
    
    // Particle system
    this.particles = [];
    
    // Screenshake properties
    this.shakeIntensity = 0;
    this.shakeDecay = 0.88;
    this.cameraBasePos = new THREE.Vector3(0, 30, 0);
    
    // Current settings placeholders
    this.currentStyle = "neon";
    this.currentColorScheme = "neon";
    this.initialized = false;
  }
  
  init(canvas, bgCanvas) {
    if (this.initialized) return;
    
    this.canvas = canvas;
    this.bgCanvas = bgCanvas;
    
    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    
    canvas.width = width;
    canvas.height = height;
    
    // Initialize WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Scene creation
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020208); // Deep indigo space background
    this.scene.fog = new THREE.FogExp2(0x03030f, 0.012); // Fog for deep atmospheric layers
    
    // Top-down Orthographic Camera setup
    this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 1000);
    this.camera.position.copy(this.cameraBasePos);
    this.camera.lookAt(0, 0, 0);
    this.camera.up.set(0, 0, -1); // Align camera up coordinate to grid Y (-z)
    
    // OrbitControls locked down to provide stable isometric/top-down view
    this.controls = new THREE.OrbitControls(this.camera, canvas);
    this.controls.enableRotate = false;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.target.set(0, 0, 0);
    
    // --- High-End Neon Lighting System ---
    // Deep dark purple-indigo ambient fills the shadow areas
    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 1.6);
    this.scene.add(ambientLight);
    
    // Vibrant electric cyan key light from upper-left with soft shadow support
    const keyLight = new THREE.DirectionalLight(0x00f3ff, 1.4);
    keyLight.position.set(-8, 15, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.002;
    this.scene.add(keyLight);
    
    // Hot pink rim light from opposite angle to capture clean specular highlight wiggles
    const rimLight = new THREE.DirectionalLight(0xff007f, 1.0);
    rimLight.position.set(8, 12, -5);
    this.scene.add(rimLight);
    
    // Build background stars and nebulae
    this._buildBackground();
    
    // Window Resize and reset camera triggers
    window.addEventListener("resize", () => this.resize());
    canvas.addEventListener("dblclick", () => this.resetCamera());
    
    this.initialized = true;
  }
  
  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
    
    this._updateCameraZoom();
  }
  
  _updateCameraZoom() {
    if (!this.camera || !this.canvas) return;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const aspect = width / height;
    
    const cols = this.currentCols || 15;
    const rows = this.currentRows || 11;
    
    // Calculate d to fit the grid perfectly at 100% of the viewport width or height
    const d = Math.max(cols / aspect, rows) * 0.505;
    
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();
  }
  
  resetCamera() {
    this.shakeIntensity = 0;
    this.cameraBasePos.set(0, 30, 0);
    this.camera.position.copy(this.cameraBasePos);
    this.camera.lookAt(0, 0, 0);
    this.camera.up.set(0, 0, -1);
    if (this.controls) {
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }
  
  _buildBackground() {
    // 1. Double-Layer Animated Starfield
    const buildStarfield = (count, size, pulseColor, rx, ry) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        pos[i] = (Math.random() - 0.5) * 100;
        pos[i+1] = -7 - Math.random() * 10; // Placed far below the playfield grid plane
        pos[i+2] = (Math.random() - 0.5) * 100;
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      
      // Dynamic canvas glowing point map
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.35, pulseColor);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      
      const texture = new THREE.CanvasTexture(canvas);
      const mat = new THREE.PointsMaterial({
        size: size,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      const sf = new THREE.Points(geo, mat);
      this.scene.add(sf);
      this.starfields.push({ mesh: sf, speedX: rx, speedY: ry });
    };
    
    // Layer 1: Cyan starfield drifting clockwise
    buildStarfield(600, 0.25, "rgba(0, 243, 255, 0.8)", 0.0002, 0.0004);
    // Layer 2: Violet starfield drifting counter-clockwise
    buildStarfield(500, 0.35, "rgba(255, 0, 127, 0.7)", -0.0001, 0.0003);
    
    // 2. Volumetric Glowing Cosmic Nebulae
    const buildNebula = (c1, c2, radius, opacity, yPos, speedZ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.45, c2);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      
      const texture = new THREE.CanvasTexture(canvas);
      const planeGeo = new THREE.PlaneGeometry(60, 60);
      const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.position.set((Math.random() - 0.5) * 8, yPos, (Math.random() - 0.5) * 8);
      plane.rotation.x = Math.PI / 2; // Lie flat below the grid
      plane.rotation.z = Math.random() * Math.PI * 2;
      
      this.scene.add(plane);
      this.nebulae.push({ mesh: plane, speed: speedZ });
    };
    
    // Layer nebulae with cyan, hot pink, purple, and radioactive emerald hues
    buildNebula("rgba(255, 0, 127, 0.16)", "rgba(120, 0, 255, 0.08)", 32, 0.65, -9, 0.0006);
    buildNebula("rgba(0, 243, 255, 0.20)", "rgba(0, 80, 255, 0.08)", 38, 0.50, -8, -0.0004);
    buildNebula("rgba(180, 0, 255, 0.12)", "rgba(255, 0, 80, 0.05)", 28, 0.60, -10, 0.0002);
    buildNebula("rgba(0, 255, 120, 0.08)", "rgba(0, 130, 255, 0.04)", 42, 0.40, -7, -0.0003);
  }
  
  _rebuildFloor(cols, rows, showGrid) {
    // Cleanup existing tiles
    this.floorMeshes.forEach(tile => {
      this.scene.remove(tile);
      if (tile.geometry) tile.geometry.dispose();
      if (tile.material) tile.material.dispose();
    });
    this.floorMeshes = [];
    
    if (cols <= 0 || rows <= 0) return;
    
    const tileW = 0.94;
    const tileH = 0.05;
    const geo = new THREE.BoxGeometry(tileW, tileH, tileW);
    
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Floor tile: dark beveled obsidian block with neon glow edges
        const mat = new THREE.MeshStandardMaterial({
          color: 0x05050e,
          roughness: 0.25,
          metalness: 0.15,
          transparent: true,
          opacity: 0.45,
          flatShading: true,
          emissive: 0x00f3ff,
          emissiveIntensity: 0.08 // Modulated dynamically by grid pulsator waves
        });
        
        const tile = new THREE.Mesh(geo, mat);
        // Map grid coordinate (c, r) centered around origin (0, 0, 0)
        const x = c - cols / 2 + 0.5;
        const z = r - rows / 2 + 0.5;
        tile.position.set(x, -0.025, z);
        tile.receiveShadow = true;
        
        this.scene.add(tile);
        this.floorMeshes.push(tile);
      }
    }
  }
  
  _getBaseY(ent) {
    if (ent.type === "word") return 0.02;
    switch (ent.name) {
      case "water":
      case "lava":
        return -0.02;
      case "grass":
        return 0.01;
      case "key":
      case "love":
        return 0.35; // Hover higher
      case "flag":
        return 0.22;
      default:
        return 0.20;
    }
  }
  
  _getWordColor(word) {
    const type = this.getWordType(word);
    if (type === "noun") return "#ff7f27";      // Hot neon orange
    if (type === "operator") return "#ff007f";  // Radioactive pink
    return "#39ff14";                          // Acid green
  }
  
  getWordType(word) {
    const nouns = ["ENZO", "KEKE", "WALL", "ROCK", "FLAG", "WATER", "LAVA", "GRASS", "KEY", "DOOR", "SKULL", "LOVE"];
    const operators = ["IS", "AND", "ON", "HAS"];
    if (nouns.includes(word)) return "noun";
    if (operators.includes(word)) return "operator";
    return "property";
  }
  
  _parseColor(colorStr) {
    if (!colorStr) return 0xffffff;
    if (colorStr.startsWith("#")) {
      return parseInt(colorStr.substring(1), 16);
    }
    if (colorStr === "enzo") return 0x00f3ff;
    if (colorStr === "keke") return 0xff007f;
    return 0xffffff;
  }
  
  _mat(color, emissiveColor, opacity = 0.5) {
    // Common material with vibrant 50% glass transparency, emissive neon internal glow, and faceted flatShading
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.08,
      metalness: 0.12,
      transparent: true,
      opacity: opacity,
      flatShading: true,
      emissive: emissiveColor || color,
      emissiveIntensity: 1.5 // Force highly vibrant internal glow
    });
  }
  
  _buildEntityMesh(ent, rules) {
    let mesh;
    if (ent.type === "word") {
      const isActive = rules ? rules.some(r => r.words.some(w => w.id === ent.id)) : false;
      mesh = this._buildWordBlock(ent.value, isActive);
    } else {
      mesh = this._buildObjectMesh(ent.name);
    }
    return mesh;
  }
  
  _buildWordBlock(wordVal, isActive) {
    const themeColor = this._getWordColor(wordVal);
    const boxGeo = new THREE.BoxGeometry(0.84, 0.08, 0.84);
    
    // Create 2D canvas texture for rule text rendering
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    
    // Background card fill
    ctx.fillStyle = "rgba(8, 8, 18, 0.95)";
    ctx.fillRect(0, 0, 256, 256);
    
    // Glowing borders
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = isActive ? 22 : 12;
    ctx.strokeRect(11, 11, 234, 234);
    
    // Bold modern rule lettering
    ctx.font = "bold 56px 'Orbitron', sans-serif";
    ctx.fillStyle = isActive ? "#ffffff" : "#abb2bf";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    if (isActive) {
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 18;
    }
    ctx.fillText(wordVal, 128, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 0.82,
      roughness: 0.15,
      metalness: 0.1,
      emissive: new THREE.Color(themeColor),
      emissiveIntensity: isActive ? 1.3 : 0.35,
      flatShading: true
    });
    
    const m = new THREE.Mesh(boxGeo, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  
  _updateWordBlockTexture(mesh, wordVal, isActive) {
    if (!mesh || !mesh.material || !mesh.material.map) return;
    
    const themeColor = this._getWordColor(wordVal);
    const texture = mesh.material.map;
    const image = texture.image;
    if (!image) return;
    
    const ctx = image.getContext("2d");
    ctx.clearRect(0, 0, 256, 256);
    
    ctx.fillStyle = "rgba(8, 8, 18, 0.95)";
    ctx.fillRect(0, 0, 256, 256);
    
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = isActive ? 22 : 12;
    ctx.strokeRect(11, 11, 234, 234);
    
    ctx.font = "bold 56px 'Orbitron', sans-serif";
    ctx.fillStyle = isActive ? "#ffffff" : "#abb2bf";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (isActive) {
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 18;
    }
    ctx.fillText(wordVal, 128, 128);
    
    texture.needsUpdate = true;
    mesh.material.emissiveIntensity = isActive ? 1.3 : 0.35;
  }
  
  _buildObjectMesh(name) {
    const group = new THREE.Group();
    
    switch(name) {
      case "enzo": {
        // Abstract sheep player: Glowing cyan faceted dodecahedron core surrounded by a floating ring
        const coreGeo = new THREE.DodecahedronGeometry(0.3, 0);
        const coreMat = this._mat(0xffffff, 0x00f3ff, 0.6);
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.castShadow = true;
        group.add(core);
        
        const ringGeo = new THREE.TorusGeometry(0.45, 0.04, 6, 12);
        const ringMat = this._mat(0x00f3ff, 0x00f3ff, 0.7);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2; // Lie flat in XZ plane
        ring.castShadow = true;
        group.add(ring);
        break;
      }
      
      case "keke": {
        // Abstract fox: Glowing magenta cone body with floating octahedron crown
        const baseGeo = new THREE.ConeGeometry(0.35, 0.65, 4, 1);
        const baseMat = this._mat(0xff007f, 0xff007f, 0.6);
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.rotation.x = Math.PI; // Inverted
        base.position.y = 0.15;
        base.castShadow = true;
        group.add(base);
        
        const crownGeo = new THREE.OctahedronGeometry(0.13, 0);
        const crownMat = this._mat(0xffffff, 0xff007f, 0.8);
        const crown = new THREE.Mesh(crownGeo, crownMat);
        crown.position.y = 0.52;
        crown.castShadow = true;
        group.add(crown);
        break;
      }
      
      case "rock": {
        // Faceted crystal gemstone rock
        const geo = new THREE.IcosahedronGeometry(0.38, 0);
        const mat = this._mat(0xff8a00, 0xff5500, 0.5);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        break;
      }
      
      case "wall": {
        // Faceted clean glass block
        const geo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
        const mat = this._mat(0x49454f, 0x49454f, 0.4);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        break;
      }
      
      case "flag": {
        // Abstract flag: thin post with rotating floating double-cone
        const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 5);
        const poleMat = this._mat(0xffd700, 0xaa7c00, 0.6);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 0.15;
        pole.castShadow = true;
        group.add(pole);
        
        const topGeo = new THREE.OctahedronGeometry(0.18, 0);
        const topMat = this._mat(0xffd700, 0xffd700, 0.8);
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 0.48;
        top.castShadow = true;
        group.add(top);
        break;
      }
      
      case "water": {
        // low flat blue glass box
        const geo = new THREE.BoxGeometry(0.85, 0.08, 0.85);
        const mat = this._mat(0x00b4db, 0x00f3ff, 0.4);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = true;
        group.add(mesh);
        break;
      }
      
      case "lava": {
        // low flat orange-red hot box
        const geo = new THREE.BoxGeometry(0.85, 0.08, 0.85);
        const mat = this._mat(0xff3300, 0xff3300, 0.5);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = true;
        group.add(mesh);
        break;
      }
      
      case "grass": {
        // 3 crystal grass blades
        const bladeGeo = new THREE.OctahedronGeometry(0.09, 0);
        const bladeMat = this._mat(0x39ff14, 0x39ff14, 0.5);
        
        const b1 = new THREE.Mesh(bladeGeo, bladeMat);
        b1.scale.set(0.12, 0.6, 0.12);
        b1.position.set(-0.15, 0.15, 0.1);
        b1.castShadow = true;
        group.add(b1);
        
        const b2 = new THREE.Mesh(bladeGeo, bladeMat);
        b2.scale.set(0.12, 0.8, 0.12);
        b2.position.set(0.1, 0.2, -0.15);
        b2.castShadow = true;
        group.add(b2);
        
        const b3 = new THREE.Mesh(bladeGeo, bladeMat);
        b3.scale.set(0.10, 0.5, 0.10);
        b3.position.set(0.05, 0.12, 0.18);
        b3.castShadow = true;
        group.add(b3);
        break;
      }
      
      case "key": {
        // Floating ring key (abstract torus)
        const torusGeo = new THREE.TorusGeometry(0.24, 0.06, 6, 12);
        const torusMat = this._mat(0xffd700, 0xffd700, 0.6);
        const torus = new THREE.Mesh(torusGeo, torusMat);
        torus.castShadow = true;
        group.add(torus);
        break;
      }
      
      case "door": {
        // Violet portal frame
        const postMat = this._mat(0xaa00ff, 0xaa00ff, 0.5);
        
        const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.68, 0.15), postMat);
        leftPost.position.set(-0.25, 0.2, 0);
        leftPost.castShadow = true;
        group.add(leftPost);
        
        const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.68, 0.15), postMat);
        rightPost.position.set(0.25, 0.2, 0);
        rightPost.castShadow = true;
        group.add(rightPost);
        
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.11, 0.15), postMat);
        topBar.position.set(0, 0.53, 0);
        topBar.castShadow = true;
        group.add(topBar);
        break;
      }
      
      case "skull": {
        // Dark metallic diamond-rotated cube with piercing glowing red eyes
        const skullGeo = new THREE.BoxGeometry(0.44, 0.44, 0.44);
        const skullMat = this._mat(0x2d3436, 0x0f1115, 0.5);
        const mainCube = new THREE.Mesh(skullGeo, skullMat);
        mainCube.rotation.x = Math.PI / 4;
        mainCube.rotation.z = Math.PI / 4;
        mainCube.castShadow = true;
        group.add(mainCube);
        
        const eyeGeo = new THREE.SphereGeometry(0.045, 4, 4);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        
        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.13, 0.08, 0.20);
        group.add(eyeL);
        
        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.13, 0.08, 0.20);
        group.add(eyeR);
        break;
      }
      
      case "love": {
        // Glowing pink torus knot (abstract sculpture for love)
        const knotGeo = new THREE.TorusKnotGeometry(0.2, 0.05, 24, 4, 3, 4);
        const knotMat = this._mat(0xff2a85, 0xff007f, 0.6);
        const knot = new THREE.Mesh(knotGeo, knotMat);
        knot.castShadow = true;
        group.add(knot);
        break;
      }
      
      default: {
        const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const mat = this._mat(0xffffff, 0xffffff, 0.5);
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        break;
      }
    }
    
    return group;
  }
  
  _disposeMesh(mesh) {
    if (!mesh) return;
    mesh.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    });
  }
  
  draw(entities, rules, cols, rows, showGrid, isEditorMode) {
    if (!this.initialized) return;
    
    // Check for dimension or grid setting updates
    if (cols !== this.currentCols || rows !== this.currentRows || showGrid !== this.currentShowGrid) {
      this.currentCols = cols;
      this.currentRows = rows;
      this.currentShowGrid = showGrid;
      this._rebuildFloor(cols, rows, showGrid);
      this._updateCameraZoom();
    }
    
    // OrbitControls logic (disable while editing to permit raycast painting)
    if (this.controls) {
      this.controls.enabled = !isEditorMode;
    }
    
    const seenIds = new Set();
    const time = Date.now() * 0.001;
    
    entities.forEach(ent => {
      const id = ent.id;
      seenIds.add(id);
      
      const base_y = this._getBaseY(ent);
      const targetX = ent.x - cols / 2 + 0.5;
      const targetZ = ent.y - rows / 2 + 0.5;
      const targetY = base_y;
      
      let wrapper = this.meshMap.get(id);
      
      if (!wrapper) {
        // Instantiate new entity mesh representation
        const mesh = this._buildEntityMesh(ent, rules);
        if (mesh) {
          mesh.position.set(targetX, targetY, targetZ);
          mesh.scale.set(0, 0, 0); // Zoom in from 0 size on spawn
          this.scene.add(mesh);
          
          wrapper = {
            mesh: mesh,
            targetPosition: new THREE.Vector3(targetX, targetY, targetZ),
            targetScale: 1.0,
            idHash: Math.random() * 100,
            entName: ent.name,
            entType: ent.type,
            wordValue: ent.value,
            lastIsActive: null
          };
          this.meshMap.set(id, wrapper);
        }
      }
      
      if (wrapper) {
        // Handle input block animation expiration
        if (ent.anim) {
          const elapsed = Date.now() - ent.anim.startTime;
          const p = Math.min(1, elapsed / ent.anim.duration);
          if (p >= 1) {
            delete ent.anim;
            wrapper.targetPosition.set(targetX, targetY, targetZ);
          } else {
            if (ent.anim.type === "bump") {
              const nudge = 0.22 * Math.sin(p * Math.PI);
              const nudgeX = ent.anim.dx * nudge;
              const nudgeZ = ent.anim.dy * nudge;
              wrapper.targetPosition.set(targetX + nudgeX, targetY, targetZ + nudgeZ);
            } else {
              wrapper.targetPosition.set(targetX, targetY, targetZ);
            }
          }
        } else {
          wrapper.targetPosition.set(targetX, targetY, targetZ);
        }
        wrapper.targetScale = 1.0;
        
        // Update mesh orientation rotations (direction map: 0:N, 1:E, 2:S, 3:W)
        let targetAngle = 0;
        if (ent.dir === 1) targetAngle = -Math.PI / 2;
        else if (ent.dir === 2) targetAngle = Math.PI;
        else if (ent.dir === 3) targetAngle = Math.PI / 2;
        
        if (ent.type !== "word") {
          wrapper.mesh.rotation.y = THREE.MathUtils.lerp(wrapper.mesh.rotation.y, targetAngle, 0.18);
        }
        
        // Handle rule word canvas updates on activation changes
        if (ent.type === "word") {
          const isActive = rules.some(r => r.words.some(w => w.id === ent.id));
          if (wrapper.lastIsActive !== isActive) {
            wrapper.lastIsActive = isActive;
            this._updateWordBlockTexture(wrapper.mesh, ent.value, isActive);
            
            if (isActive) {
              this.emitExplosion(ent.x, ent.y, this._getWordColor(ent.value));
            }
          }
        }
      }
    });
    
    // Dispose entities that have been removed
    this.meshMap.forEach((wrapper, id) => {
      if (!seenIds.has(id)) {
        wrapper.targetScale = 0;
        wrapper.mesh.scale.lerp(new THREE.Vector3(0, 0, 0), 0.28);
        
        if (wrapper.mesh.scale.x < 0.05) {
          this.scene.remove(wrapper.mesh);
          this._disposeMesh(wrapper.mesh);
          this.meshMap.delete(id);
        }
      }
    });
    
    // Apply position transitions and bobbing/rotating animations
    this.meshMap.forEach(wrapper => {
      if (wrapper.targetScale > 0) {
        wrapper.mesh.position.lerp(wrapper.targetPosition, 0.24);
        
        const s = THREE.MathUtils.lerp(wrapper.mesh.scale.x, wrapper.targetScale, 0.22);
        wrapper.mesh.scale.set(s, s, s);
        
        // Cozy floating idle bob
        const bob = Math.sin(time * 3.0 + wrapper.idHash) * 0.045;
        wrapper.mesh.position.y = wrapper.targetPosition.y + bob;
        
        // Slow rotating animations for key, flag top, love torus, enzo ring
        if (wrapper.entName === "key" || wrapper.entName === "love") {
          wrapper.mesh.rotation.y += 0.02;
        } else if (wrapper.entName === "flag" && wrapper.mesh.children.length > 1) {
          wrapper.mesh.children[1].rotation.y += 0.035;
        } else if (wrapper.entName === "enzo" && wrapper.mesh.children.length > 1) {
          wrapper.mesh.children[1].rotation.y += 0.012;
          wrapper.mesh.children[1].rotation.x += 0.006;
        }
      }
    });
  }
  
  drawBackground() {
    if (!this.initialized) return;
    
    const time = Date.now() * 0.001;
    
    // 1. Slow rotate starfields (provides depth/parallax)
    this.starfields.forEach(sf => {
      sf.mesh.rotation.y += sf.speedY;
      sf.mesh.rotation.x += sf.speedX;
    });
    
    // 2. Slow rotate volumetric nebulae
    this.nebulae.forEach(neb => {
      neb.mesh.rotation.z += neb.speed;
    });
    
    // 3. Emissive Floor grid pulsator radial waves
    if (this.floorMeshes.length > 0) {
      this.floorMeshes.forEach(tile => {
        const dx = tile.position.x;
        const dz = tile.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const wave = 0.08 + 0.15 * Math.sin(time * 1.5 - dist * 0.35);
        tile.material.emissiveIntensity = Math.max(0, wave);
      });
    }
    
    // 4. Update 3D particles
    this._updateParticles();
    
    // 5. Apply screen-shake logic
    if (this.shakeIntensity > 0.01) {
      const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      const shakeZ = (Math.random() - 0.5) * this.shakeIntensity;
      
      this.camera.position.set(
        this.cameraBasePos.x + shakeX,
        this.cameraBasePos.y + shakeY,
        this.cameraBasePos.z + shakeZ
      );
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.camera.position.copy(this.cameraBasePos);
      this.shakeIntensity = 0;
    }
    
    // 6. Draw WebGL Scene
    this.renderer.render(this.scene, this.camera);
  }
  
  // --- Particle Systems ---
  emitExplosion(gridX, gridY, colorStr) {
    const cols = this.currentCols || 15;
    const rows = this.currentRows || 11;
    const px = gridX - cols / 2 + 0.5;
    const pz = gridY - rows / 2 + 0.5;
    const py = 0.35;
    
    const count = 18;
    const colHex = this._parseColor(colorStr);
    const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: colHex,
        transparent: true,
        opacity: 0.95
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, pz);
      this.scene.add(mesh);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.11 + 0.05;
      const vy = Math.random() * 0.11 - 0.03;
      
      this.particles.push({
        mesh: mesh,
        vx: Math.cos(angle) * speed,
        vy: vy,
        vz: Math.sin(angle) * speed,
        life: 25 + Math.floor(Math.random() * 15),
        maxLife: 40,
        drag: 0.93
      });
    }
  }
  
  emitDust(gridX, gridY, dx, dy) {
    const cols = this.currentCols || 15;
    const rows = this.currentRows || 11;
    const px = gridX - cols / 2 + 0.5;
    const pz = gridY - rows / 2 + 0.5;
    const py = 0.08;
    
    const count = 8;
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x88889a,
        transparent: true,
        opacity: 0.7
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, pz);
      this.scene.add(mesh);
      
      const vx = dx * 0.05 + (Math.random() - 0.5) * 0.03;
      const vz = dy * 0.05 + (Math.random() - 0.5) * 0.03;
      const vy = Math.random() * 0.05 + 0.01;
      
      this.particles.push({
        mesh: mesh,
        vx: vx,
        vy: vy,
        vz: vz,
        life: 15 + Math.floor(Math.random() * 10),
        maxLife: 25,
        drag: 0.92
      });
    }
  }
  
  emitSplash(gridX, gridY, colorStr) {
    const cols = this.currentCols || 15;
    const rows = this.currentRows || 11;
    const px = gridX - cols / 2 + 0.5;
    const pz = gridY - rows / 2 + 0.5;
    const py = 0.05;
    
    const count = 12;
    const colHex = this._parseColor(colorStr);
    const geo = new THREE.BoxGeometry(0.09, 0.16, 0.09);
    
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: colHex,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(px, py, pz);
      this.scene.add(mesh);
      
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.07 + 0.02;
      const vy = Math.random() * 0.12 + 0.08;
      
      this.particles.push({
        mesh: mesh,
        vx: Math.cos(angle) * speed,
        vy: vy,
        vz: Math.sin(angle) * speed,
        life: 20 + Math.floor(Math.random() * 12),
        maxLife: 32,
        drag: 0.94,
        gravity: 0.008
      });
    }
  }
  
  emitVictoryFireworks() {
    const cols = this.currentCols || 15;
    const rows = this.currentRows || 11;
    const halfCols = cols / 2;
    const halfRows = rows / 2;
    
    this._launchFireworkRocket(-halfCols + 1, halfRows - 1);
    this._launchFireworkRocket(halfCols - 1, halfRows - 1);
  }
  
  _launchFireworkRocket(x, z) {
    const geo = new THREE.BoxGeometry(0.16, 0.32, 0.16);
    const color = Math.random() > 0.5 ? 0xff007f : 0x00f3ff;
    const mat = new THREE.MeshBasicMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, z);
    this.scene.add(mesh);
    
    this.particles.push({
      mesh: mesh,
      vx: (Math.random() - 0.5) * 0.06 - x * 0.02,
      vy: Math.random() * 0.14 + 0.26,
      vz: (Math.random() - 0.5) * 0.06 - z * 0.02,
      life: 38 + Math.floor(Math.random() * 10),
      maxLife: 48,
      gravity: 0.004,
      drag: 0.97,
      isRocket: true,
      rocketColor: color
    });
  }
  
  _updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      
      if (p.life <= 0) {
        if (p.isRocket) {
          this._burstFirework(p.mesh.position.x, p.mesh.position.y, p.mesh.position.z, p.rocketColor);
        }
        
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }
      
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;
      
      if (p.gravity) p.vy -= p.gravity;
      p.vx *= p.drag || 1;
      p.vy *= p.drag || 1;
      p.vz *= p.drag || 1;
      
      const progress = p.life / p.maxLife;
      if (!p.isRocket) {
        p.mesh.material.opacity = progress;
        p.mesh.scale.set(progress, progress, progress);
      }
    }
  }
  
  _burstFirework(x, y, z, colorHex) {
    const count = 32;
    const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 1.0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      this.scene.add(mesh);
      
      const angle = Math.random() * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * Math.PI;
      const speed = Math.random() * 0.14 + 0.06;
      
      this.particles.push({
        mesh: mesh,
        vx: Math.cos(angle) * Math.cos(pitch) * speed,
        vy: Math.sin(pitch) * speed,
        vz: Math.sin(angle) * Math.cos(pitch) * speed,
        life: 30 + Math.floor(Math.random() * 20),
        maxLife: 50,
        gravity: 0.003,
        drag: 0.94
      });
    }
    this.triggerShake(6);
  }
  
  triggerShake(intensity) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity * 0.065);
  }
  
  getGridCellFromMouse(clientX, clientY, cols, rows) {
    if (!this.camera || !this.canvas) return null;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(plane, target)) {
      const gridX = Math.floor(target.x + cols / 2);
      const gridY = Math.floor(target.z + rows / 2);
      
      return { cellX: gridX, cellY: gridY };
    }
    return null;
  }
  
  renderEditorThumbnails() {
    const canvases = document.querySelectorAll(".brush-preview-canvas");
    if (canvases.length === 0) return;
    
    const width = 64;
    const height = 64;
    const offscreenRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    offscreenRenderer.setSize(width, height);
    offscreenRenderer.setPixelRatio(1);
    offscreenRenderer.setClearColor(0x000000, 0); // Transparent backgrounds
    
    const scene = new THREE.Scene();
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 8, 3);
    scene.add(dirLight);
    
    // Set up orthographic camera looking isometrically at the model
    const aspect = 1;
    const d = 0.55;
    const camera = new THREE.OrthographicCamera(-d, d, d, -d, 1, 100);
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);
    
    canvases.forEach(canvas => {
      const brush = canvas.closest(".brush-btn").dataset.brush;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height);
      
      let mesh;
      if (brush === "eraser") {
        const bodyGeo = new THREE.BoxGeometry(0.5, 0.22, 0.38);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff6b8b, roughness: 0.2, flatShading: true });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        
        const sleeveGeo = new THREE.BoxGeometry(0.25, 0.24, 0.40);
        const sleeveMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, flatShading: true });
        const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
        sleeve.position.x = -0.12;
        
        mesh = new THREE.Group();
        mesh.add(body);
        mesh.add(sleeve);
      } else if (brush.startsWith("word-")) {
        const val = brush.substring(5);
        mesh = this._buildEntityMesh({ type: "word", value: val });
      } else {
        mesh = this._buildEntityMesh({ type: "object", name: brush });
      }
      
      if (!mesh) return;
      
      mesh.position.set(0, 0, 0);
      
      // Make specific adjustments so they fit perfectly in the grid buttons
      if (brush === "wall") {
        mesh.scale.set(0.85, 0.85, 0.85);
      } else if (brush === "key") {
        mesh.rotation.x = Math.PI / 4;
        mesh.rotation.y = Math.PI / 4;
      } else if (brush.startsWith("word-")) {
        mesh.rotation.x = -Math.PI / 4;
        mesh.rotation.y = Math.PI / 4;
        mesh.scale.set(0.9, 0.9, 0.9);
      }
      
      scene.add(mesh);
      offscreenRenderer.render(scene, camera);
      ctx.drawImage(offscreenRenderer.domElement, 0, 0, width, height);
      
      scene.remove(mesh);
      this._disposeMesh(mesh);
    });
    
    offscreenRenderer.dispose();
  }
  
  // --- UI Settings compatibility stubs ---
  setStyle(style) {
    this.currentStyle = style;
  }
  
  setColorScheme(scheme) {
    this.currentColorScheme = scheme;
  }
  
  isMaterialStyle(style) {
    return false;
  }
}

// Global instance mapping
const Renderer = new ThreeRenderer();
window.Renderer = Renderer;
