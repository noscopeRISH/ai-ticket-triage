const ticketService = require("../services/ticketService");

async function analyzeTicket(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "A non-empty message is required." });
    }

    const ticket = await ticketService.createTicket(message);
    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getTickets(req, res) {
  try {
    const tickets = await ticketService.getAllTickets();
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  analyzeTicket,
  getTickets
};
