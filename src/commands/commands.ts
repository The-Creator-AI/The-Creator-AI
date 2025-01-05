import { remoteSetChangePlanViewState } from "@/views/change-plan-view/utils/remoteSetChangePlanViewState";
import { ChatRepository } from "../backend/repositories/chat.respository";
import { Services } from "../backend/services/services";
import * as vscode from "vscode";
import { serverIPCs } from "@/views/register-views";
import { VIEW_TYPES } from "@/views/view-types";
import { ChangePlan } from "@/views/change-plan-view/store/change-plan-view.state-type";

// Define an array of commands with their corresponding callback functions
export const commands = [
  {
    commandId: "the-creator-ai.helloWorld",
    callback: () => {
      console.log("Hello World from the-creator-ai!");
      vscode.window.showInformationMessage(
        "Hello World from the-creator-ai!"
      );
    },
  },
  {
    commandId: "the-creator-ai.resetClearChangePlanViewState",
    callback: async () => {
      const persistentStoreRepository =
        Services.getPersistentStoreRepository();
      await persistentStoreRepository.clearChangePlanViewState();
    },
  },
  {
    commandId: "the-creator-ai.chooseChangePlan",
    callback: async () => {
      const persistentStoreRepository =
        Services.getPersistentStoreRepository();
      const store = persistentStoreRepository.getChangePlanViewState();
      const changePlans = store?.changePlans || [];

      // Sort change plans by last updated date (descending)
      changePlans.sort((a: ChangePlan, b: ChangePlan) => b.lastUpdatedAt - a.lastUpdatedAt);

      // Show quick pick with plan titles
      const selectedPlanTitle = await vscode.window.showQuickPick(
        changePlans.map((plan: ChangePlan) => {
          return {
            label: plan.planTitle,
            description: new Date(plan.lastUpdatedAt).toLocaleString(),
          };
        })
      );

      if (selectedPlanTitle) {
        // Update state with selected plan
        const selectedPlan = changePlans.find(
          (plan: ChangePlan) => plan.planTitle === selectedPlanTitle.label
        );
        if (selectedPlan) {
          const serverIpc = serverIPCs[VIEW_TYPES.SIDEBAR.CHANGE_PLAN];
          remoteSetChangePlanViewState(
            serverIpc,
            "changeDescription",
            selectedPlan.planDescription
          );
          remoteSetChangePlanViewState(
            serverIpc,
            "llmResponse",
            selectedPlan.llmResponse
          );
          remoteSetChangePlanViewState(
            serverIpc,
            "selectedFiles",
            selectedPlan.selectedFiles
          );
          remoteSetChangePlanViewState(
            serverIpc,
            "chatHistory",
            selectedPlan.chatHistory
          );
        }
      }
    },
  },
  {
    commandId: "the-creator-ai.newPlan",
    callback: async () => {
      const serverIpc = serverIPCs[VIEW_TYPES.SIDEBAR.CHANGE_PLAN];
      remoteSetChangePlanViewState(serverIpc, "changeDescription", "");
      remoteSetChangePlanViewState(serverIpc, "llmResponse", "");
      remoteSetChangePlanViewState(serverIpc, "chatHistory", []);
      remoteSetChangePlanViewState(serverIpc, "fileChunkMap", {});
      remoteSetChangePlanViewState(serverIpc, "isLoading", false);
    },
  },
  {
    commandId: "the-creator-ai.clearHistory",
    callback: async () => {
      const persistentStoreRepository =
        Services.getPersistentStoreRepository();
      await persistentStoreRepository.clearChangePlanViewState();
    },
  },
  {
    commandId: "the-creator-ai.exportChangePlan",
    callback: async () => {
      const changePlanExportService = Services.getChangePlanExportService();
      await changePlanExportService.exportAllChangePlans();
    },
  },
  {
    commandId: "the-creator-ai.importChangePlan",
    callback: async () => {
      const changePlanImportService = Services.getChangePlanImportService();
      await changePlanImportService.importAllChangePlans();
    },
  },
];