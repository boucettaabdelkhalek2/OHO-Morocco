"use strict";

const { Pool } = require("pg");

class PostgresDatasetSystem {
  constructor(connectionString) {
    this.pool = new Pool({ connectionString });
    this.ready = this._init();
  }

  async _init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS training_records (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS training_stats (
        id INT PRIMARY KEY DEFAULT 1,
        total BIGINT NOT NULL DEFAULT 0,
        by_prediction JSONB NOT NULL DEFAULT '{}'::jsonb,
        avg_confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
        last_updated BIGINT NOT NULL DEFAULT 0,
        CONSTRAINT singleton CHECK (id = 1)
      );
    `);

    await this.pool.query(`
      INSERT INTO training_stats (id, total, by_prediction, avg_confidence, last_updated)
      VALUES (1, 0, '{}'::jsonb, 0, $1)
      ON CONFLICT (id) DO NOTHING;
    `, [Date.now()]);
  }

  async record(entry, meta = {}) {
    await this.ready;

    const safeEntry = entry && typeof entry === "object" ? entry : {};
    const id = `oho_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const record = { ...safeEntry, meta, id };

    await this.pool.query("INSERT INTO training_records (id, payload) VALUES ($1, $2::jsonb)", [id, JSON.stringify(record)]);

    const prediction = record.prediction || "UNKNOWN";
    const confidence = Number(record.confidence);

    await this.pool.query(
      `
      UPDATE training_stats
      SET
        total = total + 1,
        by_prediction = jsonb_set(
          by_prediction,
          ARRAY[$1],
          to_jsonb(COALESCE((by_prediction ->> $1)::int, 0) + 1),
          true
        ),
        avg_confidence = ((avg_confidence * total) + $2) / (total + 1),
        last_updated = $3
      WHERE id = 1
      `,
      [prediction, Number.isFinite(confidence) ? confidence : 0, Date.now()]
    );

    return id;
  }

  async readAll(limit = 1000) {
    await this.ready;
    const { rows } = await this.pool.query(
      "SELECT payload FROM training_records ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    return rows.map((row) => row.payload);
  }

  async stats() {
    await this.ready;
    const { rows } = await this.pool.query(
      "SELECT total, by_prediction, avg_confidence, last_updated FROM training_stats WHERE id = 1"
    );
    if (!rows[0]) return { total: 0, byPrediction: {}, avgConfidence: 0, lastUpdated: Date.now() };

    return {
      total: Number(rows[0].total || 0),
      byPrediction: rows[0].by_prediction || {},
      avgConfidence: Number(rows[0].avg_confidence || 0),
      lastUpdated: Number(rows[0].last_updated || 0),
    };
  }
}

module.exports = { PostgresDatasetSystem };
