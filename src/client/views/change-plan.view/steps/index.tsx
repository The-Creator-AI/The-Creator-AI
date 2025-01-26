import { StepsConfig } from "@/client/components/ProgressSteps";
import { ChangePlanSteps } from "@/client/views/change-plan.view/view.constants";
import * as React from "react";
import ApiKeyManagementStep from "./ApiKeyManagementStep";
import CommitStep from "./CommitStep";
import ContextStep from "./ContextStep";
import PlanStep from "./PlanStep";

export const getSteps = (): StepsConfig => {
  return {
    [ChangePlanSteps.ApiKeyManagement]: {
      indicatorText: "API Keys",
      renderStep: () => <ApiKeyManagementStep />,
    },
    [ChangePlanSteps.Context]: {
      indicatorText: "Context",
      renderStep: () => <ContextStep />,
    },
    [ChangePlanSteps.Plan]: {
      indicatorText: "Plan",
      renderStep: () => <PlanStep />,
    },
    [ChangePlanSteps.Commit]: {
      indicatorText: "Commit",
      renderStep: () => <CommitStep />,
    },
  };
};
