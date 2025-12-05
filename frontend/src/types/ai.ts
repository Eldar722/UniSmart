export interface AIRequest {
  user_id: string;
  message: string;
}

export interface AIResponse {
  answer: string;
  memory_used?: string[];
}
