import { MenuConfig } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.2-90b-vision-preview';

interface AIResponse {
  success: boolean;
  result?: string;
  error?: string;
}

export async function callAI(
  prompt: string,
  systemPrompt: string,
  config: MenuConfig
): Promise<AIResponse> {
  try {
    const apiKey = config.apiKey || getDefaultApiKey(config.apiProvider);

    if (!apiKey) {
      return { success: false, error: 'API key not configured' };
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `API error: ${error}` };
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (result) {
      return { success: true, result };
    }

    return { success: false, error: 'No response from AI' };
  } catch (error) {
    return { success: false, error: `Request failed: ${error}` };
  }
}

function getDefaultApiKey(provider: string): string | undefined {
  // For Groq, we use a demo key (users should configure their own for production)
  if (provider === 'groq') {
    // This is a placeholder - in production, you'd want users to provide their own key
    return undefined;
  }
  return undefined;
}

export function getTranslatePrompt(targetLang: string): string {
  return `You are a professional translator. Translate the following text to ${targetLang}. Only output the translation, nothing else.`;
}

export function getSummarizePrompt(): string {
  return `You are a summarization expert. Summarize the following text in a concise manner, keeping the key points. Use bullet points if appropriate. Output in the same language as the input.`;
}

export function getExplainPrompt(): string {
  return `You are a helpful teacher. Explain the following text in simple terms that anyone can understand. Output in the same language as the input.`;
}

export function getRewritePrompt(): string {
  return `You are a professional editor. Rewrite the following text to make it clearer, more engaging, and well-structured. Keep the same meaning. Output in the same language as the input.`;
}

export function getCodeExplainPrompt(): string {
  return `You are a senior software engineer. Explain the following code in detail, including what it does, how it works, and any important concepts. Output in the same language as the input text (if any) or in English.`;
}

export function getSummarizePagePrompt(): string {
  return `You are a summarization expert. Summarize the following webpage content in a comprehensive but concise manner. Include the main topic, key points, and any important details. Use bullet points for clarity. Output in the same language as the content.`;
}
