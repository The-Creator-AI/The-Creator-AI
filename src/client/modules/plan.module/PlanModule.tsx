import { setChangePlanViewState as setState } from "@/client/modules/plan.module/store/change-plan-view.logic";
import { getChangePlanViewState } from "@/client/modules/plan.module/store/change-plan-view.store";
import * as React from "react";
import PlanPreview from "./components/PlanPreview";
import PlanInputBox from "./components/PlanInputBox";

const PlanModule: React.FC = () => {
  const llmResponse = getChangePlanViewState("llmResponse");

  return (
    <div className="plan-step flex flex-grow flex-col min-h-0">
      <PlanPreview />
      <PlanInputBox
        isUpdateRequest={
          !!(getChangePlanViewState("chatHistory").length > 0 && llmResponse)
        }
        handleChange={setState("changeDescription")}
        files={[]}
      />
    </div>
  );
};

export default PlanModule;
