import * as React from 'react';
import { useEffect, useState } from 'react';
import { LlmServiceEnum } from '@/backend/types/llm-service.enum';
import { ClientPostMessageManager } from '@/ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '@/ipc/channels.enum';
import Modal from '@/components/Modal';

const ApiKeyManagementStep: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<LlmServiceEnum, string[]>>(
    Object.values(LlmServiceEnum).reduce((acc, service) => ({ ...acc, [service]: [] }), {} as any)
  );
  const [newApiKey, setNewApiKey] = useState('');
  const [selectedService, setSelectedService] = useState<LlmServiceEnum | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for the modal

  const clientIpc = ClientPostMessageManager.getInstance();

  useEffect(() => {
    const fetchApiKeys = async () => {
      clientIpc.sendToServer(ClientToServerChannel.GetLLMApiKeys, {});
    };

    fetchApiKeys();
  }, []);

  useEffect(() => {
    const handleSendLLMApiKeys = (message: { apiKeys: Record<LlmServiceEnum, string[]> | undefined }) => {
      setApiKeys(message.apiKeys || {} as any);
    };

    clientIpc.onServerMessage(ServerToClientChannel.SendLLMApiKeys, handleSendLLMApiKeys);
  }, []);

  const handleAddApiKey = async () => {
    if (newApiKey.trim() === '' || !selectedService) {
      return;
    }

    clientIpc.sendToServer(ClientToServerChannel.SetLLMApiKey, { service: selectedService, apiKey: newApiKey });
    setNewApiKey(''); // Clear the input field
    setSelectedService(null); // Reset selected service
    setIsModalOpen(false); // Close the modal
  };

  const handleDeleteApiKey = async (service: LlmServiceEnum, apiKey: string) => {
    clientIpc.sendToServer(ClientToServerChannel.DeleteLLMApiKey, { service, apiKeyToDelete: apiKey });
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-editor-fg">API Key Management</h2>
      <button
        onClick={handleOpenModal}
        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-button-bg hover:bg-button-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-bg mb-4"
      >
        Add API Key
      </button>
      {/* Display existing keys or a message if no keys are present */}
      {Object.keys(apiKeys).some((service) => apiKeys[service as LlmServiceEnum].length > 0) ? (
        Object.entries(apiKeys).map(([service, keys]) => (
          <div key={service} className="mb-6">
            <h3 className="text-lg font-medium text-editor-fg">{service}</h3>
            <ul className="list-disc pl-5">
              {keys.map((apiKey, index) => (
                <li key={index} className="flex items-center justify-between py-2">
                  <span className="truncate text-editor-fg">{apiKey}</span>
                  <button
                    onClick={() => handleDeleteApiKey(service as LlmServiceEnum, apiKey)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div className="mb-4">
          <p className="text-gray-600">No API keys added yet.</p>
        </div>
      )}

      {/* Modal for adding new API keys */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4 text-editor-fg">Add New API Key</h3>
          <div className="mb-4">
            <label htmlFor="serviceSelect" className="block text-sm font-medium text-gray-700">
              Select Service:
            </label>
            <select
              id="serviceSelect"
              value={selectedService || ''}
              onChange={(e) => setSelectedService(e.target.value as LlmServiceEnum)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-settings-input-bg"
            >
              <option value="">Select a service</option>
              {Object.values(LlmServiceEnum).map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-700">
              API Key:
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="password" // Make the input field a password field
                name="apiKeyInput"
                id="apiKeyInput"
                className="focus:ring-indigo-500 focus:border-indigo-500 flex-grow block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 p-2 bg-settings-input-bg"
                placeholder="Enter your API key"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                disabled={!selectedService}
              />
              <button
                onClick={handleAddApiKey}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-button-bg hover:bg-button-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-button-bg"
                disabled={!selectedService || newApiKey.trim() === ''}
              >
                Add
              </button>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ApiKeyManagementStep;