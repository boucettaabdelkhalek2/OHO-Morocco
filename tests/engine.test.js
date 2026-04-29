"use strict";
const { RuleEngine } = require("../engine/rule-engine");
const engine = new RuleEngine();
let passed = 0, failed = 0;
function assert(label, condition) {
  if (condition) { console.log(`  PASS  ${label}`); passed++; }
  else           { console.error(`  FAIL  ${label}`); failed++; }
}
console.log("\n── OHO Morocco Rule Engine Tests ─────────────────────");
const cases = [
  { input: "motor not spinning and burning smell",       expect: "MOSFET_BURN"       },
  { input: "not charging and red led solid",             expect: "BMS_NO_CHARGE"     },
  { input: "battery swollen strange smell",              expect: "BATTERY_SWOLLEN"   },
  { input: "short range stops on hills",                 expect: "BATTERY_DEAD_CELL" },
  { input: "cuts when accelerating restarts after pause",expect: "BMS_UNDER_LOAD"    },
  { input: "unresponsive no movement",                   expect: "CONTROLLER_DEAD"   },
];
console.log("\nDiagnosis accuracy:");
for (const c of cases) {
  const r = engine.diagnose(c.input);
  assert(c.expect, r.status === "MATCH" && r.results[0]?.id === c.expect);
}
console.log("\nSafety warnings:");
const sw = engine.diagnose("battery swollen strange smell");
assert("BATTERY_SWOLLEN has FIRE_RISK", sw.results[0]?.warning === "FIRE_RISK");
console.log("\nEdge cases:");
assert("Unknown → NO_MATCH", engine.diagnose("the sky is blue").status === "NO_MATCH");
assert("Empty   → ERROR",    engine.diagnose("").status === "ERROR");
const conf = engine.diagnose("burning smell").confidence;
assert("Confidence 0-99",    conf >= 0 && conf <= 99);
const cat = engine.catalog();
assert("Catalog has 6 rules", cat.length === 6);
console.log(`\n── Results: ${passed} passed, ${failed} failed ──────────────────\n`);
if (failed > 0) process.exit(1);
