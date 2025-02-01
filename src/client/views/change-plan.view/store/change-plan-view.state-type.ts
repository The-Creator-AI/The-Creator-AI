import { ChangePlanSteps } from "../view.constants";
import { ChatMessage } from "@/backend/repositories/chat.respository";
import { FileNode } from "@/common/types/file-node";

export interface ChangePlan {
  planTitle: string;
  planDescription: string;
  llmResponse: string;
  planJson: any;
  chatHistory: ChatMessage[];
  selectedContext: {
    files: string[];
    features: any;
    architecture: any;
    guidelines: any;
  }
  lastUpdatedAt: number;
}

export interface ChangePlanViewStore {
  changeDescription: string;
  isLoading: boolean;
  llmResponse: string;
  currentStep: ChangePlanSteps;
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
  context: {
    files: FileNode[];
    features: any;
    architecture: any;
    guidelines: any;
  };
  selectedContext: {
    files: string[];
    features: any;
    architecture: any;
    guidelines: any;
  };
  commitSuggestionsLoading: boolean;
  commitSuggestions: string[];
}
