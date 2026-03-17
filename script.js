const revealButton = document.getElementById("revealButton");
const closeButton = document.getElementById("closeButton");
const surpriseLayer = document.getElementById("surpriseLayer");
const fireworksCanvas = document.getElementById("fireworksCanvas");
const ctx = fireworksCanvas.getContext("2d");
const particles = [];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lowPowerDevice =
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4);
const FIREWORKS_CONFIG = lowPowerDevice
  ? {
      maxParticles: 120,
      burstCount: 14,
      burstInterval: 1700,
      secondBurstChance: 0,
      targetFps: 20,
      finaleBursts: 1
    }
  : {
      maxParticles: 200,
      burstCount: 22,
      burstInterval: 1400,
      secondBurstChance: 0.08,
      targetFps: 24,
      finaleBursts: 2
    };
let dpr = 1;
let lastFrameTime = 0;

function resizeCanvas() {
  dpr = 1;
  fireworksCanvas.width = Math.floor(window.innerWidth * dpr);
  fireworksCanvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function launchFirework() {
  if (particles.length > FIREWORKS_CONFIG.maxParticles) {
    return;
  }

  const width = fireworksCanvas.width / dpr;
  const height = fireworksCanvas.height / dpr;
  const x = random(width * 0.12, width * 0.88);
  const y = random(height * 0.08, height * 0.4);
  const palette = ["#ffe7af", "#ffd7b6", "#ffc1b1", "#d9cbff", "#b8ebff"];
  const count = FIREWORKS_CONFIG.burstCount;
  const burstColor = palette[Math.floor(random(0, palette.length))];

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = random(1.4, 3.4);
    const life = random(36, 62);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * random(0.7, 1.2),
      vy: Math.sin(angle) * speed * random(0.7, 1.2),
      life,
      maxLife: life,
      size: random(1.2, 2.2),
      color: burstColor
    });
  }
}

function updateFireworks(now = 0) {
  requestAnimationFrame(updateFireworks);
  if (document.hidden) {
    return;
  }

  const frameDuration = 1000 / FIREWORKS_CONFIG.targetFps;
  if (now - lastFrameTime < frameDuration) {
    return;
  }
  lastFrameTime = now;

  const width = fireworksCanvas.width / dpr;
  const height = fireworksCanvas.height / dpr;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.984;
    p.vy = p.vy * 0.984 + 0.036;
    p.life -= 1;

    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }

    const alpha = p.life / p.maxLife;
    ctx.beginPath();
    ctx.fillStyle = `${p.color}${Math.floor(alpha * 220).toString(16).padStart(2, "0")}`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function openSurprise() {
  surpriseLayer.classList.add("show");
  surpriseLayer.setAttribute("aria-hidden", "false");

  if (!reducedMotion) {
    for (let i = 0; i < FIREWORKS_CONFIG.finaleBursts; i += 1) {
      setTimeout(() => {
        launchFirework();
      }, i * 180);
    }
  }
}

function closeSurprise() {
  surpriseLayer.classList.remove("show");
  surpriseLayer.setAttribute("aria-hidden", "true");
}

revealButton.addEventListener("click", openSurprise);
closeButton.addEventListener("click", closeSurprise);

surpriseLayer.addEventListener("click", (event) => {
  if (event.target === surpriseLayer) {
    closeSurprise();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSurprise();
  }
});

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

if (!reducedMotion) {
  launchFirework();
  setInterval(() => {
    launchFirework();
    if (Math.random() < FIREWORKS_CONFIG.secondBurstChance) {
      launchFirework();
    }
  }, FIREWORKS_CONFIG.burstInterval);
  updateFireworks();
}
