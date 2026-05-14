import { apiClient } from '../utils/api-client';
import type { ChatApiPayload } from '../types/chat';

export function sendChatMessage(text: string) {
  return apiClient<ChatApiPayload>('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}
