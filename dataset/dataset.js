"use strict";
const fs   = require("fs");
const path = require("path");
const DATA_DIR    = path.resolve(__dirname);
const RECORDS_FILE= path.join(DATA_DIR, "training.jsonl");
const STATS_FILE  = path.join(DATA_DIR, "stats.json");
class DatasetSystem {
  constructor() {
    if (!fs.existsSync(STATS_FILE)) this._resetStats();
  }
  record(entry, meta = {}) {
    const record = { ...entry, meta, id: `oho_${Date.now()}_${Math.random().toString(36).slice(2,7)}` };
    fs.appendFileSync(RECORDS_FILE, JSON.stringify(record) + "\n", "utf8");
    this._updateStats(record);
    return record.id;
  }
  readAll() {
    if (!fs.existsSync(RECORDS_FILE)) return [];
    return fs.readFileSync(RECORDS_FILE, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
  }
  stats() {
    if (!fs.existsSync(STATS_FILE)) return this._resetStats();
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  }
  _updateStats(r) {
    const s = this.stats();
    s.total++;
    s.byPrediction[r.prediction] = (s.byPrediction[r.prediction] || 0) + 1;
    s.avgConfidence = ((s.avgConfidence * (s.total - 1)) + (r.confidence || 0)) / s.total;
    s.lastUpdated   = Date.now();
    fs.writeFileSync(STATS_FILE, JSON.stringify(s, null, 2), "utf8");
  }
  _resetStats() {
    const s = { total: 0, byPrediction: {}, avgConfidence: 0, lastUpdated: Date.now() };
    fs.writeFileSync(STATS_FILE, JSON.stringify(s, null, 2), "utf8");
    return s;
  }
}
module.exports = { DatasetSystem };
