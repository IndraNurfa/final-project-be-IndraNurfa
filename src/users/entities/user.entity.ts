export class User {}

export interface Users {
  id: number;
  email: string;
  full_name: string;
  role_id: number;
  password: string;
  created_at: Date;
  updated_at: Date;
  role: Role;
  created_by: string;
  updated_by: string;
}

export interface Role {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
