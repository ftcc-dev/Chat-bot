import { useCallback, useState } from 'react';
import type { ChatMessage } from '../types/chat';
import { sendChatMessage } from '../services/chat.service';
import { isRegistrationCommand } from '../utils/detect-command';

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const welcome: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  kind: 'text',
  text:
    'Welcome to Konsulta Chat! Type /help for commands, or send a registration like:\n' +
    '/register 050502495531 Member',
  createdAt: Date.now(),
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [isBusy, setIsBusy] = useState(false);

  const append = (msg: ChatMessage) =>
    setMessages((prev) => [...prev, msg]);

  const replaceById = (id: string, patch: Partial<ChatMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const removeById = (id: string) =>
    setMessages((prev) => prev.filter((m) => m.id !== id));

  const sendMessage = useCallback(async (text: string) => {
    append({
      id: newId(),
      role: 'user',
      kind: 'text',
      text,
      createdAt: Date.now(),
    });

    const willAutomate = isRegistrationCommand(text);
    const loaderId = newId();

    if (willAutomate) {
      append({
        id: loaderId,
        role: 'bot',
        kind: 'loading',
        text: 'Bot is processing your request...',
        createdAt: Date.now(),
      });
    }

    setIsBusy(true);
    try {
      const res = await sendChatMessage(text);

      if (willAutomate) removeById(loaderId);

      if (!res.success) {
        append({
          id: newId(),
          role: 'bot',
          kind: 'error',
          text: res.message || 'Something went wrong.',
          createdAt: Date.now(),
        });
        return;
      }

      const data = res.data;
      if (data.kind === 'chat') {
        append({
          id: newId(),
          role: 'bot',
          kind: 'text',
          text: data.reply,
          createdAt: Date.now(),
        });
      } else {
        append({
          id: newId(),
          role: 'bot',
          kind: data.status === 'success' ? 'success' : 'error',
          text: data.banner,
          createdAt: Date.now(),
        });
      }
    } catch (err) {
      if (willAutomate) {
        replaceById(loaderId, {
          kind: 'error',
          text:
            err instanceof Error
              ? `Connection error: ${err.message}`
              : 'Connection error.',
        });
      } else {
        append({
          id: newId(),
          role: 'bot',
          kind: 'error',
          text: 'Could not reach the server.',
          createdAt: Date.now(),
        });
      }
    } finally {
      setIsBusy(false);
    }
  }, []);

  return { messages, isBusy, sendMessage };
}
