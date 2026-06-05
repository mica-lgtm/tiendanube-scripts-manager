export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  stores_access: string[];
  created_at: string;
  updated_at: string;
}

export interface Store {
  id: string;
  name: string;
  store_id: number;
  api_token: string;
  api_url: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Script {
  id: string;
  store_id: string;
  name: string;
  description: string;
  script_type: 'css' | 'html' | 'js';
  content: string;
  is_active: boolean;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deployed_at: string | null;
}

export interface ScriptVersion {
  id: string;
  script_id: string;
  version_number: number;
  content: string;
  changes_description: string;
  created_by: string;
  created_at: string;
  deployed_to_production: boolean;
  deployment_timestamp: string | null;
}

export interface AuditLog {
  id: string;
  store_id?: string;
  user_id?: string;
  action: 'create' | 'update' | 'delete' | 'deploy' | 'rollback' | 'deploy_error';
  details: Record<string, any>;
  timestamp: string;
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  scripts_json: any[];
  created_by: string;
  created_at: string;
  updated_at: string;
}
