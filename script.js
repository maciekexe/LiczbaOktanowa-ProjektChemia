/* --- UWAGA: USUNĄŁEM IMPORTY, BO MAMY BIBLIOTEKĘ Z HTML --- */

/* --- KONFIGURACJA SCENY --- */
const container = document.getElementById('canvas-container');
const loading = document.getElementById('loading');

// Sprawdzamy czy kontener istnieje
if (container) {
    // 1. Scena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // 2. Kamera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    if(loading) loading.style.display = 'none';

    // 4. Światła
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // 5. Kontrola (OrbitControls)
    // ZMIANA: Dodano "THREE." przed OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 2;
    controls.maxDistance = 50;

    /* --- MATERIAŁY --- */
    const carbonMat = new THREE.MeshPhysicalMaterial({ color: 0x333333, roughness: 0.2, metalness: 0.1 });
    const hydrogenMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.0 });
    const bondMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

    const atomGroup = new THREE.Group();
    scene.add(atomGroup);

    /* --- FUNKCJE POMOCNICZE --- */
    function createAtom(pos, type) {
        const radius = type === 'C' ? 0.7 : 0.4;
        const mat = type === 'C' ? carbonMat : hydrogenMat;
        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        atomGroup.add(mesh);
        return mesh;
    }

    function createBond(posA, posB) {
        const distance = posA.distanceTo(posB);
        const geo = new THREE.CylinderGeometry(0.15, 0.15, distance, 12);
        const mesh = new THREE.Mesh(geo, bondMat);
        
        const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
        mesh.position.copy(midpoint);
        mesh.lookAt(posB);
        mesh.rotateX(Math.PI / 2);
        
        atomGroup.add(mesh);
    }

    function clearScene() {
        while(atomGroup.children.length > 0){ 
            const obj = atomGroup.children[0];
            if(obj.geometry) obj.geometry.dispose();
            atomGroup.remove(obj); 
        }
    }

    /* --- DEFINICJE MOLEKUŁ --- */

    function buildHeptane() {
        clearScene();
        // C7H16
        const cPos = [
            new THREE.Vector3(-4.5, 0.5, 0),
            new THREE.Vector3(-3.0, -0.5, 0),
            new THREE.Vector3(-1.5, 0.5, 0),
            new THREE.Vector3(0.0, -0.5, 0),
            new THREE.Vector3(1.5, 0.5, 0),
            new THREE.Vector3(3.0, -0.5, 0),
            new THREE.Vector3(4.5, 0.5, 0)
        ];

        cPos.forEach((pos, i) => {
            createAtom(pos, 'C');
            if (i > 0) createBond(cPos[i-1], pos);
        });

        // Wodory
        const hOffsets = [
            { idx: 0, off: [-1, 0.5, 0] }, { idx: 0, off: [0, 1, 0.8] }, { idx: 0, off: [0, 1, -0.8] },
            { idx: 1, off: [0, -1, 0.8] }, { idx: 1, off: [0, -1, -0.8] },
            { idx: 2, off: [0, 1, 0.8] }, { idx: 2, off: [0, 1, -0.8] },
            { idx: 3, off: [0, -1, 0.8] }, { idx: 3, off: [0, -1, -0.8] },
            { idx: 4, off: [0, 1, 0.8] }, { idx: 4, off: [0, 1, -0.8] },
            { idx: 5, off: [0, -1, 0.8] }, { idx: 5, off: [0, -1, -0.8] },
            { idx: 6, off: [1, 0.5, 0] }, { idx: 6, off: [0, 1, 0.8] }, { idx: 6, off: [0, 1, -0.8] }
        ];

        hOffsets.forEach(h => {
            const hPos = cPos[h.idx].clone().add(new THREE.Vector3(...h.off).multiplyScalar(0.8));
            createAtom(hPos, 'H');
            createBond(cPos[h.idx], hPos);
        });
    }

    function buildIsooctane() {
        clearScene();
        // C8H18
        const carbons = {};
        carbons.c1 = new THREE.Vector3(-3, 0, 0);
        carbons.c2 = new THREE.Vector3(-1.5, 0, 0);
        carbons.c3 = new THREE.Vector3(0, 1, 0);
        carbons.c4 = new THREE.Vector3(1.5, 0, 0);
        carbons.c5 = new THREE.Vector3(3, 0, 0);
        carbons.m1 = new THREE.Vector3(-1.5, 1.5, 1.2);
        carbons.m2 = new THREE.Vector3(-1.5, -1.5, -0.5);
        carbons.m3 = new THREE.Vector3(1.5, -1.5, 0.5);

        for (const key in carbons) createAtom(carbons[key], 'C');

        const bonds = [
            ['c1','c2'], ['c2','c3'], ['c3','c4'], ['c4','c5'],
            ['c2','m1'], ['c2','m2'], ['c4','m3']
        ];
        bonds.forEach(pair => createBond(carbons[pair[0]], carbons[pair[1]]));

        const hDefs = [
            { parent: 'c1', dir: [-1, 0.5, 0.5] }, { parent: 'c1', dir: [-1, -0.5, -0.5] }, { parent: 'c1', dir: [-1, 0.5, -0.5] },
            { parent: 'c3', dir: [0, 1, 1] }, { parent: 'c3', dir: [0, 1, -1] },
            { parent: 'c4', dir: [0, 1, 1] },
            { parent: 'c5', dir: [1, 0.5, 0] }, { parent: 'c5', dir: [1, -0.5, 0.5] }, { parent: 'c5', dir: [1, -0.5, -0.5] },
            { parent: 'm1', dir: [0, 1, 0] }, { parent: 'm1', dir: [1, 0, 0] }, { parent: 'm1', dir: [-1, 0, 1] },
            { parent: 'm2', dir: [0, -1, 0] }, { parent: 'm2', dir: [1, 0, 0] }, { parent: 'm2', dir: [-1, 0, -1] },
            { parent: 'm3', dir: [0, -1, 0] }, { parent: 'm3', dir: [1, 0, 0] }, { parent: 'm3', dir: [0, 0, 1] }
        ];

        hDefs.forEach(def => {
            const parentPos = carbons[def.parent];
            const direction = new THREE.Vector3(...def.dir).normalize().multiplyScalar(1.0);
            const hPos = parentPos.clone().add(direction);
            createAtom(hPos, 'H');
            createBond(parentPos, hPos);
        });
    }

    // Start
    buildHeptane();

    // Przyciski
    const btnHept = document.getElementById('btn-heptane');
    const btnIso = document.getElementById('btn-isooctane');

    if(btnHept && btnIso) {
        btnHept.addEventListener('click', () => {
            buildHeptane();
            btnHept.classList.add('active');
            btnIso.classList.remove('active');
        });

        btnIso.addEventListener('click', () => {
            buildIsooctane();
            btnIso.classList.add('active');
            btnHept.classList.remove('active');
        });
    }

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}