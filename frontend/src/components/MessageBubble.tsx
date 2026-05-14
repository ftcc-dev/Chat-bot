import type { ChatMessage } from '../types/chat';

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  const align = isUser ? 'justify-end' : 'justify-start';
  const base =
    'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm whitespace-pre-wrap break-words';

  const skin = (() => {
    if (isUser) return 'bg-blue-600 text-white rounded-br-sm';
    if (message.kind === 'success')
      return 'bg-green-50 text-green-900 border border-green-300 rounded-bl-sm';
    if (message.kind === 'error')
      return 'bg-red-50 text-red-900 border border-red-300 rounded-bl-sm';
    if (message.kind === 'loading')
      return 'bg-slate-100 text-slate-700 italic rounded-bl-sm';
    return 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm';
  })();

  return (
    <div className={`flex ${align} w-full`}>
      <div className="flex flex-col items-start gap-1">
        {!isUser && (
          <span className="text-[10px] uppercase tracking-wider text-slate-500 px-2">
            {message.kind === 'success'
              ? 'Bot · Success'
              : message.kind === 'error'
                ? 'Bot · Error'
                : 'Bot'}
          </span>
        )}
        {isUser && (
          <span className="text-[10px] uppercase tracking-wider text-slate-500 px-2 self-end">
            You
          </span>
        )}
        <div className={`${base} ${skin}`}>
          {message.kind === 'loading' ? (
            <LoadingDots text={message.text} />
          ) : (
            message.text
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingDots({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
      </span>
      <span>{text}</span>
    </span>
  );
}
