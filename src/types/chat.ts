export type Role = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number; // Date.now()
  error?: boolean;
  include?: boolean; 
};

export type SendStatus = 'idle' | 'sending' | 'error';