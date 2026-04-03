const form = document.getElementById("ticket-form");
const messageInput = document.getElementById("message");
const statusText = document.getElementById("status");
const resultCard = document.getElementById("result");
const refreshButton = document.getElementById("refresh-button");
const ticketList = document.getElementById("ticket-list");
const submitButton = form.querySelector('button[type="submit"]');

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#9a1e1e" : "";
}

function showResult(ticket) {
  const urgency = ticket.urgency || ticket.urgency_level || "low";

  document.getElementById("result-category").textContent = ticket.category;
  const urgencyElement = document.getElementById("result-urgency");
  urgencyElement.textContent = urgency;
  urgencyElement.className = `urgency urgency-${urgency}`;
  document.getElementById("result-priority").textContent = ticket.priority;
  document.getElementById("result-confidence").textContent = ticket.confidence;
  document.getElementById("result-keywords").textContent = ticket.keywords.join(", ") || "None";
  resultCard.classList.remove("hidden");
}

function clearResult() {
  resultCard.classList.add("hidden");
  document.getElementById("result-category").textContent = "";
  document.getElementById("result-urgency").textContent = "";
  document.getElementById("result-urgency").className = "";
  document.getElementById("result-priority").textContent = "";
  document.getElementById("result-confidence").textContent = "";
  document.getElementById("result-keywords").textContent = "";
}

function createTicketCard(ticket) {
  const article = document.createElement("article");
  article.className = "ticket-card";

  article.innerHTML = `
    <div class="ticket-meta">
      <span class="pill">${ticket.category}</span>
      <span class="pill urgency-pill urgency-${ticket.urgency || "low"}">Urgency: ${ticket.urgency || "low"}</span>
      <span class="pill">${ticket.priority}</span>
      <span class="pill">Confidence: ${ticket.confidence}</span>
    </div>
    <p class="ticket-message">${ticket.message}</p>
    <p><strong>Keywords:</strong> ${ticket.keywords.join(", ") || "None"}</p>
    <p class="ticket-time">${new Date(ticket.createdAt).toLocaleString()}</p>
  `;

  return article;
}

async function loadTickets() {
  try {
    const response = await fetch("/tickets/", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load tickets: ${response.status}`);
    }

    const tickets = await response.json();

    ticketList.innerHTML = "";

    if (!tickets.length) {
      ticketList.innerHTML = "<p class='ticket-message'>No tickets analyzed yet.</p>";
      return;
    }

    tickets.forEach((ticket) => {
      ticketList.appendChild(createTicketCard(ticket));
    });
  } catch (error) {
    console.log("Ticket list load failed", error);
    setStatus("Unable to load tickets right now.", true);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const trimmedMessage = messageInput.value.trim();

  if (!trimmedMessage) {
    clearResult();
    setStatus("Message cannot be empty. Please describe your issue.", true);
    return;
  }

  if (trimmedMessage.length < 10) {
    clearResult();
    setStatus("Please provide more details about your issue.", true);
    return;
  }

  console.log("Ticket submit: loading state triggered");
  setStatus("Loading...");
  submitButton.disabled = true;

  try {
    if (!navigator.onLine) {
      throw new Error("Unable to analyze ticket. Check your connection.");
    }

    const response = await fetch("/tickets/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: trimmedMessage })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error("Server error, please try again");
      }

      throw new Error(data.error || "Request failed");
    }

    showResult(data);
    setStatus("Ticket analyzed successfully.");
    form.reset();
    await loadTickets();
  } catch (error) {
    console.log("Ticket submit: error caught", error);
    clearResult();
    setStatus(error.message || "Something went wrong.", true);
  } finally {
    submitButton.disabled = false;
  }
});

refreshButton.addEventListener("click", loadTickets);

loadTickets();
