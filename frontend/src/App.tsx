import { ChatWindow } from './components/ChatWindow';
import { MessageInput } from './components/MessageInput';
import { useChat } from './hooks/useChat';

export default function App() {
  const { messages, isBusy, sendMessage } = useChat();

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            K
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              Konsulta Assistant
            </span>
            <span className="text-xs text-green-600">● online</span>
          </div>
        </header>

        <ChatWindow messages={messages} />
        <MessageInput disabled={isBusy} onSend={sendMessage} />
      </div>
    </div>
  );
}
