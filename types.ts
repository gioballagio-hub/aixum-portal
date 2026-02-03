
export type UserRole = 'admin' | 'client';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_seconds: number;
  video_url: string;
  thumbnail_url: string;
  is_published: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  file_size_bytes: number;
  file_type: string;
  category: string;
  is_published: boolean;
  created_at: string;
}
