// ==================== CORE INTERFACES ====================

export interface ChatSession {
  id: string;
  title: string;
  last_message: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  thinkingContent?: string;
  functionCalls?: FunctionCall[];
  responseTime?: string;
  pending?: boolean;
  stopped?: boolean;

  // Optional convenience for tool frames
  isFunction?: boolean;
  toolName?: string;
  functionJson?: any;
}

export interface ChatHistoryMessage {
  role: string;
  content: string;
  created_at: string;
  thinking_state?: string;
  thought_content?: string;
  message_id?: string;
  is_thinking?: boolean;
  type?: string;
  function_name?: string;
  function_arguments?: any;
  function_result?: any;
}


export interface ChatHistoryResponse {
  session_id: string;
  conversations: ChatHistoryMessage[];
}

// ==================== FUNCTION CALL INTERFACES ====================

export interface FunctionCall {
  id: string;
  name: string;
  arguments: any;
  status: 'calling' | 'completed' | 'error';
  timestamp: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface ToolCall extends FunctionCall {
  toolType?: string;
}

export interface FunctionResult {
  name: string;
  content: any;
  success?: boolean;
  error?: string;
}

// ==================== REQUEST INTERFACES ====================

export interface DeleteSessionRequest {
  session_id: string;
  action: 'delete';
}

export interface UpdateSessionRequest {
  session_id: string;
  title: string;
}

export interface SaveThinkingRequest {
  session_id: string;
  thinking_data: {
    thinking_state: string;
    thought_content: string;
    message_id: string;
  };
}

// ==================== WEBSOCKET INTERFACES ====================

export interface WebSocketMessage {
  type: 'sessioncreated' | 'chathistory' | 'start' | 'token' | 'end' | 'error' | 'functioncall' | 'function';
  content?: string;
  sessionid?: string;
  conversations?: ChatHistoryMessage[];
  functioncallactive?: boolean;
  message?: string;
}

export interface ConversationHistory {
  role: 'user' | 'assistant' | 'thinking' | 'function';
  content: string;
  timestamp?: Date;
  functionCall?: FunctionCall;
  functionResult?: FunctionResult;
}

// ==================== UI STATE INTERFACES ====================

export interface ChatState {
  isConnected: boolean;
  isTyping: boolean;
  isLoading: boolean;
  currentSessionId: string | null;
  status: 'connected' | 'disconnected' | 'streaming' | 'error' | 'thinking';
  errorMessage?: string;
}

export interface GroupedChatSessions {
  todayChats: ChatSession[];
  yesterdayChats: ChatSession[];
  previousChats: ChatSession[];
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  isOnline: boolean;
}

// ==================== UTILITY INTERFACES ====================

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}
