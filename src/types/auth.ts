export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'email';
  joinedAt: number;
}
