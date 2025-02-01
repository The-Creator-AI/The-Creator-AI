import * as React from "react";
import { BsSend } from "react-icons/bs";
import AutoResizingTextarea from "@/client/components/AutoResizingTextarea";
import { useStore } from "@/client/store/useStore";
import {
  changePlanViewStoreStateSubject,
  getChangePlanViewState,
} from "@/client/modules/plan.module/store/change-plan-view.store";
import { FileNode } from "@/common/types/file-node";
import { usePlan } from "../usePlan";
import useSymbols from "../hooks/useSymbols";

interface PlanStepInputProps {
  handleChange: (value: string) => void;
  isUpdateRequest?: boolean;
  files: FileNode[];
}

const PlanInputBox: React.FC<PlanStepInputProps> = ({
  isUpdateRequest,
  handleChange,
}) => {
  const { handleSubmitPlanRequest } = usePlan();
  const {
    suggestions,
    selectedSuggestionIndex,
    showSuggestions,
    handleKeyDown,
    inputRef,
    handleSuggestionAccept,
  } = useSymbols({ handleChange });
  const changeDescription = getChangePlanViewState("changeDescription");
  const isLoading = getChangePlanViewState("isLoading");

  return (
    <div className="flex flex-col">
      <div
        className="relative p-4 flex flex-col relative"
        data-testid="change-plan-input-step"
      >
        {showSuggestions && suggestions.length > 0 && (
          <ul
            className="absolute bottom-full bg-sidebar-bg left-0 mb-1 border border-gray-300 rounded max-h-40 overflow-y-auto shadow-lg z-10 m-4"
            style={{
              width: inputRef.current?.clientWidth,
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`p-2 cursor-pointer hover:bg-hover-bg ${
                  index === selectedSuggestionIndex ? "bg-hover-bg" : ""
                }`}
                onClick={() => {
                  handleSuggestionAccept(suggestion);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
        <AutoResizingTextarea
          ref={inputRef}
          className="p-2 border border-gray-300 rounded font-normal mb-2 pr-10"
          placeholder={
            isUpdateRequest
              ? "Describe the changes you want to make to the plan..."
              : "Describe the code changes you want to plan..."
          }
          value={changeDescription}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isLoading}
          data-testid="change-description-textarea"
          onKeyDown={handleKeyDown}
          minRows={3}
          maxRows={10}
          autoFocus
        />
      </div>
      {inputRef.current && (
        <BsSend
          className="fixed transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500"
          style={{
            left: inputRef.current?.getClientRects()?.[0]?.right - 35,
            top: inputRef.current?.getClientRects()?.[0]?.bottom - 20,
          }}
          size={20}
          onClick={handleSubmitPlanRequest}
          data-testid="submit-change-description-button"
        />
      )}
    </div>
  );
};

export default PlanInputBox;
