import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

/* ============================================================
   DEEP SPACE BACKGROUND — Planets | Rings | Moons | Starfield
   ============================================================ */
class DeepSpaceAnimation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2(0, 0);
        this.time = 0;

        // Scene objects
        this.starLayers = [];
        this.mainPlanet = null;
        this.ringMesh = null;
        this.moons = [];
        this.nebula = [];
        this.asteroids = [];
        this.shootingStars = [];

        this.animationId = null;
        this.init();
    }

    /* ── BOOT ─────────────────────────────────────────── */
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();

        this.buildStarfield();
        this.buildNebula();
        this.buildMainPlanet();
        this.buildPlanetRings();
        this.buildMoons();
        this.buildAsteroidBelt();
        this.buildShootingStars();

        this.setupEvents();
        this.animate();
    }

    /* ── SCENE ────────────────────────────────────────── */
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020510);
        this.scene.fog = new THREE.FogExp2(0x020510, 0.0008);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 8, 70);
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x020510, 1);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;

        const c = this.renderer.domElement;
        c.style.cssText = 'position:fixed;top:0;left:0;z-index:-1;pointer-events:none;';
        document.body.appendChild(c);
    }

    /* ── STARFIELD ────────────────────────────────────── */
    buildStarfield() {
        const layers = [
            { count: 7000, spread: 600, size: 0.35, colors: [0xffffff, 0xaaccff, 0xffeedd] },
            { count: 3000, spread: 400, size: 0.65, colors: [0xffffff, 0xc8d8ff, 0xffd8aa] },
            { count: 1000, spread: 250, size: 1.10, colors: [0xffffff, 0xa0c8ff, 0xfff0c0] },
        ];
        layers.forEach(cfg => this._addStarLayer(cfg));
    }

    _addStarLayer({ count, spread, size, colors }) {
        const positions = new Float32Array(count * 3);
        const colorsArr = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

            const c = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
            const b = 0.45 + Math.random() * 0.55;
            colorsArr[i * 3] = c.r * b;
            colorsArr[i * 3 + 1] = c.g * b;
            colorsArr[i * 3 + 2] = c.b * b;

            sizes[i] = size * (0.5 + Math.random() * 1.5);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colorsArr, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                void main() {
                    vColor = color;
                    float twinkle = 0.7 + 0.3 * sin(time * 1.8 + position.x * 0.4 + position.y * 0.3);
                    vec4 mv = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * twinkle * (280.0 / -mv.z);
                    gl_Position  = projectionMatrix * mv;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    vec2 uv   = gl_PointCoord - 0.5;
                    float d   = length(uv);
                    if (d > 0.5) discard;
                    float a   = 1.0 - smoothstep(0.15, 0.5, d);
                    float glo = exp(-d * 5.0) * 0.6;
                    gl_FragColor = vec4(vColor + glo, a);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const pts = new THREE.Points(geo, mat);
        this.scene.add(pts);
        this.starLayers.push(pts);
    }

    /* ── NEBULA ───────────────────────────────────────── */
    buildNebula() {
        const configs = [
            { color: 0x0a0a60, pos: [-80, 30, -200], r: 130, op: 0.09 },
            { color: 0x3a0a55, pos: [90, -20, -180], r: 110, op: 0.08 },
            { color: 0x001a55, pos: [10, 50, -250], r: 160, op: 0.07 },
            { color: 0x200a40, pos: [-50, -40, -160], r: 90, op: 0.10 },
        ];
        configs.forEach(cfg => {
            const n = 600;
            const p = new Float32Array(n * 3), c = new Float32Array(n * 3), s = new Float32Array(n);
            const base = new THREE.Color(cfg.color);
            for (let i = 0; i < n; i++) {
                const radius = Math.random() * cfg.r;
                const th = Math.random() * Math.PI * 2;
                const ph = Math.acos(2 * Math.random() - 1);
                p[i * 3] = cfg.pos[0] + radius * Math.sin(ph) * Math.cos(th);
                p[i * 3 + 1] = cfg.pos[1] + radius * Math.sin(ph) * Math.sin(th) * 0.4;
                p[i * 3 + 2] = cfg.pos[2] + radius * Math.cos(ph) * 0.6;
                const v = 0.6 + Math.random() * 0.4;
                c[i * 3] = base.r * v;
                c[i * 3 + 1] = base.g * v;
                c[i * 3 + 2] = base.b * v;
                s[i] = 10 + Math.random() * 24;
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
            geo.setAttribute('size', new THREE.BufferAttribute(s, 1));
            const mat = new THREE.ShaderMaterial({
                uniforms: { opacity: { value: cfg.op } },
                vertexShader: `
                    attribute float size; attribute vec3 color; varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mv = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (500.0 / -mv.z);
                        gl_Position  = projectionMatrix * mv;
                    }`,
                fragmentShader: `
                    varying vec3 vColor; uniform float opacity;
                    void main() {
                        float d = length(gl_PointCoord - 0.5);
                        float a = exp(-d * d * 8.0) * opacity;
                        gl_FragColor = vec4(vColor, a);
                    }`,
                transparent: true, vertexColors: true,
                blending: THREE.AdditiveBlending, depthWrite: false,
            });
            const neb = new THREE.Points(geo, mat);
            this.scene.add(neb);
            this.nebula.push(neb);
        });
    }

    /* ── MAIN PLANET ──────────────────────────────────── */
    buildMainPlanet() {
        // Sphere
        const geo = new THREE.SphereGeometry(14, 64, 64);

        // Procedural surface using vertex colors baked into a DataTexture
        const size = 512;
        const data = new Uint8Array(size * size * 4);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const idx = (y * size + x) * 4;
                // Simplified procedural: bands + noise
                const nx = x / size;
                const ny = y / size;
                // Band pattern
                const band = Math.sin(ny * Math.PI * 8 + nx * 3) * 0.5 + 0.5;
                // Swirl
                const swirl = Math.sin((nx + ny) * Math.PI * 6 + Math.cos(nx * 4) * 2) * 0.5 + 0.5;
                // Mix deep navy/teal/gold tones
                const r = Math.floor((0.04 + band * 0.12 + swirl * 0.08) * 255);
                const g = Math.floor((0.06 + band * 0.15 + swirl * 0.10) * 255);
                const b = Math.floor((0.20 + band * 0.30 + swirl * 0.20) * 255);
                // Gold storm spot
                const cx = nx - 0.6, cy = ny - 0.45;
                const storm = Math.exp(-(cx * cx + cy * cy) * 80);
                data[idx] = Math.min(255, r + Math.floor(storm * 180));
                data[idx + 1] = Math.min(255, g + Math.floor(storm * 140));
                data[idx + 2] = Math.min(255, b + Math.floor(storm * 20));
                data[idx + 3] = 255;
            }
        }
        const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
        tex.needsUpdate = true;

        // Atmosphere glow — additive inner sphere
        const atmGeo = new THREE.SphereGeometry(14.6, 64, 64);
        const atmMat = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(0x1a4aff) },
                viewVector: { value: this.camera.position },
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float intensity;
                void main() {
                    vec3 vNormal   = normalize(normalMatrix * normal);
                    vec3 vNormalMV = normalize(normalMatrix * (viewVector - position));
                    intensity      = pow(0.75 - dot(vNormal, vNormalMV), 3.0);
                    gl_Position    = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }`,
            fragmentShader: `
                uniform vec3 glowColor;
                varying float intensity;
                void main() {
                    gl_FragColor = vec4(glowColor, intensity * 0.55);
                }`,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
        });

        const mat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.6,
            metalness: 0.2,
            emissiveMap: tex,
            emissive: new THREE.Color(0x0a1830),
            emissiveIntensity: 0.25,
        });

        this.mainPlanet = new THREE.Mesh(geo, mat);
        this.mainPlanet.position.set(18, -4, -10);
        this.mainPlanet.rotation.z = 0.25;
        this.scene.add(this.mainPlanet);

        // Atmosphere shell
        const atm = new THREE.Mesh(atmGeo, atmMat);
        atm.position.copy(this.mainPlanet.position);
        this.scene.add(atm);
        this.atmosphere = atm;

        // Lights
        const sunLight = new THREE.DirectionalLight(0xffd8aa, 1.8);
        sunLight.position.set(-80, 40, 60);
        this.scene.add(sunLight);

        const fill = new THREE.DirectionalLight(0x1a3066, 0.5);
        fill.position.set(60, -20, -60);
        this.scene.add(fill);

        const ambient = new THREE.AmbientLight(0x080820, 0.6);
        this.scene.add(ambient);
    }

    /* ── PLANET RINGS ─────────────────────────────────── */
    buildPlanetRings() {
        // Inner ring
        this._addRing(17.5, 24, 0xc9a84c, 0.55, 0);
        // Mid ring
        this._addRing(25, 31, 0x8899bb, 0.35, 0.01);
        // Outer faint ring
        this._addRing(32.5, 40, 0x445566, 0.18, 0.02);
    }

    _addRing(inner, outer, color, opacity, tilt) {
        const geo = new THREE.RingGeometry(inner, outer, 128);
        // Radial gradient via vertex colors
        const verts = geo.attributes.position;
        const cols = new Float32Array(verts.count * 3);
        const c1 = new THREE.Color(color);
        const c2 = new THREE.Color(0x0a1228);
        for (let i = 0; i < verts.count; i++) {
            const x = verts.getX(i), y = verts.getY(i);
            const r = Math.sqrt(x * x + y * y);
            const t = (r - inner) / (outer - inner);
            const blend = Math.sin(t * Math.PI);
            cols[i * 3] = c1.r * blend + c2.r * (1 - blend);
            cols[i * 3 + 1] = c1.g * blend + c2.g * (1 - blend);
            cols[i * 3 + 2] = c1.b * blend + c2.b * (1 - blend);
        }
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));

        const mat = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const ring = new THREE.Mesh(geo, mat);
        ring.rotation.x = Math.PI / 2 + tilt;
        ring.position.copy(this.mainPlanet.position);
        ring.rotation.z = 0.25 + tilt;
        this.scene.add(ring);
        this.moons.push({ obj: ring, orbitSpeed: 0, selfSpeed: 0.0008, isSaturn: true });
    }

    /* ── MOONS ────────────────────────────────────────── */
    buildMoons() {
        const moonDefs = [
            { r: 2.8, dist: 24, speed: 0.35, color: 0x8899aa, tiltX: 0.2, tiltY: 0.1, yOff: 3 },
            { r: 1.6, dist: 32, speed: 0.22, color: 0xaa9977, tiltX: -0.3, tiltY: 0.2, yOff: -2 },
            { r: 1.2, dist: 42, speed: 0.15, color: 0x667788, tiltX: 0.45, tiltY: -0.15, yOff: 5 },
            { r: 0.7, dist: 50, speed: 0.42, color: 0xbbaa88, tiltX: 0.1, tiltY: 0.3, yOff: -3.5 },
        ];

        moonDefs.forEach((def, i) => {
            const geo = new THREE.SphereGeometry(def.r, 24, 24);
            const mat = new THREE.MeshStandardMaterial({
                color: def.color,
                roughness: 0.9,
                metalness: 0.05,
            });
            const moon = new THREE.Mesh(geo, mat);

            // Pivot centered on the main planet
            const pivot = new THREE.Object3D();
            pivot.position.copy(this.mainPlanet.position);
            pivot.rotation.x = def.tiltX;
            pivot.rotation.y = def.tiltY;

            moon.position.set(def.dist, def.yOff, 0);
            pivot.add(moon);
            this.scene.add(pivot);

            this.moons.push({ obj: pivot, orbitSpeed: def.speed * 0.01, selfSpeed: 0, isSaturn: false });
        });
    }

    /* ── ASTEROID BELT ────────────────────────────────── */
    buildAsteroidBelt() {
        const count = 250;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const cx = this.mainPlanet.position.x;
        const cy = this.mainPlanet.position.y;
        const cz = this.mainPlanet.position.z;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 46 + Math.random() * 12;
            positions[i * 3] = cx + Math.cos(angle) * radius;
            positions[i * 3 + 1] = cy + (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = cz + Math.sin(angle) * radius * 0.4; // flatten a bit

            const col = Math.random() * 0.25 + 0.35;
            colors[i * 3] = col * 0.9;
            colors[i * 3 + 1] = col * 0.85;
            colors[i * 3 + 2] = col * 0.8;

            sizes[i] = 0.8 + Math.random() * 2.5;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size; attribute vec3 color; varying vec3 vColor; uniform float time;
                void main() {
                    vColor = color;
                    float tw = 0.8 + 0.2 * sin(time + position.x);
                    vec4 mv  = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * tw * (200.0 / -mv.z);
                    gl_Position  = projectionMatrix * mv;
                }`,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    vec2 uv  = gl_PointCoord - 0.5;
                    float d  = length(uv);
                    if (d > 0.5) discard;
                    float a  = 1.0 - smoothstep(0.2, 0.5, d);
                    gl_FragColor = vec4(vColor, a * 0.9);
                }`,
            transparent: true, vertexColors: true,
            blending: THREE.AdditiveBlending, depthWrite: false,
        });

        const belt = new THREE.Points(geo, mat);
        this.asteroids.push(belt);
        this.scene.add(belt);
    }

    /* ── SHOOTING STARS ───────────────────────────────── */
    buildShootingStars() {
        for (let i = 0; i < 6; i++) this._spawnShootingStar(i * 4);
    }

    _spawnShootingStar(delay = 0) {
        const count = 28;
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const sx = (Math.random() - 0.5) * 300;
        const sy = 60 + Math.random() * 60;
        const sz = -40 + Math.random() * 30;

        for (let i = 0; i < count; i++) {
            const t = i / count;
            pos[i * 3] = sx - t * (50 + Math.random() * 40);
            pos[i * 3 + 1] = sy - t * (18 + Math.random() * 12);
            pos[i * 3 + 2] = sz;
            col[i * 3] = 1.0;
            col[i * 3 + 1] = 0.92 - t * 0.35;
            col[i * 3 + 2] = 0.8 - t * 0.4;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
        const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });

        const line = new THREE.Line(geo, mat);
        line.userData = {
            startTime: this.time + delay + Math.random() * 8,
            duration: 1.2 + Math.random() * 0.8,
            speed: 0.08 + Math.random() * 0.05,
            offset: new THREE.Vector3(-(40 + Math.random() * 60), -(10 + Math.random() * 12), 0),
        };
        this.scene.add(line);
        this.shootingStars.push(line);
    }

    /* ── EVENTS ───────────────────────────────────────── */
    setupEvents() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('mousemove', e => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
        // Touch support for mobile
        window.addEventListener('touchmove', e => {
            const t = e.touches[0];
            this.mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });
    }

    /* ── ANIMATE ──────────────────────────────────────── */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        const dt = Math.min(this.clock.getDelta(), 0.05);
        this.time += dt;

        // STAR TWINKLE + GENTLE ROTATE
        this.starLayers.forEach((layer, i) => {
            if (layer.material.uniforms) layer.material.uniforms.time.value = this.time;
            layer.rotation.y += 0.00004 * (i + 1);
            layer.rotation.x += 0.00002 * (i + 1);
        });

        // NEBULA DRIFT
        this.nebula.forEach((n, i) => { n.rotation.z += 0.00008 * (i % 2 === 0 ? 1 : -1); });

        // MAIN PLANET SLOW SELF-ROTATE (axial)
        if (this.mainPlanet) {
            this.mainPlanet.rotation.y += 0.0015;
        }
        if (this.atmosphere) {
            this.atmosphere.rotation.y += 0.0008;
        }

        // MOONS / RINGS ORBIT
        this.moons.forEach(({ obj, orbitSpeed, isSaturn }) => {
            if (!isSaturn) {
                obj.rotation.y += orbitSpeed;
            }
        });

        // ASTEROID BELT ROTATION
        this.asteroids.forEach(belt => {
            belt.rotation.y += 0.0006;
            if (belt.material.uniforms) belt.material.uniforms.time.value = this.time;
        });

        // SHOOTING STARS
        this.shootingStars.forEach(star => {
            const { startTime, duration, speed, offset } = star.userData;
            const elapsed = this.time - startTime;
            if (elapsed > 0 && elapsed < duration) {
                const prog = elapsed / duration;
                star.material.opacity = Math.sin(prog * Math.PI) * 0.95;
                star.position.x += offset.x * speed * 0.1;
                star.position.y += offset.y * speed * 0.1;
            } else if (elapsed >= duration) {
                star.position.set(0, 0, 0);
                star.material.opacity = 0;
                star.userData.startTime = this.time + 3 + Math.random() * 10;
                star.userData.offset = new THREE.Vector3(-(40 + Math.random() * 60), -(10 + Math.random() * 12), 0);
            }
        });

        // GENTLE CAMERA PARALLAX (mouse)
        const tx = this.mouse.x * 4;
        const ty = this.mouse.y * 2.5;
        this.camera.position.x += (tx - this.camera.position.x) * 0.015;
        this.camera.position.y += (ty + 8 - this.camera.position.y) * 0.015;
        this.camera.lookAt(0, 0, 0);

        // Subtle scroll-based tilt
        const scrollRatio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
        this.camera.position.z = 70 + Math.sin(scrollRatio * Math.PI) * 15;

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer?.domElement?.parentNode)
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        this.renderer?.dispose();
    }
}

let anim = null;
document.addEventListener('DOMContentLoaded', () => { anim = new DeepSpaceAnimation(); });
window.addEventListener('beforeunload', () => anim?.destroy());
export default DeepSpaceAnimation;