module.exports = {
  billing: [
    { word: "payment", weight: 2 },
    { word: "refund", weight: 3 },
    { word: "invoice", weight: 2 },
    { word: "charge", weight: 2 },
    { word: "billing", weight: 2 },
    { word: "subscription", weight: 2 },
    { word: "transaction", weight: 2 }
  ],
  technical: [
    { word: "error", weight: 2 },
    { word: "bug", weight: 2 },
    { word: "crash", weight: 3 },
    { word: "failure", weight: 2 },
    { word: "issue", weight: 1 },
    { word: "not working", weight: 3 },
    { word: "broken", weight: 2 },
    { word: "down", weight: 3 },
    { word: "slow", weight: 1 }
  ],
  account: [
    { word: "login", weight: 2 },
    { word: "password", weight: 2 },
    { word: "account", weight: 1 },
    { word: "signup", weight: 1 },
    { word: "username", weight: 1 },
    { word: "access", weight: 2 },
    { word: "locked", weight: 3 },
    { word: "reset", weight: 2 }
  ],
  featureRequest: [
    { word: "feature", weight: 2 },
    { word: "request", weight: 1 },
    { word: "suggestion", weight: 2 },
    { word: "improve", weight: 2 },
    { word: "add", weight: 1 },
    { word: "enhancement", weight: 2 },
    { word: "would like", weight: 3 }
  ],
  urgency: ["urgent", "asap", "immediately", "critical", "priority"],
  security: ["hacked", "unauthorized", "breach", "stolen", "compromised", "fraud"]
};
