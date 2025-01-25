import { ChatRepository } from "@/backend/repositories/chat.respository";
import { Services } from "@/backend/services/services";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/common/ipc/channels.enum";
import { ServerPostMessageManager } from "@/common/ipc/server-ipc";

// Function to handle messages for the chat view
export async function onMessage(serverIpc: ServerPostMessageManager) {
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
