import React from "react";
import { MdFileDownload } from "react-icons/md";
import useCode from "./useCode";

interface GetCodeProps {
  filePath: string;
}

const GetCode: React.FC<GetCodeProps> = ({ filePath }) => {
  const { fileChunkMap, handleRequestFileCode } = useCode();

  const isLoading = fileChunkMap[filePath]?.isLoading;
  const fileContentLength = fileChunkMap[filePath]?.fileContent?.length;

  return (
    <>
      {!isLoading ? (
        <MdFileDownload
          size={18}
          className={`ml-2 cursor-pointer text-blue-500`}
          onClick={() => handleRequestFileCode(filePath)}
        />
      ) : (
        <span className="loader mr-2">
          <div className="spinner w-4 h-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin ml-2"></div>
        </span>
      )}
      {isLoading && fileContentLength ? (
        <span className="text-xs text-gray-500 whitespace-nowrap overflow-x-auto">
          ({fileContentLength} ++)
        </span>
      ) : null}
    </>
  );
};

export default GetCode;
