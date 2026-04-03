const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const analyzer = require("../analyzer/ticketAnalyzer");

const dbFilePath = path.join(__dirname, "..", "data", "tickets.db");
const db = new sqlite3.Database(dbFilePath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      category TEXT NOT NULL,
      isSecurityIssue INTEGER DEFAULT 0,
      urgency TEXT NOT NULL,
      priority TEXT NOT NULL,
      keywords TEXT NOT NULL,
      confidence REAL NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
});

function run(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve(this);
    });
  });
}

function all(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function createTicket(message) {
  const analysis = analyzer.analyzeMessage(message);
  const ticket = {
    message,
    ...analysis,
    createdAt: new Date().toISOString()
  };

  try {
    const result = await run(
      `
        INSERT INTO tickets (
          message,
          category,
          isSecurityIssue,
          urgency,
          priority,
          keywords,
          confidence,
          createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        ticket.message,
        ticket.category,
        ticket.isSecurityIssue ? 1 : 0,
        ticket.urgency,
        ticket.priority,
        JSON.stringify(ticket.keywords),
        ticket.confidence,
        ticket.createdAt
      ]
    );

    return {
      id: result.lastID,
      ...ticket
    };
  } catch (error) {
    console.error("Failed to save ticket data:", error);
    return {
      id: null,
      ...ticket
    };
  }
}

async function getAllTickets() {
  const rows = await all(
    "SELECT * FROM tickets ORDER BY datetime(createdAt) DESC, id DESC"
  );

  return rows.map((row) => ({
    id: row.id,
    message: row.message,
    category: row.category,
    isSecurityIssue: Boolean(row.isSecurityIssue),
    urgency: row.urgency,
    priority: row.priority,
    keywords: JSON.parse(row.keywords),
    confidence: row.confidence,
    createdAt: row.createdAt
  }));
}

module.exports = {
  createTicket,
  getAllTickets
};
