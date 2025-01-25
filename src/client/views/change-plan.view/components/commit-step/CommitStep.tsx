import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { requestCommitMessageSuggestions } from '../../logic/requestCommitMessageSuggestions';
import { handleCommitMessageSuggestions } from '../../logic/handleCommitMessageSuggestions';
import { setChangePlanViewState } from '../../store/change-plan-view.logic';
import { useStore } from '@/client/store/useStore';
import { changePlanViewStoreStateSubject, getChangePlanViewState } from '@/client/views/change-plan.view/store/change-plan-view.store';
import { commitStagedChanges } from '../../logic/commitStagedChanges';
import AutoResizingTextarea from '@/client/components/AutoResizingTextarea';

const CommitStep: React.FC = () => {
    const {
        chatHistory,
    } = useStore(changePlanViewStoreStateSubject);
    const [commitTitle, setCommitTitle] = useState(getChangePlanViewState('changePlans')?.[getChangePlanViewState('changePlans').length - 1]?.planTitle || '');
    const [commitDescription, setCommitDescription] = useState(getChangePlanViewState('changePlans')?.[getChangePlanViewState('changePlans').length - 1]?.planDescription || '');

    const handleCommit = async () => {
        commitStagedChanges(commitTitle, commitDescription);
    };

    return (
        <div className="p-4">
            {chatHistory.length === 0 ? (
                <p className="text-gray-600">No changes to commit.</p>
            ) : (
                <div className="flex flex-col">
                    <div className="mb-4">
                        <label htmlFor="commitTitle" className="block text-sm font-medium text-gray-700">
                            Commit Title:
                        </label>
                        <AutoResizingTextarea
                            id="commitTitle"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={commitTitle}
                            onChange={(e) => setCommitTitle(e.target.value)}
                            placeholder="Enter a short, descriptive commit title"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="commitDescription" className="block text-sm font-medium text-gray-700">
                            Commit Description (Optional):
                        </label>
                        <AutoResizingTextarea
                            id="commitDescription"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={commitDescription}
                            onChange={(e) => setCommitDescription(e.target.value)}
                            placeholder="Enter a more detailed description of the changes (optional)"
                            minRows={3} // Adjust as needed
                            maxRows={10} // Adjust as needed
                        />
                    </div>
                    <button
                        onClick={handleCommit}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Commit
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommitStep;