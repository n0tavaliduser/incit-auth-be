export interface User {
  id: number;
  email: string;
  name: string;
  email_verified?: boolean;
  oauth_provider?: string;
  verification_token?: string | null;
  verification_token_expires_at?: Date | null;
} 