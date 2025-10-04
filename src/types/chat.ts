import type { RegexFlag } from "./placeholders";

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
  id?: string;
  type: 'regex' | 'prompt' | 'const' | 'restapi' | 'function' ;
  name: string;
  description: string;
  parameters: Record<string, any>;
} & (
  | {
      type: 'regex';
      regexTemplate: string;
      baseText: string;
      flags?: RegexFlag[]; // ex: ['i', 'm']
      template: string;
      defaultValue?: string;
    }
  | {
      type: 'prompt';
      promptTemplate: string;
      systemPrompt?: string;
    }
  | {
      type: 'const';
      value: string;
    }
  | {
      type:'restapi';
      endpoint:string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'; 
      headers : Record<string,string>;
      strJsonBody : string;
    }
  | {
      type: 'function';
      functionName: string;
      functionCode: string;
    }
);
     


export type SendStatus = 'idle' | 'sending' | 'error';