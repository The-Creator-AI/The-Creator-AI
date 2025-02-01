import { changePlanViewStoreStateSubject } from "@/client/modules/plan.module/store/change-plan-view.store";
import { useStore } from "@/client/store/useStore";
import { ClientToServerChannel } from "@/common/ipc/channels.enum";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import * as React from "react";
import { useEffect, useState } from "react";
import FileCard from "./file-card";
import GetCode from "../modules/code.module/GetCode";

interface FormattedPlanPreviewProps {
  jsonData: any;
}

const FormattedPlanPreview: React.FC<FormattedPlanPreviewProps> = ({
  jsonData,
}) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const { activeTab } = useStore(changePlanViewStoreStateSubject);
  const clientIpc = ClientPostMessageManager.getInstance();

  useEffect(() => {
    const matchingCardIndex = jsonData.code_plan.findIndex(
      (item: any) =>
        item?.filename && activeTab && activeTab.endsWith(item.filename)
    );
    if (matchingCardIndex !== -1) {
      setCurrentFileIndex(matchingCardIndex);
    }
  }, [activeTab, jsonData.code_plan]);

  const handleHeaderClick = (index: number) => {
    setCurrentFileIndex(index);
    clientIpc.sendToServer(ClientToServerChannel.RequestOpenFile, {
      filePath: jsonData.code_plan[index]?.filename,
    });
  };

  return jsonData ? (
    <div className="formatted-plan-preview min-h-0 pt-2 flex flex-col flex-grow focus:outline-none overflow-y-auto">
      <h3 className="flex justify-center text-xs font-bold mb-2 px-4 text-center">
        {jsonData.title}
      </h3>
      <p className="flex justify-center text-gray-700 px-4 text-center">
        {jsonData.description}
      </p>
      {/* Pagination Dots */}
      <div className="flex flex-col my-4">
        {jsonData.code_plan.map((item: any, index: number) => (
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
        {jsonData.code_plan.map((item: any, index: number) => {
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
  ) : null;
};

export default FormattedPlanPreview;
