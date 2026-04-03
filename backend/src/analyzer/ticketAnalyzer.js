const keywordConfig = require("./keywordConfig");

const categoryRules = [
  { category: "Billing", keywords: keywordConfig.billing },
  { category: "Technical", keywords: keywordConfig.technical },
  { category: "Account", keywords: keywordConfig.account },
  { category: "Feature Request", keywords: keywordConfig.featureRequest }
];

const urgencyRules = {
  high: [...keywordConfig.urgency, "down", "outage", "system failure"],
  medium: ["soon"]
};

const priorityRules = {
  critical: ["down", "outage", "critical", "urgent", "asap", "system failure"],
  high: ["not working", "broken", "error", "failed", "cannot"]
};

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "have",
  "from",
  "your",
  "please",
  "into",
  "when",
  "what",
  "been",
  "cannot",
  "could",
  "would",
  "there",
  "about"
]);

function normalizeMessage(message) {
  return message.toLowerCase();
}

function matchKeywords(text, keywords) {
  return keywords.filter((keyword) => text.includes(keyword));
}

function matchWeightedKeywords(text, keywords) {
  return keywords.filter((keyword) => text.includes(keyword.word));
}

function calculateConfidenceScore(matchedKeywords, categoryKeywords, allCategoryKeywords) {
  const totalKeywords = categoryKeywords.length;
  const totalPossibleWeight = categoryKeywords.reduce((sum, keyword) => sum + keyword.weight, 0);
  const matchedKeywordWeight = matchedKeywords.reduce((sum, keyword) => sum + keyword.weight, 0);

  const exclusiveMatches = matchedKeywords.filter((matchedKeyword) => {
    const categoriesContainingKeyword = allCategoryKeywords.filter((categoryKeywordList) =>
      categoryKeywordList.some((keyword) => keyword.word === matchedKeyword.word)
    );

    return categoriesContainingKeyword.length === 1;
  }).length;

  const matchRatio = totalKeywords ? matchedKeywords.length / totalKeywords : 0;
  const weightScore = totalPossibleWeight ? matchedKeywordWeight / totalPossibleWeight : 0;
  const exclusivityScore = matchedKeywords.length ? exclusiveMatches / matchedKeywords.length : 0;

  const confidence =
    matchRatio * 0.4 +
    weightScore * 0.4 +
    exclusivityScore * 0.2;

  return Number((confidence * 100).toFixed(2));
}

function collectMatches(text, rules) {
  return rules.flatMap((rule) =>
    matchWeightedKeywords(text, rule.keywords).map((keyword) => keyword.word)
  );
}

function detectCategory(text) {
  const allCategoryKeywords = categoryRules.map((rule) => rule.keywords);
  let bestCategory = "Other";
  let bestConfidence = 0;
  let bestMatches = [];

  for (const rule of categoryRules) {
    const matches = matchWeightedKeywords(text, rule.keywords);
    const confidence = calculateConfidenceScore(matches, rule.keywords, allCategoryKeywords);

    if (confidence > bestConfidence) {
      bestCategory = rule.category;
      bestConfidence = confidence;
      bestMatches = matches;
    }
  }

  if (bestConfidence < 25) {
    return { category: "Other", categoryConfidence: bestConfidence, categoryMatches: [] };
  }

  return {
    category: bestCategory,
    categoryConfidence: bestConfidence,
    categoryMatches: bestMatches
  };
}

function detectUrgency(text) {
  const highMatches = matchKeywords(text, urgencyRules.high);
  if (highMatches.length) {
    return { urgency: "high", urgencyMatches: highMatches };
  }

  const mediumMatches = matchKeywords(text, urgencyRules.medium);
  if (mediumMatches.length) {
    return { urgency: "medium", urgencyMatches: mediumMatches };
  }

  return { urgency: "low", urgencyMatches: [] };
}

function detectSecurityIssue(text) {
  const securityMatches = matchKeywords(text, keywordConfig.security);
  return {
    isSecurityIssue: securityMatches.length > 0,
    securityMatches
  };
}

function detectPriority(text, category, urgency) {
  if (detectSecurityIssue(text).isSecurityIssue) {
    return "P0";
  }

  if (text.includes("refund")) {
    return "P0";
  }

  if (matchKeywords(text, priorityRules.critical).length) {
    return "P0";
  }

  const highImpactMatches = matchKeywords(text, priorityRules.high);
  const isTechnicalIncident = category === "Technical" || highImpactMatches.length > 0;

  if (urgency === "high" && isTechnicalIncident) {
    return "P0";
  }

  if (isTechnicalIncident) {
    return "P1";
  }

  if (urgency === "medium") {
    return "P2";
  }

  if (category === "Billing" || category === "Account" || category === "Other") {
    return "P2";
  }

  if (category === "Feature Request") {
    return "P3";
  }

  return "P2";
}

function extractKeywords(text) {
  const matchedTerms = [
    ...collectMatches(text, categoryRules),
    ...matchKeywords(text, urgencyRules.high),
    ...matchKeywords(text, urgencyRules.medium),
    ...matchKeywords(text, priorityRules.high),
    ...matchKeywords(text, priorityRules.critical)
  ];

  const messageTerms = text.match(/[a-z]+/g) || [];

  const usefulTerms = messageTerms.filter(
    (word) => word.length >= 4 && !stopWords.has(word)
  );

  const keywords = Array.from(new Set([...matchedTerms, ...usefulTerms])).slice(0, 8);
  return keywords;
}

function analyzeMessage(message) {
  const text = normalizeMessage(message);
  const { category, categoryConfidence } = detectCategory(text);
  const { urgency, urgencyMatches } = detectUrgency(text);
  const { isSecurityIssue } = detectSecurityIssue(text);
  const priority = detectPriority(text, category, urgency);
  const keywords = extractKeywords(text);

  return {
    category,
    isSecurityIssue,
    urgency,
    priority,
    keywords,
    confidence: categoryConfidence
  };
}

module.exports = {
  analyzeMessage
};
