export interface SeedUser {
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
  oauth_provider?: string;
  oauth_id?: string;
} 