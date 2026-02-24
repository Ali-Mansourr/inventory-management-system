import Groq from "groq-sdk";

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
  });
}

export async function chatWithAI(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || "No response generated.";
}

export async function getInventoryInsights(
  inventoryData: string
): Promise<string> {
  const systemPrompt = `You are an inventory management AI assistant. Analyze the provided inventory data and give actionable insights. Focus on:
1. Items that need restocking (below minimum stock threshold)
2. Potential overstock situations
3. Category-level trends
4. Cost optimization suggestions
Keep responses concise, practical, and formatted with bullet points.`;

  return chatWithAI(systemPrompt, inventoryData);
}

export async function getRestockSuggestions(
  inventoryData: string
): Promise<string> {
  const systemPrompt = `You are an inventory restocking advisor. Based on the inventory data provided, generate a prioritized restocking list. For each item:
- Item name and current stock level
- Recommended reorder quantity
- Priority level (Critical/High/Medium/Low)
- Brief reasoning
Format as a clear, actionable list sorted by priority.`;

  return chatWithAI(systemPrompt, inventoryData);
}

export async function answerInventoryQuestion(
  question: string,
  inventoryContext: string
): Promise<string> {
  const systemPrompt = `You are a helpful inventory management assistant. You have access to the following inventory data. Answer the user's question based on this data. Be concise and helpful. If you can't answer from the data, say so.

INVENTORY DATA:
${inventoryContext}`;

  return chatWithAI(systemPrompt, question);
}
