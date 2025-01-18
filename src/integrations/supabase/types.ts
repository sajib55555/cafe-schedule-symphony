export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_schedules: {
        Row: {
          company_id: string | null
          created_at: string
          id: number
          schedule_data: Json
          week_start: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: number
          schedule_data: Json
          week_start: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: number
          schedule_data?: Json
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_schedules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          name: string
          phone: string | null
          size: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name: string
          phone?: string | null
          size?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          name?: string
          phone?: string | null
          size?: string | null
          website?: string | null
        }
        Relationships: []
      }
      holiday_tracking: {
        Row: {
          company_id: string | null
          created_at: string
          holiday_entitlement_hours: number | null
          holiday_hours_taken: number | null
          id: number
          staff_id: number | null
          total_worked_hours: number | null
          updated_at: string
          year: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          holiday_entitlement_hours?: number | null
          holiday_hours_taken?: number | null
          id?: number
          staff_id?: number | null
          total_worked_hours?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          holiday_entitlement_hours?: number | null
          holiday_hours_taken?: number | null
          id?: number
          staff_id?: number | null
          total_worked_hours?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "holiday_tracking_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holiday_tracking_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_wages: {
        Row: {
          company_id: string | null
          created_at: string
          id: number
          month_end: string
          month_start: string
          staff_id: number | null
          total_hours: number | null
          total_wages: number | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: number
          month_end: string
          month_start: string
          staff_id?: number | null
          total_hours?: number | null
          total_wages?: number | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: number
          month_end?: string
          month_start?: string
          staff_id?: number | null
          total_hours?: number | null
          total_wages?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_wages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_wages_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          currency_symbol: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          role: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_price_id: string | null
          subscription_status: string | null
          trial_end: string | null
          trial_start: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          currency_symbol?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          position?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_price_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          currency_symbol?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          role?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_price_id?: string | null
          subscription_status?: string | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_rules: {
        Row: {
          company_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: number
          max_staff: number
          min_staff: number
          role: Database["public"]["Enums"]["staff_role"]
          start_time: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: number
          max_staff?: number
          min_staff?: number
          role: Database["public"]["Enums"]["staff_role"]
          start_time: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: number
          max_staff?: number
          min_staff?: number
          role?: Database["public"]["Enums"]["staff_role"]
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_rules_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          created_at: string
          end_time: string
          id: number
          role: string | null
          staff_id: number | null
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: number
          role?: string | null
          staff_id?: number | null
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: number
          role?: string | null
          staff_id?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          availability: string[] | null
          company_id: string | null
          created_at: string
          email: string | null
          hourly_pay: number | null
          hours: number | null
          id: number
          name: string
          phone: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          availability?: string[] | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          hourly_pay?: number | null
          hours?: number | null
          id?: number
          name: string
          phone?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: string[] | null
          company_id?: string | null
          created_at?: string
          email?: string | null
          hourly_pay?: number | null
          hours?: number | null
          id?: number
          name?: string
          phone?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_tasks: {
        Row: {
          company_id: string | null
          completed: boolean | null
          created_at: string
          id: number
          staff_id: number | null
          task_description: string
          updated_at: string
          week_start: string
        }
        Insert: {
          company_id?: string | null
          completed?: boolean | null
          created_at?: string
          id?: number
          staff_id?: number | null
          task_description: string
          updated_at?: string
          week_start: string
        }
        Update: {
          company_id?: string | null
          completed?: boolean | null
          created_at?: string
          id?: number
          staff_id?: number | null
          task_description?: string
          updated_at?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_tasks_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      wage_budgets: {
        Row: {
          company_id: string | null
          created_at: string
          id: number
          monthly_budget: number
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: number
          monthly_budget?: number
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: number
          monthly_budget?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wage_budgets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      staff_role:
        | "Barista"
        | "Floor"
        | "Waiter"
        | "Waitress"
        | "Team Leader"
        | "Shift Leader"
        | "Assistant Manager"
        | "General Manager"
        | "Operation Manager"
        | "Duty Manager"
        | "Food Runner"
        | "Cleaner"
        | "Kitchen Porter"
        | "Head Chef"
        | "Sous Chef"
        | "Commie Chef"
        | "Cook"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
