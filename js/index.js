import { HORSES } from "./horses.js";

const SHAKE_THRESHOLD = 24;
const COOLDOWN_MS = 1200;
const MOTION_KEY = "tethorse.motionGranted";
const FLOWER_TOTAL = 20;

const enableMotionButton = document.getElementById("enableMotionButton");
const drawFortuneButton = document.getElementById("drawFortuneBtn");
const motionStatusText = document.getElementById("motionStatusText");
const motionPrompt = document.getElementById("motionPrompt");
const closeMotionButton = document.getElementById("closeMotionButton");

let lastTrigger = 0;
let armed = true;
let motionEnabled = false;
let flowersLoaded = false;
let motionSeen = false;

const supportsMotion = "DeviceMotionEvent" in window;
const needsPermission =
  supportsMotion && typeof DeviceMotionEvent.requestPermission === "function";
const isMobile =
  typeof navigator !== "undefined" &&
  ((navigator.userAgentData && navigator.userAgentData.mobile) ||
    /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent));

function setStatus(message) {
  if (motionStatusText) {
    motionStatusText.textContent = message;
  }
}

function showDrawButton() {
  drawFortuneButton?.classList.remove("hidden");
}

function hideDrawButton() {
  drawFortuneButton?.classList.add("hidden");
}

function chooseRandomHorse() {
  const pool = HORSES.filter((horse) => !horse.secret);
  return pool[Math.floor(Math.random() * pool.length)];
}

function goToHorse(outcome) {
  const revealUrl = new URL("horse.html", window.location.href);
  revealUrl.searchParams.set("horse", outcome.id);
  window.location.href = revealUrl.toString();
}

function triggerDraw() {
  if (!armed) {
    return;
  }
  armed = false;
  if (drawFortuneButton) {
    drawFortuneButton.disabled = true;
  }
  const outcome = chooseRandomHorse();
  goToHorse(outcome);
}

function handleMotion(event) {
  if (!armed) {
    return;
  }
  motionSeen = true;
  const acc = event.accelerationIncludingGravity;
  if (!acc) {
    return;
  }
  const x = acc.x || 0;
  const y = acc.y || 0;
  const z = acc.z || 0;
  const magnitude = Math.sqrt(x * x + y * y + z * z);
  const now = Date.now();
  if (magnitude > SHAKE_THRESHOLD && now - lastTrigger > COOLDOWN_MS) {
    lastTrigger = now;
    triggerDraw();
  }
}

function startMotion() {
  if (motionEnabled) {
    return;
  }
  motionSeen = false;
  window.addEventListener("devicemotion", handleMotion, { passive: true });
  motionEnabled = true;
  setStatus("");
  hideDrawButton();
  hideMotionModal();

  if (needsPermission) {
    window.setTimeout(() => {
      if (!motionSeen) {
        setStatus("Enable motion access to use shake.");
        showDrawButton();
        showMotionModal();
      }
    }, 800);
  }
}

async function requestMotionPermission() {
  if (!needsPermission) {
    setMotionGranted();
    startMotion();
    return;
  }
  try {
    const response = await DeviceMotionEvent.requestPermission();
    if (response === "granted") {
      setMotionGranted();
      startMotion();
      return;
    }
    setStatus("Motion access denied.");
    showDrawButton();
  } catch (error) {
    setStatus("Motion access unavailable.");
    showDrawButton();
  }

  hideMotionModal();
}

function setupMotionUI() {
  if (!isMobile || !supportsMotion) {
    setStatus("");
    showDrawButton();
    hideMotionModal();
    return;
  }

  if (!needsPermission) {
    startMotion();
    return;
  }

  if (isMotionGranted()) {
    startMotion();
    return;
  }

  setStatus("Enable motion access to use shake.");
  showDrawButton();
  showMotionModal();
}

function isMotionGranted() {
  try {
    return window.localStorage.getItem(MOTION_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function setMotionGranted() {
  try {
    window.localStorage.setItem(MOTION_KEY, "true");
  } catch (error) {
    // ignore storage errors
  }
}

function showMotionModal() {
  motionPrompt?.classList.remove("hidden");
}

function hideMotionModal() {
  motionPrompt?.classList.add("hidden");
}

function createFlowerElement({ svg, size, spin }, x, y) {
  const flower = document.createElement("span");
  flower.className = `tree-flower${spin ? " tree-flower--spin" : ""}`;

  flower.style.setProperty("--flower-x", `${x}%`);
  flower.style.setProperty("--flower-y", `${y}%`);
  flower.style.setProperty("--flower-size", `${size}px`);
  flower.style.setProperty("--flower-delay", `${Math.random() * 0.6}s`);

  if (spin) {
    const duration = 6 + Math.random() * 6;
    const delay = Math.random() * 1.5;
    flower.style.setProperty("--spin-duration", `${duration}s`);
    flower.style.setProperty("--spin-delay", `${delay}s`);
  }

  flower.innerHTML = svg;
  return flower;
}

function seedFlowers() {
  if (flowersLoaded) {
    return;
  }
  const container = document.querySelector(".hero-tree-flowers");
  if (!container) {
    return;
  }
  flowersLoaded = true;
  container.innerHTML = "";

  const flowerCount = Math.max(1, FLOWER_TOTAL);
  const minPerType = Math.max(1, Math.floor(FLOWER_TOTAL * 0.15));
  const maxPerType = Math.max(minPerType, Math.ceil(FLOWER_TOTAL * 0.45));

  const flowers = [
    {
      size: 12,
      spin: false,
      svg:
        '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="5" fill="#FFFFFF"/><circle cx="6" cy="6" r="5" stroke="#D50B0B" stroke-width="2"/></svg>'
    },
    {
      size: 26,
      spin: true,
      svg:
        '<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 13C0 5.8203 5.8203 0 13 0C20.1797 0 26 5.8203 26 13C26 20.1797 20.1797 26 13 26C5.8203 26 0 20.1797 0 13Z" fill="#FFFF90"/><path d="M13 6.99998L13.7071 6.29287L13 5.58577L12.2929 6.29287L13 6.99998ZM19 13L19.7071 13.7071L20.4142 13L19.7071 12.2929L19 13ZM13 19L12.2929 19.7071L13 20.4142L13.7071 19.7071L13 19ZM6.99999 13L6.29288 12.2929L5.58578 13L6.29288 13.7071L6.99999 13ZM13 6.99998L12.2929 7.70709L18.2929 13.7071L19 13L19.7071 12.2929L13.7071 6.29287L13 6.99998ZM19 13L18.2929 12.2929L12.2929 18.2929L13 19L13.7071 19.7071L19.7071 13.7071L19 13ZM13 19L13.7071 18.2929L7.7071 12.2929L6.99999 13L6.29288 13.7071L12.2929 19.7071L13 19ZM6.99999 13L7.7071 13.7071L13.7071 7.70709L13 6.99998L12.2929 6.29287L6.29288 12.2929L6.99999 13Z" fill="#D50B0B"/></svg>'
    },
    {
      size: 24,
      spin: true,
      svg:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" fill="#FF6FFA"/><path d="M12.001 15.3333L12.001 22" stroke="#D50B0B" stroke-width="2"/><path d="M12.001 2V8.66667" stroke="#D50B0B" stroke-width="2"/><path d="M8.67188 11.9958L2.00521 11.9958" stroke="#D50B0B" stroke-width="2"/><path d="M22.0049 11.9958L15.3382 11.9958" stroke="#D50B0B" stroke-width="2"/><path d="M9.64502 14.3541L4.93097 19.0681" stroke="#D50B0B" stroke-width="2"/><path d="M19.0732 4.92597L14.3592 9.64002" stroke="#D50B0B" stroke-width="2"/><path d="M9.64502 9.63992L4.93098 4.92588" stroke="#D50B0B" stroke-width="2"/><path d="M19.0732 19.0682L14.3592 14.3542" stroke="#D50B0B" stroke-width="2"/></svg>'
    }
  ];

  const placed = [];
  const maxTries = flowerCount * 20;
  let tries = 0;

  const counts = [0, 0, 0];
  if (flowerCount <= flowers.length) {
    for (let i = 0; i < flowerCount; i += 1) {
      counts[i] = 1;
    }
  } else {
    counts[0] = minPerType;
    counts[1] = minPerType;
    counts[2] = minPerType;
    let remaining = flowerCount - minPerType * 3;
    while (remaining > 0) {
      const options = counts
        .map((count, index) => (count < maxPerType ? index : null))
        .filter((value) => value !== null);
      const pick = options.length
        ? options[Math.floor(Math.random() * options.length)]
        : Math.floor(Math.random() * counts.length);
      counts[pick] += 1;
      remaining -= 1;
    }
  }

  const distribution = [];
  counts.forEach((count, index) => {
    for (let i = 0; i < count; i += 1) {
      distribution.push(flowers[index]);
    }
  });
  for (let i = distribution.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
  }

  while (placed.length < distribution.length && tries < maxTries) {
    tries += 1;
    const x = 5 + Math.random() * 90;
    const y = 5 + Math.random() * 70;
    const flower = distribution[placed.length];
    const minGap = Math.max(12, flower.size * 1.8);

    const tooClose = placed.some((point) => {
      const dx = point.x - x;
      const dy = point.y - y;
      return Math.hypot(dx, dy) < minGap;
    });

    if (tooClose) {
      continue;
    }

    placed.push({ x, y });
    container.appendChild(createFlowerElement(flower, x, y));
  }

  while (placed.length < distribution.length) {
    const x = 5 + Math.random() * 90;
    const y = 5 + Math.random() * 70;
    const flower = distribution[placed.length];
    placed.push({ x, y });
    container.appendChild(createFlowerElement(flower, x, y));
  }
}

function setupTreeFlowers() {
  const wrap = document.querySelector(".hero-tree-wrap");
  if (!wrap) {
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    seedFlowers();
    return;
  }

  const style = window.getComputedStyle(wrap);
  const hasAnimation =
    style.animationName && style.animationName !== "none" && parseFloat(style.animationDuration) > 0;

  if (!hasAnimation) {
    seedFlowers();
    return;
  }

  wrap.addEventListener("animationend", seedFlowers, { once: true });
  const durationMs = parseFloat(style.animationDuration) * 1000;
  if (Number.isFinite(durationMs) && durationMs > 0) {
    setTimeout(seedFlowers, durationMs + 50);
  }
}

enableMotionButton?.addEventListener("click", requestMotionPermission);
closeMotionButton?.addEventListener("click", hideMotionModal);
motionPrompt?.addEventListener("click", (event) => {
  const target = event.target;
  if (target && target.matches("[data-close=\"true\"]")) {
    setStatus("");
    showDrawButton();
    hideMotionModal();
  }
});

drawFortuneButton?.addEventListener("click", () => {
  triggerDraw();
});

setupTreeFlowers();
setupMotionUI();
