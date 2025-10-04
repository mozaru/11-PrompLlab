export type Role = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  createdAt: number; // Date.now()
  error?: boolean;
  include?: boolean; 
};

export type AgentTool = {
  type: 'regex' | 'prompt' | 'function';
  name: string;
  description: string;
  parameters: Record<string, any>;
} & (
  | {
      type: 'regex';
      regexTemplate: string;
      baseText: string;
      flags?: string[]; // ex: ['i', 'm']
      group?: number | string;
      defaultValue?: string;
    }
  | {
      type: 'prompt';
      promptTemplate: string;
      systemPrompt?: string;
    }
  | {
      type: 'function';
      functionName: string;
      functionCode: string;
    }
);
     


export type SendStatus = 'idle' | 'sending' | 'error';