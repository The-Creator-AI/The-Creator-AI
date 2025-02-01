import {
  changePlanViewStoreStateSubject,
  getChangePlanViewState,
} from "@/client/modules/plan.module/store/change-plan-view.store";
import { useStore } from "@/client/store/useStore";
import { ClientToServerChannel } from "@/common/ipc/channels.enum";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import * as React from "react";
import { useEffect, useState } from "react";
import FileCard from "./FileCard";
import GetCode from "../modules/code.module/GetCode";
import { parseJsonResponse } from "@/common/utils/parse-json";
import Markdown from "markdown-to-jsx";

interface PlanPreviewProps {}

const PlanPreview: React.FC<PlanPreviewProps> = () => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const { activeTab } = useStore(changePlanViewStoreStateSubject);
  const clientIpc = ClientPostMessageManager.getInstance();
  const [responseType, setResponseType] = useState<"json" | "markdown" | null>(
    null
  );
  const [parsedResponse, setParsedResponse] = useState<any>(null);
  const llmResponse = getChangePlanViewState("llmResponse");

  useEffect(() => {
    const jsonData = parseJsonResponse(llmResponse);
    if (jsonData) {
      setResponseType("json");
      setParsedResponse(jsonData);
    } else {
      setResponseType("markdown");
    }
  }, [llmResponse]);

  useEffect(() => {
    const jsonData = parsedResponse;
    if (jsonData) {
      const matchingCardIndex = jsonData.code_plan.findIndex(
        (item: any) =>
          item?.filename && activeTab && activeTab.endsWith(item.filename)
      );
      if (matchingCardIndex !== -1) {
        setCurrentFileIndex(matchingCardIndex);
      }
    }
  }, [activeTab, parsedResponse]);

  const handleHeaderClick = (index: number) => {
    if (parsedResponse) {
      setCurrentFileIndex(index);
      clientIpc.sendToServer(ClientToServerChannel.RequestOpenFile, {
        filePath: parsedResponse.code_plan[index]?.filename,
      });
    }
  };

  const renderPlan = () => {
    return (
      <div className="formatted-plan-preview min-h-0 pt-2 flex flex-col flex-grow focus:outline-none overflow-y-auto">
        <h3 className="flex justify-center text-xs font-bold mb-2 px-4 text-center">
          {parsedResponse.title}
        </h3>
        <p className="flex justify-center text-gray-700 px-4 text-center">
          {parsedResponse.description}
        </p>
        {/* Pagination Dots */}
        <div className="flex flex-col my-4">
          {parsedResponse.code_plan.map((item: any, index: number) => (
            <div key={index}>
              <button
                onClick={() => handleHeaderClick(index)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-hover-bg ${
                  index === currentFileIndex ? "bg-hover-bg" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.filename?.split("/").pop() || ""}
                  </span>
                  <GetCode filePath={item.filename} />
                </div>
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-grow mx-4">
          {parsedResponse.code_plan.map((item: any, index: number) => {
            if (item?.filename && index === currentFileIndex) {
              // Only render the card at the currentFileIndex
              return (
                <FileCard
                  key={index}
                  fileName={item.filename?.split("/").pop() || ""}
                  operation={item.operation}
                  recommendations={item.recommendations}
                  filePath={item.filename}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (responseType === "json") {
      return parsedResponse ? renderPlan() : null;
    }
    if (responseType === "markdown") {
      return <Markdown>{llmResponse}</Markdown>;
    }
    return null;
  };
  return (
    <div className="flex flex-grow flex-col min-h-0">
      {renderContent()}
    </div>
  );
};

export default PlanPreview;
