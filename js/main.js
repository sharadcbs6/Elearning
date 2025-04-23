import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Initialize Three.js Scene
class ThreeScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#hero-canvas'),
            antialias: true,
            alpha: true
        });
        
        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0); // Make background transparent
        this.camera.position.z = 5;

        // Add ambient light with reduced intensity
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);

        // Add directional light with reduced intensity
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 10, 5);
        this.scene.add(directionalLight);

        // Create animated background particles
        this.createParticles();
        
        // Create floating objects
        this.createFloatingObjects();

        // Animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        // Handle mouse movement
        window.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
    }

    createParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;
        const posArray = new Float32Array(particlesCount * 3);
        const scaleArray = new Float32Array(particlesCount);

        for(let i = 0; i < particlesCount * 3; i += 3) {
            posArray[i] = (Math.random() - 0.5) * 10;
            posArray[i + 1] = (Math.random() - 0.5) * 10;
            posArray[i + 2] = (Math.random() - 0.5) * 10;
            scaleArray[i / 3] = Math.random();
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            color: 0x2a2a72,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    createFloatingObjects() {
        // Create abstract shapes
        this.createAbstractShapes();
        
        // Create glowing orbs
        this.createGlowingOrbs();
        
        // Create DNA helix
        this.createDNAHelix();

        // Create neural network
        this.createNeuralNetwork();

        // Create binary data stream
        this.createBinaryStream();

        // Create circuit board pattern
        this.createCircuitBoard();

        // Create cyber lock
        this.createCyberLock();

        // Create floating characters
        this.createFloatingCharacters();

        // Create atom structure
        this.createAtomStructure();

        // Create geometric patterns
        this.createGeometricPatterns();

        // Create holographic displays
        this.createHolographicDisplays();

        // Create tech stack logos
        this.createTechStackLogos();

        // Create cloud services
        this.createCloudServices();

        // Create database symbols
        this.createDatabaseSymbols();

        // Create framework icons
        this.createFrameworkIcons();

        // Create mobile platforms
        this.createMobilePlatforms();

        // Create IDE symbols
        this.createIDESymbols();
    }

    createAbstractShapes() {
        const geometries = [
            new THREE.IcosahedronGeometry(0.3, 0),
            new THREE.OctahedronGeometry(0.3, 0),
            new THREE.TetrahedronGeometry(0.3, 0)
        ];

        const material = new THREE.MeshPhongMaterial({
            color: 0x009ffd,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });

        this.abstractShapes = [];
        for(let i = 0; i < 5; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 2
            );
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            this.abstractShapes.push(mesh);
            this.scene.add(mesh);
        }
    }

    createGlowingOrbs() {
        const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });

        this.glowingOrbs = [];
        for(let i = 0; i < 8; i++) {
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 2
            );
            sphere.userData = {
                originalY: sphere.position.y,
                speed: 0.001 + Math.random() * 0.002,
                amplitude: 0.1 + Math.random() * 0.3
            };
            this.glowingOrbs.push(sphere);
            this.scene.add(sphere);
        }
    }

    createDNAHelix() {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-2, -2, 0),
            new THREE.Vector3(-1, 0, 1),
            new THREE.Vector3(0, 2, 0),
            new THREE.Vector3(1, 0, -1),
            new THREE.Vector3(2, -2, 0)
        ]);

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ff88,
            transparent: true,
            opacity: 0.5
        });

        this.dnaHelix = new THREE.Line(geometry, material);
        this.scene.add(this.dnaHelix);

        // Add particles along the curve
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5
        });

        this.dnaParticles = [];
        for(let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const position = curve.getPoint(i / 20);
            particle.position.copy(position);
            this.dnaParticles.push({
                mesh: particle,
                t: i / 20
            });
            this.scene.add(particle);
        }
    }

    createNeuralNetwork() {
        const nodes = [];
        const connections = [];
        const layers = 3;
        const nodesPerLayer = 4;
        const nodeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const nodeMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x00ff88,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });

        // Create nodes
        for(let layer = 0; layer < layers; layer++) {
            for(let node = 0; node < nodesPerLayer; node++) {
                const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
                mesh.position.x = (layer - 1) * 2;
                mesh.position.y = (node - nodesPerLayer/2) * 0.5;
                mesh.position.z = -2;
                nodes.push(mesh);
                this.scene.add(mesh);
            }
        }

        // Create connections
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
        });

        for(let i = 0; i < layers - 1; i++) {
            for(let j = 0; j < nodesPerLayer; j++) {
                for(let k = 0; k < nodesPerLayer; k++) {
                    const points = [];
                    points.push(nodes[i * nodesPerLayer + j].position);
                    points.push(nodes[(i + 1) * nodesPerLayer + k].position);
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, lineMaterial);
                    connections.push(line);
                    this.scene.add(line);
                }
            }
        }

        this.neuralNetwork = { nodes, connections };
    }

    createBinaryStream() {
        const particleCount = 100;
        const particles = [];
        const geometry = new THREE.SphereGeometry(0.02, 8, 8);
        const material = new THREE.MeshPhongMaterial({
            color: 0x009ffd,
            emissive: 0x009ffd,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
        });

        for(let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            );
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                )
            };
            particles.push(particle);
            this.scene.add(particle);
        }

        this.binaryStream = particles;
    }

    createCircuitBoard() {
        const lines = [];
        const lineCount = 20;
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
        });

        for(let i = 0; i < lineCount; i++) {
            const points = [];
            let x = (Math.random() - 0.5) * 10;
            let y = (Math.random() - 0.5) * 10;
            let z = -3;

            // Create circuit-like paths
            for(let j = 0; j < 5; j++) {
                points.push(new THREE.Vector3(x, y, z));
                if(Math.random() > 0.5) {
                    x += (Math.random() - 0.5) * 2;
                } else {
                    y += (Math.random() - 0.5) * 2;
                }
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            lines.push(line);
            this.scene.add(line);
        }

        this.circuitBoard = lines;
    }

    createCyberLock() {
        const lockGeometry = new THREE.TorusGeometry(0.3, 0.1, 16, 32);
        const lockMaterial = new THREE.MeshPhongMaterial({
            color: 0x009ffd,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });

        this.cyberLock = new THREE.Mesh(lockGeometry, lockMaterial);
        this.cyberLock.position.set(2, 2, -1);
        this.scene.add(this.cyberLock);

        // Add lock details
        const detailGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.1);
        const detail = new THREE.Mesh(detailGeometry, lockMaterial);
        detail.position.y = -0.4;
        this.cyberLock.add(detail);
    }

    createFloatingCharacters() {
        const characters = [
            { text: '01', color: 0x00ff88 },
            { text: 'AI', color: 0x009ffd },
            { text: '{}', color: 0x2a2a72 },
            { text: '<>', color: 0x00ff88 },
            { text: '//', color: 0x009ffd },
            { text: 'ML', color: 0x2a2a72 }
        ];

        this.floatingTexts = [];

        characters.forEach((char, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const context = canvas.getContext('2d');
            context.fillStyle = '#ffffff';
            context.font = 'Bold 100px Consolas';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(char.text, 128, 128);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: char.color,
                transparent: true,
                opacity: 0.7
            });

            const sprite = new THREE.Sprite(material);
            sprite.scale.set(1, 1, 1);
            sprite.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 4
            );
            sprite.userData = {
                originalY: sprite.position.y,
                speed: 0.001 + Math.random() * 0.002,
                amplitude: 0.3 + Math.random() * 0.5
            };
            this.floatingTexts.push(sprite);
            this.scene.add(sprite);
        });
    }

    createAtomStructure() {
        const nucleus = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0x009ffd,
                emissive: 0x009ffd,
                emissiveIntensity: 0.5,
                transparent: true,
                opacity: 0.7
            })
        );
        nucleus.position.set(-2, 2, -2);

        const orbits = [];
        const electrons = [];
        const orbitCount = 3;

        for(let i = 0; i < orbitCount; i++) {
            const orbit = new THREE.RingGeometry(0.4 + i * 0.2, 0.41 + i * 0.2, 64);
            const orbitMesh = new THREE.Mesh(
                orbit,
                new THREE.MeshBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                })
            );
            orbitMesh.rotation.x = Math.PI / 2 + i * Math.PI / 4;
            orbits.push(orbitMesh);
            nucleus.add(orbitMesh);

            // Add electrons
            const electron = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 16, 16),
                new THREE.MeshPhongMaterial({
                    color: 0x00ff88,
                    emissive: 0x00ff88,
                    emissiveIntensity: 0.5
                })
            );
            electron.userData = {
                orbit: i,
                angle: Math.random() * Math.PI * 2,
                speed: 0.02 - i * 0.005
            };
            electrons.push(electron);
            this.scene.add(electron);
        }

        this.atomStructure = {
            nucleus,
            orbits,
            electrons
        };
        this.scene.add(nucleus);
    }

    createGeometricPatterns() {
        const patterns = [];
        const geometries = [
            new THREE.TetrahedronGeometry(0.2),
            new THREE.OctahedronGeometry(0.2),
            new THREE.DodecahedronGeometry(0.2)
        ];

        for(let i = 0; i < 15; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshPhongMaterial({
                color: 0x009ffd,
                transparent: true,
                opacity: 0.5,
                wireframe: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            );
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                }
            };
            patterns.push(mesh);
            this.scene.add(mesh);
        }

        this.geometricPatterns = patterns;
    }

    createHolographicDisplays() {
        const displays = [];
        const displayGeometry = new THREE.PlaneGeometry(1, 0.6);
        
        for(let i = 0; i < 3; i++) {
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    varying vec2 vUv;
                    void main() {
                        float line = abs(sin(vUv.y * 10.0 + time));
                        vec3 color = vec3(0.0, 1.0, 0.8) * line;
                        gl_FragColor = vec4(color, 0.3);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            });

            const display = new THREE.Mesh(displayGeometry, material);
            display.position.set(
                (i - 1) * 2,
                Math.sin(i * Math.PI / 3) * 2,
                -3
            );
            display.rotation.y = Math.PI / 6;
            displays.push(display);
            this.scene.add(display);
        }

        this.holographicDisplays = displays;
    }

    createTechStackLogos() {
        const techLogos = [
            { text: 'JS', color: 0xf7df1e },
            { text: 'PY', color: 0x3776ab },
            { text: 'TS', color: 0x007acc },
            { text: 'GO', color: 0x00add8 },
            { text: 'RS', color: 0xdea584 },
            { text: 'C++', color: 0x00599c },
            { text: 'PHP', color: 0x777bb4 },
            { text: 'SQL', color: 0x4479a1 },
            { text: 'C#', color: 0x239120 }
        ];

        this.techLogos = [];

        techLogos.forEach((logo, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const context = canvas.getContext('2d');
            context.fillStyle = '#ffffff';
            context.font = 'Bold 80px Monaco';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(logo.text, 128, 128);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: logo.color,
                transparent: true,
                opacity: 0.8
            });

            const sprite = new THREE.Sprite(material);
            sprite.scale.set(0.8, 0.8, 0.8);
            sprite.position.set(
                Math.cos(index * Math.PI * 2 / techLogos.length) * 5,
                Math.sin(index * Math.PI * 2 / techLogos.length) * 5,
                -3
            );
            sprite.userData = {
                rotationSpeed: 0.001 + Math.random() * 0.002,
                orbitRadius: 5,
                orbitAngle: index * Math.PI * 2 / techLogos.length
            };
            this.techLogos.push(sprite);
            this.scene.add(sprite);
        });
    }

    createCloudServices() {
        const cloudShapes = [];
        const cloudGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0x4285f4,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });

        for(let i = 0; i < 3; i++) {
            const cloud = new THREE.Group();
            
            // Main cloud body
            const mainSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.add(mainSphere);

            // Smaller spheres for cloud shape
            for(let j = 0; j < 3; j++) {
                const smallSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
                smallSphere.scale.setScalar(0.6);
                smallSphere.position.set(
                    Math.cos(j * Math.PI * 2/3) * 0.3,
                    Math.sin(j * Math.PI * 2/3) * 0.3,
                    0
                );
                cloud.add(smallSphere);
            }

            cloud.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                -4
            );
            cloud.userData = {
                floatSpeed: 0.001 + Math.random() * 0.002,
                rotationSpeed: 0.005 + Math.random() * 0.005
            };
            cloudShapes.push(cloud);
            this.scene.add(cloud);
        }

        this.cloudServices = cloudShapes;
    }

    createDatabaseSymbols() {
        const dbSymbols = [];
        const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32);
        const dbMaterial = new THREE.MeshPhongMaterial({
            color: 0xffa500,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });

        for(let i = 0; i < 4; i++) {
            const db = new THREE.Group();
            
            // Main cylinder
            const cylinder = new THREE.Mesh(cylinderGeometry, dbMaterial);
            db.add(cylinder);

            // Rings for database symbol
            const ringGeometry = new THREE.TorusGeometry(0.3, 0.05, 16, 32);
            for(let j = 0; j < 3; j++) {
                const ring = new THREE.Mesh(ringGeometry, dbMaterial);
                ring.position.y = -0.2 + j * 0.2;
                db.add(ring);
            }

            db.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                -3
            );
            db.rotation.x = Math.PI / 4;
            db.userData = {
                pulseSpeed: 0.002 + Math.random() * 0.002,
                rotationSpeed: 0.01
            };
            dbSymbols.push(db);
            this.scene.add(db);
        }

        this.databaseSymbols = dbSymbols;
    }

    createFrameworkIcons() {
        const frameworks = [
            { text: 'React', color: 0x61dafb },
            { text: 'Vue', color: 0x42b883 },
            { text: 'Angular', color: 0xdd0031 },
            { text: 'Django', color: 0x092e20 },
            { text: 'Flask', color: 0x000000 },
            { text: 'Spring', color: 0x6db33f },
            { text: 'Rails', color: 0xcc0000 }
        ];

        this.frameworkIcons = [];

        frameworks.forEach((framework, index) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const context = canvas.getContext('2d');
            context.fillStyle = '#ffffff';
            context.font = 'Bold 60px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(framework.text, 256, 256);

            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({
                map: texture,
                color: framework.color,
                transparent: true,
                opacity: 0.7
            });

            const sprite = new THREE.Sprite(material);
            sprite.scale.set(1.2, 0.6, 1);
            
            // Position in a spiral pattern
            const angle = index * 0.5;
            const radius = 1 + index * 0.3;
            sprite.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -2 - index * 0.1
            );
            
            sprite.userData = {
                originalPosition: sprite.position.clone(),
                floatSpeed: 0.001 + Math.random() * 0.002,
                floatAmplitude: 0.2 + Math.random() * 0.3
            };
            
            this.frameworkIcons.push(sprite);
            this.scene.add(sprite);
        });
    }

    createMobilePlatforms() {
        const platforms = [
            { text: 'iOS', color: 0x000000 },
            { text: 'Android', color: 0x3ddc84 },
            { text: 'Flutter', color: 0x02569b },
            { text: 'React Native', color: 0x61dafb }
        ];

        this.mobilePlatforms = [];

        platforms.forEach((platform, index) => {
            const group = new THREE.Group();

            // Create phone shape
            const phoneGeometry = new THREE.BoxGeometry(0.4, 0.8, 0.05);
            const phoneMaterial = new THREE.MeshPhongMaterial({
                color: platform.color,
                transparent: true,
                opacity: 0.7
            });
            const phone = new THREE.Mesh(phoneGeometry, phoneMaterial);
            group.add(phone);

            // Add screen
            const screenGeometry = new THREE.PlaneGeometry(0.35, 0.7);
            const screenMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    varying vec2 vUv;
                    void main() {
                        float line = abs(sin(vUv.y * 20.0 + time));
                        vec3 color = vec3(0.5, 0.8, 1.0) * line;
                        gl_FragColor = vec4(color, 0.3);
                    }
                `,
                transparent: true,
                side: THREE.DoubleSide
            });
            const screen = new THREE.Mesh(screenGeometry, screenMaterial);
            screen.position.z = 0.03;
            group.add(screen);

            group.position.set(
                (index - platforms.length/2) * 2,
                3,
                -2
            );
            group.userData = {
                rotationSpeed: 0.01,
                floatSpeed: 0.002 + Math.random() * 0.002
            };

            this.mobilePlatforms.push(group);
            this.scene.add(group);
        });
    }

    createIDESymbols() {
        const ides = [
            { text: 'VS Code', color: 0x007acc },
            { text: 'IntelliJ', color: 0x000000 },
            { text: 'Eclipse', color: 0x2c2255 },
            { text: 'PyCharm', color: 0x000000 }
        ];

        this.ideSymbols = [];

        ides.forEach((ide, index) => {
            const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
            const material = new THREE.MeshPhongMaterial({
                color: ide.color,
                transparent: true,
                opacity: 0.7
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                -3
            );
            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02
                },
                floatSpeed: 0.001 + Math.random() * 0.002
            };

            this.ideSymbols.push(mesh);
            this.scene.add(mesh);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const time = Date.now() * 0.001;

        if(this.particles) {
            this.particles.rotation.x += 0.0001;
            this.particles.rotation.y += 0.0001;
        }

        if(this.abstractShapes) {
            this.abstractShapes.forEach((obj, i) => {
                obj.rotation.x += 0.001 * (i + 1);
                obj.rotation.y += 0.002 * (i + 1);
                obj.position.y += Math.sin(Date.now() * 0.001 + i) * 0.001;
            });
        }

        if(this.glowingOrbs) {
            this.glowingOrbs.forEach(orb => {
                const { originalY, speed, amplitude } = orb.userData;
                orb.position.y = originalY + Math.sin(Date.now() * speed) * amplitude;
                orb.scale.setScalar(1 + Math.sin(Date.now() * speed * 2) * 0.1);
            });
        }

        if(this.dnaParticles) {
            this.dnaParticles.forEach(particle => {
                particle.t += 0.001;
                if(particle.t > 1) particle.t = 0;
                const position = this.dnaHelix.geometry.parameters?.path?.getPoint(particle.t) || new THREE.Vector3();
                particle.mesh.position.copy(position);
            });
        }

        // Animate neural network
        if(this.neuralNetwork) {
            this.neuralNetwork.nodes.forEach(node => {
                node.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.1);
            });
        }

        // Animate binary stream
        if(this.binaryStream) {
            this.binaryStream.forEach(particle => {
                particle.position.add(particle.userData.velocity);
                
                // Reset position if particle goes out of bounds
                if(Math.abs(particle.position.x) > 4) particle.position.x *= -0.9;
                if(Math.abs(particle.position.y) > 4) particle.position.y *= -0.9;
                if(Math.abs(particle.position.z) > 4) particle.position.z *= -0.9;
            });
        }

        // Animate circuit board
        if(this.circuitBoard) {
            this.circuitBoard.forEach((line, i) => {
                line.material.opacity = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;
            });
        }

        // Animate cyber lock
        if(this.cyberLock) {
            this.cyberLock.rotation.y += 0.01;
            this.cyberLock.rotation.z = Math.sin(Date.now() * 0.001) * 0.2;
        }

        // Animate floating characters
        if(this.floatingTexts) {
            this.floatingTexts.forEach(text => {
                const { originalY, speed, amplitude } = text.userData;
                text.position.y = originalY + Math.sin(Date.now() * speed) * amplitude;
                text.rotation.z = Math.sin(Date.now() * speed * 0.5) * 0.1;
            });
        }

        // Animate atom structure
        if(this.atomStructure) {
            this.atomStructure.nucleus.rotation.y += 0.01;
            this.atomStructure.electrons.forEach((electron, i) => {
                const { orbit, angle, speed } = electron.userData;
                electron.userData.angle += speed;
                const radius = 0.4 + orbit * 0.2;
                electron.position.x = this.atomStructure.nucleus.position.x + Math.cos(angle) * radius;
                electron.position.y = this.atomStructure.nucleus.position.y + Math.sin(angle) * radius;
                electron.position.z = this.atomStructure.nucleus.position.z;
            });
        }

        // Animate geometric patterns
        if(this.geometricPatterns) {
            this.geometricPatterns.forEach(pattern => {
                const { rotationSpeed } = pattern.userData;
                pattern.rotation.x += rotationSpeed.x;
                pattern.rotation.y += rotationSpeed.y;
                pattern.rotation.z += rotationSpeed.z;
            });
        }

        // Animate holographic displays
        if(this.holographicDisplays) {
            this.holographicDisplays.forEach(display => {
                display.material.uniforms.time.value = Date.now() * 0.001;
            });
        }

        // Animate tech stack logos
        if(this.techLogos) {
            this.techLogos.forEach(logo => {
                const { rotationSpeed, orbitRadius, orbitAngle } = logo.userData;
                logo.userData.orbitAngle += rotationSpeed;
                logo.position.x = Math.cos(logo.userData.orbitAngle) * orbitRadius;
                logo.position.y = Math.sin(logo.userData.orbitAngle) * orbitRadius;
                logo.rotation.z = time * 0.5;
            });
        }

        // Animate cloud services
        if(this.cloudServices) {
            this.cloudServices.forEach(cloud => {
                const { floatSpeed, rotationSpeed } = cloud.userData;
                cloud.rotation.y += rotationSpeed;
                cloud.position.y += Math.sin(time * floatSpeed) * 0.01;
            });
        }

        // Animate database symbols
        if(this.databaseSymbols) {
            this.databaseSymbols.forEach(db => {
                const { pulseSpeed, rotationSpeed } = db.userData;
                db.rotation.y += rotationSpeed;
                db.scale.setScalar(1 + Math.sin(time * pulseSpeed) * 0.1);
            });
        }

        // Animate framework icons
        if(this.frameworkIcons) {
            this.frameworkIcons.forEach(icon => {
                const { originalPosition, floatSpeed, floatAmplitude } = icon.userData;
                icon.position.y = originalPosition.y + Math.sin(time * floatSpeed) * floatAmplitude;
            });
        }

        // Animate mobile platforms
        if(this.mobilePlatforms) {
            this.mobilePlatforms.forEach(platform => {
                const { rotationSpeed, floatSpeed } = platform.userData;
                platform.rotation.y += rotationSpeed;
                platform.position.y += Math.sin(time * floatSpeed) * 0.01;
                platform.children[1].material.uniforms.time.value = time;
            });
        }

        // Animate IDE symbols
        if(this.ideSymbols) {
            this.ideSymbols.forEach(ide => {
                const { rotationSpeed, floatSpeed } = ide.userData;
                ide.rotation.x += rotationSpeed.x;
                ide.rotation.y += rotationSpeed.y;
                ide.position.y += Math.sin(time * floatSpeed) * 0.01;
            });
        }

        // Rotate entire scene slightly based on mouse position
        if(this.mouseX && this.mouseY) {
            this.scene.rotation.y += (this.mouseX - this.scene.rotation.y) * 0.05;
            this.scene.rotation.x += (this.mouseY - this.scene.rotation.x) * 0.05;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        gsap.to(this.camera.position, {
            x: this.mouseX * 0.3,
            y: this.mouseY * 0.3,
            duration: 2,
            ease: 'power2.out'
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

// Initialize animations
class Animations {
    constructor() {
        this.init();
    }

    init() {
        // Initial loader animation
        this.loaderAnimation();
        
        // Navigation animation
        this.navigationAnimation();
        
        // Hero section animations
        this.heroAnimation();
        
        // Course cards animation
        this.courseCardsAnimation();
        
        // About section animation
        this.aboutAnimation();
        
        // Initialize scroll animations
        this.initScrollAnimations();
    }

    loaderAnimation() {
        const loader = document.querySelector('.loader');
        gsap.to(loader, {
            opacity: 0,
            duration: 1,
            delay: 2,
            ease: 'power2.inOut',
            onComplete: () => {
                loader.style.display = 'none';
            }
        });
    }

    navigationAnimation() {
        const nav = document.querySelector('.navigation');
        
        ScrollTrigger.create({
            start: 'top -100',
            onUpdate: (self) => {
                if (self.direction === -1) {
                    nav.classList.remove('scrolled');
                } else {
                    nav.classList.add('scrolled');
                }
            }
        });
    }

    heroAnimation() {
        const heroTitle = document.querySelector('.hero-content h1');
        const words = heroTitle.textContent.split(' ');
        heroTitle.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
        
        gsap.from('.word', {
            opacity: 0,
            y: 100,
            duration: 1,
            stagger: 0.2,
            ease: 'back.out(1.7)',
            delay: 2.5
        });

        gsap.from('.hero-content p', {
            opacity: 0,
            y: 50,
            duration: 1,
            delay: 3.2,
            ease: 'power2.out'
        });

        gsap.from('.cta-button', {
            opacity: 0,
            scale: 0,
            duration: 1,
            delay: 3.5,
            ease: 'back.out(1.7)'
        });
    }

    courseCardsAnimation() {
        const cards = document.querySelectorAll('.course-card');
        
        cards.forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom-=100',
                    toggleActions: 'play none none reverse'
                },
                y: 100,
                opacity: 0,
                duration: 1,
                delay: index * 0.2,
                ease: 'power2.out'
            });
        });
    }

    aboutAnimation() {
        const aboutContent = document.querySelector('.about-content');
        const aboutScene = document.querySelector('.about-3d-scene');

        gsap.from(aboutContent, {
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top center',
                toggleActions: 'play none none reverse'
            },
            x: -100,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });

        gsap.from(aboutScene, {
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top center',
                toggleActions: 'play none none reverse'
            },
            x: 100,
            opacity: 0,
            duration: 1,
            delay: 0.3,
            ease: 'power2.out'
        });
    }

    initScrollAnimations() {
        // Fade up animation for elements with fade-up class
        const fadeElements = document.querySelectorAll('.fade-up');
        fadeElements.forEach(element => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom-=100',
                    toggleActions: 'play none none reverse',
                    onEnter: () => element.classList.add('visible')
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThreeScene();
    new Animations();

    // Add interactive hover effects
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                scale: 1.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
});
