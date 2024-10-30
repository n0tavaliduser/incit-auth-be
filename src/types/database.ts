export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  oauth_provider?: string;
  oauth_id?: string;
  created_at: Date;
  updated_at: Date;
} 