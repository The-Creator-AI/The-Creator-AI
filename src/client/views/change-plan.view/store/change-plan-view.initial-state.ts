import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { ChangePlanSteps } from "../view.constants";

export const initialState: ChangePlanViewStore = {
  changeDescription: "",
  isLoading: false,
  llmResponse: "",
  currentStep: ChangePlanSteps.Plan,
  chatHistory: [],
  activeTab: undefined,
  changePlans: [],
  commitSuggestions: [],
  commitSuggestionsLoading: false,
  fileChunkMap: {},
  context: {
    files: [],
    features: [],
    architecture: [],
    guidelines: [],
  },
  selectedContext: {
    files: [],
    features: [],
    architecture: [],
    guidelines: [],
  }
};