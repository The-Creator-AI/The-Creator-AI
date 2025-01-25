import * as React from 'react';
import '../../view.scss';
import { BsSend } from 'react-icons/bs';
import AutoResizingTextarea from '@/client/components/AutoResizingTextarea';
import { ClientPostMessageManager } from '@/common/ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '@/common/ipc/channels.enum';
import { useStore } from '@/client/store/useStore';
import { changePlanViewStoreStateSubject, getChangePlanViewState } from '@/client/views/change-plan.view/store/change-plan-view.store';
import { handleSubmitPlanRequest } from '../../logic/handleSubmitPlanRequest';
import { FileNode } from '@/common/types/file-node';

interface PlanStepInputProps {
    handleChange: (value: string) => void;
    isUpdateRequest?: boolean;
    files: FileNode[];
}

const PlanInputBox: React.FC<PlanStepInputProps> = ({ isUpdateRequest, handleChange, files }) => {
    const { selectedFiles } = useStore(changePlanViewStoreStateSubject);
    const [suggestions, setSuggestions] = React.useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = React.useState<number | null>(null);
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const changeDescription = getChangePlanViewState("changeDescription");
    const isLoading = getChangePlanViewState("isLoading");

    const clientIpc = ClientPostMessageManager.getInstance();

    const handleSuggestionAccept = (suggestion: string) => {
        handleChange(
            changeDescription.split(' ').slice(0, -1).join(' ')
            + (changeDescription.split(' ').length > 1 ? ' ' : '')
            + suggestion + ' ');
        setSelectedSuggestionIndex(null);
        setShowSuggestions(false);
    };

    const handleSubmit = () => {
        handleSubmitPlanRequest(clientIpc, files);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (showSuggestions) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSuggestionIndex((prevIndex) => (prevIndex === null || prevIndex === 0) ? suggestions.length - 1 : prevIndex - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestionIndex((prevIndex) => (prevIndex === null || prevIndex === suggestions.length - 1) ? 0 : prevIndex + 1);
            } else if (e.key === 'Enter') {
                if (selectedSuggestionIndex !== null) {
                    e.preventDefault();
                    const selectedSuggestion = suggestions[selectedSuggestionIndex];
                    handleSuggestionAccept(selectedSuggestion);
                }
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || e.altKey)) {
            e.preventDefault();
            handleSubmit();
        }
    };

    React.useEffect(() => {
        const fetchSuggestions = () => {
            if (changeDescription.split(' ').pop().startsWith('@')) {
                clientIpc.sendToServer(ClientToServerChannel.RequestSymbols, {
                    query: changeDescription.split(' ').pop().slice(1)
                });
            } else {
                setShowSuggestions(false); // Hide suggestions if "@" is not the last character
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300); // Adjust delay as needed

        return () => clearTimeout(timeoutId);
    }, [changeDescription, selectedFiles]);

    React.useEffect(() => {
        clientIpc.onServerMessage(ServerToClientChannel.SendSymbols, (message) => {
            const receivedSuggestions = (message.symbols || []).map((symbol: { name: string }) => symbol.name); // Adjust based on actual symbol structure
            setSuggestions(receivedSuggestions);
            setShowSuggestions(true);
        });
    }, []);

    return (
        <div className="flex flex-col">
            <div className="relative p-4 flex flex-col relative" data-testid="change-plan-input-step">
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute bottom-full bg-sidebar-bg left-0 mb-1 border border-gray-300 rounded max-h-40 overflow-y-auto shadow-lg z-10 m-4"
                        style={{
                            width: inputRef.current?.clientWidth,
                        }}>
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className={`p-2 cursor-pointer hover:bg-hover-bg ${index === selectedSuggestionIndex ? 'bg-hover-bg' : ''}`}
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
                    placeholder={isUpdateRequest ? "Describe the changes you want to make to the plan..." : "Describe the code changes you want to plan..."}
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
            {inputRef.current && <BsSend
                className="fixed transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500"
                style={{
                    left: inputRef.current?.getClientRects()?.[0]?.right - 35,
                    top: inputRef.current?.getClientRects()?.[0]?.bottom - 20,
                }}
                size={20}
                onClick={handleSubmit}
                data-testid="submit-change-description-button"
            />}
        </div>
    );
};

export default PlanInputBox;
