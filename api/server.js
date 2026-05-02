"use strict";

const express           = require("express");
const { RuleEngine, ALL_RULES } = require("../engine/rule-engine");
const { DatasetSystem } = require("../dataset/dataset");

const app    = express();
const engine = new RuleEngine(ALL_RULES);
const ds     = new DatasetSystem();

app.use(express.json({ limit: "16kb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const ipHits = {};
app.use("/api", (req, res, next) => {
  const ip  = req.ip;
  const now = Date.now();
  if (!ipHits[ip]) ipHits[ip] = [];
  ipHits[ip] = ipHits[ip].filter(t => now - t < 60000);
  if (ipHits[ip].length >= 60) return res.status(429).json({ error: "Rate limit" });
  ipHits[ip].push(now);
  next();
});

const ok  = (data, meta = {}) => ({ success: true,  ...meta, data });
const err = (code, msg)       => ({ success: false, error: { code, message: msg } });

function validate(body) {
  const { input, voltageHint = "unknown", lang = "en" } = body || {};
  if (!input || typeof input !== "string" || input.trim().length < 2)
    return { error: "Field input is required (string, min 2 chars)" };
  return { input: input.trim(), voltageHint, lang };
}

app.post("/api/v1/diagnose", (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json(err("VALIDATION_ERROR", v.error));
  const result    = engine.diagnose(v.input);
  const datasetId = ds.record(result.trainingData, { voltageHint: v.voltageHint, lang: v.lang });
  res.json(ok(result, { version: "v1", datasetId, timestamp: Date.now() }));
});

app.get("/api/v1/catalog", (req, res) => res.json(ok(engine.catalog(), { version: "v1" })));
app.get("/api/v1/stats",   (req, res) => res.json(ok(ds.stats(),       { version: "v1" })));

const AI_SYSTEM = "You are an EV scooter fault diagnosis assistant for OHO Morocco. Specialize in BMS, MOSFET, Li-ion batteries, BLDC controllers. Prices in MAD. Reply in the same language as the user. Provide: diagnosis, numbered steps, cost estimate. Use WARNING: for safety issues.";

app.post("/api/v2/diagnose", async (req, res) => {
  const v = validate(req.body);
  if (v.error) return res.status(400).json(err("VALIDATION_ERROR", v.error));

  const result    = engine.diagnose(v.input);
  const datasetId = ds.record(result.trainingData, { voltageHint: v.voltageHint, lang: v.lang, source: "v2" });

  if (result.status === "MATCH" && result.confidence > 60)
    return res.json(ok({ ...result, aiEnhanced: false }, { version: "v2", datasetId, source: "rule_engine" }));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey)
    return res.json(ok({ ...result, aiEnhanced: false, fallbackReason: "NO_API_KEY" }, { version: "v2", datasetId }));

  try {
    const ctx   = v.voltageHint !== "unknown" ? " (voltage: " + v.voltageHint + ")" : "";
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method  : "POST",
      headers : { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body    : JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 800,
        system: AI_SYSTEM,
        messages: [{ role: "user", content: v.input + ctx }],
      }),
    });
    const aiData = await aiRes.json();
    const aiText = aiData.content?.[0]?.text || "";
    ds.record({ input: v.input, prediction: "AI_RESPONSE", confidence: 0.9, timestamp: Date.now() }, { source: "claude_ai" });
    return res.json(ok({ ...result, aiEnhanced: true, aiResponse: aiText }, { version: "v2", datasetId, source: "claude_ai" }));
  } catch (e) {
    return res.json(ok({ ...result, aiEnhanced: false, fallbackReason: "AI_ERROR" }, { version: "v2", datasetId }));
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "OHO Morocco API", engineVersion: engine.version,
             uptime: process.uptime(), timestamp: Date.now() });
});

app.use((req, res) => res.status(404).json(err("NOT_FOUND", "No route: " + req.method + " " + req.path)));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("\nOHO Morocco API — http://localhost:" + PORT);
  console.log("  POST /api/v1/diagnose");
  console.log("  POST /api/v2/diagnose");
  console.log("  GET  /api/v1/catalog");
  console.log("  GET  /api/v1/stats");
  console.log("  GET  /health\n");
});

module.exports = app;
