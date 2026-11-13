export type Role = "Admin" | "Operator" | "Viewer";

export interface AuthUser {
  access_token: string;
  token_type: string;
  username: string;
  role: Role;
}

export interface Certificate {
  id: number;
  common_name: string;
  sans: string;
  ca_type: string;
  external_order_id?: string;
  external_certificate_id?: string;
  management_state: string;
  status: string;
  valid_to?: string;
  thumbprint?: string;
  last_pfx_path?: string;
}

export interface Target {
  id: number;
  name: string;
  adapter_type: string;
  host: string;
  site_name: string;
  hostname: string;
  port: number;
  enabled: boolean;
}

export interface IssuanceCheck {
  status: "Pending" | "Retrying" | "Needs attention" | "Issued" | "Failed";
  consecutive_failures: number;
  last_checked_at: string | null;
  next_check_at: string | null;
  last_error: string | null;
}

export interface CertificateDetails extends Certificate {
  targets: Target[];
  renewal_available: boolean;
  issuance_check: IssuanceCheck | null;
}

export interface ExternalCertificate {
  order_id: string;
  certificate_id?: string;
  common_name: string;
  dns_names: string[];
  status: string;
  valid_till?: string;
  days_remaining?: number;
  product_name_id?: string;
  organization_name?: string;
  management_state: string;
  local_certificate_id?: number;
}

export interface ExternalDetails {
  external: Record<string, unknown>;
  management_state: string;
  local_certificate_id?: number;
}

export interface Job {
  id: number;
  certificate_id?: number;
  external_order_id?: string;
  job_type: string;
  status: string;
  actor: string;
  message: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_certificates: number;
  managed_certificates: number;
  onboarding_certificates: number;
  total_jobs: number;
  failed_jobs: number;
}
