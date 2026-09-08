import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ResolvedLlmConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature?: number | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LlmRequest {
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  /** Overrides the model of the resolved config when set. */
  model?: string;
  /** Resolved provider config (from the model config module). */
  config?: ResolvedLlmConfig | null;
  /** Cancels the in-flight request when the run is cancelled. */
  signal?: AbortSignal;
  /** Image URLs for vision/multimodal requests. */
  imageUrls?: string[];
  /** Prior conversation turns inserted before the current user message. */
  history?: ChatMessage[];
}

export interface LlmUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface LlmResponse {
  text: string;
  model: string;
  mock: boolean;
  usage: LlmUsage;
}

/**
 * OpenAI-compatible chat completion client.
 * Provider resolution order: request.config -> environment -> mock.
 * The mock fallback keeps the whole workflow loop runnable without any key.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly config: ConfigService) {}

  /** Provider config from environment variables, or null when no key is set. */
  private envConfig(): ResolvedLlmConfig | null {
    const apiKey = this.config.get<string>('LLM_API_KEY', '');
    if (!apiKey) return null;
    return {
      apiKey,
      baseUrl: this.config.get<string>('LLM_BASE_URL', 'https://api.openai.com/v1'),
      model: this.config.get<string>('LLM_MODEL', 'gpt-5-mini'),
    };
  }

  async complete(request: LlmRequest): Promise<LlmResponse> {
    const provider =
      request.config && request.config.apiKey ? request.config : this.envConfig();
    const model =
      request.model || provider?.model || this.config.get<string>('LLM_MODEL', 'gpt-5-mini');

    if (!provider) {
      return this.mockComplete(request, model);
    }

    const baseUrl = provider.baseUrl.replace(/\/$/, '');
    const timeout = Number(this.config.get('LLM_TIMEOUT', 120000));
    const temperature = request.temperature ?? provider.temperature ?? 0.7;

    const messages: Array<{ role: string; content: any }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    // Insert prior conversation turns before the current user message.
    if (request.history?.length) {
      for (const turn of request.history) {
        messages.push({ role: turn.role, content: turn.content });
      }
    }
    if (request.imageUrls?.length) {
      const content: any[] = [{ type: 'text', text: request.prompt }];
      for (const url of request.imageUrls) {
        content.push({ type: 'image_url', image_url: { url, detail: 'auto' } });
      }
      messages.push({ role: 'user', content });
    } else {
      messages.push({ role: 'user', content: request.prompt });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    // Cancelling the run must also tear down the provider request.
    const onCancel = () => controller.abort();
    request.signal?.addEventListener('abort', onCancel, { once: true });
    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          ...(request.maxTokens ? { max_tokens: request.maxTokens } : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `provider returned ${response.status} for model "${model}" at ${baseUrl} - ${body.slice(0, 200)}`,
        );
      }

      const data: any = await response.json();
      const text: string = data?.choices?.[0]?.message?.content ?? '';
      const usage: LlmUsage = {
        promptTokens: data?.usage?.prompt_tokens ?? 0,
        completionTokens: data?.usage?.completion_tokens ?? 0,
        totalTokens: data?.usage?.total_tokens ?? 0,
      };
      return { text, model, mock: false, usage };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        if (request.signal?.aborted) {
          throw new Error('LLM request aborted: execution cancelled');
        }
        throw new Error(
          `LLM request timed out after ${timeout}ms (${baseUrl}). The provider did not respond in time; retry later or increase LLM_TIMEOUT in server/.env for slower models such as DeepSeek.`,
        );
      }
      // Network-level failures (DNS, refused connection, invalid host) surface as
      // an opaque "fetch failed"; make the root cause actionable instead.
      const detail = error?.cause?.message ?? error?.message ?? String(error);
      throw new Error(
        `LLM request failed: ${detail}. Check the base URL / API key of the selected model config (${baseUrl}).`,
      );
    } finally {
      clearTimeout(timer);
      request.signal?.removeEventListener('abort', onCancel);
    }
  }

  private mockComplete(request: LlmRequest, model: string): LlmResponse {
    this.logger.warn('No LLM provider configured, returning mock completion');
    const preview = request.prompt.slice(0, 200);
    return {
      text: `[mock] This is a simulated LLM response. Configure a model in Settings or set LLM_API_KEY in server/.env.\n\nReceived prompt: ${preview}`,
      model: `${model} (mock)`,
      mock: true,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}
