import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls';

/* --- KONFIGURACJA SCENY --- */
const container = document.getElementById('canvas-container');
const loading = document.getElementById('loading');

if (container) {
    // 1. Scena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // 2. Kamera - Poprawiony zakres widzenia (Clipping)
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 20); // Odsunięta startowo

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
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    // Naprawa znikania przy przybliżaniu:
    controls.minDistance = 2; // Nie pozwala wejść "w atom"
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
        return mesh; // Zwracamy mesh, żeby znać jego pozycję
    }

    function createBond(posA, posB) {
        const distance = posA.distanceTo(posB);
        const geo = new THREE.CylinderGeometry(0.15, 0.15, distance, 12);
        const mesh = new THREE.Mesh(geo, bondMat);
        
        // Ustawienie cylindra między punktami
        const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
        mesh.position.copy(midpoint);
        mesh.lookAt(posB);
        mesh.rotateX(Math.PI / 2);
        
        atomGroup.add(mesh);
    }

    function clearScene() {
        while(atomGroup.children.length > 0){ 
            const obj = atomGroup.children[0];
            obj.geometry.dispose(); // Czyszczenie pamięci
            atomGroup.remove(obj); 
        }
    }

    /* --- DEFINICJE MOLEKUŁ (Ręczna robota dla poprawności) --- */

    function buildHeptane() {
        // C7H16 - Prosty łańcuch
        clearScene();
        
        // Lista Węgli (Zig-Zag na osi X)
        // C1, C2, C3, C4, C5, C6, C7
        const cPos = [
            new THREE.Vector3(-4.5, 0.5, 0),  // C1
            new THREE.Vector3(-3.0, -0.5, 0), // C2
            new THREE.Vector3(-1.5, 0.5, 0),  // C3
            new THREE.Vector3(0.0, -0.5, 0),  // C4
            new THREE.Vector3(1.5, 0.5, 0),   // C5
            new THREE.Vector3(3.0, -0.5, 0),  // C6
            new THREE.Vector3(4.5, 0.5, 0)    // C7
        ];

        // Rysuj węgle i wiązania między nimi
        cPos.forEach((pos, i) => {
            createAtom(pos, 'C');
            if (i > 0) createBond(cPos[i-1], pos);
        });

        // Wodory (H) - Logika manualna dla poprawności
        const hOffsets = [];

        // C1 (Końcowy - CH3)
        hOffsets.push({ idx: 0, off: [-1, 0.5, 0] });   // W lewo
        hOffsets.push({ idx: 0, off: [0, 1, 0.8] });    // Góra przód
        hOffsets.push({ idx: 0, off: [0, 1, -0.8] });   // Góra tył

        // C2 (Środkowy - CH2)
        hOffsets.push({ idx: 1, off: [0, -1, 0.8] });   // Dół przód
        hOffsets.push({ idx: 1, off: [0, -1, -0.8] });  // Dół tył

        // C3 (Środkowy - CH2)
        hOffsets.push({ idx: 2, off: [0, 1, 0.8] });
        hOffsets.push({ idx: 2, off: [0, 1, -0.8] });

        // C4 (Środkowy - CH2)
        hOffsets.push({ idx: 3, off: [0, -1, 0.8] });
        hOffsets.push({ idx: 3, off: [0, -1, -0.8] });

        // C5 (Środkowy - CH2)
        hOffsets.push({ idx: 4, off: [0, 1, 0.8] });
        hOffsets.push({ idx: 4, off: [0, 1, -0.8] });

        // C6 (Środkowy - CH2)
        hOffsets.push({ idx: 5, off: [0, -1, 0.8] });
        hOffsets.push({ idx: 5, off: [0, -1, -0.8] });

        // C7 (Końcowy - CH3)
        hOffsets.push({ idx: 6, off: [1, 0.5, 0] });    // W prawo
        hOffsets.push({ idx: 6, off: [0, 1, 0.8] });    // Góra przód
        hOffsets.push({ idx: 6, off: [0, 1, -0.8] });   // Góra tył

        // Dodawanie wodorów
        hOffsets.forEach(h => {
            const hPos = cPos[h.idx].clone().add(new THREE.Vector3(...h.off).multiplyScalar(0.8));
            createAtom(hPos, 'H');
            createBond(cPos[h.idx], hPos);
        });
    }

    function buildIsooctane() {
        // C8H18 - 2,2,4-trimethylpentane
        clearScene();

        // Szkielet węglowy
        const carbons = {};
        
        // Główny łańcuch (Pentan - 5 węgli)
        carbons.c1 = new THREE.Vector3(-3, 0, 0);
        carbons.c2 = new THREE.Vector3(-1.5, 0, 0); // To jest C2 (tu będą 2 grupy metylowe)
        carbons.c3 = new THREE.Vector3(0, 1, 0);    // C3
        carbons.c4 = new THREE.Vector3(1.5, 0, 0);  // C4 (tu będzie 1 grupa)
        carbons.c5 = new THREE.Vector3(3, 0, 0);    // C5

        // Grupy metylowe
        carbons.m1 = new THREE.Vector3(-1.5, 1.5, 1.2);  // Grupa przy C2
        carbons.m2 = new THREE.Vector3(-1.5, -1.5, -0.5); // Grupa przy C2
        carbons.m3 = new THREE.Vector3(1.5, -1.5, 0.5);   // Grupa przy C4

        // Rysowanie węgli
        for (const key in carbons) createAtom(carbons[key], 'C');

        // Wiązania Węgiel-Węgiel
        const bonds = [
            ['c1','c2'], ['c2','c3'], ['c3','c4'], ['c4','c5'], // Łańcuch
            ['c2','m1'], ['c2','m2'], ['c4','m3']               // Gałęzie
        ];
        bonds.forEach(pair => createBond(carbons[pair[0]], carbons[pair[1]]));

        // Wodory (Precyzyjnie!)
        const hDefs = [];

        // C1 (CH3)
        hDefs.push({ parent: 'c1', dir: [-1, 0.5, 0.5] });
        hDefs.push({ parent: 'c1', dir: [-1, -0.5, -0.5] });
        hDefs.push({ parent: 'c1', dir: [-1, 0.5, -0.5] });

        // C2 - BRAK WODORÓW (To węgiel czwartorzędowy!)

        // C3 (CH2)
        hDefs.push({ parent: 'c3', dir: [0, 1, 1] });
        hDefs.push({ parent: 'c3', dir: [0, 1, -1] });

        // C4 (CH) - Jeden wodór (węgiel trzeciorzędowy)
        hDefs.push({ parent: 'c4', dir: [0, 1, 1] });

        // C5 (CH3)
        hDefs.push({ parent: 'c5', dir: [1, 0.5, 0] });
        hDefs.push({ parent: 'c5', dir: [1, -0.5, 0.5] });
        hDefs.push({ parent: 'c5', dir: [1, -0.5, -0.5] });

        // M1 (CH3)
        hDefs.push({ parent: 'm1', dir: [0, 1, 0] });
        hDefs.push({ parent: 'm1', dir: [1, 0, 0] });
        hDefs.push({ parent: 'm1', dir: [-1, 0, 1] });

        // M2 (CH3)
        hDefs.push({ parent: 'm2', dir: [0, -1, 0] });
        hDefs.push({ parent: 'm2', dir: [1, 0, 0] });
        hDefs.push({ parent: 'm2', dir: [-1, 0, -1] });

        // M3 (CH3)
        hDefs.push({ parent: 'm3', dir: [0, -1, 0] });
        hDefs.push({ parent: 'm3', dir: [1, 0, 0] });
        hDefs.push({ parent: 'm3', dir: [0, 0, 1] });

        // Rysowanie Wodorów
        hDefs.forEach(def => {
            const parentPos = carbons[def.parent];
            const direction = new THREE.Vector3(...def.dir).normalize().multiplyScalar(1.0); // Długość wiązania C-H
            const hPos = parentPos.clone().add(direction);
            createAtom(hPos, 'H');
            createBond(parentPos, hPos);
        });
    }

    // Start
    buildHeptane();

    // UI Listeners
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

    // Responsywność
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Pętla Renderowania
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}