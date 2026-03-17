const revealButton = document.getElementById("revealButton");
const closeButton = document.getElementById("closeButton");
const surpriseLayer = document.getElementById("surpriseLayer");
const fireworksCanvas = document.getElementById("fireworksCanvas");
const ctx = fireworksCanvas.getContext("2d");
const particles = [];
const flashes = [];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MAX_PARTICLES = 820;
let dpr = 1;

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  fireworksCanvas.width = Math.floor(window.innerWidth * dpr);
  fireworksCanvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function launchFirework() {
  if (particles.length > MAX_PARTICLES) {
    return;
  }

  const width = fireworksCanvas.width / dpr;
  const height = fireworksCanvas.height / dpr;
  const x = random(width * 0.12, width * 0.88);
  const y = random(height * 0.08, height * 0.4);
  const palette = ["#ffe7af", "#ffd7b6", "#ffc1b1", "#d9cbff", "#b8ebff"];
  const count = 72;
  const burstColor = palette[Math.floor(random(0, palette.length))];

  flashes.push({
    x,
    y,
    life: 16,
    maxLife: 16,
    radius: random(24, 44),
    color: burstColor
  });

  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = random(1.9, 6.2);
    const life = random(62, 112);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * random(0.7, 1.2),
      vy: Math.sin(angle) * speed * random(0.7, 1.2),
      life,
      maxLife: life,
      size: random(1.8, 3.9),
      color: burstColor
    });
  }
}

function updateFireworks() {
  const width = fireworksCanvas.width / dpr;
  const height = fireworksCanvas.height / dpr;
  // Fade slightly instead of clear for trail effect.
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  for (let i = flashes.length - 1; i >= 0; i -= 1) {
    const flash = flashes[i];
    flash.life -= 1;
    if (flash.life <= 0) {
      flashes.splice(i, 1);
      continue;
    }

    const alpha = flash.life / flash.maxLife;
    ctx.beginPath();
    ctx.fillStyle = `${flash.color}${Math.floor(alpha * 165).toString(16).padStart(2, "0")}`;
    ctx.shadowColor = flash.color;
    ctx.shadowBlur = 34;
    ctx.arc(flash.x, flash.y, flash.radius * (1.05 - alpha * 0.35), 0, Math.PI * 2);
    ctx.fill();
  }

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
    ctx.fillStyle = `${p.color}${Math.floor(alpha * 255).toString(16).padStart(2, "0")}`;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 22;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(updateFireworks);
}

function openSurprise() {
  surpriseLayer.classList.add("show");
  surpriseLayer.setAttribute("aria-hidden", "false");

  if (!reducedMotion) {
    // Grand finale burst when surprise opens.
    for (let i = 0; i < 4; i += 1) {
      setTimeout(() => {
        launchFirework();
      }, i * 140);
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
    if (Math.random() > 0.4) {
      launchFirework();
    }
  }, 850);
  updateFireworks();
}
