import { randomUUID } from "crypto";
import { getContext } from "../../extension";
import { StorageKeysEnum } from "../types/storage-keys.enum";

export interface ChatMessage {
  user: 'user' | 'bot' | 'instrutor'
  message: string;
}

export interface Chat {
  id: string;
  messages: ChatMessage[];
}

interface ChatRepositoryData {
  chats: Chat[];
  activeChatId: string | null;
}

const defaultChatRepositoryData: ChatRepositoryData = {
  chats: [],
  activeChatId: null,
};

export class ChatRepository {
  private static async getChatRepositoryData(): Promise<ChatRepositoryData> {
    const chatRepositoryData =
      getContext().workspaceState.get<ChatRepositoryData>(
        StorageKeysEnum.ChatRepository
      );
    if (!chatRepositoryData || !chatRepositoryData.chats) {
      await getContext().workspaceState.update(
        StorageKeysEnum.ChatRepository,
        defaultChatRepositoryData
      );
      return defaultChatRepositoryData;
    }
    return chatRepositoryData;
  }

  private static async patchChatRepositoryData(
    chatRepositoryData: Partial<ChatRepositoryData>
  ): Promise<void> {
    const existingData = await this.getChatRepositoryData();
    const updatedData = {
      ...existingData,
      ...chatRepositoryData,
    };
    await getContext().workspaceState.update(
        StorageKeysEnum.ChatRepository,
      updatedData
    );
  }

  static async getChats(): Promise<Chat[]> {
    return (await this.getChatRepositoryData()).chats;
  }

  static async getChatById(id?: string): Promise<Chat | undefined> {
    if (!id) {
      return this.getActiveChat();
    }
    const chats = await this.getChats();
    return chats.find((chat) => chat.id === id);
  }

  static async createChat(): Promise<Chat> {
    const newChat: Chat = { id: randomUUID(), messages: [] };
    const chats = await this.getChats();
    chats.push(newChat);
    await this.patchChatRepositoryData({ chats });
    await this.setActiveChat(newChat.id);
    return newChat;
  }

  static async updateChat(updatedChat: Chat): Promise<void> {
    const chats = await this.getChats();
    const index = chats.findIndex((chat) => chat.id === updatedChat.id);
    if (index !== -1) {
      chats[index] = updatedChat;
      await this.patchChatRepositoryData({ chats });
    }
  }

  static async deleteChat(id: string): Promise<void> {
    const chats = await this.getChats();
    const updatedChats = chats.filter((chat) => chat.id !== id);
    await this.patchChatRepositoryData({ chats: updatedChats });
  }

  static async getActiveChat() {
    const activeChatId = (await this.getChatRepositoryData()).activeChatId;
    if (!activeChatId) {
      return await this.createChat();
    }
    const activeChat = await this.getChatById(activeChatId);
    if (!activeChat) {
      return await this.createChat();
    }
    return activeChat;
  }

  static async setActiveChat(chatId: string | null): Promise<void> {
    await this.patchChatRepositoryData({ activeChatId: chatId });
  }

  // Message Management within a Chat
  static async addMessageToChat(
    chatId: string,
    message: ChatMessage
  ): Promise<void> {
    const chat = await this.getChatById(chatId);
    if (chat) {
      chat.messages.push(message);
      await this.updateChat(chat);
    }
  }

  static async updateMessageInChat(
    chatId: string,
    messageIndex: number,
    updatedMessage: ChatMessage
  ): Promise<void> {
    const chat = await this.getChatById(chatId);
    if (chat && chat.messages[messageIndex]) {
      chat.messages[messageIndex] = updatedMessage;
      await this.updateChat(chat);
    }
  }

  static async deleteMessageFromChat(
    chatId: string,
    messageIndex: number
  ): Promise<void> {
    const chat = await this.getChatById(chatId);
    if (chat && chat.messages[messageIndex]) {
      chat.messages.splice(messageIndex, 1);
      await this.updateChat(chat);
    }
  }
}
