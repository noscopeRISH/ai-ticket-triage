const express = require("express");
const ticketController = require("../controllers/ticketController");

const router = express.Router();

router.post("/analyze", ticketController.analyzeTicket);
router.get("/", ticketController.getTickets);

module.exports = router;
