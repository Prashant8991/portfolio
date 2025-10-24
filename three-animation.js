import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

class Portfolio3DAnimation {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.glassPanels = [];
        this.vortex = null;
        this.animationId = null;
        this.mouse = new THREE.Vector2();
        this.time = 0;
        
        this.init();
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createParticleSystem();
        this.createGlassPanels();
        this.createVortex();
        this.createFloatingElements();
        this.setupEventListeners();
        this.animate();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
        
        // Add starfield background
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 2000;
        const positions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 400;
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starsMaterial = new THREE.PointsMaterial({
            color: 0x4a90e2,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 30);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Add bloom effect
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        const canvas = this.renderer.domElement;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        
        document.body.appendChild(canvas);
    }

    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.3);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0x4a90e2, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Accent lights
        const light1 = new THREE.PointLight(0x00ff88, 0.8, 50);
        light1.position.set(-20, 10, 10);
        this.scene.add(light1);

        const light2 = new THREE.PointLight(0xff0088, 0.6, 50);
        light2.position.set(20, -10, 10);
        this.scene.add(light2);

        // Rim light
        const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.5);
        rimLight.position.set(-10, 0, -10);
        this.scene.add(rimLight);
    }

    createParticleSystem() {
        const particleCount = 3000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Position
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;

            // Color (green to blue gradient)
            const hue = Math.random() * 0.3 + 0.3; // Green to cyan range
            const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Size
            sizes[i] = Math.random() * 2 + 0.5;

            // Velocity
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // Add wave motion
                    pos.y += sin(time * 0.5 + position.x * 0.01) * 2.0;
                    pos.x += cos(time * 0.3 + position.z * 0.01) * 1.5;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createGlassPanels() {
        const panelCount = 8;
        
        for (let i = 0; i < panelCount; i++) {
            const geometry = new THREE.PlaneGeometry(8, 12, 32, 32);
            
            // Create glassmorphism material
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(0x4a90e2),
                transparent: true,
                opacity: 0.1,
                roughness: 0.1,
                metalness: 0.1,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                transmission: 0.9,
                thickness: 0.5,
                ior: 1.5,
                reflectivity: 0.2,
                side: THREE.DoubleSide
            });

            const panel = new THREE.Mesh(geometry, material);
            
            // Position panels in a circle
            const angle = (i / panelCount) * Math.PI * 2;
            panel.position.x = Math.cos(angle) * 25;
            panel.position.z = Math.sin(angle) * 25;
            panel.position.y = (Math.random() - 0.5) * 10;
            
            panel.rotation.y = angle + Math.PI / 2;
            panel.rotation.x = (Math.random() - 0.5) * 0.5;
            
            this.glassPanels.push(panel);
            this.scene.add(panel);
        }
    }

    createVortex() {
        const vortexGeometry = new THREE.BufferGeometry();
        const vortexCount = 1000;
        const positions = new Float32Array(vortexCount * 3);
        const colors = new Float32Array(vortexCount * 3);

        for (let i = 0; i < vortexCount; i++) {
            const i3 = i * 3;
            const radius = (i / vortexCount) * 15;
            const angle = (i / vortexCount) * Math.PI * 8;
            const height = (i / vortexCount) * 20 - 10;

            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = height;
            positions[i3 + 2] = Math.sin(angle) * radius;

            // Green energy color
            const intensity = 1 - (i / vortexCount);
            colors[i3] = 0.2 * intensity;
            colors[i3 + 1] = 1.0 * intensity;
            colors[i3 + 2] = 0.4 * intensity;
        }

        vortexGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        vortexGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const vortexMaterial = new THREE.PointsMaterial({
            size: 0.8,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });

        this.vortex = new THREE.Points(vortexGeometry, vortexMaterial);
        this.scene.add(this.vortex);
    }

    createFloatingElements() {
        // Create floating geometric shapes
        const shapes = [
            new THREE.IcosahedronGeometry(2, 0),
            new THREE.OctahedronGeometry(1.5),
            new THREE.TetrahedronGeometry(1.8),
        ];

        for (let i = 0; i < 15; i++) {
            const geometry = shapes[Math.floor(Math.random() * shapes.length)];
            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6),
                transparent: true,
                opacity: 0.3,
                roughness: 0.2,
                metalness: 0.8,
                clearcoat: 1.0,
                transmission: 0.5,
                emissive: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.5, 0.1)
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 60
            );
            
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: Math.random() * 0.01 + 0.005
            };

            this.scene.add(mesh);
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        
        // Scroll-based camera movement
        window.addEventListener('scroll', () => this.onScroll());
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onScroll() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        
        // Cinematic camera movement based on scroll
        this.camera.position.y = Math.sin(scrollPercent * Math.PI * 2) * 10;
        this.camera.position.x = Math.cos(scrollPercent * Math.PI * 4) * 15;
        this.camera.lookAt(0, 0, 0);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.time += 0.016;

        // Update particle system
        if (this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = this.time;
        }

        // Rotate particles
        this.particles.rotation.y += 0.002;
        this.particles.rotation.x += 0.001;

        // Animate glass panels
        this.glassPanels.forEach((panel, index) => {
            panel.rotation.y += 0.005;
            panel.rotation.x += 0.002;
            panel.position.y += Math.sin(this.time + index) * 0.02;
            
            // Glassmorphism effect variation
            panel.material.opacity = 0.1 + Math.sin(this.time + index) * 0.05;
        });

        // Animate vortex
        if (this.vortex) {
            this.vortex.rotation.y += 0.01;
            this.vortex.position.y = Math.sin(this.time * 0.5) * 2;
        }

        // Animate floating elements
        this.scene.traverse((child) => {
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.x += child.userData.rotationSpeed.x;
                child.rotation.y += child.userData.rotationSpeed.y;
                child.rotation.z += child.userData.rotationSpeed.z;
                child.position.y += Math.sin(this.time * child.userData.floatSpeed) * 0.01;
            }
        });

        // Camera movement based on mouse
        this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.02;
        this.camera.position.y += (-this.mouse.y * 5 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        // Cinematic auto-rotation
        const radius = 35;
        this.camera.position.x = Math.cos(this.time * 0.1) * radius;
        this.camera.position.z = Math.sin(this.time * 0.1) * radius;
        this.camera.position.y = Math.sin(this.time * 0.05) * 10;
        this.camera.lookAt(0, 0, 0);

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    }
}

// Initialize the 3D animation
let portfolio3D = null;

document.addEventListener('DOMContentLoaded', () => {
    portfolio3D = new Portfolio3DAnimation();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (portfolio3D) {
        portfolio3D.destroy();
    }
});

export default Portfolio3DAnimation;