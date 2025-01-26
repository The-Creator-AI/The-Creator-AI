import { ChangePlanSteps } from "../view.constants";
import { ChatMessage } from "@/backend/repositories/chat.respository";
import { FileNode } from "@/common/types/file-node";

export interface ChangePlan {
  planTitle: string;
  planDescription: string;
  llmResponse: string;
  planJson: any;
  chatHistory: ChatMessage[];
  selectedFiles: string[];
  lastUpdatedAt: number;
}

export interface ChangePlanViewStore {
  changeDescription: string;
  isLoading: boolean;
  llmResponse: string;
  currentStep: ChangePlanSteps;
  selectedFiles: string[];
  chatHistory: ChatMessage[];
  activeTab: string | undefined;
  changePlans: ChangePlan[];
  fileChunkMap: Record<
    string,
    {
      isLoading: boolean;
      fileContent: string;
    }
  >;
    files: FileNode[];
  commitSuggestionsLoading: boolean;
  commitSuggestions: string[];
}