const fs = require("fs");
const path = require("path");
const analyzer = require("../analyzer/ticketAnalyzer");

const dataFilePath = path.join(__dirname, "..", "data", "tickets.json");

function readTickets() {
  try {
    const raw = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveTickets(tickets) {
  fs.writeFileSync(dataFilePath, JSON.stringify(tickets, null, 2), "utf8");
}

function createTicket(message) {
  const analysis = analyzer.analyzeMessage(message);
  const tickets = readTickets();

  const ticket = {
    id: tickets.length + 1,
    message,
    ...analysis,
    createdAt: new Date().toISOString()
  };

  tickets.unshift(ticket);
  try {
    saveTickets(tickets);
  } catch (error) {
    console.error("Failed to save ticket data:", error);
  }

  return ticket;
}

function getAllTickets() {
  return readTickets();
}

module.exports = {
  createTicket,
  getAllTickets
};
