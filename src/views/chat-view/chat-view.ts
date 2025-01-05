import * as vscode from "vscode";
import {
    ClientToServerChannel,
    ServerToClientChannel,
} from "../../ipc/channels.enum";
import { ServerPostMessageManager } from "../../ipc/server-ipc";
import { ChatRepository } from "../../backend/repositories/chat.respository";
import { Services } from "../../backend/services/services";

// Function to get HTML for chat view
export function getChatViewHtml(
  webview: vscode.Webview,
  nonce: string,
  extensionUri: vscode.Uri
): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist", "chatView.js")
  );
  return `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body>
                        <div id="chat-view-root"></div>
                        <script nonce="${nonce}" src="${scriptUri}"></script>
                    </body>
                    </html>`;
}

// Function to handle messages for the chat view
export async function handleChatViewMessages(serverIpc: ServerPostMessageManager) {
  serverIpc?.onClientMessage(
    ClientToServerChannel.SendMessage,
    async (data) => {
      const userMessage = data.chatHistory?.[0];

      // Fetch Chat History from Repository
      let existingChat = await ChatRepository.getActiveChat();
      await ChatRepository.addMessageToChat(existingChat.id, userMessage);
      existingChat = await ChatRepository.getActiveChat();

      const response = await Services.getLlmService().sendPrompt(
        existingChat.messages
      );

      serverIpc.sendToClient(ServerToClientChannel.SendMessage, {
        message: response.response,
      });

      await ChatRepository.addMessageToChat(existingChat.id, {
        user: "bot",
        message: response.response,
      });
    }
  );
  serverIpc?.onClientMessage(
    ClientToServerChannel.RequestChatHistory,
    async (data) => {
      const chatId = data.chatId;
      const chat = await ChatRepository.getChatById(chatId);
      if (!chat) {
        return;
      }
      serverIpc.sendToClient(ServerToClientChannel.SendChatHistory, {
        chatId: chat.id,
        messages: chat.messages,
      });
    }
  );
}
