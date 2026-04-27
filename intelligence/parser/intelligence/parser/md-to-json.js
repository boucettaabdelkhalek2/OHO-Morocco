const fs = require("fs");
const path = require("path");

// مسارات
const BASE = path.join(__dirname, "..");
const DIAG_DIR = path.join(BASE, "diagnostics");
const FAIL_DIR = path.join(BASE, "failures");

const OUT_RULES = path.join(BASE, "rules");
const OUT_FAIL = path.join(BASE, "failure-map");

// تأكد من وجود المجلدات
[OUT_RULES, OUT_FAIL].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ---- Parser عام ----
function parseMarkdown(content) {
  const sections = {};
  let current = null;

  content.split("\n").forEach(line => {
    const header = line.match(/^##\s+(.*)/);
    if (header) {
      current = header[1].toLowerCase().trim();
      sections[current] = [];
    } else if (current) {
      if (line.trim()) sections[current].push(line.trim());
    }
  });

  return sections;
}

// ---- Diagnostics → Rules ----
function parseDiagnostic(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const name = path.basename(filePath, ".md");

  const sections = parseMarkdown(content);

  return {
    id: name,
    symptom: name,
    checks: (sections["checks"] || []).map((line, i) => ({
      id: `check_${i}`,
      step: line
    })),
    solutions: sections["solutions"] || []
  };
}

// ---- Failures → Failure Map ----
function parseFailure(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const name = path.basename(filePath, ".md");

  const sections = parseMarkdown(content);

  return {
    id: `fail_${name}`,
    component: sections["component"]?.[0] || "unknown",
    symptoms: sections["symptoms"] || [],
    causes: sections["causes"] || [],
    solutions: sections["solutions"] || []
  };
}

// ---- تنفيذ التحويل ----
function run() {
  // Diagnostics
  fs.readdirSync(DIAG_DIR).forEach(file => {
    if (!file.endsWith(".md")) return;

    const json = parseDiagnostic(path.join(DIAG_DIR, file));
    const outPath = path.join(OUT_RULES, file.replace(".md", ".json"));

    fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
    console.log("✔ Rule:", outPath);
  });

  // Failures
  fs.readdirSync(FAIL_DIR).forEach(file => {
    if (!file.endsWith(".md")) return;

    const json = parseFailure(path.join(FAIL_DIR, file));
    const outPath = path.join(OUT_FAIL, file.replace(".md", ".json"));

    fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
    console.log("✔ Failure:", outPath);
  });
}

run();
