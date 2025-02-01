import { parseJsonResponse } from "@/common/utils/parse-json";
import { getChangePlanViewState } from "@/client/views/change-plan.view/store/change-plan-view.store";
import { setChangePlanViewState } from "@/client/views/change-plan.view/store/change-plan-view.logic";

export const updateOrCreateChangePlan = (llmResponse: string) => {
  try {
    const planJson = parseJsonResponse(llmResponse);
    if (!planJson) {
      return;
    }

    const planTitle = planJson.title;
    const planDescription = planJson.description;

    const changePlans = getChangePlanViewState("changePlans");
    const existingPlanIndex = changePlans.findIndex(
      (plan) => plan.planTitle === planTitle
    );

    const updatedChangePlans = [...changePlans];

    if (existingPlanIndex !== -1) {
      // Update existing plan
      updatedChangePlans[existingPlanIndex] = {
        ...updatedChangePlans[existingPlanIndex],
        planDescription,
        llmResponse,
        planJson,
        chatHistory: getChangePlanViewState("chatHistory"),
        selectedFiles: getChangePlanViewState("selectedContext").files,
        lastUpdatedAt: Date.now(),
      };
    } else {
      // Create a new plan
      updatedChangePlans.push({
        planTitle,
        planDescription,
        llmResponse,
        planJson,
        chatHistory: getChangePlanViewState("chatHistory"),
        selectedFiles: getChangePlanViewState("selectedContext").files,
        lastUpdatedAt: Date.now(),
      });
    }

    setChangePlanViewState("changePlans")(updatedChangePlans);
  } catch (error) {
    console.error("Error parsing or updating change plan:", error);
  }
};
