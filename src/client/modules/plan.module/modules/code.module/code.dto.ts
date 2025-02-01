import { ChatMessage } from "@/backend/repositories/chat.respository";

export interface RequestFileCodeDTO {
  filePath: string;
  chatHistory: ChatMessage[];
  selectedFiles: string[];
}

export interface RequestStreamFileCodeDTO {
  filePath: string;
  chatHistory: ChatMessage[];
  selectedFiles: string[];
}

export interface SendFileCodeDTO {
  filePath: string;
  fileContent: string;
}
