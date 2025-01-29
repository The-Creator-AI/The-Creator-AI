import { ChatMessage } from "@/backend/repositories/chat.respository";
import { Services } from "@/backend/services/services";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/common/ipc/channels.enum";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";
import { parseJsonResponse } from "@/common/utils/parse-json";
import { ChangePlanViewStore } from "@/client/views/change-plan.view/store/change-plan-view.state-type";
import { handleActiveTabChange } from "@/backend/utils/handleActiveTabChange";
import * as vscode from "vscode";
import { MessageService } from "@/backend/services/message.service";

// Function to handle messages for the change plan view
export function onMessage(serverIpc: ServerPostMessageManager) {
  const fsService = Services.getFSService();
  const messageService = Services.getMessageService();
  serverIpc.onClientMessage(ClientToServerChannel.RequestWorkspaceFiles, () =>
    fsService.handleWorkspaceFilesRequest(serverIpc)
  );

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestFileCode,
    async (data) => {
      const res = await Services.getCodeService().requestFileCode(
        data.filePath,
        data.chatHistory,
        data.selectedFiles
      );
      serverIpc.sendToClient(ServerToClientChannel.SendFileCode, res);
    }
  );

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestStreamFileCode,
    async (data) => {
      const res = await Services.getCodeService().requestFileCode(
        data.filePath,
        data.chatHistory,
        data.selectedFiles,
        (filePath, chunk) => {
          serverIpc.sendToClient(ServerToClientChannel.StreamFileCode, {
            filePath,
            chunk,
          });
        }
      );
      serverIpc.sendToClient(ServerToClientChannel.SendFileCode, res);
    }
  );

  serverIpc.onClientMessage(ClientToServerChannel.SendMessage, (data) =>
      messageService.sendMessage(serverIpc, data)
  );

  serverIpc.onClientMessage(ClientToServerChannel.SendStreamMessage, (data) => {
      messageService.streamMessage(serverIpc, data)
  });

  serverIpc.onClientMessage(
    ClientToServerChannel.RequestOpenFile,
    async (data) => {
      fsService.handleFileOpen(data);
    }
  );

  serverIpc.onClientMessage(ClientToServerChannel.PersistStore, (data) => {
    const { storeName, storeState } = data;
    if (storeName === "changePlanViewState") {
      Services.getPersistentStoreRepository().setChangePlanViewState(
        storeState
      );
    }
  });

  serverIpc.onClientMessage(ClientToServerChannel.FetchStore, (data) => {
    const { storeName } = data;
    if (storeName === "changePlanViewState") {
      const storeState =
        Services.getPersistentStoreRepository().getChangePlanViewState();
      console.log("storeState", storeState);
      for (const key in storeState) {
        serverIpc.sendToClient(ServerToClientChannel.SetChangePlanViewState, {
          keyPath: key as keyof ChangePlanViewStore,
          value: storeState[key],
        });
      }
    }
  });

  handleActiveTabChange(serverIpc);

  // Handle request for commit message suggestions
  serverIpc.onClientMessage(
    ClientToServerChannel.RequestCommitMessageSuggestions,
    async ({ chatHistory }) => {
      // Add a user message at the end of the chat history prompting for commit message suggestions in JSON format.
      const userMessage: ChatMessage = {
        user: "user",
        message:
          "Please provide commit message suggestions in JSON format. Here's an example of the expected JSON structure:" +
          JSON.stringify({
            suggestions: ["Add feature X", "Fix bug Y", "Update dependency Z"],
          }),
      };

      // Send a message to the LLM service with the updated chat history.
      const llmResponse = await Services.getLlmService().sendPrompt([
        ...chatHistory.filter(
          (message) => message.user === "bot" || message.user === "user"
        ),
        userMessage,
      ]);

      // Parse the LLM response using parseJsonResponse from parse-json.
      const parsedResponse = parseJsonResponse(llmResponse.response);

      // Extract commit message suggestions from the parsed JSON.
      const suggestions = parsedResponse.suggestions;

      // Send the suggestions to the client.
      serverIpc.sendToClient(
        ServerToClientChannel.SendCommitMessageSuggestions,
        { suggestions }
      );
    }
  );

  // Handle commit action with the selected message
  serverIpc.onClientMessage(
    ClientToServerChannel.CommitStagedChanges,
    async (message) => {
      console.log("Committing staged changes with message:", message.message);
      console.log(
        "Committing staged changes with description:",
        message.description
      );

      // Set commitSuggestionsLoading to true before initiating the commit
      serverIpc.sendToClient(ServerToClientChannel.SetChangePlanViewState, {
        keyPath: "commitSuggestionsLoading",
        value: true,
      });

      try {
        // Use the publicly available VS Code command to commit the staged changes with the provided message
        const gitService = Services.getGitService();
        await gitService.gitCommit(message.message, message.description);
      } catch (error) {
        // Handle any errors during the commit process
        console.error("Error committing changes:", error);
      } finally {
        // Reset commit suggestions and loading state after the commit, regardless of success or failure
        serverIpc.sendToClient(ServerToClientChannel.SetChangePlanViewState, {
          keyPath: "commitSuggestions",
          value: [],
        });
        serverIpc.sendToClient(ServerToClientChannel.SetChangePlanViewState, {
          keyPath: "commitSuggestionsLoading",
          value: false,
        });
      }
    }
  );

  // Handle get LLM API keys request
  serverIpc.onClientMessage(ClientToServerChannel.GetLLMApiKeys, async () => {
    try {
      const apiKeys = await Services.getSettingsRepository().getLLMApiKeys();
      serverIpc.sendToClient(ServerToClientChannel.SendLLMApiKeys, {
        apiKeys,
      });
    } catch (error) {
      console.error("Error getting LLM API keys:", error);
      // Handle the error appropriately, e.g., send an error message to the client
    }
  });

  // Handle set LLM API key request
  serverIpc.onClientMessage(
    ClientToServerChannel.SetLLMApiKey,
    async ({ service, apiKey }) => {
      try {
        await Services.getSettingsRepository().setLLMApiKey(service, apiKey);

        // After successfully setting the API key, you might want to re-fetch
        // the API keys and send them back to the client to update the UI.
        const updatedApiKeys =
          await Services.getSettingsRepository().getLLMApiKeys();
        serverIpc.sendToClient(ServerToClientChannel.SendLLMApiKeys, {
          apiKeys: updatedApiKeys,
        });
      } catch (error) {
        console.error("Error setting LLM API key:", error);
        // Handle the error appropriately, e.g., send an error message to the client
      }
    }
  );

  // Handle delete LLM API key request
  serverIpc.onClientMessage(
    ClientToServerChannel.DeleteLLMApiKey,
    async ({ service, apiKeyToDelete }) => {
      try {
        await Services.getSettingsRepository().deleteLLMApiKey(
          service,
          apiKeyToDelete
        );

        // After successfully deleting the API key, you might want to re-fetch
        // the API keys and send them back to the client to update the UI.
        const updatedApiKeys =
          await Services.getSettingsRepository().getLLMApiKeys();
        serverIpc.sendToClient(ServerToClientChannel.SendLLMApiKeys, {
          apiKeys: updatedApiKeys,
        });
      } catch (error) {
        console.error("Error deleting LLM API key:", error);
        // Handle the error appropriately, e.g., send an error message to the client
      }
    }
  );

  // Handle symbol retrieval request
  serverIpc.onClientMessage(
    ClientToServerChannel.RequestSymbols,
    async ({ query }) => {
      try {
        const symbolInformation = await vscode.commands.executeCommand<
          vscode.SymbolInformation[]
        >("vscode.executeWorkspaceSymbolProvider", query || "");
        const files = await vscode.workspace.findFiles(`**/${query}**`);

        serverIpc.sendToClient(ServerToClientChannel.SendSymbols, {
          symbols: [
            ...files
              .map((file) => ({
                name: file.path?.split("/").pop(),
                kind: vscode.SymbolKind.File,
                location: file.path,
                range: new vscode.Range(
                  new vscode.Position(0, 0),
                  new vscode.Position(0, 0)
                ),
              }))
              ?.filter(
                (symbol, index, self) =>
                  self.findIndex((s) => s.name === symbol.name) === index
              )
              ?.filter((_, index) => index < 3),
            ...symbolInformation
              .map((symbol) => ({
                name: symbol.name,
                kind: symbol.kind,
                location: symbol.location.uri.path,
                range: symbol.location.range,
              }))
              ?.filter(
                (symbol, index, self) =>
                  self.findIndex((s) => s.name === symbol.name) === index
              )
              ?.filter((_, index) => index < 5),
          ],
        });
      } catch (error) {
        console.error("Error retrieving symbols:", error);
        // Handle the error appropriately, e.g., send an error message to the client
      }
    }
  );
}