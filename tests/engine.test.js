"use strict";

const { RuleEngine, ALL_RULES } = require("../engine/rule-engine");

const engine = new RuleEngine(ALL_RULES);
let passed = 0, failed = 0;

function assert(label, condition) {
  if (condition) { console.log("  PASS  " + label); passed++; }
  else           { console.error("  FAIL  " + label); failed++; }
}

console.log("\n── OHO Morocco Rule Engine Tests v3.1 ────────────────");

const cases = [
  ["motor not spinning and burning smell",       "MOSFET_BURN"      ],
  ["not charging and red led solid",             "BMS_NO_CHARGE"    ],
  ["battery swollen strange smell",              "BATTERY_SWOLLEN"  ],
  ["short range stops on hills",                 "BATTERY_DEAD_CELL"],
  ["cuts when accelerating restarts after pause","BMS_UNDER_LOAD"   ],
  ["unresponsive no movement",                   "CONTROLLER_DEAD"  ],
  ["throttle not responding",                    "THROTTLE_FAILURE" ],
  ["flickering lights random shutdowns",         "WIRING_LOOSE"     ],
  ["water damage after rain",                    "WATER_DAMAGE"     ],
  ["charger gets hot and stops",                 "CHARGER_FAULT"    ],
  ["grinding noise motor",                       "MOTOR_NOISE"      ],
  ["limited to 6 walk mode",                     "WALK_MODE"        ],
];

console.log("\nDiagnosis accuracy (" + cases.length + " cases):");
for (const [input, expect] of cases) {
  const r = engine.diagnose(input);
  assert(expect, r.status === "MATCH" && r.results[0]?.id === expect);
}

console.log("\nSafety warnings:");
const sw = engine.diagnose("battery swollen strange smell");
assert("BATTERY_SWOLLEN has FIRE_RISK", sw.results[0]?.warning === "FIRE_RISK");

console.log("\nEdge cases:");
assert("Unknown input → NO_MATCH", engine.diagnose("the sky is blue").status === "NO_MATCH");
assert("Empty input   → ERROR",    engine.diagnose("").status === "ERROR");
assert("Confidence 0-99",          engine.diagnose("burning smell").confidence <= 99);

console.log("\nCatalog:");
const cat = engine.catalog();
assert("Catalog has 12 rules", cat.length === 12);

console.log("\n── Results: " + passed + " passed, " + failed + " failed ──────────\n");
if (failed > 0) process.exit(1);
