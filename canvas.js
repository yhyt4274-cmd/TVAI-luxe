// Interactive Three.js Gold Dust Canvas
function initLuxuryCanvas() {
    const canvas = document.getElementById('luxury-bg-canvas');
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const particlesCount = 350;
    const positions = new Float32Array(particlesCount * 3);
    const speeds = [];

    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 12;
        positions[i + 1] = (Math.random() - 0.5) * 12;
        positions[i + 2] = (Math.random() - 0.5) * 10;
        
        speeds.push({
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() + 0.1) * 0.003,
            z: (Math.random() - 0.5) * 0.001
        });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.06,
        color: new THREE.Color('#D4AF37'),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    function animate() {
        requestAnimationFrame(animate);

        const positionsAttr = geometry.attributes.position;
        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            positionsAttr.array[i3 + 1] += speeds[i].y;
            positionsAttr.array[i3] += speeds[i].x + (mouseX * 0.01);
            
            if (positionsAttr.array[i3 + 1] > 6) {
                positionsAttr.array[i3 + 1] = -6;
                positionsAttr.array[i3] = (Math.random() - 0.5) * 12;
            }
        }
        positionsAttr.needsUpdate = true;

        points.rotation.y += 0.0008;
        points.rotation.x += 0.0003;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}