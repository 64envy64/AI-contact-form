// User interface
export interface User {
  id: string;
  name: string;
  ai_usage_count: number;
  created_at: string;
}

// Submission interface
export interface Submission {
  id: string;
  user_name: string;
  email: string;
  subject: 'General Inquiry' | 'Bug Report' | 'Feature Request' | 'Billing Question';
  message: string;
  created_at: string;
}

// Contact form data interface
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// AI improvement request interface
export interface AIImproveRequest {
  message: string;
  userName: string;
}

// AI improvement response interface
export interface AIImproveResponse {
  improvedMessage: string;
  tokensUsed?: number;
}

// Generic API response wrapper
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
