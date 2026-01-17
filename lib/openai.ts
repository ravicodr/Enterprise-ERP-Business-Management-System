import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateProductDescription(productName: string, category: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional product description writer for an ERP system. Write concise, professional product descriptions that highlight key features and benefits."
        },
        {
          role: "user",
          content: `Write a professional product description (2-3 sentences) for: ${productName} in the ${category} category.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'High-quality product for your business needs.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Professional quality product designed for business excellence.';
  }
}

export async function analyzeInventoryTrends(inventoryData: any[]): Promise<string> {
  try {
    const summary = inventoryData.slice(0, 10).map(p => 
      `${p.name}: ${p.currentStock} units (Reorder: ${p.reorderLevel}, Status: ${p.status})`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an inventory management analyst. Provide brief, actionable insights about inventory status and recommend actions."
        },
        {
          role: "user",
          content: `Analyze this inventory data and provide 3 key insights:\n${summary}`
        }
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    return response.choices[0].message.content || 'Inventory levels are within normal range.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Unable to generate inventory insights at this time.';
  }
}

export async function generateOrderSummary(orders: any[]): Promise<string> {
  try {
    const summary = orders.slice(0, 5).map(o => 
      `Order ${o.orderNumber}: $${o.totalAmount} - ${o.status} (${o.items.length} items)`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a business analyst. Provide brief insights about order patterns and business performance."
        },
        {
          role: "user",
          content: `Analyze these recent orders and provide 2-3 key business insights:\n${summary}`
        }
      ],
      max_tokens: 150,
      temperature: 0.5,
    });

    return response.choices[0].message.content || 'Order processing is running smoothly.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Unable to generate order insights at this time.';
  }
}

export async function chatAssistant(userMessage: string, context?: string): Promise<string> {
  try {
    const systemMessage = context 
      ? `You are an ERP assistant helping users with inventory, orders, and business operations. Context: ${context}`
      : "You are an ERP assistant helping users with inventory management, order processing, and business analytics. Keep responses concise and actionable.";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'I apologize, but I cannot process your request at the moment.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'I apologize, but I am unable to respond at this time. Please try again.';
  }
}

export default openai;
