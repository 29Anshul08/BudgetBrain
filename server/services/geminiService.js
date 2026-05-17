const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Helper to parse JSON from Gemini response
const parseAIResponse = (text) => {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

// Format transactions for AI context
const formatTransactionsForAI = (transactions, currency = 'INR') => {
  return transactions.map((t) => ({
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date.toISOString().split('T')[0],
  }));
};

/**
 * Analyze spending patterns and provide insights
 */
exports.analyzeSpending = async (transactions, currency = 'INR') => {
  const data = formatTransactionsForAI(transactions, currency);

  const prompt = `You are a financial analyst AI. Analyze this spending data and return a JSON response.

Transaction Data (${currency}):
${JSON.stringify(data, null, 2)}

Return a JSON object with this exact structure:
{
  "insights": [
    "insight 1 about spending patterns",
    "insight 2 about category trends",
    "insight 3 about saving opportunities"
  ],
  "suggestions": [
    "actionable suggestion 1",
    "actionable suggestion 2",
    "actionable suggestion 3"
  ],
  "topCategories": [
    {"category": "name", "amount": 0, "trend": "up/down/stable"}
  ],
  "savingsPotential": "estimated amount that could be saved",
  "healthTip": "one key financial health tip"
}

Be specific with numbers. Keep insights concise (1-2 sentences each). Use ${currency} for amounts.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseAIResponse(text);
  } catch (error) {
    console.error('Gemini analyzeSpending error:', error.message);
    return {
      insights: ['Unable to generate AI insights at this time. Please check your API key.'],
      suggestions: ['Try again later or add more transaction data.'],
      topCategories: [],
      savingsPotential: 'N/A',
      healthTip: 'Track your expenses consistently for better insights.',
    };
  }
};

/**
 * Generate personalized budget plan
 */
exports.generateBudgetPlan = async (transactions, currentBudgets, user) => {
  const data = formatTransactionsForAI(transactions, user.currency);
  const budgetData = currentBudgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: b.spent,
  }));

  const prompt = `You are a financial planning AI. Based on the user's transaction history and current budgets, create an optimized budget plan.

User Info:
- Currency: ${user.currency}
- Monthly Income: ${user.monthlyIncome || 'Not specified'}

Transaction History (last 3 months):
${JSON.stringify(data, null, 2)}

Current Budgets:
${JSON.stringify(budgetData, null, 2)}

Return a JSON object with this exact structure:
{
  "recommendedBudgets": [
    {"category": "name", "suggestedLimit": 0, "reason": "why this amount"}
  ],
  "savingsGoal": {
    "monthly": 0,
    "strategy": "how to achieve this"
  },
  "warnings": ["any financial warnings"],
  "optimizations": ["specific budget optimization tips"],
  "monthlyPlan": {
    "needs": 0,
    "wants": 0,
    "savings": 0,
    "ratio": "50/30/20 or adjusted ratio"
  }
}

Use ${user.currency} for all amounts. Be practical and specific.`;

  try {
    const result = await model.generateContent(prompt);
    return parseAIResponse(result.response.text());
  } catch (error) {
    console.error('Gemini generateBudgetPlan error:', error.message);
    return {
      recommendedBudgets: [],
      savingsGoal: { monthly: 0, strategy: 'Set up automatic savings transfers.' },
      warnings: ['AI budget planning is temporarily unavailable.'],
      optimizations: ['Review your spending manually for now.'],
      monthlyPlan: { needs: 0, wants: 0, savings: 0, ratio: '50/30/20' },
    };
  }
};

/**
 * Chat with AI financial advisor
 */
exports.chatWithAI = async (message, transactions, budgets, user, conversationContext = []) => {
  const data = formatTransactionsForAI(transactions, user.currency);
  const budgetData = budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: b.spent,
    percentSpent: b.percentSpent,
  }));

  const contextMessages = conversationContext.map((c) => 
    `${c.role === 'user' ? 'User' : 'Assistant'}: ${c.content}`
  ).join('\n');

  const prompt = `You are BudgetBrain AI — a friendly, knowledgeable financial advisor chatbot. You help users understand their finances, give budgeting advice, explain spending habits, suggest investment basics, and help save money.

User Context:
- Name: ${user.name}
- Currency: ${user.currency}
- Monthly Income: ${user.monthlyIncome || 'Not specified'}

This month's transactions summary:
${JSON.stringify(data.slice(0, 15), null, 2)}

Current budgets:
${JSON.stringify(budgetData, null, 2)}

${contextMessages ? `Conversation history:\n${contextMessages}\n` : ''}

User message: "${message}"

Respond naturally and helpfully. Be concise (2-4 sentences for simple questions, more for complex ones). Use specific numbers from their data when relevant. If the question is not finance-related, gently redirect to financial topics. Format your response as a JSON object:

{
  "reply": "your helpful response here",
  "suggestions": ["follow-up question 1", "follow-up question 2"],
  "actionItems": ["any specific action the user should take"]
}`;

  try {
    const result = await model.generateContent(prompt);
    return parseAIResponse(result.response.text());
  } catch (error) {
    console.error('Gemini chat error:', error.message);
    return {
      reply: "I'm having trouble connecting right now. Please try again in a moment!",
      suggestions: ['How can I save more?', 'What are my biggest expenses?'],
      actionItems: [],
    };
  }
};

/**
 * Generate monthly financial report
 */
exports.generateMonthlyReport = async (transactions, budgets, user, month, year) => {
  const data = formatTransactionsForAI(transactions, user.currency);
  const budgetData = budgets.map((b) => ({
    category: b.category,
    limit: b.limit,
    spent: b.spent,
  }));

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const prompt = `You are a financial report generator. Create a comprehensive monthly financial report.

Report for: ${monthNames[month]} ${year}
Currency: ${user.currency}

Transactions:
${JSON.stringify(data, null, 2)}

Budgets:
${JSON.stringify(budgetData, null, 2)}

Return a JSON object:
{
  "summary": "2-3 sentence executive summary",
  "totalIncome": 0,
  "totalExpenses": 0,
  "netSavings": 0,
  "topExpenseCategories": [{"category": "name", "amount": 0, "percentage": 0}],
  "budgetPerformance": "overall assessment",
  "highlights": ["positive highlights"],
  "concerns": ["areas of concern"],
  "recommendations": ["specific recommendations for next month"],
  "grade": "A/B/C/D/F financial grade",
  "gradeExplanation": "why this grade"
}

Use ${user.currency} for amounts. Be data-driven and specific.`;

  try {
    const result = await model.generateContent(prompt);
    return parseAIResponse(result.response.text());
  } catch (error) {
    console.error('Gemini monthlyReport error:', error.message);
    return {
      summary: 'Report generation temporarily unavailable.',
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      topExpenseCategories: [],
      budgetPerformance: 'N/A',
      highlights: [],
      concerns: [],
      recommendations: ['Please try again later.'],
      grade: 'N/A',
      gradeExplanation: 'Unable to generate report.',
    };
  }
};

/**
 * Predict future spending patterns
 */
exports.predictSpending = async (transactions, currency = 'INR') => {
  const data = formatTransactionsForAI(transactions, currency);

  const prompt = `You are a financial prediction AI. Based on 6 months of transaction history, predict future spending patterns.

Transaction History (${currency}):
${JSON.stringify(data, null, 2)}

Return a JSON object:
{
  "nextMonthPrediction": {
    "totalExpected": 0,
    "categoryPredictions": [{"category": "name", "predicted": 0, "confidence": "high/medium/low"}]
  },
  "trends": ["identified spending trends"],
  "risks": ["potential financial risks ahead"],
  "opportunities": ["savings opportunities identified"],
  "seasonalPatterns": ["any seasonal spending patterns noticed"]
}

Use ${currency} for amounts. Base predictions on actual data patterns.`;

  try {
    const result = await model.generateContent(prompt);
    return parseAIResponse(result.response.text());
  } catch (error) {
    console.error('Gemini predictSpending error:', error.message);
    return {
      nextMonthPrediction: { totalExpected: 0, categoryPredictions: [] },
      trends: ['Add more transaction data for predictions.'],
      risks: [],
      opportunities: [],
      seasonalPatterns: [],
    };
  }
};

/**
 * Detect unusual/anomalous expenses
 */
exports.detectAnomalies = async (transactions, currency = 'INR') => {
  const data = formatTransactionsForAI(transactions, currency);

  const prompt = `You are a fraud detection and anomaly analysis AI. Analyze these expenses for unusual patterns.

Expense Data (${currency}):
${JSON.stringify(data, null, 2)}

Return a JSON object:
{
  "anomalies": [
    {
      "description": "what seems unusual",
      "amount": 0,
      "category": "category",
      "date": "date",
      "severity": "high/medium/low",
      "explanation": "why this is unusual"
    }
  ],
  "patterns": ["unusual spending patterns detected"],
  "recommendations": ["what to do about these anomalies"]
}

Only flag genuinely unusual expenses (e.g., significantly higher than average for that category, unexpected categories, unusual timing). Use ${currency} for amounts.`;

  try {
    const result = await model.generateContent(prompt);
    return parseAIResponse(result.response.text());
  } catch (error) {
    console.error('Gemini detectAnomalies error:', error.message);
    return {
      anomalies: [],
      patterns: ['Anomaly detection temporarily unavailable.'],
      recommendations: ['Review your expenses manually.'],
    };
  }
};

/**
 * Get financial advice on a specific topic
 */
exports.getFinancialAdvice = async (topic, userContext) => {
  const prompt = `You are a certified financial advisor AI. Provide expert advice on: "${topic}"

User context: ${JSON.stringify(userContext)}

Return a JSON object:
{
  "advice": "detailed advice",
  "steps": ["step-by-step action items"],
  "resources": ["helpful resources or tools"],
  "caution": "any warnings or caveats"
}

Be practical, specific, and actionable.`;

  try {
    const result = await model.generateContent(prompt);
    return parseAIResponse(result.response.text());
  } catch (error) {
    console.error('Gemini getFinancialAdvice error:', error.message);
    return {
      advice: 'Financial advice is temporarily unavailable.',
      steps: ['Please try again later.'],
      resources: [],
      caution: '',
    };
  }
};
