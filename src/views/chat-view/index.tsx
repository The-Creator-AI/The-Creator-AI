// the-creator-ai/src/sidebar/Sidebar.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ClientPostMessageManager } from '../../ipc/client-ipc';
import { ClientToServerChannel, ServerToClientChannel } from '../../ipc/channels.enum';
import Markdown from 'markdown-to-jsx';
import { FaUser, FaRobot } from 'react-icons/fa';
import './index.scss';

const App = () => {
  const [messages, setMessages] = React.useState<{ user: string; message: string }[]>([]);
  const [userInput, setUserInput] = React.useState('');
  const clientIpc = ClientPostMessageManager.getInstance();

  const sendMessage = () => {
    if (userInput.trim() === '') return;

    // Send message to extension
    clientIpc.sendToServer(ClientToServerChannel.SendMessage, {
      chatHistory: [{ user: 'user', message: userInput }],
      selectedFiles: []
    });

    // Update local messages (for display)
    setMessages([...messages, { user: 'user', message: userInput }]);
    setUserInput('');
  };

  React.useEffect(() => {
    clientIpc.onServerMessage(ServerToClientChannel.SendMessage, ({ message }) => {
      setMessages((messages) => ([...messages, { user: 'AI', message }]));
    });
    clientIpc.onServerMessage(ServerToClientChannel.SendChatHistory, ({ messages }) => {
      setMessages(() => ([...messages]));
    });
    clientIpc.sendToServer(ClientToServerChannel.RequestChatHistory, {});
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start my-2 p-2 ${message.user === 'user' ? 'user' : 'bot'}`}>
            <div className={`mr-2 text-lg ${message.user === 'user' ? 'text-blue-500' : 'text-gray-400'}`}>
              {message.user === 'user' ? <FaUser /> : <FaRobot />}
            </div>
            <div className="flex-grow">
              <Markdown>{message.message}</Markdown>
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-4 border-t">
        <input
          type="text"
          className="flex-grow p-2 border rounded mr-2"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here"
        />
        <button className="p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-700" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('chat-view-root')!);
root.render(<App />);
