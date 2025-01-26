import ErrorBoundary from "@/client/components/ErrorBoundary";
import { StepsConfig } from '@/client/components/ProgressSteps';
import ApiKeyManagement from '@/client/modules/api-keys-management.module/ApiKeysManagement';
import Commit from '@/client/modules/commit.module/Commit';
import Context from '@/client/modules/context.module/Context';
import Plan from '@/client/modules/plan.module/Plan';
import { useStore } from "@/client/store/useStore";
import { Log } from "@/common/utils/firebaseLogger";
import * as React from "react";
import { useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon
import ProgressSteps from "../../components/ProgressSteps";
import { setupChannelHandlers } from "./logic/setupChannelHandlers";
import { setChangePlanViewState as setState } from "./store/change-plan-view.logic";
import { changePlanViewStoreStateSubject } from "./store/change-plan-view.store";
import { ChangePlanSteps } from "./view.constants";
import "./view.scss";

const App = () => {
  const { isLoading, currentStep: currentTab } = useStore(
    changePlanViewStoreStateSubject
  );
  const changePlanSteps: StepsConfig = {
    [ChangePlanSteps.ApiKeyManagement]: {
      indicatorText: "API Keys",
      renderStep: () => <ApiKeyManagement />,
    },
    [ChangePlanSteps.Context]: {
      indicatorText: "Context",
      renderStep: () => <Context />,
    },
    [ChangePlanSteps.Plan]: {
      indicatorText: "Plan",
      renderStep: () => <Plan />,
    },
    [ChangePlanSteps.Commit]: {
      indicatorText: "Commit",
      renderStep: () => <Commit />,
    },
  };
  

  // Initialize Firebase
  useEffect(() => {
    Log.sidebarOpened();
  }, []);

  useEffect(() => {
    setupChannelHandlers();
  }, []);

  const handleStepClick = (step: ChangePlanSteps) => {
    setState("currentStep")(step);
  };

  const renderLoader = () => (
    <div
      className="loader fixed inset-0 flex justify-center items-center bg-opacity-50 bg-[#202020] z-50"
      data-testid="loader"
    >
      <FaSpinner className="spinner text-2xl animate-spin text-white" />
    </div>
  );

  return (
    <div className="h-full fixed inset-0 flex flex-col justify-between bg-editor-bg">
      <ProgressSteps
        stepsConfig={changePlanSteps}
        currentStep={currentTab}
        handleStepClick={handleStepClick}
      />
      <div className="flex flex-grow flex-col overflow-hidden">
        {/* Dropdown removed */}
        {changePlanSteps[currentTab].renderStep()}
      </div>
      {isLoading && renderLoader()} {/* Conditionally render the loader */}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("change-plan-view-root")!
);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
