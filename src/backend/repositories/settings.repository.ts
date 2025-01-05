import { Injectable } from "injection-js";
import { getContext } from "../../extension";
import { LlmServiceEnum } from "../types/llm-service.enum";
import { StorageKeysEnum } from "../types/storage-keys.enum";

@Injectable()
export class SettingsRepository {
  async getLLMApiKeys(): Promise<Record<LlmServiceEnum, string[]> | undefined> {
    try {
      const llmApiKeys = getContext().workspaceState.get<string>(
        StorageKeysEnum.LlmApiKeys
      );

      return llmApiKeys ? JSON.parse(llmApiKeys) : {};
    } catch (error) {
      console.error("Error retrieving LLM API keys:", error);
      return undefined;
    }
  }

  async setLLMApiKey(service: LlmServiceEnum, apiKey: string): Promise<void> {
    const llmApiKeys = (await this.getLLMApiKeys()) || {};
    llmApiKeys[service]
      ? llmApiKeys[service].push(apiKey)
      : (llmApiKeys[service] = [apiKey]);

    try {
      getContext().workspaceState.update(
        StorageKeysEnum.LlmApiKeys,
        JSON.stringify(llmApiKeys)
      );
    }
    catch (error) {
      console.error("Error setting LLM API key:", error);
      throw error;
    }
  }

  async deleteLLMApiKey(
    service: LlmServiceEnum,
    apiKeyToDelete: string
  ): Promise<void> {
    const llmApiKeys = (await this.getLLMApiKeys()) || {};
    llmApiKeys[service]
      ? (llmApiKeys[service] = llmApiKeys[service].filter(
          (apiKey) => apiKey !== apiKeyToDelete
        ))
      : null;

    try {
      getContext().workspaceState.update(
        StorageKeysEnum.LlmApiKeys,
        JSON.stringify(llmApiKeys)
      );
    }
    catch (error) {
      console.error("Error deleting LLM API key:", error);
      throw error;
    }
  }
}
