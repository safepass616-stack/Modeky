// ----------------------------------------------------------------------------
// Database types
// ----------------------------------------------------------------------------
// These types mirror the SQL schema in supabase/migrations. If you change
// the schema, run `supabase gen types typescript` to regenerate this file
// automatically, or update it by hand to keep it in sync.

export type SubscriptionPlan = 'starter' | 'business' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'cancelled';
export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'supervisor'
  | 'payroll_admin'
  | 'hr_admin'
  | 'read_only';
export type EmployeeStatus = 'active' | 'inactive';
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'checked_out';
export type VerificationStatus =
  | 'verified'
  | 'outside_site'
  | 'missing_selfie'
  | 'missing_gps'
  | 'manual_override';
  export type VerificationStatus = 'verified' | 'outside_site' | 'missing_selfie' | 'missing_gps' | 'manual_override';

// Append verification_status to your existing Attendance row type
export interface Attendance {
  id: string;
  company_id: string;
  employee_id: string;
  site_id: string | null;
  attendance_date: string;
  check_in_time: string;
  checkout_time: string | null;
  status: 'present' | 'late' | 'absent';
  minutes_late: number;
  verification_status: VerificationStatus | null; // New field
  created_at: string;
  updated_at: string;
export type WhatsappSessionState = 'idle' | 'awaiting_location' | 'awaiting_selfie';
export type WhatsappPendingAction = 'check_in' | 'check_out';

export interface Company {
  id: string;
  name: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  company_id: string | null;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  company_id: string;
  employee_code: string | null;
  full_name: string;
  phone_number: string;
  profile_photo_url: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  company_id: string;
  site_name: string;
  client_name: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  created_at: string;
  updated_at: string;
}

export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Attendance {
  id: string;
  company_id: string;
  employee_id: string;
  site_id: string | null;
  schedule_id: string | null;
  checkin_time: string | null;
  checkout_time: string | null;
  checkin_latitude: number | null;
  checkin_longitude: number | null;
  checkout_latitude: number | null;
  checkout_longitude: number | null;
  selfie_url: string | null;
  status: AttendanceStatus;
  verification_status: VerificationStatus | null;
  minutes_late: number | null;
  attendance_date: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  company_id: string;
  employee_id: string;
  site_id: string | null;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: ScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface ScheduleWithRelations extends Schedule {
  employees: Pick<Employee, 'id' | 'full_name' | 'employee_code'> | null;
  sites: Pick<Site, 'id' | 'site_name'> | null;
}

export interface AttendanceWithRelations extends Attendance {
  employees: Pick<Employee, 'id' | 'full_name' | 'employee_code'> | null;
  sites: Pick<Site, 'id' | 'site_name'> | null;
}

export interface WhatsappSession {
  id: string;
  company_id: string;
  employee_id: string;
  state: WhatsappSessionState;
  pending_action: WhatsappPendingAction | null;
  pending_latitude: number | null;
  pending_longitude: number | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ----------------------------------------------------------------------------
// Supabase generic Database type
// ----------------------------------------------------------------------------
// A minimal hand-written version of the generated Supabase `Database` type,
// sufficient to give the Supabase client type-safe `.from('table')` calls.

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      companies: {
        Row: Company & Record<string, unknown>;
        Insert: Partial<Company> & { name: string } & Record<string, unknown>;
        Update: Partial<Company> & Record<string, unknown>;
        Relationships: [];
      };
      users: {
        Row: AppUser & Record<string, unknown>;
        Insert: Partial<AppUser> & { id: string; email: string } & Record<string, unknown>;
        Update: Partial<AppUser> & Record<string, unknown>;
        Relationships: [];
      };
      employees: {
        Row: Employee & Record<string, unknown>;
        Insert: Partial<Employee> & {
          company_id: string;
          full_name: string;
          phone_number: string;
        } & Record<string, unknown>;
        Update: Partial<Employee> & Record<string, unknown>;
        Relationships: [];
      };
      sites: {
        Row: Site & Record<string, unknown>;
        Insert: Partial<Site> & {
          company_id: string;
          site_name: string;
          latitude: number;
          longitude: number;
        } & Record<string, unknown>;
        Update: Partial<Site> & Record<string, unknown>;
        Relationships: [];
      };
      attendance: {
        Row: Attendance & Record<string, unknown>;
        Insert: Partial<Attendance> & {
          company_id: string;
          employee_id: string;
        } & Record<string, unknown>;
        Update: Partial<Attendance> & Record<string, unknown>;
        Relationships: [];
      };
      whatsapp_sessions: {
        Row: WhatsappSession & Record<string, unknown>;
        Insert: Partial<WhatsappSession> & {
          company_id: string;
          employee_id: string;
        } & Record<string, unknown>;
        Update: Partial<WhatsappSession> & Record<string, unknown>;
        Relationships: [];
      };
      schedules: {
        Row: Schedule & Record<string, unknown>;
        Insert: Partial<Schedule> & {
          company_id: string;
          employee_id: string;
          shift_date: string;
          start_time: string;
          end_time: string;
        } & Record<string, unknown>;
        Update: Partial<Schedule> & Record<string, unknown>;
        Relationships: [];
      };
      audit_logs: {
        Row: AuditLog & Record<string, unknown>;
        Insert: Partial<AuditLog> & {
          company_id: string;
          action: string;
          entity_type: string;
        } & Record<string, unknown>;
        Update: Partial<AuditLog> & Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
