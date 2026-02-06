function getDomRefs() {
  return {
    codeTop: document.getElementById("horseCodeTop"),
    codeName: document.getElementById("horseCodeName"),
    fortune: document.getElementById("horseFortune"),
    description: document.getElementById("horseDescription"),
    codeBottom: document.getElementById("horseCodeBottom"),
    designer: document.getElementById("horseDesigner")
  };
}

export function renderOutcome(outcome) {
  if (!outcome) {
    return;
  }
  setTheme(outcome.theme);
  setCopy(outcome);
}

export function setTheme(themeCfg = {}) {
  const root = document.documentElement;
  if (themeCfg.bg) {
    root.style.setProperty("--horse-bg", themeCfg.bg);
  }
  if (themeCfg.bgSolid) {
    root.style.setProperty("--horse-bg-solid", themeCfg.bgSolid);
  } else if (themeCfg.bg) {
    if (themeCfg.bg.includes("gradient")) {
      const vars = themeCfg.bg.match(/var\([^)]+\)/g) || [];
      const firstVar = vars[0];
      const lastVar = vars[vars.length - 1];
      if (firstVar) {
        root.style.setProperty("--horse-bg-top", firstVar);
        root.style.setProperty("--horse-bg-solid", firstVar);
      }
      if (lastVar) {
        root.style.setProperty("--horse-bg-bottom", lastVar);
      }
    } else {
      root.style.setProperty("--horse-bg-solid", themeCfg.bg);
      root.style.setProperty("--horse-bg-top", themeCfg.bg);
      root.style.setProperty("--horse-bg-bottom", themeCfg.bg);
    }
  }
  if (themeCfg.text) {
    root.style.setProperty("--horse-text", themeCfg.text);
  }

  const pattern = themeCfg.pattern || "";
  if (pattern) {
    document.body.setAttribute("data-pattern", pattern);
  } else {
    document.body.removeAttribute("data-pattern");
  }

  syncThemeColor();
}

function resolveThemeColor() {
  const rootStyles = getComputedStyle(document.documentElement);
  let color = rootStyles.getPropertyValue("--horse-bg-top").trim();
  if (!color) {
    color = rootStyles.getPropertyValue("--horse-bg-solid").trim();
  }
  if (color.startsWith("var(")) {
    const varName = color.slice(4, -1).trim();
    const resolved = rootStyles.getPropertyValue(varName).trim();
    if (resolved) {
      color = resolved;
    }
  }
  if (!color || color.includes("gradient")) {
    color = rootStyles.getPropertyValue("--colors-white").trim() || "#ffffff";
  }
  return color;
}

function syncThemeColor() {
  const meta = document.querySelector("meta[name=\"theme-color\"]");
  if (!meta) {
    return;
  }
  const color = resolveThemeColor();
  meta.setAttribute("content", color || "#ffffff");
}

export function setCopy(outcome) {
  const dom = getDomRefs();
  if (dom.codeTop) dom.codeTop.textContent = outcome.code || "";
  if (dom.codeName) dom.codeName.textContent = outcome.codeName || "";
  if (dom.fortune) dom.fortune.textContent = outcome.fortune || "";
  if (dom.description) dom.description.textContent = outcome.description || "";
  if (dom.codeBottom) dom.codeBottom.textContent = "DESIGNER";
  if (dom.designer) dom.designer.textContent = outcome.designer || "";
}
