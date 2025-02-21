import { useEffect, useState, useRef } from "react";
import { ClientPostMessageManager } from "@/common/ipc/client-ipc";
import {
  ClientToServerChannel,
  ServerToClientChannel,
} from "@/common/ipc/channels.enum";

interface UseSymbolsProps {
  handleChange: (value: string) => void;
  inputRef: React.MutableRefObject<HTMLTextAreaElement>;
}

const useSymbolsSuggestions = ({ handleChange, inputRef }: UseSymbolsProps) => {
  const clientIpc = ClientPostMessageManager.getInstance();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<
    number | null
  >(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSuggestionAccept = (suggestion: string) => {
    handleChange(
      handleChange.toString().split(" ").slice(0, -1).join(" ") +
        (handleChange.toString().split(" ").length > 1 ? " " : "") +
        suggestion +
        " "
    );
    setSelectedSuggestionIndex(null);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prevIndex) =>
          prevIndex === null || prevIndex === 0
            ? suggestions.length - 1
            : prevIndex - 1
        );
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prevIndex) =>
          prevIndex === null || prevIndex === suggestions.length - 1
            ? 0
            : prevIndex + 1
        );
      } else if (e.key === "Enter") {
        if (selectedSuggestionIndex !== null) {
          e.preventDefault();
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          handleSuggestionAccept(selectedSuggestion);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  useEffect(() => {
    const fetchSuggestions = () => {
      const changeDescription = handleChange.toString();
      if (changeDescription.split(" ").pop().startsWith("@")) {
        clientIpc.sendToServer(ClientToServerChannel.RequestSymbols, {
          query: changeDescription.split(" ").pop().slice(1),
        });
      } else {
        setShowSuggestions(false); // Hide suggestions if "@" is not the last character
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // Adjust delay as needed

    return () => clearTimeout(timeoutId);
  }, [handleChange]);

  useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendSymbols, (message) => {
      const receivedSuggestions = (message.symbols || []).map(
        (symbol: { name: string }) => symbol.name
      ); // Adjust based on actual symbol structure
      setSuggestions(receivedSuggestions);
      setShowSuggestions(true);
    });
  }, []);

  return {
    suggestions,
    selectedSuggestionIndex,
    showSuggestions,
    handleKeyDown,
    inputRef,
    handleSuggestionAccept,
  };
};

export default useSymbolsSuggestions;
