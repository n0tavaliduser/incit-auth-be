export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  email_verified: boolean;
  verification_token?: string;
  created_at: Date;
  updated_at: Date;
}

// Interface untuk data yang dikirim ke email service
export interface UserEmailData {
  id: number;
  email: string;
  name: string;
  email_verified: boolean;
} 