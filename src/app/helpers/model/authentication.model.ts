// helpers/model/authentication.model.ts
export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  access?: string;
  refresh?: string;
  username?: string;
  user_id?: string | number;
  message?: string;
  
  // Additional fields that might be returned by your Django backend
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
}

// Optional: Additional interfaces for better type safety
export interface UserInfo {
  username: string;
  id: string | number;
  user_id: string | number;
  email: string;
  authenticated: boolean;
  login_time: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_active?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  refreshToken: string | null;
}

// WebSocket authentication interface
export interface WebSocketAuthData {
  type: 'authenticate';
  sessionid?: string;
  csrftoken?: string;
  token?: string;
  user_info?: UserInfo;
  timestamp: number;
}

// WebSocket authentication response interface
export interface WebSocketAuthResponse {
  type: 'auth_success' | 'auth_failed' | 'auth_required';
  message?: string;
}
