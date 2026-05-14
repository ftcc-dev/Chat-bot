export type MessageRole = 'user' | 'bot' | 'system';

export type MessageKind = 'text' | 'loading' | 'success' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  kind: MessageKind;
  text: string;
  createdAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ChatApiPayload =
  | { kind: 'chat'; reply: string }
  | {
      kind: 'automation';
      status: 'success' | 'error';
      banner: string;
      userId: string | null;
      pin: string;
      type: 'MM' | 'DD';
    };
