import { useStore } from "@/client/store/useStore";
import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom/client";
import { FaSpinner } from "react-icons/fa"; // Import spinner icon
import ErrorBoundary from "@/client/components/ErrorBoundary";
import { FileNode } from "@/common/types/file-node";
import {
  ChangePlanSteps
} from "./view.constants";
import { getSteps } from "./steps";
import "./view.scss";
import ProgressSteps from "../../components/ProgressSteps";
import { setupChannelHandlers } from "./logic/setupChannelHandlers";
import {
  setChangePlanViewState as setState,
} from "./store/change-plan-view.logic";
import {
  changePlanViewStoreStateSubject
} from "./store/change-plan-view.store";
import {Log} from '@/common/utils/firebaseLogger';

const App = () => {
  const {
    isLoading,
    currentStep: currentTab,
  } = useStore(changePlanViewStoreStateSubject);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string>();

  const changePlanSteps = getSteps({
    files,
    recentFiles,
    activeFile,
    setRecentFiles,
    setActiveFile,
  });

  // Initialize Firebase
  useEffect(() => {
    Log.sidebarOpened();
  }, []);

  useEffect(() => {
    setupChannelHandlers(setFiles);
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

  console.log({
    changePlanSteps,
    currentTab
  });
  return (
    <div
      className="h-full fixed inset-0 flex flex-col justify-between bg-editor-bg"
    >
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