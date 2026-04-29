"use strict";

const SEVERITY = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

const RULES = [
  {
    id: "MOSFET_BURN", component: "MOSFET", severity: SEVERITY.HIGH,
    symptoms: [
      { keyword: "burning smell",      weight: 0.90 },
      { keyword: "motor not spinning", weight: 0.80 },
      { keyword: "clicking sound",     weight: 0.50 },
      { keyword: "led blinking fast",  weight: 0.40 },
    ],
    solution: {
      ar: "قِس مقاومة MOSFET (يجب > 1MΩ). إذا 0 → مقصور. استبدل IRF3205 أو HY3008.",
      fr: "Mesurer resistance MOSFET (> 1MΩ). Si 0 → court-circuit. Remplacer IRF3205.",
      en: "Measure MOSFET resistance (> 1MΩ). Near 0 → shorted. Replace IRF3205 or HY3008.",
    },
    cost: { min: 40, max: 80 }, timeMin: 60, difficulty: 4, warning: null,
  },
  {
    id: "BMS_NO_CHARGE", component: "BMS", severity: SEVERITY.HIGH,
    symptoms: [
      { keyword: "not charging",  weight: 0.85 },
      { keyword: "red led solid", weight: 0.80 },
      { keyword: "overheating",   weight: 0.60 },
    ],
    solution: {
      ar: "1. تحقق جهد البطارية (>30V).\n2. افحص مكثفات BMS.\n3. اختبر MOSFET القوة.",
      fr: "1. Verifier tension (>30V).\n2. Inspecter condensateurs BMS.\n3. Tester MOSFET.",
      en: "1. Check battery voltage (>30V).\n2. Inspect BMS capacitors.\n3. Test power MOSFET.",
    },
    cost: { min: 80, max: 150 }, timeMin: 90, difficulty: 3, warning: null,
  },
  {
    id: "BATTERY_SWOLLEN", component: "Battery", severity: SEVERITY.CRITICAL,
    symptoms: [
      { keyword: "swollen",       weight: 0.95 },
      { keyword: "bulging",       weight: 0.90 },
      { keyword: "strange smell", weight: 0.70 },
    ],
    solution: {
      ar: "⚠️ خطر فوري: افصل البطارية الآن. لا تشحن أبداً. استبدال كامل.",
      fr: "⚠️ DANGER: Deconnecter immediatement. Ne JAMAIS recharger. Remplacement total.",
      en: "WARNING: Disconnect now. Store outdoors. NEVER charge again. Full replacement required.",
    },
    cost: { min: 300, max: 800 }, timeMin: 15, difficulty: 1, warning: "FIRE_RISK",
  },
  {
    id: "BATTERY_DEAD_CELL", component: "Battery", severity: SEVERITY.MEDIUM,
    symptoms: [
      { keyword: "short range",    weight: 0.80 },
      { keyword: "stops on hills", weight: 0.75 },
      { keyword: "fast charge",    weight: 0.55 },
    ],
    solution: {
      ar: "قِس كل خلية: < 3.0V → ميتة تُستبدل. < 3.5V → ضعيفة.",
      fr: "Mesurer chaque cellule: < 3.0V → morte. < 3.5V → faible.",
      en: "Measure each cell: < 3.0V → dead, replace. < 3.5V → weak, monitor.",
    },
    cost: { min: 200, max: 600 }, timeMin: 120, difficulty: 2, warning: null,
  },
  {
    id: "BMS_UNDER_LOAD", component: "BMS", severity: SEVERITY.MEDIUM,
    symptoms: [
      { keyword: "cuts when accelerating", weight: 0.80 },
      { keyword: "restarts after pause",   weight: 0.65 },
      { keyword: "fine at low speed",      weight: 0.50 },
    ],
    solution: {
      ar: "اضبط حد تيار BMS. إذا استمر → استبدل MOSFET القوة.",
      fr: "Ajuster seuil surintensité BMS. Si persistant → remplacer MOSFET.",
      en: "Adjust BMS overcurrent threshold. If persists → replace BMS power MOSFET.",
    },
    cost: { min: 0, max: 120 }, timeMin: 45, difficulty: 3, warning: null,
  },
  {
    id: "CONTROLLER_DEAD", component: "Controller", severity: SEVERITY.HIGH,
    symptoms: [
      { keyword: "unresponsive",      weight: 0.85 },
      { keyword: "no movement",       weight: 0.80 },
      { keyword: "silent on startup", weight: 0.60 },
    ],
    solution: {
      ar: "قِس 5V داخل الكنترولر. غائب → PSU تالف. موجود → افحص throttle.",
      fr: "Mesurer 5V interne. Absent → PSU defaillant. Present → verifier accelerateur.",
      en: "Measure internal 5V. Absent → PSU failed. Present → check throttle signal.",
    },
    cost: { min: 150, max: 400 }, timeMin: 30, difficulty: 3, warning: null,
  },
];

class RuleEngine {
  constructor(rules = RULES) {
    this.rules   = rules;
    this.version = "3.0.0";
  }

  diagnose(input) {
    if (!input || typeof input !== "string" || input.trim().length < 2) {
      return { status: "ERROR", message: "Input must be a non-empty string (min 2 chars)" };
    }
    const text   = input.trim().toLowerCase();
    const scored = this._scoreAll(text).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return { status: "NO_MATCH", confidence: 0, results: [],
               timestamp: Date.now(), engineVersion: this.version,
               trainingData: this._training(input, null, 0) };
    }

    const top       = scored[0];
    const ambiguous = scored.length > 1 && (scored[1].score / top.score) > 0.85;
    const selected  = ambiguous ? scored.slice(0, 2) : [top];

    return {
      status: "MATCH", confidence: top.confidence, ambiguous,
      results: selected.map(m => this._format(m)),
      timestamp: Date.now(), engineVersion: this.version,
      trainingData: this._training(input, top.rule.id, top.confidence),
    };
  }

  _scoreAll(text) {
    return this.rules.map(rule => {
      let raw = 0, hits = 0;
      const max = rule.symptoms.reduce(
        (s, sym) => s + sym.weight * (rule.severity / SEVERITY.CRITICAL), 0
      );
      for (const sym of rule.symptoms) {
        if (text.includes(sym.keyword)) { raw += sym.weight * (rule.severity / SEVERITY.CRITICAL); hits++; }
      }
      const score      = max > 0 ? raw / max : 0;
      const confidence = Math.min(Math.round(score * 100), 99);
      return { rule, score, confidence, hits };
    });
  }

  _format({ rule, confidence, hits }) {
    return {
      id: rule.id, component: rule.component,
      severity: Object.keys(SEVERITY).find(k => SEVERITY[k] === rule.severity),
      confidence, hits, solution: rule.solution,
      cost: rule.cost, timeMin: rule.timeMin, difficulty: rule.difficulty, warning: rule.warning,
    };
  }

  _training(input, prediction, confidence) {
    return { input, prediction: prediction || "UNKNOWN",
             confidence: confidence / 100, timestamp: Date.now(), engineVersion: this.version };
  }

  catalog() {
    return this.rules.map(r => ({
      id: r.id, component: r.component,
      severity: Object.keys(SEVERITY).find(k => SEVERITY[k] === r.severity),
      symptomCount: r.symptoms.length,
    }));
  }
}

module.exports = { RuleEngine, RULES, SEVERITY };
