import { ChangePlan } from "@/client/views/change-plan-view/store/change-plan-view.state-type";
import { remoteSetChangePlanViewState } from "@/client/views/change-plan-view/utils/remoteSetChangePlanViewState";
import { serverIPCs } from "@/client/views/register-views";
import { VIEW_TYPES } from "@/common/view-types";
import * as vscode from "vscode";
import { Services } from "@/backend/services/services";

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
      const selectedPlan = await vscode.window.showQuickPick(
        changePlans.map((plan: ChangePlan) => {
          return {
            label: plan.planTitle,
            description: new Date(plan.lastUpdatedAt).toLocaleString(),
            plan,
          };
        }),
        {
          placeHolder: "Select a plan to load or delete",
          matchOnDescription: true
        }
      );

      if (selectedPlan) {
        const choice = await vscode.window.showQuickPick(
          ['Load', 'Delete'],
          {
            placeHolder: `What do you want to do with: ${selectedPlan.label} plan?`
          }
        )
        if (choice === 'Load') {
          const serverIpc = serverIPCs[VIEW_TYPES.SIDEBAR.CHANGE_PLAN];
          remoteSetChangePlanViewState(
            serverIpc,
            "changeDescription",
            selectedPlan.plan.planDescription
          );
          remoteSetChangePlanViewState(
            serverIpc,
            "llmResponse",
            selectedPlan.plan.llmResponse
          );
          remoteSetChangePlanViewState(
            serverIpc,
            "selectedFiles",
            selectedPlan.plan.selectedFiles
          );
          remoteSetChangePlanViewState(
            serverIpc,
            "chatHistory",
            selectedPlan.plan.chatHistory
          );
          remoteSetChangePlanViewState(
            serverIpc,
            "changePlans",
            changePlans
          );
        } else if(choice === 'Delete') {
          const confirmDelete = await vscode.window.showWarningMessage(
            `Are you sure you want to delete the plan "${selectedPlan.label}"?`,
            { modal: true },
            'Yes', 'No'
          );

          if (confirmDelete === 'Yes') {
            const updatedChangePlans = changePlans.filter((plan: ChangePlan) => plan.planTitle !== selectedPlan.label);
            persistentStoreRepository.setChangePlanViewState({
              ...store,
              changePlans: updatedChangePlans,
            });
          }
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