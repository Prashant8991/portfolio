import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

class StarfieldAnimation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.stars = null;
        this.nebula = [];
        this.shootingStars = [];
        this.mouse = new THREE.Vector2();
        this.time = 0;
        this.animationId = null;
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createStarfield();
        this.createNebulaLayers();
        this.createShootingStars();
        this.createGlowOrbs();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020510);
        this.scene.fog = new THREE.FogExp2(0x020510, 0.0015);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 50);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x020510, 1);

        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
    }

    createStarfield() {
        // Layer 1: Distant small stars
        this._addStarLayer(8000, 300, 0.3, [0xffffff, 0xaaccff, 0xffeedd]);
        // Layer 2: Mid stars
        this._addStarLayer(3000, 200, 0.6, [0xffffff, 0xc8d8ff, 0xffd8aa]);
        // Layer 3: Close bright stars
        this._addStarLayer(800, 100, 1.2, [0xffffff, 0xa0c8ff, 0xfff0c0]);
    }

    _addStarLayer(count, spread, baseSize, colors) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colorsArray = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 2;

            const c = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
            const brightness = 0.5 + Math.random() * 0.5;
            colorsArray[i * 3] = c.r * brightness;
            colorsArray[i * 3 + 1] = c.g * brightness;
            colorsArray[i * 3 + 2] = c.b * brightness;

            sizes[i] = baseSize * (0.5 + Math.random() * 1.5);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vSize;
                uniform float time;
                void main() {
                    vColor = color;
                    vSize = size;
                    vec3 pos = position;
                    float twinkle = sin(time * 2.0 + position.x * 0.5 + position.y * 0.3) * 0.3 + 0.7;
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    float alpha = 1.0 - smoothstep(0.1, 0.5, dist);
                    float glow = exp(-dist * 6.0);
                    gl_FragColor = vec4(vColor + glow * 0.5, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        points.userData = { material };
        this.scene.add(points);
        if (!this.starLayers) this.starLayers = [];
        this.starLayers.push(points);
    }

    createNebulaLayers() {
        const nebulaConfigs = [
            { color: 0x1a0a4a, pos: [-40, 20, -100], size: 120, opacity: 0.12 },
            { color: 0x0a1a4a, pos: [50, -15, -80], size: 100, opacity: 0.10 },
            { color: 0x2a0a3a, pos: [10, 30, -120], size: 150, opacity: 0.08 },
            { color: 0x0a2a4a, pos: [-60, -30, -90], size: 90, opacity: 0.09 },
        ];

        nebulaConfigs.forEach(cfg => {
            const count = 500;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);
            const baseColor = new THREE.Color(cfg.color);

            for (let i = 0; i < count; i++) {
                const r = Math.random() * cfg.size;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                positions[i * 3] = cfg.pos[0] + r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = cfg.pos[1] + r * Math.sin(phi) * Math.sin(theta) * 0.3;
                positions[i * 3 + 2] = cfg.pos[2] + r * Math.cos(phi) * 0.5;

                const variation = 0.7 + Math.random() * 0.3;
                colors[i * 3] = baseColor.r * variation;
                colors[i * 3 + 1] = baseColor.g * variation;
                colors[i * 3 + 2] = baseColor.b * variation;
                sizes[i] = 8 + Math.random() * 20;
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const mat = new THREE.ShaderMaterial({
                uniforms: { opacity: { value: cfg.opacity } },
                vertexShader: `
                    attribute float size;
                    attribute vec3 color;
                    varying vec3 vColor;
                    void main() {
                        vColor = color;
                        vec4 mv = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (500.0 / -mv.z);
                        gl_Position = projectionMatrix * mv;
                    }
                `,
                fragmentShader: `
                    varying vec3 vColor;
                    uniform float opacity;
                    void main() {
                        float d = length(gl_PointCoord - 0.5);
                        float a = exp(-d * d * 8.0) * opacity;
                        gl_FragColor = vec4(vColor, a);
                    }
                `,
                transparent: true,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const nebula = new THREE.Points(geo, mat);
            this.scene.add(nebula);
            this.nebula.push(nebula);
        });
    }

    createShootingStars() {
        for (let i = 0; i < 5; i++) {
            this._spawnShootingStar();
        }
    }

    _spawnShootingStar() {
        const geometry = new THREE.BufferGeometry();
        const count = 30;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const startX = (Math.random() - 0.5) * 200;
        const startY = 30 + Math.random() * 50;
        const startZ = -30 + Math.random() * 20;

        for (let i = 0; i < count; i++) {
            const t = i / count;
            positions[i * 3] = startX - t * (60 + Math.random() * 40);
            positions[i * 3 + 1] = startY - t * (20 + Math.random() * 15);
            positions[i * 3 + 2] = startZ;
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.9 - t * 0.4;
            colors[i * 3 + 2] = 0.7 - t * 0.3;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });

        const line = new THREE.Line(geometry, material);
        line.userData = {
            startTime: this.time + Math.random() * 10,
            duration: 1.5 + Math.random() * 1,
            speed: 0.08 + Math.random() * 0.06,
            offset: new THREE.Vector3(
                -(Math.random() * 60 + 40),
                -(Math.random() * 15 + 10),
                0
            )
        };

        this.scene.add(line);
        this.shootingStars.push(line);
    }

    createGlowOrbs() {
        // Subtle colored glow orbs in the background
        const orbConfigs = [
            { color: 0x1e3a8a, pos: [-25, 10, -60], size: 8 },
            { color: 0x4c1d95, pos: [30, -15, -50], size: 6 },
            { color: 0x0f172a, pos: [0, 20, -80], size: 12 },
        ];

        orbConfigs.forEach(cfg => {
            const geo = new THREE.SphereGeometry(cfg.size, 16, 16);
            const mat = new THREE.MeshBasicMaterial({
                color: cfg.color,
                transparent: true,
                opacity: 0.15
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(...cfg.pos);
            this.scene.add(mesh);
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', e => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.time += 0.01;

        // Update star twinkle
        if (this.starLayers) {
            this.starLayers.forEach((layer, idx) => {
                if (layer.material.uniforms) {
                    layer.material.uniforms.time.value = this.time;
                }
                // Slow gentle rotation
                layer.rotation.y += 0.00005 * (idx + 1);
                layer.rotation.x += 0.00003 * (idx + 1);
            });
        }

        // Nebula gentle drift
        this.nebula.forEach((n, i) => {
            n.rotation.z += 0.0001 * (i % 2 === 0 ? 1 : -1);
        });

        // Shooting stars
        this.shootingStars.forEach(star => {
            const { startTime, duration, speed, offset } = star.userData;
            const elapsed = this.time - startTime;
            if (elapsed > 0 && elapsed < duration) {
                const progress = elapsed / duration;
                star.material.opacity = Math.sin(progress * Math.PI) * 0.9;
                star.position.x += offset.x * speed * 0.1;
                star.position.y += offset.y * speed * 0.1;
            } else if (elapsed > duration) {
                // Reset shooting star
                star.position.set(0, 0, 0);
                star.material.opacity = 0;
                star.userData.startTime = this.time + 3 + Math.random() * 8;
                star.userData.offset = new THREE.Vector3(
                    -(Math.random() * 60 + 40),
                    -(Math.random() * 15 + 10),
                    0
                );
            }
        });

        // Subtle parallax with mouse
        this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mouse.y * 2 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer?.domElement?.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        this.renderer?.dispose();
    }
}

let portfolioAnim = null;
document.addEventListener('DOMContentLoaded', () => {
    portfolioAnim = new StarfieldAnimation();
});
window.addEventListener('beforeunload', () => portfolioAnim?.destroy());

export default StarfieldAnimation;