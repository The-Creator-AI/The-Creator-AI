import { ChangePlanViewStore } from "./change-plan-view.state-type";
import { ChangePlanSteps } from "../view.constants";

export const initialState: ChangePlanViewStore = {
  changeDescription: "",
  isLoading: false,
  llmResponse: "",
  currentStep: ChangePlanSteps.Plan,
  selectedFiles: [],
  chatHistory: [],
  activeTab: undefined,
  changePlans: [],
  commitSuggestions: [],
  commitSuggestionsLoading: false,
  fileChunkMap: {},
  files: [],
};