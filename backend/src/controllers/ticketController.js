const ticketService = require("../services/ticketService");

function analyzeTicket(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "A non-empty message is required." });
    }

    const ticket = ticketService.createTicket(message);
    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

function getTickets(req, res) {
  const tickets = ticketService.getAllTickets();
  return res.json(tickets);
}

module.exports = {
  analyzeTicket,
  getTickets
};
