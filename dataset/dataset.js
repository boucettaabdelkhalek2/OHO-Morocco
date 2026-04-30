"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname);
const RECORDS_FILE = path.join(DATA_DIR, "training.jsonl");
const STATS_FILE = path.join(DATA_DIR, "stats.json");

class DatasetSystem {
  constructor() {
    if (!fs.existsSync(STATS_FILE)) this._resetStats();
  }

  record(entry, meta = {}) {
    const safeEntry = entry && typeof entry === "object" ? entry : {};
    const record = {
      ...safeEntry,
      meta,
      id: `oho_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    };

    fs.appendFileSync(RECORDS_FILE, `${JSON.stringify(record)}\n`, "utf8");
    this._updateStats(record);
    return record.id;
  }

  readAll() {
    if (!fs.existsSync(RECORDS_FILE)) return [];
    return fs
      .readFileSync(RECORDS_FILE, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  }

  stats() {
    if (!fs.existsSync(STATS_FILE)) return this._resetStats();
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  }

  _updateStats(record) {
    const stats = this.stats();
    const prediction = record.prediction || "UNKNOWN";
    const confidence = Number(record.confidence);

    stats.total += 1;
    stats.byPrediction[prediction] = (stats.byPrediction[prediction] || 0) + 1;
    stats.avgConfidence =
      ((stats.avgConfidence * (stats.total - 1)) + (Number.isFinite(confidence) ? confidence : 0)) /
      stats.total;
    stats.lastUpdated = Date.now();

    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf8");
  }

  _resetStats() {
    const stats = { total: 0, byPrediction: {}, avgConfidence: 0, lastUpdated: Date.now() };
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf8");
    return stats;
  }
}

module.exports = { DatasetSystem, RECORDS_FILE, STATS_FILE };
