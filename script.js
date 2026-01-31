/* --- 1. SYMULATOR SILNIKA --- */
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const compSlider = document.getElementById('compression');
const octSlider = document.getElementById('octane');
const compDisplay = document.getElementById('comp-val');
const octDisplay = document.getElementById('oct-val');
const statusBox = document.getElementById('status-box');
const engineWrapper = document.getElementById('engine-wrapper');

let angle = 0;
let isKnocking = false;

// Nasłuchiwanie zmian suwaków
compSlider.addEventListener('input', () => compDisplay.textContent = compSlider.value);
octSlider.addEventListener('input', () => octDisplay.textContent = octSlider.value);

function drawEngine() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = 250;
    const crankR = 40;
    const rodL = 100;
    const pistonW = 80;
    const pistonH = 60;

    angle += 0.1;
    const crankX = cx + Math.cos(angle) * crankR;
    const crankY = cy + Math.sin(angle) * crankR;
    const pistonY = crankY - Math.sqrt(rodL**2 - (crankX - cx)**2);

    const compression = parseFloat(compSlider.value);
    const octane = parseInt(octSlider.value);
    
    // Prosta formuła: Wytrzymałość paliwa rośnie z oktanami
    const fuelResistance = (octane / 10) + 0.5;
    const isTDC = Math.sin(angle) < -0.8; // Tłok na górze

    // Warunek stukania: Wysoka kompresja vs Słabe paliwo
    if (isTDC && compression > fuelResistance) {
        isKnocking = true;
    } else {
        isKnocking = false;
    }

    // Rysowanie
    ctx.fillStyle = "#333";
    ctx.fillRect(cx - 50, 40, 100, 220); // Cylinder

    if (isKnocking && isTDC) {
        ctx.fillStyle = "rgba(239, 68, 68, 0.9)"; // Czerwony błysk
        statusBox.innerHTML = "⚠️ <span style='color:#ef4444'>SPALANIE STUKOWE!</span><br>Silnik niszczony.";
        engineWrapper.classList.add('knocking');
    } else if (isTDC) {
        ctx.fillStyle = "rgba(234, 179, 8, 0.6)"; // Żółty zapłon (OK)
        statusBox.innerHTML = "STATUS: <span style='color:#4ade80'>PRACA OPTYMALNA</span>";
        engineWrapper.classList.remove('knocking');
    } else {
        ctx.fillStyle = "rgba(0,0,0,0)";
        if(!isKnocking) engineWrapper.classList.remove('knocking');
    }
    ctx.fillRect(cx - 45, 40, 90, pistonY - 40 - pistonH/2); // Komora spalania

    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(cx - pistonW/2, pistonY - pistonH/2, pistonW, pistonH); // Tłok
    
    ctx.beginPath(); ctx.moveTo(cx, pistonY); ctx.lineTo(crankX, crankY);
    ctx.strokeStyle = "#64748b"; ctx.lineWidth = 10; ctx.stroke(); // Korbowód

    ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI*2);
    ctx.fillStyle = "#fff"; ctx.fill(); // Wał

    requestAnimationFrame(drawEngine);
}
drawEngine();

/* --- 2. SYMULATOR KOMPUTERA (ECU) --- */
const consoleOutput = document.getElementById('console-output');
const messages = [
    { text: "> SENSOR: Nasłuchiwanie...", color: "#fff" },
    { text: "> STATUS: Praca silnika stabilna.", color: "#4ade80" },
    { text: "> ALERT: Wykryto wibracje!", color: "#ef4444" },
    { text: "> ECU: Opóźnianie kąta zapłonu...", color: "#eab308" },
    { text: "> KOREKTA: Zapłon -3°.", color: "#eab308" },
    { text: "> SENSOR: Wibracje ustały.", color: "#4ade80" },
    { text: "> INFO: Moc ograniczona.", color: "#94a3b8" }
];
let msgIndex = 0;

function runConsole() {
    if(msgIndex >= messages.length) msgIndex = 0;
    const msg = messages[msgIndex];
    const line = document.createElement('div');
    line.innerText = msg.text;
    line.style.color = msg.color;
    line.style.marginBottom = "4px";
    consoleOutput.appendChild(line);
    
    if(consoleOutput.children.length > 5) {
        consoleOutput.removeChild(consoleOutput.children[0]);
    }
    msgIndex++;
    setTimeout(runConsole, 1500);
}
runConsole();